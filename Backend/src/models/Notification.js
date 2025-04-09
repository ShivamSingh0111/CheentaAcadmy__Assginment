const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who gets the notification
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the notification
  type: { type: String, enum: ["like", "comment"], required: true }, // Type of notification
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true }, // Blog post related to this notification
  message: { type: String, required: true }, // Notification message
  isRead: { type: Boolean, default: false }, // Has the user seen this?
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
