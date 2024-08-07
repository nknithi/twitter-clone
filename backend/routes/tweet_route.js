// Import statements
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const TweetModel = mongoose.model("TweetModel");  // Importing the TweetModel
const protectedResource = require('../middleware/protectedResource'); // Middleware for protected resources

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/tweets'); // Destination folder for tweet images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `tweet-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// POST /api/tweet - Create a new tweet with optional image
router.post('/api/tweet', protectedResource, upload.single('image'), (req, res) => {
    const { content } = req.body;
    const tweetedBy = req.user._id;

    // Validate content presence
    if (!content) {
        return res.status(400).json({ error: 'Content is required for a tweet' });
    }

    // Ensure no additional fields are present in req.body
    const allowedFields = ['content'];
    for (const key in req.body) {
        if (!allowedFields.includes(key)) {
            return res.status(400).json({ error: `Field '${key}' is not allowed in this request` });
        }
    }

    // Prepare the new tweet data
    const newTweetData = {
        content,
        tweetedBy,
        isReply: false  // Set isReply to false for a new tweet

    };

    // If an image is uploaded, add the image path to the tweet data
    if (req.file) {
        newTweetData.image = req.file.path.replace('images/', '');
    }

    // Create new tweet instance
    const newTweet = new TweetModel(newTweetData);

    // Save tweet to database
    newTweet.save()
        .then(savedTweet => {
            res.status(201).json({ message: 'Tweet created successfully', tweet: savedTweet });

        })
        .catch(error => {
            console.error('Error creating tweet:', error);
            res.status(500).json({ error: 'Failed to create tweet. Please try again later.' });
        });
});

// GET /api/tweet/:id - Fetch a specific tweet by ID
router.get('/api/tweet/:id', protectedResource, (req, res) => {
    const tweetId = req.params.id;

    TweetModel.findById(tweetId)
        .populate('tweetedBy', '-password') // Populate user details excluding password
        .exec()
        .then(tweet => {
            if (!tweet) {
                return res.status(404).json({ error: 'Tweet not found' });
            }

            // Construct tweet object to include image URL if it exists
            const tweetWithImage = {
                ...tweet.toJSON(), // Convert Mongoose document to plain JavaScript object
                image: tweet.image ? `http://localhost:5000/${tweet.image}` : null // Attach full image URL if image path exists
            };

            res.status(200).json({ tweet: tweetWithImage });
        })
        .catch(error => {
            console.error('Error fetching tweet:', error);
            res.status(500).json({ error: 'Failed to fetch tweet. Please try again later.' });
        });
});

// GET /api/tweet/ - Fetch all tweets
router.get('/api/tweet/', protectedResource, (req, res) => {
    TweetModel.find()
        .populate('tweetedBy', '-password') // Populate user details excluding password
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
        .exec()
        .then(tweets => {
            // Map tweets to include image URL if image exists
            const tweetsWithImage = tweets.map(tweet => ({
                ...tweet.toJSON(), // Convert Mongoose document to plain JavaScript object
                image: tweet.image ? `http://localhost:5000/${tweet.image}` : null // Attach full image URL if image path exists
            }));
            res.status(200).json({ tweets: tweetsWithImage });
        })
        .catch(error => {
            console.error('Error fetching tweets:', error);
            res.status(500).json({ error: 'Failed to fetch tweets. Please try again later.' });
        });
});



// POST /api/tweet/:id/like
router.post('/api/tweet/:id/like', protectedResource, async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    try {
        const tweet = await TweetModel.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Check if the user has already liked the tweet
        if (tweet.likes.includes(userId)) {
            return res.status(400).json({ error: 'You have already liked this tweet' });
        }

        // Add userId to the likes array and save the tweet
        tweet.likes.push(userId);
        const savedTweet = await tweet.save();

        res.status(200).json({ message: 'Tweet liked successfully', tweet: savedTweet });
    } catch (error) {
        console.error('Error liking tweet:', error);
        res.status(500).json({ error: 'Failed to like tweet. Please try again later.' });
    }
});

