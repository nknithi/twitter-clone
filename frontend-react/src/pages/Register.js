// RegisterForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the CSS file
import '../App.css';
import axios from 'axios';

// Import Toast components for notifications
import { toast, ToastContainer } from 'react-toastify';


// Register component
function Register() {

  // State to hold form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    password: ''
  });

  // State to hold error messages
  const [error, setError] = useState('');

  // Hook for navigation
  const navigate = useNavigate();

  // Function to handle input changes and update state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {

    // Prevent default form submission behavior
    e.preventDefault();
    try {

      // Send POST request to backend to register user
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('Registration successful. Please login to continue.'); // Show success toast message


      navigate('/login');  // Navigate to login page
    } catch (error) {
      setError(error.response.data.error); // Set error message if registration fails
    }
  };

  return (
    <div className="container pt-4 pb-5 ps-3 pe-3  mt-5">
      <div className="row border  border-secondary-light  rounded-3 shadow  bg-light  mx-auto w-lg-50 w-md-75 w-75  mt-5 ">
        <div className="col-lg-5 col-md-5 col-sm-5 rounded-top-mobile rounded-start-desktop p-4  bg-primary d-flex flex-column justify-content-center align-items-center">
          <h1 className="text-center text-light mb-4">Join Us!</h1>
          <i className="fa-brands text-light  fa-x-twitter" style={{ fontSize: '5em' }}></i>
        </div>
        <div className="col-lg-7 col-md-7  col-sm-7  ">
          <form className="p-sm-5 p-md-5 p-lg-5 p-3 pt-4" onSubmit={handleSubmit} >
            <h3 className=" text-center text-md-start fw-bold mb-4 ">Register</h3>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Input field for full name */}
            <div className="mb-3">
              <input type="text" placeholder="Full Name" required value={formData.fullName}
                onChange={handleChange} className="form-control text-center text-md-start" id="fullName" name="fullName" />
            </div>

            {/* Input field for email */}
            <div className="mb-3">
              <input type="email" placeholder="Email" value={formData.email}
                onChange={handleChange} required className="form-control text-center text-md-start" id="email" name="email" />
            </div>

            {/* Input field for username */}
            <div className="mb-3">
              <input type="text" placeholder="User Name" value={formData.userName}
                onChange={handleChange} required className="form-control text-center text-md-start" id="userName" name="userName" />
            </div>

            {/* Input field for password */}
            <div className="mb-3">
              <input type="password" id="password" value={formData.password}
                onChange={handleChange} name="password" required className="form-control text-center text-md-start" placeholder="Password" />
            </div>

            {/* Register button */}
            <div className="mb-3 d-flex justify-content-center justify-content-md-start">

              <button className="btn  btn-dark text-light  " type="submit">Register</button>
            </div>

            {/* Link to login page */}
            <div className="text-center text-md-start">
              <p>Already Registered?<button className="btn  text-primary   " type="submit"
                onClick={() => navigate('/login')}><u>Login here</u></button> </p>
            </div>
          </form>
        </div>

      </div>


    </div>


  );
}

export default Register;
