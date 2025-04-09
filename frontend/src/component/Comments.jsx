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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const blogResponse = await axios.get(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}`, { headers });
        setBlog(blogResponse.data);

        const commentsResponse = await axios.get(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}/comments`, { headers });
        setComments(commentsResponse.data);

        const userResponse = await axios.get(`https://cheentaacadmy-assginment-1.onrender.com/user/profile`, { headers });
        setCurrentUser(userResponse.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load blog and comments");
        console.error("Failed to fetch blog or comments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [blogId, token]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}/comment`, { text: newComment }, { headers });

      const updatedComments = await axios.get(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}/comments`, { headers });
      setComments(updatedComments.data);

      setNewComment("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add comment");
      console.error("Failed to add comment", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}/comment/${commentId}`, { headers });
      
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete comment");
      console.error("Failed to delete comment", error);
    }
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    
    if (comment.user?._id === currentUser._id) {
      return true;
    }
    
    if (blog?.author?._id === currentUser._id) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 px-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading blog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : blog ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">{blog.title}</h2>
            <p className="text-gray-600">by {blog.author?.name || "Unknown"}</p>
            <p className="mt-2 text-gray-700">{blog.content}</p>
          </div>
        ) : null}

        <h2 className="mt-6 text-xl font-semibold text-gray-800">Comments</h2>
        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-center text-gray-600">Loading comments...</p>
          ) : comments.length > 0 ? (
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
            disabled={commentLoading}
          />
          <button
            onClick={handleAddComment}
            disabled={commentLoading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {commentLoading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