// POST /api/tweet/:id/dislike
router.post('/api/tweet/:id/dislike', protectedResource, async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    try {
        const tweet = await TweetModel.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Check if the user has not liked the tweet
        if (!tweet.likes.includes(userId)) {
            return res.status(400).json({ error: 'You have not liked this tweet to dislike' });
        }

        // Remove userId from the likes array and save the tweet
        tweet.likes.pull(userId);
        const savedTweet = await tweet.save();

        res.status(200).json({ message: 'Tweet disliked successfully', tweet: savedTweet });
    } catch (error) {
        console.error('Error disliking tweet:', error);
        res.status(500).json({ error: 'Failed to dislike tweet. Please try again later.' });
    }
});


// POST /api/tweet/:id/reply
router.post('/api/tweet/:id/reply', protectedResource, (req, res) => {
    const tweetId = req.params.id;
    const { content } = req.body;
    const tweetedBy = req.user._id;

    // Validate content presence
    if (!content) {
        return res.status(400).json({ error: 'Content is required for a reply' });
    }

    // Create new reply tweet instance
    const newReply = new TweetModel({
        content,
        tweetedBy,
        isReply: true  // Set isReply to true for a reply

    });

    // Save the new reply tweet
    newReply.save()
        .then(savedReply => {

            // Find the parent tweet and add the reply id to replies array
            return TweetModel.findByIdAndUpdate(
                tweetId,
                { $push: { replies: savedReply._id } },
                { new: true }
            );
        })
        .then(updatedTweet => {
            if (!updatedTweet) {
                return res.status(404).json({ error: 'Parent tweet not found' });
            }
            res.status(201).json({ message: 'Reply created successfully', tweet: updatedTweet });
        })
        .catch(error => {
            console.error('Error creating reply:', error);
            res.status(500).json({ error: 'Failed to create reply. Please try again later.' });
        });
});



// DELETE /api/tweet/:tweetId - Delete a tweet or a reply
router.delete('/api/tweet/:tweetId', protectedResource, async (req, res) => {
    const { tweetId } = req.params;
    const { replyId } = req.query;

    try {
        // Ensure req.user is defined
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user._id;

        if (replyId) {
            // Delete reply logic
            const parentTweet = await TweetModel.findById(tweetId);
            if (!parentTweet) {
                return res.status(404).json({ error: 'Parent tweet not found' });
            }

            const reply = parentTweet.replies.id(replyId);
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }

            // Check if reply.tweetedBy exists before comparing
            if (!reply.tweetedBy || reply.tweetedBy.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Unauthorized action' });
            }

            reply.remove();
            parentTweet.replyCount = parentTweet.replies.length;
            await parentTweet.save();

            return res.status(200).json({ message: 'Reply deleted successfully.', parentTweet });
        } else {
            // Delete tweet logic
            const tweet = await TweetModel.findById(tweetId);
            if (!tweet) {
                return res.status(404).json({ error: 'Tweet not found' });
            }

            // Check if tweet.tweetedBy exists before comparing
            if (!tweet.tweetedBy || tweet.tweetedBy.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Unauthorized action' });
            }

            await tweet.remove();

            return res.status(200).json({ message: 'Tweet deleted successfully.' });
        }
    } catch (error) {
        console.error('Error deleting tweet or reply:', error);
        return res.status(500).json({ error: 'Failed to delete tweet or reply.' });
    }
});




// POST /api/tweet/:id/retweet
router.post('/api/tweet/:id/retweet', protectedResource, async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    try {
        // Find the tweet by ID
        const tweet = await TweetModel.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Check if the user has already retweeted the tweet
        if (tweet.retweetBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already retweeted this tweet' });
        }

        // Add userId to the retweetBy array and save the tweet
        tweet.retweetBy.push(userId);
        const savedTweet = await tweet.save();

        // Populate the 'tweetedBy' field to include user details
        const populatedTweet = await TweetModel.findById(savedTweet._id)
            .populate('tweetedBy', '_id fullName userName profileImg')
            .exec();

        res.status(200).json({ message: 'Tweet retweeted successfully', tweet: populatedTweet });
    } catch (error) {
        console.error('Error retweeting tweet:', error);
        res.status(500).json({ error: 'Failed to retweet tweet. Please try again later.' });
    }
});



module.exports = router;