// Import statements
import React, { useState, useEffect } from 'react';

const EditModal = ({ show, handleClose, profileUser, handleUpdate }) => {

  // State to manage updated profile data and errors
  const [updatedProfile, setUpdatedProfile] = useState({
    fullName: '',
    location: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    location: '',
    dateOfBirth: '',
  });

  // Function to format date string to a readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (profileUser) {
      const formattedDateOfBirth = profileUser.dateOfBirth ? new Date(profileUser.dateOfBirth).toISOString().split('T')[0] : '';

      setUpdatedProfile({
        fullName: profileUser.fullName || '',
        location: profileUser.location || '',
        dateOfBirth: formattedDateOfBirth,
      });
    }
  }, [profileUser]);


  // Handle input changes and update updatedProfile state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };


  // Handle saving changes and validate form fields
  const handleSaveChanges = () => {
    const { fullName, location, dateOfBirth } = updatedProfile;
    let formErrors = {};

    if (!fullName.trim()) {
      formErrors.fullName = 'Full Name is required';
    }

    if (!location.trim()) {
      formErrors.location = 'Location is required';
    }

    if (!dateOfBirth) {
      formErrors.dateOfBirth = 'Date of Birth is required';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Call handleUpdate function from props to update profile
    handleUpdate(updatedProfile);
  };

  // Render null if show prop is false to hide modal
  if (!show) {
    return null;
  }

  // Modal component with Bootstrap classes
  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          {/* Modal header with title and close button */}
          <div className="modal-header">
            <h5 className="modal-title">Edit Profile</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          {/* Modal body with form to edit profile */}
          <div className="modal-body">
            <form>

              {/* Input field for Full Name */}
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={updatedProfile.fullName}
                  onChange={handleChange}
                  required
                />

                {/* Display error message if fullName field is empty */}
                {errors.fullName && <div className="text-danger">{errors.fullName}</div>}
              </div>

              {/* Input field for Location */}
              <div className="mb-3">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={updatedProfile.location}
                  onChange={handleChange}
                  required
                />

                {/* Display error message if location field is empty */}
                {errors.location && <div className="text-danger">{errors.location}</div>}
              </div>

              {/* Input field for Date of Birth */}
              <div className="mb-3">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={updatedProfile.dateOfBirth}
                  onChange={handleChange}
                  required
                />

                {/* Display error message if dateOfBirth field is empty */}
                {errors.dateOfBirth && <div className="text-danger">{errors.dateOfBirth}</div>}
              </div>
            </form>
          </div>

          {/* Modal footer with Close and Edit buttons */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
