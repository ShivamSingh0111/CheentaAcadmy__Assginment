const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signupRouter = express.Router();

signupRouter.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    // Create new user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Signup successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = signupRouter;
