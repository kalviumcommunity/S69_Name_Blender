// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   senderId: { type: String, required: true },
//   text: { type: String, required: true },
//   recipientId: { type: String },
//   isPrivate: { type: Boolean, default: false },
//   timestamp: { type: Date, default: Date.now },
//   replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
//   seenAt: { type: Date },
//   reactions: [
//     {
//       emoji: { type: String, required: true },
//       userId: { type: String, required: true },
//     },
//   ],
// });

// // TTL index for private messages: expire after 2 hours (7200 seconds)
// messageSchema.index(
//   { timestamp: 1 },
//   {
//     expireAfterSeconds: 7200,
//     partialFilterExpression: { isPrivate: true },
//   }
// );

// module.exports = mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  recipientId: { type: String },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  seenAt: { type: Date },
  expiresAt: { type: Date }, // For private message expiration
  reactions: [
    {
      emoji: { type: String, required: true },
      userId: { type: String, required: true },
    },
  ],
});

// Indexes for efficient cleanup queries
messageSchema.index({ isPrivate: 1, timestamp: 1 });
messageSchema.index({ isPrivate: 1, expiresAt: 1 });

module.exports = mongoose.model("Message", messageSchema);