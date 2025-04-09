import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="logo">
          <Link to="/home" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition duration-200">
            BlogTime
          </Link>
        </div>
        
        <ul className="flex space-x-8 items-center">
          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to="/home" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/create" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                >
                  Create Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                >
                  About
                </Link>
              </li>
              <li className="relative group">
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 flex items-center"
                >
                  <span>Profile</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/edit-profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
