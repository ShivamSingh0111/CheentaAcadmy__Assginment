const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const notificationRoutes = require("./src/routes/notificationRoutes");
const userRoutes=require('./src/routes/userRoutes')
dotenv.config();
connectDB();

require("dotenv").config

const app = express();
app.use(express.json());
app.use(cors());

const signupRouter = require("./src/routes/signup");
const loginRouter = require("./src/routes/login");
const authMiddleware = require("./src/middlewares/authMiddleware");
const blogRouter = require("./src/routes/blogRoutes");



app.use("/user", userRoutes);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use('/blog',authMiddleware,blogRouter)
app.use("/notifications", notificationRoutes);

app.get("/",(req,res)=>{
  res.send("Healthy")
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
