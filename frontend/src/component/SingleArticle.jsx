import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const SingleArticle = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
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

  const handleLike = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`https://cheentaacadmy-assginment-1.onrender.com/blog/${blogId}/like`, {}, { headers });
      setBlog(prevBlog => ({ ...prevBlog, likes: response.data.likes }));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to like blog");
      console.error("Failed to like blog", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading article...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : blog ? (
          <div className="space-y-8">
            {/* Article Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{blog.title}</h1>
                  <p className="text-gray-600">
                    by {blog.author?.name || "Unknown Author"}
                  </p>
                </div>
                <button
                  onClick={handleLike}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition duration-200"
                >
                  <span className="mr-1">👍</span> {blog.likes || 0}
                </button>
              </div>
              
              {/* Article Content */}
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{blog.content}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comments</h2>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800">
                          <strong className="text-blue-600">{comment.user?.name || "Unknown"}</strong>: {comment.text}
                        </p>
                        {canDeleteComment(comment) && (
                          <button
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="mt-6">
                <textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  disabled={commentLoading}
                />
                <div className="mt-3 flex justify-end">
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SingleArticle; 