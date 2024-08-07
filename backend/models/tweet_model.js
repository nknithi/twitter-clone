// Importing Mongoose library for MongoDB
const mongoose = require('mongoose');

// Defining the schema for the Tweet model
const tweetSchema = new mongoose.Schema({

    // The tweet content is required
    content: {
        type: String,
        required: true
    },

    // The user who tweeted is required and references the UserModel
    tweetedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },

    // Array of user IDs who liked the tweet, referencing UserModel
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }],

    // Array of user IDs who retweeted the tweet, referencing UserModel
    retweetBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }],

    // Optional field for image URL associated with the tweet
    image: {
        type: String
    },

    // Array of tweet IDs that are replies to this tweet, referencing TweetModel
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TweetModel'
    }],

    // Boolean indicating if this tweet is a reply to another tweet
    isReply: {
        type: Boolean,
        required: true
    }

    // Automatically adds createdAt and updatedAt timestamps
}, { timestamps: true });


// Creating the TweetModel in Mongoose
mongoose.model("TweetModel", tweetSchema);