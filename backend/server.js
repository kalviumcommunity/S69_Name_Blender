// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const cron = require("node-cron");
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
//   .connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Schedule cleanup for global chat messages (every hour)
// cron.schedule("0 * * * *", async () => {
//   try {
//     const twoDaysAgo = new Date(Date.now() - 172800000); // 2 days in milliseconds
//     await mongoose.model("Message").deleteMany({
//       isPrivate: false,
//       timestamp: { $lt: twoDaysAgo },
//     });
//     console.log("Cleaned up expired global chat messages");
//   } catch (err) {
//     console.error("Error cleaning up global chat messages:", err);
//   }
// });

// // Schedule cleanup for private chat messages (every minute)
// cron.schedule("* * * * *", async () => {
//   try {
//     const now = new Date();
//     await mongoose.model("Message").deleteMany({
//       isPrivate: true,
//       expiresAt: { $lt: now },
//     });
//     console.log("Cleaned up expired private chat messages");
//   } catch (err) {
//     console.error("Error cleaning up private chat messages:", err);
//   }
// });

// const typingTimestamps = {};
// const activePrivateChats = new Map(); // Track active users in private chats

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

//   socket.on("joinPrivateChat", ({ senderId, recipientId }) => {
//     if (!senderId || !recipientId) return;
//     const chatKey = [senderId, recipientId].sort().join(":");
//     if (!activePrivateChats.has(chatKey)) {
//       activePrivateChats.set(chatKey, new Set());
//     }
//     activePrivateChats.get(chatKey).add(senderId);

//     socket.on("disconnect", async () => {
//       activePrivateChats.get(chatKey)?.delete(senderId);
//       if (activePrivateChats.get(chatKey)?.size === 0) {
//         activePrivateChats.delete(chatKey);
//         try {
//           const Message = mongoose.model("Message");
//           await Message.updateMany(
//             {
//               isPrivate: true,
//               $or: [
//                 { senderId, recipientId },
//                 { senderId: recipientId, recipientId: senderId },
//               ],
//               expiresAt: { $exists: false },
//             },
//             { expiresAt: new Date(Date.now() + 600000) } // 10 minutes from now
//           );
//         } catch (err) {
//           console.error("Error setting expiresAt for private messages:", err);
//         }
//       }
//     });
//   });

//   socket.on("sendMessage", async ({ senderId, text, timestamp, replyTo }, callback) => {
//     try {
//       if (!senderId || !text) throw new Error("Missing senderId or text");
//       const Message = mongoose.model("Message");
//       const message = new Message({ senderId, text, timestamp: timestamp || Date.now(), replyTo, reactions: [] });
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
//       if (!senderId || !text || !recipientId) throw new Error("Missing senderId, text, or recipientId");
//       const Message = mongoose.model("Message");
//       const message = new Message({ senderId, text, recipientId, isPrivate: true, timestamp: Date.now(), replyTo, reactions: [] });
//       await message.save();
//       socket.to(recipientId).emit("receiveMessage", message._doc);
//       socket.emit("receiveMessage", message._doc);
//       socket.to(recipientId).emit("privateMessageNotification", { senderId, recipientId, messageId: message._id });
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
//       if (!message || message.recipientId !== recipientId || !message.isPrivate) {
//         socket.emit("error", { message: "Invalid message or unauthorized" });
//         return;
//       }
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
//         socket.to(recipientId).emit("typing", { senderId, recipientId });
//       } else {
//         socket.broadcast.emit("typing", { senderId });
//       }
//     }
//   });

//   socket.on("stopTyping", ({ senderId, recipientId }) => {
//     if (!senderId) return;
//     typingTimestamps[senderId] = Date.now();
//     if (recipientId) {
//       socket.to(recipientId).emit("stopTyping", { senderId, recipientId });
//     } else {
//       socket.broadcast.emit("stopTyping", { senderId });
//     }
//   });

//   socket.on("deleteMessage", async ({ messageId, senderId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message || message.senderId !== senderId) {
//         socket.emit("error", { message: "Invalid message or unauthorized" });
//         return;
//       }
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
//       if (!message || message.senderId !== senderId) {
//         socket.emit("error", { message: "Invalid message or unauthorized" });
//         return;
//       }
//       message.text = newText;
//       await message.save();
//       io.emit("messageEdited", { messageId, newText });
//     } catch (err) {
//       socket.emit("error", { message: "Failed to edit message" });
//     }
//   });

