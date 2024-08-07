// Import statements
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');  // State to manage error messages
  const [loading, setLoading] = useState(false); // State to manage loading state
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true during form submission
    try {

      // Send POST request to login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        emailOruserName: formData.emailOrUsername, // Use entered email or username
        password: formData.password, // Use entered password
      });

      const { token, user } = response.data.result;  // Extract token and user details from response

      // Store user details in localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Call onLogin function passed as prop to update application state
      onLogin();

      // Redirect to home page or any other route upon successful login
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error); // Set error message from server response
      } else {
        setError('Failed to log in. Please try again later.'); // Set generic error message
      }
    } finally {
      setLoading(false); // Set loading state to false after request completes
    }
  };

  return (
    <div className="container pt-4 pb-5 ps-3 pe-3 mt-5">

      {/* Container for login form */}
      <div className="row border border-secondary-light rounded-3 shadow bg-light mx-auto w-lg-50 w-md-75 w-75 mt-5">

        {/* Left Column - Login Header */}
        <div className="col-lg-5 col-md-5 col-sm-5 rounded-top-mobile rounded-start-desktop p-4 bg-primary d-flex flex-column justify-content-center align-items-center">

          {/* Header Title and Icon */}
          <h1 className="text-center text-light mb-4">Login</h1>
          <i className="fa-brands text-light fa-x-twitter" style={{ fontSize: '5em' }}></i>
        </div>

        {/* Right Column - Login Form */}
        <div className="col-lg-7 col-md-7 col-sm-7">

          {/* Form Section */}
          <form className="p-sm-5 p-md-5 p-lg-5 p-3 pt-4" onSubmit={handleSubmit}>

            {/* Form Title */}
            <h3 className="text-center text-md-start fw-bold mb-4">Login</h3>

            {/* Display error message if there's an error */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Email or Username Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Email or Username"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
                className="form-control text-center text-md-start"
                id="emailOrUsername"
                name="emailOrUsername"
              />
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control text-center text-md-start"
                id="password"
                name="password"
              />
            </div>

            {/* Login Button */}
            <div className="mb-3 d-flex justify-content-center justify-content-md-start">
              <button className="btn btn-dark text-light" type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center text-md-start">
              <p>
                Not Registered Yet?{' '}
                <button
                  className="btn text-primary"
                  type="button"
                  onClick={() => navigate('/register')}
                >
                  <u>Register here</u>
                </button>{' '}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
