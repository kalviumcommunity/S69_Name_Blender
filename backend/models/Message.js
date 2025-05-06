const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  recipientId: { type: String },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  seenAt: { type: Date },
  // reactions: [
  //   {
  //     emoji: { type: String, required: true },
  //     userId: { type: String, required: true },
  //   },
  // ],
});

// TTL index for private messages: expire after 2 hours (7200 seconds)
messageSchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 7200,
    partialFilterExpression: { isPrivate: true },
  }
);

module.exports = mongoose.model("Message", messageSchema);
