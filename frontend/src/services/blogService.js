import axios from "axios";

const API_URL = "http://localhost:5000/blog";

export const fetchBlogs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.map((blog) => ({
    ...blog,
    likes: Number.isInteger(blog.likes) ? blog.likes : 0, // Ensure likes is taken from backend, not reset to 0
  }));
};

export const likeBlog = async (blogId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `${API_URL}/${blogId}/like`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      likes: Number.isInteger(response.data.likes) ? response.data.likes : 0, // Ensure backend likes count is reflected
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to like/unlike blog");
  }
};
