
// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   senderId: { type: String, required: true },
//   text: { type: String, required: true },
//   recipientId: { type: String },
//   isPrivate: { type: Boolean, default: false },
//   timestamp: { type: Date, default: Date.now },
//   replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
//   seenAt: { type: Date },
//   expiresAt: { type: Date }, // For private message expiration
//   reactions: [
//     {
//       emoji: { type: String, required: true },
//       userId: { type: String, required: true },
//     },
//   ],
// });

// // Indexes for efficient cleanup queries
// messageSchema.index({ isPrivate: 1, timestamp: 1 });
// messageSchema.index({ isPrivate: 1, expiresAt: 1 });

// module.exports = mongoose.model("Message", messageSchema);


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  recipientId: { type: String },
  text: { type: String },
  audioUrl: { type: String }, // URL to the stored audio file
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  seenAt: { type: Date },
  expiresAt: { type: Date }, // For private message expiration
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  reactions: [{ emoji: String, userId: String }],
});

messageSchema.index({ senderId: 1, recipientId: 1, isPrivate: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Optional TTL for cleanup

module.exports = mongoose.model("Message", messageSchema);