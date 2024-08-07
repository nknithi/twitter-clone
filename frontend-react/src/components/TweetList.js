import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TweetCard from './TweetCard';
import { toast } from 'react-toastify';

const TweetList = ({ tweets, user, handleDelete, handleLike, handleReply, retweetTweet, filterTweetId, handleDeleteReply }) => {
  const [finalFilteredTweets, setFinalFilteredTweets] = useState([]);
  const [isHomePage, setIsHomePage] = useState(false); // Local state to determine if it's the home page
  const [hasRepliesMap, setHasRepliesMap] = useState({}); // State to track whether each tweet has replies

  // Effect to update isHomePage based on filterTweetId changes
  useEffect(() => {
    setIsHomePage(!filterTweetId); // Determine if it's the home page based on filterTweetId
  }, [filterTweetId]);

  // Effect to fetch and filter tweets based on filterTweetId or display all tweets
  useEffect(() => {
    const fetchFilteredTweets = async () => {
      try {
        if (filterTweetId) {

          // Fetch a single tweet and its replies if filterTweetId is provided
          const authToken = localStorage.getItem('token');
          const config = {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          };

          const response = await axios.get(`http://localhost:5000/api/tweet/${filterTweetId}`, config);
          const filteredTweet = response.data.tweet;

          // Filter existing replies from tweets state
          const replyIds = filteredTweet.replies || [];
          const existingReplyIds = replyIds.filter(replyId => tweets.find(tweet => tweet._id === replyId));
          const replies = await fetchReplies(existingReplyIds, authToken);

          // Combine filtered tweet and its replies into finalFilteredTweets
          const finalFilteredTweets = [filteredTweet, ...replies];
          setFinalFilteredTweets(finalFilteredTweets);

          // Update hasRepliesMap to track which tweets have replies
          const updatedHasRepliesMap = { ...hasRepliesMap };
          updatedHasRepliesMap[filteredTweet._id] = replies.length > 0;
          setHasRepliesMap(updatedHasRepliesMap);
        } else {

          // Display all original tweets if filterTweetId is not provided
          const originalTweets = tweets.filter(tweet => !tweet.isReply);
          setFinalFilteredTweets(originalTweets);

          // Update hasRepliesMap for original tweets
          const updatedHasRepliesMap = {};
          originalTweets.forEach(tweet => {
            updatedHasRepliesMap[tweet._id] = tweet.replies.length > 0;
          });
          setHasRepliesMap(updatedHasRepliesMap);
        }
      } catch (error) {
        console.error('Error fetching filtered tweets:', error);
      }
    };

    fetchFilteredTweets();
  }, [filterTweetId, tweets]); // Depend on filterTweetId and tweets to trigger fetching updates


  // Function to fetch replies based on replyIds and authToken
  const fetchReplies = async (replyIds, authToken) => {
    if (!replyIds || replyIds.length === 0) {
      return [];
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };

      // Fetch each reply asynchronously and filter out deleted replies
      const fetchRequests = replyIds.map(async (replyId) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/tweet/${replyId}`, config);
          return response.data.tweet;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            return null;  // Handle 404 errors for deleted tweets
          } else {
            throw error;
          }
        }
      });

      // Wait for all fetch requests to complete and filter out null replies
      let replies = await Promise.all(fetchRequests);
      replies = replies.filter(reply => reply !== null && !reply.isDeleted); // Exclude deleted replies
      return replies;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };

  // Render TweetCard components for each tweet in finalFilteredTweets
  return (
    <div>

      {/* Map through finalFilteredTweets to render each TweetCard */}
      {finalFilteredTweets.map((tweet, index) => (
        <div key={tweet._id} style={{ marginBottom: index === 0 ? '20px' : '10px' }}>
          <TweetCard
            tweet={tweet}
            user={user}
            handleDelete={handleDelete}
            handleLike={handleLike}
            handleReply={handleReply}
            retweetTweet={retweetTweet}
            handleDeleteReply={handleDeleteReply}

          />
          {!isHomePage && hasRepliesMap[tweet._id] && (
            <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Replies</h4>
          )}
        </div>
      ))}
    </div>
  );
};

export default TweetList;
