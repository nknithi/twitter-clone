import React, { useState } from 'react';
import axios from 'axios';  // Importing axios for making HTTP requests
import { toast, ToastContainer } from 'react-toastify'; // Importing toast notifications


const ReplyModal = ({ tweetId, authToken, onClose, onReply, show }) => {
  const [replyContent, setReplyContent] = useState('');  // State to hold the reply content
  const [loading, setLoading] = useState(false); // State to track loading state
  const [error, setError] = useState(''); // State to store error messages

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true
    try {
      if (!replyContent.trim()) { // Check if reply content is empty
        setError('Reply content cannot be empty.'); // Set error message
        return;  // Exit function early
      }

      // Send POST request to submit reply
      await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/reply`, // API endpoint for posting reply
        { content: replyContent }, // Reply content data
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Authorization token in headers
          },
        }
      );

      onReply(); // Callback function to handle successful reply submission
      toast.success('Reply posted successfully.'); // Display success toast notification
      setReplyContent(''); // Clear reply content after successful submission
      onClose(); // Close modal
    } catch (error) {
      console.error('Error replying to tweet:', error);  // Log error to console
      toast.error('Failed to post reply.'); // Display error toast notification
      setError('Failed to post reply. Please try again.'); // Set error state
    } finally {
      setLoading(false); // Set loading state to false regardless of success or failure
    }
  };

  // Function to handle input change in the reply textarea
  const handleChange = (e) => {
    setReplyContent(e.target.value); // Update reply content state with input value
    setError('');  // Clear any existing error message
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    onClose(); // Close modal
  };

  // Function to handle canceling the reply action
  const handleCancel = () => {
    setReplyContent(''); // Clear reply content
    setError(''); // Clear any existing error message
    onClose(); // Close modal
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} id="replyModal" tabIndex="-1" aria-labelledby="replyModalLabel" aria-modal="true">

      {/* Modal dialog */}
      <div className="modal-dialog">

        {/* Modal content */}
        <div className="modal-content">

          {/* Modal header */}
          <div className="modal-header">
            <h5 className="modal-title" id="replyModalLabel">Tweet your reply</h5>

            {/* Close button */}
            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
          </div>

          {/* Modal body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">

                {/* Textarea for entering reply */}
                <textarea
                  className="form-control"
                  placeholder="Your reply..."
                  value={replyContent}
                  onChange={handleChange}
                  required
                  rows={4} // Adjust the number of rows as needed
                  style={{ minHeight: '100px' }}
                ></textarea>

                {/* Display error message if there's an error */}
                {error && <div className="invalid-feedback d-block">{error}</div>}
              </div>

              {/* Modal footer */}
              <div className="modal-footer">

                {/* Close button */}
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Close</button>

                {/* Submit button for replying */}
                <button type="submit" className="btn btn-primary" disabled={loading}>Reply</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporting ReplyModal component as default
export default ReplyModal;