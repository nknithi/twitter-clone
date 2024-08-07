import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap'; // Assuming you are using Bootstrap for modals

const UploadProfilePhotoModal = ({ show, handleClose, handleUpload }) => {

  // State variables to manage file selection, preview, and error handling
  // Stores the selected file object
  const [selectedFile, setSelectedFile] = useState(null);

  // Stores the URL of the selected file for preview
  const [preview, setPreview] = useState(null);

  // Error message to display when file selection fails
  const [error, setError] = useState('');


  // Handler for when a file is selected
  const handleFileChange = (event) => {

    // Get the selected file from the input event
    const file = event.target.files[0];

    // Store the selected file in state
    setSelectedFile(file);

    if (file) {

      // Create a preview URL for the selected file
      const objectUrl = URL.createObjectURL(file);

      // Set the preview URL to display the selected image
      setPreview(objectUrl);

      // Reset any previous error messages
      setError('');
    } else {

      // Reset preview if no file is selected
      setPreview(null);
    }
  };

  // Handler for saving the selected profile picture
  const handleSave = () => {

    // Validate that a file is selected
    if (!selectedFile) {
      setError('Please select an image file'); // Display error message if no file is selected
      return; // Exit the function if no file is selected
    }

    handleUpload(selectedFile); // Call the parent component function to handle file upload
    handleClose();  // Close the modal after handling the file upload
  };

  // Cleanup function to revoke the object URL to avoid memory leaks
  useEffect(() => {
    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview); // Revoke the preview URL when the component unmounts
      }
    };
  }, [preview]); // Dependencies array ensures the cleanup runs only when preview changes

  return (
    <Modal show={show} onHide={handleClose} centered>

      {/* Modal header */}
      <Modal.Header closeButton>
        <Modal.Title>Upload Profile Pic</Modal.Title>
      </Modal.Header>

      {/* Modal body */}
      <Modal.Body>

        {/* Note section */}
        <p className="text-primary" style={{ backgroundColor: '#eaf1f8', padding: '13px' }}>
          Note: The image should be square in shape.
        </p>

        {/* File input for selecting image */}
        <input type="file" onChange={handleFileChange} accept="image/*" className="form-control mb-2" />

        {/* Error message display */}
        {error && <div className="text-danger mb-2">{error}</div>}

        {/* Image preview */}
        {preview && (
          <div className="text-center mb-2">
            <img src={preview} alt="Profile Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </div>
        )}
      </Modal.Body>

      {/* Modal footer with Close and Save buttons */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Profile Pic
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadProfilePhotoModal;
