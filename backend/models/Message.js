const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  recipientId: { type: String },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  seenAt: { type: Date },
});

module.exports = mongoose.model("Message", messageSchema);
