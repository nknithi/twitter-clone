// Import statements
import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const CreatePostDialog = ({ showModal, onClose, onCreate, authToken }) => {

  // State variables to manage form inputs and state
  const [newTweetContent, setNewTweetContent] = useState('');
  const [tweetImage, setTweetImage] = useState(null); // State to hold the selected image file
  const [imagePreview, setImagePreview] = useState(''); // State to hold the URL of the selected image preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      // Validate tweet content
      if (!newTweetContent.trim()) {
        setError('Tweet content cannot be empty.');
        return;
      }

      // Create FormData object to send tweet content and image
      const formData = new FormData();
      formData.append('content', newTweetContent);
      if (tweetImage) {
        formData.append('image', tweetImage);
      }

      // Configuration for axios request including authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      // Send POST request to create a new tweet
      const response = await axios.post('http://localhost:5000/api/tweet', formData, config);

      // Handle successful response
      if (response.status === 201) {
        toast.success('Tweet created successfully.');
        setNewTweetContent('');
        setTweetImage(null);
        setImagePreview(''); // Clear image preview after successful upload
        onCreate(); // Trigger parent component callback to update state
        onClose(); // Close the modal dialog
      } else {
        console.error('Unexpected response:', response);
        setError('Failed to create tweet. Unexpected status.');
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      toast.error('Failed to create tweet.');
      setError('Failed to create tweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Function to handle changes in the tweet content textarea
  const handleChange = (e) => {
    setNewTweetContent(e.target.value);
    setError(''); // Clear error message on content change
  };


  // Function to handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setTweetImage(file);

    // Display selected image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };


  return (
    // Modal container with conditional show/hide classes based on showModal prop
    <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="createPostModal" tabIndex="-1" aria-labelledby="createPostModalLabel" aria-hidden={!showModal}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="createPostModalLabel">New Tweet</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          {/* Modal body containing the tweet creation form */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="What's happening?"
                  value={newTweetContent}
                  onChange={handleChange}
                  required
                  rows={4} // Adjust the number of rows as needed
                  style={{ minHeight: '100px' }}
                ></textarea>

                {/* Display error message if tweet content is empty */}
                {error && <div className="invalid-feedback d-block">{error}</div>}
              </div>

              {/* Input for uploading an image */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control d-none"
                    id="tweetImage"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                  />

                  {/* Label with FontAwesome icon for selecting an image */}
                  <label htmlFor="tweetImage" className="input-group-text">
                    <FontAwesomeIcon icon={faImage} />
                  </label>
                </div>
              </div>

              {/* Display image preview if an image is selected */}
              {imagePreview && (
                <div className="mb-3">
                  <img src={imagePreview} alt="Selected Image" className="img-fluid rounded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </div>
              )}

              {/* Modal footer with Close and Tweet buttons */}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Tweeting...' : 'Tweet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostDialog;