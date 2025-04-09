const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require('../middlewares/authMiddleware')
const Notification=require('../models/Notification');
const blogRouter = express.Router();


// Get all blogs by a specific user
 blogRouter.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });

    if (!blogs.length) return res.status(404).json({ message: "No blogs found for this user" });

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




blogRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newBlog = new Blog({ title, content, author: req.user.id });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

blogRouter.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email"); // Populate author details

    // ✅ Ensure each blog has `likes` as a count instead of an array
    const formattedBlogs = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author, // Already populated with name & email
      likes: blog.likes.length, // Return only count, not the array
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    }));

    res.json(formattedBlogs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


blogRouter.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Update a blog post
blogRouter.put("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only author can update
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.updatedAt = Date.now();

    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Delete a blog post
blogRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only author can delete
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

blogRouter.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user.id;
    let likedByUser = false;

    if (blog.likes.includes(userId)) {
      // Unlike: Remove like
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      // Like: Add like
      blog.likes.push(userId);
      likedByUser = true;
    }

    await blog.save();

    // ✅ Return only the total likes count, NOT the likes array
    res.json({ likes: blog.likes.length, likedByUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});







// Add a comment to a blog post
blogRouter.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author"); // Get blog with author details
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    blog.comments.push(newComment);
    await blog.save();

    if (blog.author._id.toString() !== req.user.id) { // Don't notify self-comments
      await Notification.create({
        recipient: blog.author._id,
        sender: req.user.id,
        type: "comment",
        blog: blog._id,
        message: `${req.user.name} commented on your blog "${blog.title}".`,
      });
    }

    res.json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// Get all comments for a blog post
blogRouter.get("/:id/comments", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("comments.user", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

blogRouter.delete("/blog/:blogId/comment/:commentId", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user._id.toString(); // Convert to string for comparison
    
    console.log(`Delete request - Blog ID: ${blogId}, Comment ID: ${commentId}, User ID: ${userId}`);
    
    // Find the blog
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      console.log(`Blog with ID ${blogId} not found`);
      return res.status(404).json({ error: "Blog not found" });
    }
    
    // Check if user is the blog author
    const isBlogAuthor = blog.author.toString() === userId;
    
    // Find the comment
    const commentIndex = blog.comments.findIndex(c => c._id.toString() === commentId);
    
    if (commentIndex === -1) {
      console.log(`Comment with ID ${commentId} not found in blog`);
      console.log(`Available comment IDs: ${blog.comments.map(c => c._id.toString())}`);
      return res.status(404).json({ error: "Comment not found" });
    }
    
    const comment = blog.comments[commentIndex];
    
    // Check if user is the comment author
    // Note: comment.user might be an ObjectId or a user object with an _id property
    const commentUserId = comment.user._id ? comment.user._id.toString() : comment.user.toString();
    const isCommentAuthor = commentUserId === userId;
    
    console.log(`Comment user ID: ${commentUserId}, Current user ID: ${userId}`);
    console.log(`Is blog author: ${isBlogAuthor}, Is comment author: ${isCommentAuthor}`);
    
    // Check authorization
    if (!isCommentAuthor && !isBlogAuthor) {
      console.log("User is neither comment author nor blog author");
      return res.status(403).json({ error: "Unauthorized to delete this comment" });
    }
    
    // Remove the comment
    blog.comments.splice(commentIndex, 1);
    await blog.save();
    
    console.log("Comment deleted successfully");
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = blogRouter;