//   socket.on("addReaction", async ({ messageId, emoji, userId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit("error", { message: "Invalid message" });
//         return;
//       }
//       message.reactions = message.reactions.filter(r => r.userId !== userId);
//       message.reactions.push({ emoji, userId });
//       await message.save();
//       if (message.isPrivate) {
//         socket.to(message.senderId).emit("reactionAdded", { messageId, emoji, userId });
//         socket.to(message.recipientId).emit("reactionAdded", { messageId, emoji, userId });
//         socket.emit("reactionAdded", { messageId, emoji, userId });
//       } else {
//         io.emit("reactionAdded", { messageId, emoji, userId });
//       }
//     } catch (err) {
//       socket.emit("error", { message: "Failed to add reaction" });
//     }
//   });

//   socket.on("removeReaction", async ({ messageId, userId }) => {
//     try {
//       const Message = mongoose.model("Message");
//       const message = await Message.findById(messageId);
//       if (!message) {
//         socket.emit("error", { message: "Invalid message" });
//         return;
//       }
//       message.reactions = message.reactions.filter(r => r.userId !== userId);
//       await message.save();
//       if (message.isPrivate) {
//         socket.to(message.senderId).emit("reactionRemoved", { messageId, userId });
//         socket.to(message.recipientId).emit("reactionRemoved", { messageId, userId });
//         socket.emit("reactionRemoved", { messageId, userId });
//       } else {
//         io.emit("reactionRemoved", { messageId, userId });
//       }
//     } catch (err) {
//       socket.emit("error", { message: "Failed to remove reaction" });
//     }
//   });

//   socket.on("checkPrivateChatRelationship", async ({ senderId, recipientId }, callback) => {
//     try {
//       if (!senderId || !recipientId) throw new Error("Missing senderId or recipientId");
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
//         socket.emit("privateChatAccepted", { senderId, recipientId });
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
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const routes = require("./routes/routes");
const cron = require("node-cron");
const Message = require("models/Message");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const server = http.createServer(app);

// Handle Render's reverse proxy
app.set("trust proxy", 1);

