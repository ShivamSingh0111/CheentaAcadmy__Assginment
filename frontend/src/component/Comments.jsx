import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const Comments = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const blogResponse = await axios.get(`http://localhost:5000/blog/${blogId}`, { headers });
        setBlog(blogResponse.data);

        const commentsResponse = await axios.get(`http://localhost:5000/blog/${blogId}/comments`, { headers });
        setComments(commentsResponse.data);

        const userResponse = await axios.get(`http://localhost:5000/user/profile`, { headers });
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error("Failed to fetch blog or comments", error);
      }
    };

    fetchBlogAndComments();
  }, [blogId, token]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`http://localhost:5000/blog/${blogId}/comment`, { text: newComment }, { headers });

      const updatedComments = await axios.get(`http://localhost:5000/blog/${blogId}/comments`, { headers });
      setComments(updatedComments.data);

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  // 1. First, let's check if the commentId is in the correct format
const handleDeleteComment = async (commentId) => {
  try {
    console.log(`Attempting to delete comment with ID: ${commentId}`);
    console.log(`Blog ID: ${blogId}`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Log the exact URL being called
    const deleteUrl = `http://localhost:5000/blog/${blogId}/comment/${commentId}`;
    console.log(`DELETE request to: ${deleteUrl}`);
    
    // Add specific error handling to see the full error response
    try {
      await axios.delete(deleteUrl, { headers });
      console.log("Comment deleted successfully");
      
      // Update state after deletion
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      console.error("Status code:", error.response?.status);
      console.error("Headers:", error.response?.headers);
      throw error; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Failed to delete comment", error);
  }
};

const canDeleteComment = (comment) => {
  if (!currentUser) return false;
  
  // User who posted the comment
  if (comment.user?._id === currentUser._id) {
    return true;
  }
  
  // Blog author can delete any comment
  if (blog?.author?._id === currentUser._id) {
    return true;
  }
  
  return false;
};

  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 px-4">
        {blog ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">{blog.title}</h2>
            <p className="text-gray-600">by {blog.author?.name || "Unknown"}</p>
            <p className="mt-2 text-gray-700">{blog.content}</p>
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading blog...</p>
        )}

        <h2 className="mt-6 text-xl font-semibold text-gray-800">Comments</h2>
        <div className="mt-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">
                  <strong className="text-blue-600">{comment.user?.name || "Unknown"}</strong>: {comment.text}
                </p>
                {canDeleteComment(comment) && (
                  <button
                    className="mt-2 px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No comments yet.</p>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
