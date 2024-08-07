import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TweetCard.css'; // Import the CSS file for styling
import { toast, ToastContainer } from 'react-toastify';
import formatDate from '../utils/dateUtils'; // Import formatDate function


const TweetCard = ({ tweet, user, handleDelete, handleLike, handleReply, retweetTweet, handleDeleteReply }) => {
  const { _id, tweetedBy, createdAt, content, image, retweetBy, likes, replyCount, isReply } = tweet || {};
  { console.log("reply count is beginning " + { replyCount }) }

  const [retweeters, setRetweeters] = useState([]);
  const [loadingRetweeters, setLoadingRetweeters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    // Function to fetch retweeters when retweetBy array changes
    const fetchRetweeters = async () => {
      try {
        setLoadingRetweeters(true);
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        };

        // Fetching user details for each retweetBy user ID
        const users = await Promise.all(
          retweetBy.map(async (userId) => {
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`, config);
            return response.data.result; // Assuming result contains user details
          })
        );
        setRetweeters(users);  // Setting retweeters state
      } catch (error) {
        console.error('Error fetching retweeters:', error); // Logging error if fetching fails
      } finally {
        setLoadingRetweeters(false); // Reset loading state after fetch completes
      }
    };

    if (retweetBy && retweetBy.length > 0) {
      fetchRetweeters(); // Call fetchRetweeters when retweetBy changes and is not empty
    }
  }, [retweetBy]); // Dependency array to re-run effect when retweetBy changes

  if (!tweet || !tweetedBy) {
    return null; // Or render a loading state or error message
  }

  const isRetweet = retweetBy && retweetBy.length > 0; // Check if the tweet is a retweet
  const isLiked = likes && likes.includes(user._id); // Check if the tweet is liked by the current user

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent navigating to details page on delete
    handleDelete(_id);
  };

  // Event handler to prevent default and propagate behaviors for card click
  const handleLikeClick = (event) => {
    event.stopPropagation(); // Prevent navigating to details page on like
    handleLike(_id, isLiked);
  };

  const handleReplyClick = (event) => {
    event.stopPropagation(); // Prevent navigating to details page on reply
    handleReply(_id, "Reply content placeholder");
  };

  const handleRetweetClick = (event) => {
    event.stopPropagation(); // Prevent navigating to details page on retweet
    retweetTweet(_id);
  };



  // Event handler to prevent default behavior of anchor tag and propagate behaviors for username click
  const handleUsernameClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of anchor tag
    event.stopPropagation(); // Prevent the event from propagating to the parent card
    navigate(`/profile/${tweetedBy._id}`, { state: { from: 'tweetCard' } });
  };

  const handleCardClick = () => {
    navigate(`/tweet/${_id}`);
  };

  return (
    <div className="card mb-3" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card-body p-3 border">

        {/* Display retweet information if it's a retweet */}
        {isRetweet && !loadingRetweeters && retweeters.length > 0 && (
          <p className="text-muted mb-2">
            <i className="fas fa-retweet me-1"></i> Retweeted by{' '}
            {retweeters.map((retweeter, index) => (
              <span key={index}>
                {retweeter.userName}
                {index !== retweeters.length - 1 && ', '}
              </span>
            ))}
          </p>
        )}

        <div className="d-flex align-items-start">

          {/* Display user profile image if available */}
          {tweetedBy.profileImg && (
            <img
              src={tweetedBy.profileImg}
              alt="User Avatar"
              className="rounded-circle me-2 img-fluid"
              width="50"
              height="50"
            />
          )}
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center mb-2">

              {/* Display username as a link */}
              <p className="fw-bold mb-0">
                <a href={`#`} onClick={handleUsernameClick} className="username-link">
                  {'@' + tweetedBy.userName}
                </a>
              </p>

              {/* Display formatted creation date */}
              <p className="text-muted mb-0 ms-2">- {formatDate(createdAt)}</p> {/* Use formatDate function */}
            </div>

            {/* Display tweet content */}
            <p className="card-text mb-3">{content}</p>

            {/* Display tweet image if available */}
            {image && (
              <div className="mb-3" style={{ width: '75%', minWidth: '300px' }}>
                <img
                  src={image}
                  alt="Tweet Image"
                  className="img-fluid rounded"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Display buttons for like, reply, and retweet */}
            <div className="d-flex align-items-center">
              <button className="btn btn-link ms-3" onClick={handleLikeClick}>
                <i className={`fa-heart ${isLiked ? 'fas' : 'far'} me-1 text-danger`}></i> {likes.length}
              </button>
              <button className="btn btn-link ms-3" onClick={handleReplyClick}>
                <i className="far fa-comment me-1 text-primary"></i> {tweet.replies.length}
                {console.log("reply count is" + { replyCount })}
              </button>
              <button className="btn btn-link ms-3" onClick={handleRetweetClick}>
                <i className="fas fa-retweet me-1 text-success"></i>  {retweetBy.length}
              </button>
            </div>
          </div>

          {/* Display delete icon for user's own tweets */}
          {user._id === tweetedBy._id && (
            <i
              className="far fa-trash-alt ms-auto"
              style={{ alignSelf: 'flex-start', marginTop: '5px', cursor: 'pointer' }}
              onClick={handleDeleteClick}
            ></i>
          )}

        </div>
      </div>
    </div>
  );
};

export default TweetCard;