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
//     origin: [
//       process.env.VITE_API_URL,
//       "http://localhost:5173",
//       "https://your-frontend-domain.com",
//       "https://s69-name-blender-4.onrender.com"
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// app.use(cors({
//   origin: [
//     process.env.VITE_API_URL,
//     "http://localhost:5173",
//     "https://your-frontend-domain.com",
//     "https://s69-name-blender-4.onrender.com"
//   ],
//   methods: ["GET", "POST"],
//   credentials: true,
// }));
// app.use(express.json());
// app.use("/api", itemRouter);

// // Define PrivateChatRelationship Schema
// const privateChatSchema = new mongoose.Schema({
//   user1: { type: String, required: true },
//   user2: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// // Ensure unique pairs (user1, user2) with user1 < user2 to avoid duplicates
// privateChatSchema.index({ user1: 1, user2: 1 }, { unique: true });

// const PrivateChatRelationship = mongoose.model("PrivateChatRelationship", privateChatSchema);

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

//   socket.on("sendMessage", async ({ senderId, text, timestamp, replyTo }, callback) => {
//     try {
//       if (!senderId || !text) throw new Error("Missing fields");

//       const Message = mongoose.model("Message");
//       const message = new Message({
//         senderId,
//         text,
//         timestamp: timestamp || Date.now(),
//         replyTo,
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
//         socket.to(recipientId).emit("typing", { senderId });
//       } else {
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
//         socket.to(recipientId).emit("stopTyping", { senderId });
//       } else {
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

//   socket.on("checkPrivateChatRelationship", async ({ senderId, recipientId }, callback) => {
//     try {
//       if (!senderId || !recipientId) throw new Error("Missing fields");
//       // Ensure consistent ordering: user1 < user2
//       const [user1, user2] = [senderId, recipientId].sort();
//       const relationship = await PrivateChatRelationship.findOne({ user1, user2 });
//       callback({ status: "success", exists: !!relationship });
//     } catch (err) {
//       console.error("Error checking private chat relationship:", err.message);
//       callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("privateChatRequest", async ({ senderId, recipientId }, callback) => {
//     if (!senderId || !recipientId) {
//       if (callback) callback({ status: "error", message: "Missing senderId or recipientId" });
//       return;
//     }

//     try {
//       // Check if a relationship already exists
//       const [user1, user2] = [senderId, recipientId].sort();
//       const existingRelationship = await PrivateChatRelationship.findOne({ user1, user2 });
//       if (existingRelationship) {
//         socket.emit("privateChatAccepted", { senderId, recipientId });
//         const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
//         if (recipientSocket) {
//           recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
//         }
//         if (callback) callback({ status: "success", message: "Relationship already exists" });
//         return;
//       }

//       const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
//       if (recipientSocket) {
//         console.log(`Sending private chat request from ${senderId} to ${recipientId}`);
//         recipientSocket.emit("privateChatRequest", { senderId, recipientId });
//         if (callback) callback({ status: "success", message: "Request sent" });
//       } else {
//         socket.emit("error", { message: `Recipient ${recipientId} not found` });
//         if (callback) callback({ status: "error", message: `Recipient ${recipientId} not found` });
//       }
//     } catch (err) {
//       console.error("Error sending private chat request:", err.message);
//       socket.emit("error", { message: "Failed to send private chat request" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("acceptPrivateChat", async ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;

//     try {
//       // Save the private chat relationship
//       const [user1, user2] = [senderId, recipientId].sort();
//       await PrivateChatRelationship.findOneAndUpdate(
//         { user1, user2 },
//         { user1, user2, createdAt: Date.now() },
//         { upsert: true, new: true }
//       );

//       const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
//       const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
//       if (senderSocket && recipientSocket) {
//         console.log(`Private chat accepted by ${recipientId} for ${senderId}`);
//         senderSocket.emit("privateChatAccepted", { senderId, recipientId });
//         recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
//       }
//     } catch (err) {
//       console.error("Error saving private chat relationship:", err.message);
//       socket.emit("error", { message: "Failed to accept private chat" });
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
      "http://localhost:5173",
      "https://your-frontend-domain.com",
      "https://s69-name-blender-4.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: [
    process.env.VITE_API_URL,
    "http://localhost:5173",
    "https://your-frontend-domain.com",
    "https://s69-name-blender-4.onrender.com",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());
app.use("/api", itemRouter);