// Manual CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://nameblender.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Additional CORS for redundancy
app.use(cors({
  origin: "https://nameblender.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Debug endpoint to verify deployment
app.get("/debug", (req, res) => {
  res.json({
    version: "deployed with manual CORS and debug endpoint",
    corsOrigin: "https://nameblender.netlify.app",
    mongodbUri: process.env.MONGODB_URI ? "set" : "not set",
  });
});

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "https://nameblender.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use("/api", routes);

// Serve uploaded audio files
app.use("/uploads/audios", express.static(path.join(__dirname, "Uploads/audios")));

// MongoDB connection with retry
const connectMongoDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app");
      console.log("MongoDB connected");
      break;
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Max retries reached. Could not connect to MongoDB.");
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectMongoDB();

const privateChatUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId, callback) => {
    socket.userId = userId;
    socket.join(userId);
    console.log(`${userId} joined their own room`);
    callback();
  });

  socket.on("joinPrivateChat", ({ senderId, recipientId }) => {
    const chatId = [senderId, recipientId].sort().join(":");
    privateChatUsers.set(chatId, (privateChatUsers.get(chatId) || new Set()).add(senderId));
    socket.join(chatId);
    console.log(`${senderId} joined private chat with ${recipientId}`);
  });

  socket.on("sendPrivateMessage", async (message) => {
    try {
      const chatId = [message.senderId, message.recipientId].sort().join(":");
      const newMessage = new Message({
        ...message,
        timestamp: new Date(),
        expiresAt: privateChatUsers.get(chatId)?.size > 1 ? undefined : new Date(Date.now() + 600 * 1000),
      });
      await newMessage.save();
      io.to(chatId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving private message:", err);
    }
  });

  socket.on("typing", ({ senderId, recipientId }) => {
    const chatId = [senderId, recipientId].sort().join(":");
    socket.to(chatId).emit("typing", { senderId, recipientId });
  });

  socket.on("stopTyping", ({ senderId, recipientId }) => {
    const chatId = [senderId, recipientId].sort().join(":");
    socket.to(chatId).emit("stopTyping", { senderId, recipientId });
  });

  socket.on("markMessageSeen", async ({ messageId, recipientId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { seenAt: new Date() },
        { new: true }
      );
      if (message) {
        const chatId = [message.senderId, message.recipientId].sort().join(":");
        io.to(chatId).emit("messageSeen", { messageId, seenAt: message.seenAt });
      }
    } catch (err) {
      console.error("Error marking message as seen:", err);
    }
  });

  socket.on("deleteMessage", async ({ messageId, senderId }) => {
    try {
      const message = await Message.findOneAndDelete({ _id: messageId, senderId });
      if (message) {
        const chatId = [message.senderId, message.recipientId].sort().join(":");
        io.to(chatId).emit("messageDeleted", { messageId });
        if (message.audioUrl) {
          const audioPath = path.join(__dirname, "Uploads/audios", path.basename(message.audioUrl));
          await fs.unlink(audioPath).catch((err) => console.error("Error deleting audio file:", err));
        }
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  });

  socket.on("editMessage", async ({ messageId, newText, senderId }) => {
    try {
      const message = await Message.findOneAndUpdate(
        { _id: messageId, senderId },
        { text: newText },
        { new: true }
      );
      if (message) {
        const chatId = [message.senderId, message.recipientId].sort().join(":");
        io.to(chatId).emit("messageEdited", { messageId, newText });
      }
    } catch (err) {
      console.error("Error editing message:", err);
    }
  });

  socket.on("addReaction", async ({ messageId, emoji, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.reactions = message.reactions.filter((r) => r.userId !== userId).concat({ emoji, userId });
        await message.save();
        const chatId = [message.senderId, message.recipientId].sort().join(":");
        io.to(chatId).emit("reactionAdded", { messageId, emoji, userId });
      }
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  });

  socket.on("removeReaction", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.reactions = message.reactions.filter((r) => r.userId !== userId);
        await message.save();
        const chatId = [message.senderId, message.recipientId].sort().join(":");
        io.to(chatId).emit("reactionRemoved", { messageId, userId });
      }
    } catch (err) {
      console.error("Error removing reaction:", err);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      privateChatUsers.forEach((users, chatId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          if (users.size <= 1) {
            Message.updateMany(
              {
                isPrivate: true,
                $or: [
                  { senderId: socket.userId, recipientId: chatId.split(":")[chatId.split(":").indexOf(socket.userId) ? 0 : 1] },
                  { senderId: chatId.split(":")[chatId.split(":").indexOf(socket.userId) ? 0 : 1], recipientId: socket.userId },
                ],
                expiresAt: { $exists: false },
              },
              { expiresAt: new Date(Date.now() + 600 * 1000) }
            ).catch((err) => console.error("Error setting expiresAt:", err));
          }
          if (users.size === 0) privateChatUsers.delete(chatId);
        }
      });
      console.log(`${socket.userId} disconnected`);
    }
  });
});

// Clean up expired global messages every hour
cron.schedule("0 * * * *", async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Skipping global message cleanup: MongoDB not connected");
      return;
    }
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await Message.deleteMany({ isPrivate: false, timestamp: { $lt: twoDaysAgo } });
    console.log("Expired global messages cleaned up");
  } catch (err) {
    console.error("Error cleaning up global messages:", err);
  }
});

// Clean up expired private messages and audio files every minute
cron.schedule("* * * * *", async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Skipping private message cleanup: MongoDB not connected");
      return;
    }
    const now = new Date();
    const expiredMessages = await Message.find({ isPrivate: true, expiresAt: { $lte: now } });
    for (const message of expiredMessages) {
      if (message.audioUrl) {
        const audioPath = path.join(__dirname, "Uploads/audios", path.basename(message.audioUrl));
        await fs.unlink(audioPath).catch((err) => console.error("Error deleting audio file:", err));
      }
    }
    await Message.deleteMany({ isPrivate: true, expiresAt: { $lte: now } });
    console.log("Expired private messages and audio files cleaned up");
  } catch (err) {
    console.error("Error cleaning up private messages:", err);
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));