// Import statements
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import SideBar from '../components/SideBar';
import RightPanel from '../components/RightPanel';
import LeftPanel from '../components/LeftPanel';
import ReplyModal from '../components/ReplyModal';
import TweetList from '../components/TweetList';


// Main component for displaying tweet details
const TweetDetails = ({ user, onLogout }) => {
  const { id } = useParams(); // Extract tweet ID from URL
  const navigate = useNavigate(); // Hook for navigation
  const [tweets, setTweets] = useState([]); // State to hold tweet data
  const [loadingTweets, setLoadingTweets] = useState(false); // State for loading status
  const [error, setError] = useState('');  // State for error messages
  const [showReplyModal, setShowReplyModal] = useState(false); // State to control reply modal visibility
  const [replyTweetId, setReplyTweetId] = useState(null); // State to hold the ID of the tweet being replied to
  const authToken = localStorage.getItem('token'); // Get authentication token from local storage


  // Fetch tweets when component mounts or ID changes
  useEffect(() => {
    fetchTweets();
  }, [id]);


  // Function to fetch tweets from the server
  const fetchTweets = async () => {
    setLoadingTweets(true); // Set loading state to true
    try {
      if (!authToken) {
        console.error('User not authenticated.');
        return;
      }

      // Fetch tweets from the backend
      const response = await axios.get('http://localhost:5000/api/tweet', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Add reply count to each tweet
      const originalTweets = response.data.tweets;
      const updatedTweets = originalTweets.map(tweet => ({
        ...tweet,
        replyCount: tweet.replies.length,
      }));

      setTweets(updatedTweets); // Update tweets state
      setError('');  // Clear any previous errors
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized. Please log in again.');
        navigate('/login'); // Navigate to login if unauthorized
      } else {
        console.error('Error fetching tweets:', error);
        setError('Failed to fetch tweets. Please try again.'); // Set error message
      }
    } finally {
      setLoadingTweets(false); // Set loading state to false
    }
  };


  // Function to handle logout
  const handleLogout = () => {

    // Call onLogout function from props
    onLogout();

    // Navigate to login page
    navigate('/login');
  };


  // Function to handle tweet deletion
  const handleDelete = async (tweetId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tweet/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setTweets(prevTweets => prevTweets.filter(tweet => tweet._id !== tweetId));
      toast.success('Tweet deleted'); // Show success message
      navigate('/'); // Navigate to home page
    } catch (error) {
      console.error('Error deleting tweet:', error);
      toast.error('Failed to delete tweet.'); // Show error message
    }
  };

  // Function to handle tweet like/unlike
  const handleLike = async (tweetId, isLiked) => {
    try {
      const endpoint = isLiked ? `dislike` : `like`; // Determine endpoint based on current like status
      const response = await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchTweets(); // Refresh tweets after like/unlike

      if (endpoint === 'like') {
        toast.success('Tweet liked'); // Show like success message
      } else {
        toast.success('Tweet disliked'); // Show dislike success message
      }
    } catch (error) {
      console.error('Error liking/unliking tweet:', error);
      toast.error('Failed to like/dislike tweet.');  // Show error message
    }
  };

  // Function to handle retweeting a tweet
  const retweetTweet = async (tweetId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/retweet`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const { tweet } = response.data;

      setTweets(prevTweets =>
        prevTweets.map(t => (t._id === tweet._id ? tweet : t))
      ); // Update state with retweeted tweet

      toast.success('Tweet retweeted'); // Show success message
    } catch (error) {
      console.error('Error retweeting tweet:', error);
      toast.error('Failed to retweet tweet.'); // Show error message
    }
  };

  // Function to handle replying to a tweet
  const handleReply = async (tweetId, replyContent) => {
    try {
      await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchTweets();  // Refresh tweets after reply

      toast.success('Reply posted'); // Show success message
      setShowReplyModal(false); // Close reply modal
    } catch (error) {
      console.error('Error replying to tweet:', error);
      toast.error('Failed to post reply.'); // Show error message
    }
  };

  // Function to open the reply modal
  const handleReplyModalOpen = (tweetId) => {
    setReplyTweetId(tweetId); // Set the ID of the tweet being replied to
    setShowReplyModal(true); // Show reply modal
  };


  // Function to close the reply modal
  const handleReplyModalClose = () => {
    setReplyTweetId(null); // Clear reply tweet ID
    setShowReplyModal(false);  // Hide reply modal
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <LeftPanel />  {/* Left panel component */}

        {/* Sidebar component */}
        <SideBar user={user} handleLogout={handleLogout} />


        {/* Main content area */}
        <main className="col-md-6">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Tweet</h2>
            </div>

            {/* Show loading message if tweets are loading */}
            {loadingTweets && <p>Loading tweet...</p>}

            {/* Show error message if there's an error */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* TweetList component to display the list of tweets */}
            <TweetList
              tweets={tweets}
              user={user}
              handleDelete={handleDelete}
              handleLike={handleLike}
              handleReply={handleReplyModalOpen}
              retweetTweet={retweetTweet}
              filterTweetId={id} // Pass the tweet ID to filter
            />
          </div>
        </main>

        {/* Right panel component */}
        <RightPanel />


        {/* ReplyModal component for replying to tweets */}
        <ReplyModal
          tweetId={replyTweetId}
          authToken={authToken}
          onClose={handleReplyModalClose}
          onReply={fetchTweets}
          show={showReplyModal}
        />
      </div>
    </div>
  );
};

export default TweetDetails;
