import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
// Remove the CSS import as we're using Tailwind
// import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const userResponse = await axios.get("http://localhost:5000/user/profile", { headers });
        setUser(userResponse.data);

        const blogsResponse = await axios.get(`http://localhost:5000/blog/user/${userResponse.data._id}`, { headers });
        setBlogs(blogsResponse.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {user ? (
            <div className="flex flex-col items-center">
              <img 
                src={user.avatar || "https://via.placeholder.com/100"} 
                alt="User Avatar" 
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 mb-4">Email: {user.email}</p>
              <button 
                onClick={handleEditProfile}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading profile...</p>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Blogs</h3>
        <div className="space-y-4">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div 
                key={blog._id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{blog.title}</h4>
                <p className="text-gray-600 mb-4">{blog.content.substring(0, 100)}...</p>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  Read More
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 bg-white rounded-lg shadow-md p-6">
              No blogs written yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;