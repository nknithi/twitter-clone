// Import statements
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const UserModel = mongoose.model("UserModel");
const TweetModel = mongoose.model("TweetModel");
const protectedResource = require('../middleware/protectedResource');


// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');  // Set the destination folder for uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profilePic-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }
});

// POST /api/user/:id/uploadProfilePic - upload profile picture of the user
router.post("/api/user/:id/uploadProfilePic", protectedResource, upload.single('profilePic'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a valid image file (JPEG/PNG)" });
    }

    const profilePicUrl = `http://localhost:5000/images/${req.file.filename}`;
    const userId = req.params.id;

    UserModel.findByIdAndUpdate(userId, { profileImg: profilePicUrl }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ result: "Profile picture uploaded successfully", user: updatedUser });
        })
        .catch(err => {
            console.error("Error updating user profile picture:", err);
            res.status(500).json({ error: "Failed to upload profile picture" });
        });
});

// GET /api/user/:id/profilePic - get profile picture of the user
router.get("/api/user/:id/profilePic", protectedResource, (req, res) => {
    const userId = req.params.id;

    UserModel.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (!user.profileImg) {
                return res.status(404).json({ error: "User does not have a profile picture" });
            }

            res.redirect(user.profileImg);
        })
        .catch(err => {
            console.error("Error fetching user profile image:", err);
            res.status(500).json({ error: "Failed to fetch user profile image" });
        });
});


// PUT /api/user/:id - Edit user details
router.put('/api/user/:id', protectedResource, (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.user._id;
    const { fullName, dateOfBirth, location } = req.body;

    // Ensure the logged-in user is the one being updated
    if (userId.toString() !== loggedInUserId.toString()) {
        return res.status(403).json({ error: "You can only update your own profile" });
    }

    // Validate input fields
    const updateFields = { fullName, dateOfBirth, location };
    const allowedFields = ['fullName', 'dateOfBirth', 'location'];

    for (const key in req.body) {
        if (!allowedFields.includes(key)) {
            return res.status(400).json({ error: `Field '${key}' is not allowed to be updated` });
        }
    }

    if (!fullName && !dateOfBirth && !location) {
        return res.status(400).json({ error: 'At least one field is required to update' });
    }

    // Find user by ID and update fields
    UserModel.findByIdAndUpdate(userId, updateFields, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ result: updatedUser });
        })
        .catch(err => {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Failed to update user. Please try again later.' });
        });
});



// GET /api/user/:id/ - get user by id
router.get("/api/user/:id", protectedResource, (req, res) => {
    const userId = req.params.id;

    UserModel.findById(userId)
        .select('-password') // Exclude password field from query
        .populate('followers', '_id') // Populate followers with only _id
        .populate('following', '_id') // Populate following with only _id
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Prepare detailed user profile information
            const userProfile = {
                id: user._id,
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                followers: user.followers.map(follower => follower._id),
                following: user.following.map(following => following._id),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                dateOfBirth: user.dateOfBirth,
                location: user.location,
                profileImg: user.profileImg
            };

            res.status(200).json({ result: userProfile });
        })
        .catch((err) => {
            console.error("Error finding user in database:", err);
            res.status(500).json({ error: "Failed to fetch user profile details. Please try again later." });
        });
});

// GET all tweets by a specific user
router.get("/api/user/:id/tweets", protectedResource, (req, res) => {
    const userId = req.params.id;

    // Fetch tweets where tweetedBy matches the userId
    TweetModel.find({ tweetedBy: userId })
        .populate('tweetedBy', '_id fullName userName profileImg') // Populate user details in tweets
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
        .then((tweets) => {
            // Map tweets to include image URL if image exists
            const tweetsWithImage = tweets.map(tweet => ({
                ...tweet.toJSON(), // Convert Mongoose document to plain JavaScript object
                image: tweet.image ? `http://localhost:5000/${tweet.image}` : null // Attach full image URL if image path exists
            }));
            res.status(200).json({ tweets: tweetsWithImage });
        })
        .catch((err) => {
            console.error("Error fetching user tweets:", err);
            res.status(500).json({ error: "Failed to fetch user tweets. Please try again later." });
        });
});


// Follow a user
router.post("/api/user/:id/follow", protectedResource, (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.user._id;

    if (userId.toString() === loggedInUserId.toString()) {
        return res.status(400).json({ error: "You cannot follow yourself" });
    }

    UserModel.findById(userId)
        .then(user => {
            if (!user) {
                throw new Error("User not found");
            }

            // Check if loggedInUserId is already in user's followers array
            if (user.followers.includes(loggedInUserId)) {
                return res.status(400).json({ error: "You are already following this user" });
            }

            // Update user's followers array
            return UserModel.findByIdAndUpdate(
                userId,
                { $addToSet: { followers: loggedInUserId } },
                { new: true }
            );
        })
        .then(updatedUser => {
            // Update loggedInUserId's following array
            return UserModel.findByIdAndUpdate(
                loggedInUserId,
                { $addToSet: { following: userId } },
                { new: true }
            );
        })
        .then(() => {
            res.status(200).json({ success: true });
        })
        .catch(err => {
            console.error("Error following user:", err.message || err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Failed to follow user. Please try again later." });
            }
        });
});


// Unfollow a user
router.post("/api/user/:id/unfollow", protectedResource, (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.user._id;

    if (userId === loggedInUserId.toString()) {
        return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    UserModel.findById(loggedInUserId)
        .then((loggedInUser) => {
            if (!loggedInUser) {
                throw new Error("Logged in user not found");
            }

            if (!loggedInUser.following.includes(userId)) {
                return res.status(400).json({ error: "You are already not following this user" });
            }

            // Remove the userId from the logged-in user's following array
            return UserModel.findByIdAndUpdate(
                loggedInUserId,
                { $pull: { following: userId } }, // Remove userId from following array
                { new: true }
            );
        })
        .then(() => {
            // Remove the loggedInUserId from the target user's followers array
            return UserModel.findByIdAndUpdate(
                userId,
                { $pull: { followers: loggedInUserId } },
                { new: true }
            );
        })
        .then(() => {
            res.status(200).json({ success: true });
        })
        .catch((err) => {
            console.error("Error unfollowing user:", err);
            // Check if headers have already been sent to avoid sending multiple times
            if (!res.headersSent) {
                res.status(500).json({ error: "Failed to unfollow user. Please try again later." });
            }
        });
});






module.exports = router;