const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt=require("jsonwebtoken")
const loginRouter = express.Router();
require("dotenv").config();
loginRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    const verify = await bcrypt.compare(password, user.password);
    if (!verify) return res.status(400).json({ message: "Invalid credentials" });
    
    const token=jwt.sign({id: user._id, email: user.email},process.env.JWT_SECRET)    
    res.json({ message: "Login successful",token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = loginRouter;

