// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const itemRouter = require("./routes/routes");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [`${process.env.VITE_API_URL}`, `${process.env.VITE_API_URL}`],
//     methods: ["GET", "POST"],
//   },
// });

// app.use(cors());
// app.use(express.json());
// app.use("/api", itemRouter);

// mongoose
//   .connect(process.env.DB_URL)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// const typingTimestamps = {};

// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.on("join", (username, callback) => {
//     if (!username) {
//       socket.emit("error", { message: "Username is required" });
//       if (callback) callback({ status: "error", message: "Username is required" });
//       return;
//     }

//     socket.username = username;
//     socket.join(username);
//     console.log(`${username} joined`);

//     const users = [...io.sockets.sockets.values()]
//       .map((s) => s.username)
//       .filter((u, i, arr) => u && arr.indexOf(u) === i);
//     io.emit("userList", { users });

//     if (callback) callback({ status: "success", message: `Joined as ${username}` });
//   });

//   socket.on("sendMessage", async ({ senderId, text, timestamp }, callback) => {
//     try {
//       if (!senderId || !text) throw new Error("Missing fields");

//       const Message = mongoose.model("Message");
//       const message = new Message({
//         senderId,
//         text,
//         timestamp: timestamp || Date.now(),
//       });
//       await message.save();

//       const payload = { ...message._doc };
//       console.log("Sending public message:", payload);
//       io.emit("receiveMessage", payload);

//       if (callback) callback({ status: "success", payload });
//     } catch (err) {
//       console.error("Error saving message:", err.message);
//       socket.emit("error", { message: "Failed to send message" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("sendPrivateMessage", async ({ senderId, text, recipientId, isPrivate, replyTo }, callback) => {
//     try {
//       if (!senderId || !text || !recipientId) throw new Error("Missing fields");

//       const Message = mongoose.model("Message");
//       const message = new Message({
//         senderId,
//         text,
//         recipientId,
//         isPrivate: true,
//         timestamp: Date.now(),
//         replyTo,
//       });
//       await message.save();

//       const payload = { ...message._doc };
//       console.log(`Sending private message from ${senderId} to ${recipientId}:`, payload);

//       socket.to(recipientId).emit("receiveMessage", payload);
//       socket.emit("receiveMessage", payload);

//       if (callback) callback({ status: "success", payload });
//     } catch (err) {
//       console.error("Error saving private message:", err.message);
//       socket.emit("error", { message: "Failed to send private message" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("typing", ({ senderId, recipientId }) => {
//     if (!senderId) return;
//     const now = Date.now();
//     if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
//       typingTimestamps[senderId] = now;
//       console.log(`${senderId} is typing${recipientId ? ` to ${recipientId}` : ""}`);
//       if (recipientId) {
//         // Private chat: Send typing event only to the recipient
//         socket.to(recipientId).emit("typing", { senderId });
//       } else {
//         // Global chat: Broadcast to all except sender
//         socket.broadcast.emit("typing", { senderId });
//       }
//     }
//   });

//   socket.on("stopTyping", ({ senderId, recipientId }) => {
//     if (!senderId) return;
//     const now = Date.now();
//     if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
//       typingTimestamps[senderId] = now;
//       console.log(`${senderId} stopped typing${recipientId ? ` to ${recipientId}` : ""}`);
//       if (recipientId) {
//         // Private chat: Send stopTyping event only to the recipient
//         socket.to(recipientId).emit("stopTyping", { senderId });
//       } else {
//         // Global chat: Broadcast to all except sender
//         socket.broadcast.emit("stopTyping", { senderId });
//       }
//     }
//   });

//   socket.on("deleteMessage", async ({ messageId, senderId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit("error", { message: "Message not found" });
//         return;
//       }
//       if (message.senderId !== senderId) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       await Message.deleteOne({ _id: messageId });
//       io.emit("messageDeleted", { messageId });
//     } catch (err) {
//       console.error("Error deleting message:", err.message);
//       socket.emit("error", { message: "Failed to delete message" });
//     }
//   });

//   socket.on("editMessage", async ({ messageId, newText, senderId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit("error", { message: "Message not found" });
//         return;
//       }
//       if (message.senderId !== senderId) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       message.text = newText;
//       await message.save();
//       io.emit("messageEdited", { messageId, newText });
//     } catch (err) {
//       console.error("Error editing message:", err.message);
//       socket.emit("error", { message: "Failed to edit message" });
//     }
//   });

//   socket.on("privateChatRequest", ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;

//     const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
//     if (recipientSocket) {
//       console.log(`Sending private chat request from ${senderId} to ${recipientId}`);
//       recipientSocket.emit("privateChatRequest", { senderId, recipientId });
//     } else {
//       socket.emit("error", { message: `Recipient ${recipientId} not found` });
//     }
//   });

//   socket.on("acceptPrivateChat", ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;

//     const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
//     const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
//     if (senderSocket && recipientSocket) {
//       console.log(`Private chat accepted by ${recipientId} for ${senderId}`);
//       senderSocket.emit("privateChatAccepted", { senderId, recipientId });
//       recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
//     }
//   });

//   socket.on("rejectPrivateChat", ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;

//     const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
//     if (senderSocket) {
//       console.log(`Private chat rejected by ${recipientId} for ${senderId}`);
//       senderSocket.emit("privateChatRejected", { senderId, recipientId });
//     }
//   });

//   socket.on("disconnect", () => {
//     if (socket.username) {
//       console.log(`${socket.username} disconnected`);
//       delete typingTimestamps[socket.username];
//       const users = [...io.sockets.sockets.values()]
//         .map((s) => s.username)
//         .filter((u, i, arr) => u && arr.indexOf(u) === i);
//       io.emit("userList", { users });
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));





