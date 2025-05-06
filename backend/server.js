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
//       "https://s69-name-blender-4.onrender.com",
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
//     "https://s69-name-blender-4.onrender.com",
//   ],
//   methods: ["GET", "POST"],
//   credentials: true,
// }));
// app.use(express.json());
// app.use("/api", itemRouter);

// const privateChatSchema = new mongoose.Schema({
//   user1: { type: String, required: true },
//   user2: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });
// privateChatSchema.index({ user1: 1, user2: 1 }, { unique: true });
// const PrivateChatRelationship = mongoose.model("PrivateChatRelationship", privateChatSchema);

// mongoose
//   .connect(process.env.DB_URL)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// const typingTimestamps = {};

// io.on("connection", (socket) => {
//   socket.on("join", (username, callback) => {
//     if (!username) {
//       socket.emit("error", { message: "Username is required" });
//       if (callback) callback({ status: "error", message: "Username is required" });
//       return;
//     }

//     socket.username = username;
//     socket.join(username);
//     const users = [...io.sockets.sockets.values()]
//       .map(s => s.username)
//       .filter((u, i, arr) => u && arr.indexOf(u) === i);
//     io.emit("userList", { users });

//     if (callback) callback({ status: "success", message: `Joined as ${username}` });
//   });

//   socket.on("sendMessage", async ({ senderId, text, timestamp, replyTo }, callback) => {
//     try {
//       if (!senderId || !text) throw new Error("Missing fields");
//       const Message = mongoose.model("Message");
//       const message = new Message({ senderId, text, timestamp: timestamp || Date.now(), replyTo });
//       await message.save();
//       io.emit("receiveMessage", message._doc);
//       if (callback) callback({ status: "success" });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to send message" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("sendPrivateMessage", async ({ senderId, text, recipientId, isPrivate, replyTo }, callback) => {
//     try {
//       if (!senderId || !text || !recipientId) throw new Error("Missing fields");
//       const Message = mongoose.model("Message");
//       const message = new Message({ senderId, text, recipientId, isPrivate: true, timestamp: Date.now(), replyTo });
//       await message.save();
//       socket.to(recipientId).emit("receiveMessage", message._doc);
//       socket.emit("receiveMessage", message._doc);
//       if (callback) callback({ status: "success" });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to send private message" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("markMessageSeen", async ({ messageId, recipientId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message || message.recipientId !== recipientId || !message.isPrivate) return;
//       message.seenAt = Date.now();
//       await message.save();
//       io.to(message.senderId).emit("messageSeen", { messageId, seenAt: message.seenAt });
//       socket.emit("messageSeen", { messageId, seenAt: message.seenAt });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to mark message as seen" });
//     }
//   });

//   socket.on("typing", ({ senderId, recipientId }) => {
//     if (!senderId) return;
//     const now = Date.now();
//     if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
//       typingTimestamps[senderId] = now;
//       if (recipientId) {
//         socket.to(recipientId).emit("typing", { senderId });
//       } else {
//         socket.broadcast.emit("typing", { senderId });
//       }
//     }
//   });

//   socket.on("stopTyping", ({ senderId, recipientId }) => {
//     if (!senderId) return;
//     typingTimestamps[senderId] = Date.now();
//     if (recipientId) {
//       socket.to(recipientId).emit("stopTyping", { senderId });
//     } else {
//       socket.broadcast.emit("stopTyping", { senderId });
//     }
//   });

//   socket.on("deleteMessage", async ({ messageId, senderId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message || message.senderId !== senderId) return;
//       await Message.deleteOne({ _id: messageId });
//       io.emit("messageDeleted", { messageId });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to delete message" });
//     }
//   });

//   socket.on("editMessage", async ({ messageId, newText, senderId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message || message.senderId !== senderId) return;
//       message.text = newText;
//       await message.save();
//       io.emit("messageEdited", { messageId, newText });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to edit message" });
//     }
//   });

//   socket.on("checkPrivateChatRelationship", async ({ senderId, recipientId }, callback) => {
//     try {
//       if (!senderId || !recipientId) throw new Error("Missing fields");
//       const [user1, user2] = [senderId, recipientId].sort();
//       const relationship = await PrivateChatRelationship.findOne({ user1, user2 });
//       callback({ status: "success", exists: !!relationship });
//     } catch (err) {
//       callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("privateChatRequest", async ({ senderId, recipientId }, callback) => {
//     if (!senderId || !recipientId) {
//       if (callback) callback({ status: "error", message: "Missing senderId or recipientId" });
//       return;
//     }

//     try {
//       const [user1, user2] = [senderId, recipientId].sort();
//       const existingRelationship = await PrivateChatRelationship.findOne({ user1, user2 });
//       if (existingRelationship) {
//         // Only notify the sender to navigate to the private chat
//         socket.emit("privateChatAccepted", { senderId, recipientId });
//         // Notify the recipient with a popup message instead of redirecting
//         socket.to(recipientId).emit("notifyPrivateChat", { senderId, recipientId });
//         if (callback) callback({ status: "success", message: "Relationship already exists" });
//         return;
//       }

//       socket.to(recipientId).emit("privateChatRequest", { senderId, recipientId });
//       if (callback) callback({ status: "success", message: "Request sent" });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to send private chat request" });
//       if (callback) callback({ status: "error", message: err.message });
//     }
//   });

//   socket.on("acceptPrivateChat", async ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;
//     try {
//       const [user1, user2] = [senderId, recipientId].sort();
//       await PrivateChatRelationship.findOneAndUpdate(
//         { user1, user2 },
//         { user1, user2, createdAt: Date.now() },
//         { upsert: true, new: true }
//       );
//       socket.to(senderId).emit("privateChatAccepted", { senderId, recipientId });
//       socket.emit("privateChatAccepted", { senderId, recipientId });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to accept private chat" });
//     }
//   });

