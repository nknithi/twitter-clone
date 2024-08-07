
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import CreatePostDialog from '../components/CreatePostDialog';
import TweetList from '../components/TweetList';
import SideBar from '../components/SideBar';
import RightPanel from '../components/RightPanel';
import LeftPanel from '../components/LeftPanel';
import ReplyModal from '../components/ReplyModal';

const Home = ({ user, onUpdateUser, onLogout }) => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]); // State to store tweets fetched from API
  const [loadingTweets, setLoadingTweets] = useState(false); // State to manage loading state of tweets
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); // State to control visibility of create post modal
  const [error, setError] = useState(''); // State to manage error messages
  const [showReplyModal, setShowReplyModal] = useState(false); // State to control visibility of reply modal
  const [replyTweetId, setReplyTweetId] = useState(null); // State to store tweet id for replying
  const authToken = localStorage.getItem('token'); // Retrieve auth token from local storage

  useEffect(() => {
    fetchTweets(); // Fetch tweets on component mount
  }, []);

  // Function to fetch tweets from API
  const fetchTweets = async () => {
    setLoadingTweets(true); // Set loading state to true
    try {
      if (!authToken) {
        console.error('User not authenticated.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/tweet', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Assuming all fetched tweets are original tweets
      const originalTweets = response.data.tweets;

      // Update tweet data with reply count for each original tweet
      const updatedTweets = originalTweets.map(tweet => ({
        ...tweet,
        replyCount: tweet.replies.length,  // Calculate reply count for each tweet

      }));

      setTweets(updatedTweets); // Update tweets state with fetched tweets

      setError('');  // Clear any previous errors
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized. Please log in again.');
        navigate('/login'); // Redirect to login page if unauthorized
      } else {
        console.error('Error fetching tweets:', error);
        setError('Failed to fetch tweets. Please try again.');  // Set error message for failed tweet fetch
      }
    } finally {
      setLoadingTweets(false); // Set loading state to false after fetching tweets
    }
  };


  // Function to handle user logout
  const handleLogout = () => {
    onLogout(); // Call parent logout function
    navigate('/login'); // Redirect to login page
  };

  // Function to delete a tweet by id
  const handleDelete = async (tweetId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tweet/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Remove deleted tweet from state
      setTweets(prevTweets => prevTweets.filter(tweet => tweet._id !== tweetId));

      toast.success('Tweet deleted'); // Display success message for tweet deletion
    } catch (error) {
      console.error('Error deleting tweet:', error);
      toast.error('Failed to delete tweet.'); // Display error message for failed tweet deletion
    }
  };



  // Function to handle liking/unliking a tweet
  const handleLike = async (tweetId, isLiked) => {
    try {
      const endpoint = isLiked ? `dislike` : `like`;
      const response = await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const updatedTweet = response.data.tweet;

      // Update tweets state after liking/unliking
      fetchTweets();

      if (endpoint === 'like') {
        toast.success('Tweet liked');
      } else {
        toast.success('Tweet disliked');
      }
    } catch (error) {
      console.error('Error liking/unliking tweet:', error);
      toast.error('Failed to like/dislike tweet.');
    }
  };

  // Function to retweet a tweet by id
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

      // Update tweets state with the retweeted tweet
      setTweets(prevTweets =>
        prevTweets.map(t => (t._id === tweet._id ? tweet : t))
      );

      // Fetch updated tweets after retweeting
      fetchTweets();

      toast.success('Tweet retweeted');
    } catch (error) {
      console.error('Error retweeting tweet:', error);
      toast.error('Failed to retweet tweet.');
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

      // After posting a reply, fetch updated tweets
      fetchTweets();

      toast.success('Reply posted'); // Display success message for reply posting
      setShowReplyModal(false); // Close reply modal after successful reply
    } catch (error) {
      console.error('Error replying to tweet:', error);
      toast.error('Failed to post reply.'); // Display error message for failed reply posting
    }
  };


  // Function to handle opening the create post modal
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  // Function to handle opening the reply modal
  const handleReplyModalOpen = (tweetId) => {
    setReplyTweetId(tweetId);
    setShowReplyModal(true);
  };

  // Function to handle closing the reply modal
  const handleReplyModalClose = () => {
    setReplyTweetId(null);
    setShowReplyModal(false);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <LeftPanel />
        <SideBar user={user} handleLogout={handleLogout} />

        {/* Main Content */}
        <main className="col-md-6">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Home</h2>
              <button className="btn btn-primary ps-5 pe-5" onClick={handleCreatePost}>
                Tweet
              </button>
            </div>
            {loadingTweets && <p>Loading tweets...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            <TweetList
              tweets={tweets}
              user={user}
              handleDelete={handleDelete}
              handleLike={handleLike}
              handleReply={handleReplyModalOpen}
              retweetTweet={retweetTweet}

            />
          </div>
        </main>
        <RightPanel />

        {/* Create Post Dialog */}
        <CreatePostDialog
          authToken={authToken}
          showModal={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onCreate={fetchTweets}
        />

        {/* Reply Modal */}
        <ReplyModal
          tweetId={replyTweetId}
          authToken={authToken}
          onClose={handleReplyModalClose}
          onReply={fetchTweets} // Update tweets after replying
          show={showReplyModal}
        />
      </div>
    </div>
  );
};

export default Home;