const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const itemRouter = require("./routes/routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.VITE_API_URL,
      "http://localhost:5173", // Add local development origin
      "https://your-frontend-domain.com", // Replace with your actual frontend domain
      "https://s69-name-blender-4.onrender.com" // Ensure server URL is included
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: [
    process.env.VITE_API_URL,
    "http://localhost:5173",
    "https://your-frontend-domain.com", // Replace with your actual frontend domain
    "https://s69-name-blender-4.onrender.com"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());
app.use("/api", itemRouter);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const typingTimestamps = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (username, callback) => {
    if (!username) {
      socket.emit("error", { message: "Username is required" });
      if (callback) callback({ status: "error", message: "Username is required" });
      return;
    }

    socket.username = username;
    socket.join(username);
    console.log(`${username} joined`);

    const users = [...io.sockets.sockets.values()]
      .map((s) => s.username)
      .filter((u, i, arr) => u && arr.indexOf(u) === i);
    io.emit("userList", { users });

    if (callback) callback({ status: "success", message: `Joined as ${username}` });
  });

  socket.on("sendMessage", async ({ senderId, text, timestamp, replyTo }, callback) => {
    try {
      if (!senderId || !text) throw new Error("Missing fields");

      const Message = mongoose.model("Message");
      const message = new Message({
        senderId,
        text,
        timestamp: timestamp || Date.now(),
        replyTo,
      });
      await message.save();

      const payload = { ...message._doc };
      console.log("Sending public message:", payload);
      io.emit("receiveMessage", payload);

      if (callback) callback({ status: "success", payload });
    } catch (err) {
      console.error("Error saving message:", err.message);
      socket.emit("error", { message: "Failed to send message" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("sendPrivateMessage", async ({ senderId, text, recipientId, isPrivate, replyTo }, callback) => {
    try {
      if (!senderId || !text || !recipientId) throw new Error("Missing fields");

      const Message = mongoose.model("Message");
      const message = new Message({
        senderId,
        text,
        recipientId,
        isPrivate: true,
        timestamp: Date.now(),
        replyTo,
      });
      await message.save();

      const payload = { ...message._doc };
      console.log(`Sending private message from ${senderId} to ${recipientId}:`, payload);

      socket.to(recipientId).emit("receiveMessage", payload);
      socket.emit("receiveMessage", payload);

      if (callback) callback({ status: "success", payload });
    } catch (err) {
      console.error("Error saving private message:", err.message);
      socket.emit("error", { message: "Failed彼此相望") socket.emit("error", { message: "Failed to send private message" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("typing", ({ senderId, recipientId }) => {
    if (!senderId) return;
    const now = Date.now();
    if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
      typingTimestamps[senderId] = now;
      console.log(`${senderId} is typing${recipientId ? ` to ${recipientId}` : ""}`);
      if (recipientId) {
        // Private chat: Send typing event only to the recipient
        socket.to(recipientId).emit("typing", { senderId });
      } else {
        // Global chat: Broadcast to all except sender
        socket.broadcast.emit("typing", { senderId });
      }
    }
  });

  socket.on("stopTyping", ({ senderId, recipientId }) => {
    if (!senderId) return;
    const now = Date.now();
    if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
      typingTimestamps[senderId] = now;
      console.log(`${senderId} stopped typing${recipientId ? ` to ${recipientId}` : ""}`);
      if (recipientId) {
        // Private chat: Send stopTyping event only to the recipient
        socket.to(recipientId).emit("stopTyping", { senderId });
      } else {
        // Global chat: Broadcast to all except sender
        socket.broadcast.emit("stopTyping", { senderId });
      }
    }
  });

  socket.on("deleteMessage", async ({ messageId, senderId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }
      if (message.senderId !== senderId) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      await Message.deleteOne({ _id: messageId });
      io.emit("messageDeleted", { messageId });
    } catch (err) {
      console.error("Error deleting message:", err.message);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("editMessage", async ({ messageId, newText, senderId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }
      if (message.senderId !== senderId) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      message.text = newText;
      await message.save();
      io.emit("messageEdited", { messageId, newText });
    } catch (err) {
      console.error("Error editing message:", err.message);
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  socket.on("privateChatRequest", ({ senderId, recipientId }) => {
    if (!senderId || !recipientId) return;

    const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
    if (recipientSocket) {
      console.log(`Sending private chat request from ${senderId} to ${recipientId}`);
      recipientSocket.emit("privateChatRequest", { senderId, recipientId });
    } else {
      socket.emit("error", { message: `Recipient ${recipientId} not found` });
    }
  });

  socket.on("acceptPrivateChat", ({ senderId, recipientId }) => {
    if (!senderId || !recipientId) return;

    const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
    const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
    if (senderSocket && recipientSocket) {
      console.log(`Private chat accepted by ${recipientId} for ${senderId}`);
      senderSocket.emit("privateChatAccepted", { senderId, recipientId });
      recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
    }
  });

  socket.on("rejectPrivateChat", ({ senderId, recipientId }) => {
    if (!senderId || !recipientId) return;

    const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
    if (senderSocket) {
      console.log(`Private chat rejected by ${recipientId} for ${senderId}`);
      senderSocket.emit("privateChatRejected", { senderId, recipientId });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      delete typingTimestamps[socket.username];
      const users = [...io.sockets.sockets.values()]
        .map((s) => s.username)
        .filter((u, i, arr) => u && arr.indexOf(u) === i);
      io.emit("userList", { users });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
