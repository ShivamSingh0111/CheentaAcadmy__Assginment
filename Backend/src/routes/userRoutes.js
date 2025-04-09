const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const user=express.Router();

// Get logged-in user details
user.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password field
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = user