// Define PrivateChatRelationship Schema
const privateChatSchema = new mongoose.Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique pairs (user1, user2) with user1 < user2 to avoid duplicates
privateChatSchema.index({ user1: 1, user2: 1 }, { unique: true });

const PrivateChatRelationship = mongoose.model("PrivateChatRelationship", privateChatSchema);

// Assuming Message Schema is defined elsewhere, it should include seenAt
// Example Message Schema (add this in your routes/routes.js or wherever Message is defined):
/*
const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  recipientId: { type: String },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  seenAt: { type: Date }, // New field for tracking when message is seen
});
*/

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
      socket.emit("error", { message: "Failed to send private message" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("markMessageSeen", async ({ messageId, recipientId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }
      if (message.recipientId !== recipientId || !message.isPrivate) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      message.seenAt = Date.now();
      await message.save();

      const payload = { messageId, seenAt: message.seenAt };
      console.log(`Message ${messageId} marked as seen by ${recipientId}`);
      io.to(message.senderId).emit("messageSeen", payload);
      socket.emit("messageSeen", payload);
    } catch (err) {
      console.error("Error marking message as seen:", err.message);
      socket.emit("error", { message: "Failed to mark message as seen" });
    }
  });

  socket.on("typing", ({ senderId, recipientId }) => {
    if (!senderId) return;
    const now = Date.now();
    if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
      typingTimestamps[senderId] = now;
      console.log(`${senderId} is typing${recipientId ? ` to ${recipientId}` : ""}`);
      if (recipientId) {
        socket.to(recipientId).emit("typing", { senderId });
      } else {
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
        socket.to(recipientId).emit("stopTyping", { senderId });
      } else {
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

  socket.on("checkPrivateChatRelationship", async ({ senderId, recipientId }, callback) => {
    try {
      if (!senderId || !recipientId) throw new Error("Missing fields");
      const [user1, user2] = [senderId, recipientId].sort();
      const relationship = await PrivateChatRelationship.findOne({ user1, user2 });
      callback({ status: "success", exists: !!relationship });
    } catch (err) {
      console.error("Error checking private chat relationship:", err.message);
      callback({ status: "error", message: err.message });
    }
  });

  socket.on("privateChatRequest", async ({ senderId, recipientId }, callback) => {
    if (!senderId || !recipientId) {
      if (callback) callback({ status: "error", message: "Missing senderId or recipientId" });
      return;
    }

    try {
      const [user1, user2] = [senderId, recipientId].sort();
      const existingRelationship = await PrivateChatRelationship.findOne({ user1, user2 });
      if (existingRelationship) {
        socket.emit("privateChatAccepted", { senderId, recipientId });
        const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
        if (recipientSocket) {
          recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
        }
        if (callback) callback({ status: "success", message: "Relationship already exists" });
        return;
      }

      const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
      if (recipientSocket) {
        console.log(`Sending private chat request from ${senderId} to ${recipientId}`);
        recipientSocket.emit("privateChatRequest", { senderId, recipientId });
        if (callback) callback({ status: "success", message: "Request sent" });
      } else {
        socket.emit("error", { message: `Recipient ${recipientId} not found` });
        if (callback) callback({ status: "error", message: `Recipient ${recipientId} not found` });
      }
    } catch (err) {
      console.error("Error sending private chat request:", err.message);
      socket.emit("error", { message: "Failed to send private chat request" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("acceptPrivateChat", async ({ senderId, recipientId }) => {
    if (!senderId || !recipientId) return;

    try {
      const [user1, user2] = [senderId, recipientId].sort();
      await PrivateChatRelationship.findOneAndUpdate(
        { user1, user2 },
        { user1, user2, createdAt: Date.now() },
        { upsert: true, new: true }
      );

      const senderSocket = [...io.sockets.sockets.values()].find((s) => s.username === senderId);
      const recipientSocket = [...io.sockets.sockets.values()].find((s) => s.username === recipientId);
      if (senderSocket && recipientSocket) {
        console.log(`Private chat accepted by ${recipientId} for ${senderId}`);
        senderSocket.emit("privateChatAccepted", { senderId, recipientId });
        recipientSocket.emit("privateChatAccepted", { senderId, recipientId });
      }
    } catch (err) {
      console.error("Error saving private chat relationship:", err.message);
      socket.emit("error", { message: "Failed to accept private chat" });
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

