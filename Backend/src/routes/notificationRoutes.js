const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Notification = require("../models/Notification");

const notificationRouter = express.Router();

// Get unread notifications for the logged-in user
notificationRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id, isRead: false })
      .populate("sender", "name")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notifications as read
notificationRouter.put("/read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete all notifications for the user
notificationRouter.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = notificationRouter;
