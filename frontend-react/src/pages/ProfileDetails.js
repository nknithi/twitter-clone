// Import statements
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useLocation } from 'react-router-dom';

// Import formatDate function
import EditModal from '../components/EditModal';
import formatDate from '../utils/dateUtils'; // Import formatDate function
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake, faMapMarkerAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import LeftPanel from '../components/LeftPanel';
import SideBar from '../components/SideBar';
import RightPanel from '../components/RightPanel';
import TweetCard from '../components/TweetCard';
import ReplyModal from '../components/ReplyModal';
import UploadProfilePhotoModal from '../components/UploadProfilePhotoModal'

const ProfileDetails = ({ user, onUpdateUser, onLogout }) => {
  const { userId } = useParams(); // Get userId from URL parameters 
  const location = useLocation();
  const from = location.state?.from || 'unknown'; // Get 'from' from location.state, default to 'unknown' if not set
  const [profileUser, setProfileUser] = useState(null);  // State to hold profile user data
  const [isFollowed, setIsFollowed] = useState(false); // State for follow status
  const [userTweets, setUserTweets] = useState([]);  // State for user tweets
  const [showReplyModal, setShowReplyModal] = useState(false); // State for controlling the reply modal
  const [replyTweetId, setReplyTweetId] = useState(null); // State to hold the tweetId for replying
  const [showEditModal, setShowEditModal] = useState(false); // State for controlling the edit profile modal
  const authToken = localStorage.getItem('token'); // Get authentication token from localStorage

  const [showUploadModal, setShowUploadModal] = useState(false); // State for controlling upload modal


  // Effect to fetch user profile data and tweets on component mount or when userId changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!authToken) {
          console.error('User not authenticated.');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log('Fetch User Profile Response:', response.data); // Log response data for debugging

        if (response.data.result) {
          setProfileUser(response.data.result); // Set profileUser state with fetched user data
          checkFollowStatus(response.data.result); // Check follow status based on fetched user data
          fetchUserTweets(userId); // Fetch user's tweets
        } else {
          console.error('User data not found');
          toast.error('User data not found.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch user profile.');
      }
    };

    const checkFollowStatus = (profileUser) => {
      if (profileUser.followers.includes(user._id)) {
        setIsFollowed(true); // Set follow status based on whether current user is in profileUser's followers
      }
    };

    if (userId) {
      fetchUserProfile(); // Fetch user profile when userId changes
    }
  }, [userId, authToken, user._id]); // Dependencies for useEffect



  // Function to fetch user tweets
  const fetchUserTweets = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${userId}/tweets`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUserTweets(response.data.tweets); // Set userTweets state with fetched tweets data
    } catch (error) {
      console.error('Error fetching user tweets:', error);
      toast.error('Failed to fetch user tweets.');
    }
  };

  // Function to handle follow/unfollow action
  const handleToggleFollow = async () => {
    try {
      if (userId === user._id) {
        toast.error("You can't follow yourself!"); // Prevent following oneself
        return;
      }

      const endpoint = isFollowed ? 'unfollow' : 'follow'; // Determine API endpoint based on current follow status

      const response = await axios.post(
        `http://localhost:5000/api/user/${userId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Toggle Follow Response:', response.data); // Log response data for debugging

      if (response.data.success) {
        setIsFollowed(!isFollowed);  // Toggle follow status

        setProfileUser((prevUser) => ({
          ...prevUser,
          followers: isFollowed
            ? prevUser.followers.filter((followerId) => followerId !== user._id)
            : [...prevUser.followers, user._id],
        }));

        toast.success(`User ${endpoint === 'follow' ? 'followed' : 'unfollowed'}`);
      } else {
        console.error(`Failed to ${endpoint} user.`);
        toast.error(`Failed to ${endpoint} user.`);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast.error('Failed to follow/unfollow user.');
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    onLogout(); // Call parent component's logout function

  };

  // Function to delete a tweet
  const handleDelete = async (tweetId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tweet/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUserTweets((prevTweets) => prevTweets.filter((tweet) => tweet._id !== tweetId));
      toast.success('Tweet deleted');
    } catch (error) {
      console.error('Error deleting tweet:', error);
      toast.error('Failed to delete tweet.');
    }
  };


  // Function to handle like/unlike a tweet
  const handleLike = async (tweetId, isLiked) => {
    try {
      const endpoint = isLiked ? 'dislike' : 'like'; // Determine API endpoint based on current like status
      const response = await axios.post(
        `http://localhost:5000/api/tweet/${tweetId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchUserTweets(userId); // Refresh tweets after liking/unliking

      if (endpoint === 'like') {
        toast.success('Tweet liked'); // Show success message for like action
      } else {
        toast.success('Tweet disliked'); // Show success message for dislike action
      }
    } catch (error) {
      console.error('Error liking/unliking tweet:', error);
      toast.error('Failed to like/dislike tweet.');
    }
  };

  // Function to handle opening reply modal for a tweet
  const handleReplyModalOpen = (tweetId) => {
    setReplyTweetId(tweetId); // Set tweetId for the reply modal
    setShowReplyModal(true); // Open reply modal
  };

  // Function to handle closing reply modal
  const handleReplyModalClose = () => {
    setReplyTweetId(null);
    setShowReplyModal(false); // Close reply modal
  };

  // Function to retweet a tweet
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

      fetchUserTweets(userId); // Refresh tweets after retweeting
      toast.success('Tweet retweeted'); // Show success message for retweet action
    } catch (error) {
      console.error('Error retweeting tweet:', error);
      toast.error('Failed to retweet tweet.');
    }
  };

  // Function to handle opening edit profile modal
  const handleEditProfile = () => {
    setShowEditModal(true);
  };


  // Function to handle updating user profile
  const handleUpdateProfile = async (updatedProfile) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/${userId}`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Update Profile Response:', response.data); // Log response data for debugging

      if (response.data.result) {
        // Update profileUser state
        setProfileUser(response.data.result);
        toast.success('Profile updated'); // Show success message
        setShowEditModal(false); // Close edit profile modal

        // Update localStorage with updated user data
        const updatedUserData = { ...user, ...response.data.result };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      } else {
        console.error('Failed to update profile:', response.data.error);
        toast.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  // Function to handle closing edit profile modal
  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  // Effect to log current profileUser state for debugging
  useEffect(() => {
    console.log('Current profileUser state:', profileUser); // Log current profileUser state for debugging
  }, [profileUser]);


  // Function to handle toggling the upload modal
  const handleToggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
  };


  // Function to handle uploading a profile picture
  const handleUploadProfilePic = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/${userId}/uploadProfilePic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.result) {
        // Update profileUser state
        setProfileUser(response.data.user);
        toast.success('Profile image uploaded');
        setShowUploadModal(false); // Close the modal after successful upload
        fetchUserTweets(userId);

        // Update localStorage with updated user data
        const updatedUserData = { ...user, profileImg: response.data.user.profileImg };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      } else {
        console.error('Failed to upload profile image:', response.data.error);
        toast.error('Failed to upload profile image.');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image.');
    }
  };





  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <LeftPanel />



        <SideBar user={user} handleLogout={handleLogout} />
        <main className="col-md-6">
          <div className="p-3">
            <h2 className='mb-3'>Profile</h2>
            {profileUser ? (
              <>
                <div className="middle-panel bg-primary" style={{ height: '150px', position: 'relative', zIndex: 0 }}>
                  {/* Blue background with fixed height */}
                </div>
                <div className="middle-panel-content" style={{ position: 'relative', zIndex: 1 }}>
                  {profileUser.profileImg ? (
                    <div
                      className="profile-image-container"
                      style={{
                        position: 'absolute',
                        top: '-50px',
                        left: '25px',
                        width: '100px',
                        height: '100px',
                        overflow: 'hidden',
                        borderRadius: '50%',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={profileUser.profileImg}
                        alt="Profile"
                        className="profile-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="profile-image-placeholder"
                      style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'gray' }}
                    >
                      {/* Placeholder or fallback image */}
                    </div>
                  )}
                </div>

                <div className="text-end mt-2">


                  {from === 'tweetCard' ? (
                    <button className="me-3 btn btn-dark" onClick={handleToggleFollow}>
                      {isFollowed ? 'Unfollow' : 'Follow'}
                    </button>
                  ) : (
                    <div>
                      <button className="btn btn-outline-primary me-2"
                        onClick={handleToggleUploadModal}
                      >
                        Upload Profile Photo
                      </button>
                      <button className="btn btn-outline-dark" onClick={handleEditProfile}>
                        Edit
                      </button>
                    </div>
                  )}


                </div>

                <div style={{ marginTop: '35px' }}>
                  <h4 className="text-dark">{profileUser.fullName}</h4>
                  <p className="text-muted" style={{ fontSize: '1em' }}>@{profileUser.userName}</p>
                  <div className='d-flex'>
                    <p className="text-dark "> <FontAwesomeIcon className="me-2" icon={faBirthdayCake} /><span style={{ fontSize: '1em' }} className='text-muted'>Dob, {formatDate(profileUser.dateOfBirth)}</span></p>

                    <p className="text-dark ms-3"><FontAwesomeIcon className="me-1" icon={faMapMarkerAlt} /><span style={{ fontSize: '1em' }} className='text-muted'> Location, {profileUser.location}</span></p>


                  </div>
                  <p className="text-dark"><FontAwesomeIcon className="me-2" icon={faCalendar} /><span className='text-muted'>Joined {formatDate(profileUser.createdAt)}</span></p>
                  <p className="text-dark fw-bold">
                    {profileUser.following.length} Following &nbsp;&nbsp;  {profileUser.followers.length} Followers

                  </p>
                </div>
              </>
            ) : (
              <p>Loading profile...</p>
            )}

            <div>
              <h4 className="text-dark text-center mt-4 ">Tweets and Replies</h4>
              {userTweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  user={user}
                  handleDelete={() => handleDelete(tweet._id)}
                  handleLike={() => handleLike(tweet._id, tweet.likes.includes(user._id))}
                  handleReply={() => handleReplyModalOpen(tweet._id)} // Open reply modal for each tweet
                  retweetTweet={() => retweetTweet(tweet._id)}
                />
              ))}
            </div>
          </div>
        </main>
        <RightPanel />
      </div>

      {/* Reply Modal */}
      <ReplyModal
        tweetId={replyTweetId}
        authToken={authToken}
        onClose={handleReplyModalClose}
        onReply={() => fetchUserTweets(userId)} // Update tweets after replying
        show={showReplyModal}
      />

      {/* Edit Profile Modal */}
      <EditModal
        show={showEditModal}
        handleClose={handleEditModalClose}
        profileUser={profileUser} // Ensure profileUser is correctly set here
        handleUpdate={handleUpdateProfile}
      />

      <UploadProfilePhotoModal
        show={showUploadModal}
        handleClose={() => setShowUploadModal(false)}
        handleUpload={handleUploadProfilePic}
      />


    </div>
  );
};

export default ProfileDetails;