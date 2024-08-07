// Import statements
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TweetDetails from './pages/TweetDetails'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfileDetails from './pages/ProfileDetails'

import LogoutModal from './components/LogoutModal';

function App() {

  // State to manage authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State to store user data
  const [user, setUser] = useState(null);
  // State to manage the visibility of the logout modal

  const [showLogoutModal, setShowLogoutModal] = useState(false);


  // Effect to check local storage for user data and authentication token
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData)); // Parse and set user data
      setIsAuthenticated(true); // Set authentication status to true
    } else {
      setIsAuthenticated(false); // Set authentication status to false
    }
  }, []);


  // Function to handle user login
  const handleLogin = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));  // Parse and set user data 
      setIsAuthenticated(true); // Set authentication status to true
    }
  };


  // Function to handle user logout (showing the logout modal)
  const handleLogout = () => {
    setShowLogoutModal(true);
  };


  // Function to close the logout modal
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // Function to confirm and handle the actual logout process
  const handleConfirmLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setShowLogoutModal(false);
  };

  return (
    <Router>
      <ToastContainer /> {/* Toast notifications container */}
      <Routes>

        {/* Route for home page */}
        <Route
          exact path="/"
          element={isAuthenticated ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Route for login page */}
        <Route
          exact path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
        />

        {/* Route for registration page */}
        <Route
          exact path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />

        {/* Route for user profile page with dynamic userId parameter */}
        <Route
          exact path="/profile/:userId" // Define your route with dynamic userId parameter
          element={isAuthenticated ? <ProfileDetails user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Route for tweet details page with dynamic id parameter */}
        <Route
          exact path="/tweet/:id" // Add this route
          element={isAuthenticated ? <TweetDetails user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* Catch-all route to redirect to home or login based on authentication status */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>


      {/* Conditional rendering of LogoutModal component */}
      {showLogoutModal && <LogoutModal onClose={handleCloseLogoutModal} onLogout={handleConfirmLogout} />}

    </Router>
  );
}

export default App;