//   socket.on("rejectPrivateChat", ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;
//     socket.to(senderId).emit("privateChatRejected", { senderId, recipientId });
//   });

//   socket.on("disconnect", () => {
//     if (socket.username) {
//       delete typingTimestamps[socket.username];
//       const users = [...io.sockets.sockets.values()]
//         .map(s => s.username)
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

const privateChatSchema = new mongoose.Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
privateChatSchema.index({ user1: 1, user2: 1 }, { unique: true });
const PrivateChatRelationship = mongoose.model("PrivateChatRelationship", privateChatSchema);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const typingTimestamps = {};

io.on("connection", (socket) => {
  socket.on("join", (username, callback) => {
    if (!username) {
      socket.emit("error", { message: "Username is required" });
      if (callback) callback({ status: "error", message: "Username is required" });
      return;
    }

    socket.username = username;
    socket.join(username);
    const users = [...io.sockets.sockets.values()]
      .map(s => s.username)
      .filter((u, i, arr) => u && arr.indexOf(u) === i);
    io.emit("userList", { users });

    if (callback) callback({ status: "success", message: `Joined as ${username}` });
  });

  socket.on("sendMessage", async ({ senderId, text, timestamp, replyTo }, callback) => {
    try {
      if (!senderId || !text) throw new Error("Missing fields");
      const Message = mongoose.model("Message");
      const message = new Message({ senderId, text, timestamp: timestamp || Date.now(), replyTo });
      await message.save();
      io.emit("receiveMessage", message._doc);
      if (callback) callback({ status: "success" });
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("sendPrivateMessage", async ({ senderId, text, recipientId, isPrivate, replyTo }, callback) => {
    try {
      if (!senderId || !text || !recipientId) throw new Error("Missing fields");
      const Message = mongoose.model("Message");
      const message = new Message({ senderId, text, recipientId, isPrivate: true, timestamp: Date.now(), replyTo });
      await message.save();
      socket.to(recipientId).emit("receiveMessage", message._doc);
      socket.emit("receiveMessage", message._doc);
      // Notify the recipient of the new private message
      socket.to(recipientId).emit("privateMessageNotification", { senderId, recipientId, messageId: message._id });
      if (callback) callback({ status: "success" });
    } catch (err) {
      socket.emit("error", { message: "Failed to send private message" });
      if (callback) callback({ status: "error", message: err.message });
    }
  });

  socket.on("markMessageSeen", async ({ messageId, recipientId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message || message.recipientId !== recipientId || !message.isPrivate) return;
      message.seenAt = Date.now();
      await message.save();
      io.to(message.senderId).emit("messageSeen", { messageId, seenAt: message.seenAt });
      socket.emit("messageSeen", { messageId, seenAt: message.seenAt });
    } catch (err) {
      socket.emit("error", { message: "Failed to mark message as seen" });
    }
  });

  socket.on("typing", ({ senderId, recipientId }) => {
    if (!senderId) return;
    const now = Date.now();
    if (!typingTimestamps[senderId] || now - typingTimestamps[senderId] > 1000) {
      typingTimestamps[senderId] = now;
      if (recipientId) {
        // For private chat, only send to the recipient
        socket.to(recipientId).emit("typing", { senderId, recipientId });
      } else {
        // For global chat, broadcast to all except the sender
        socket.broadcast.emit("typing", { senderId });
      }
    }
  });

  socket.on("stopTyping", ({ senderId, recipientId }) => {
    if (!senderId) return;
    typingTimestamps[senderId] = Date.now();
    if (recipientId) {
      // For private chat, only send to the recipient
      socket.to(recipientId).emit("stopTyping", { senderId, recipientId });
    } else {
      // For global chat, broadcast to all except the sender
      socket.broadcast.emit("stopTyping", { senderId });
    }
  });

  socket.on("deleteMessage", async ({ messageId, senderId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message || message.senderId !== senderId) return;
      await Message.deleteOne({ _id: messageId });
      io.emit("messageDeleted", { messageId });
    } catch (err) {
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("editMessage", async ({ messageId, newText, senderId }) => {
    try {
      const Message = mongoose.model("Message");
      const message = await Message.findById(messageId);
      if (!message || message.senderId !== senderId) return;
      message.text = newText;
      await message.save();
      io.emit("messageEdited", { messageId, newText });
    } catch (err) {
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
        // Only notify the sender to navigate to the private chat
        socket.emit("privateChatAccepted", { senderId, recipientId });
        // Notify the recipient with a popup message instead of redirecting
        socket.to(recipientId).emit("notifyPrivateChat", { senderId, recipientId });
        if (callback) callback({ status: "success", message: "Relationship already exists" });
        return;
      }

      socket.to(recipientId).emit("privateChatRequest", { senderId, recipientId });
      if (callback) callback({ status: "success", message: "Request sent" });
    } catch (err) {
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
      socket.to(senderId).emit("privateChatAccepted", { senderId, recipientId });
      socket.emit("privateChatAccepted", { senderId, recipientId });
    } catch (err) {
      socket.emit("error", { message: "Failed to accept private chat" });
    }
  });

  socket.on("rejectPrivateChat", ({ senderId, recipientId }) => {
    if (!senderId || !recipientId) return;
    socket.to(senderId).emit("privateChatRejected", { senderId, recipientId });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete typingTimestamps[socket.username];
      const users = [...io.sockets.sockets.values()]
        .map(s => s.username)
        .filter((u, i, arr) => u && arr.indexOf(u) === i);
      io.emit("userList", { users });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
