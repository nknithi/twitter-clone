// Importing Mongoose library for MongoDB
const mongoose = require('mongoose');

// Defining the schema for the User model
const userSchema = new mongoose.Schema({

    // The full name of the user is required
    fullName: {
        type: String,
        required: true
    },

    // The email of the user is required and must be unique
    email: {
        type: String,
        required: true,
        unique: true
    },

    // The username of the user is required and must be unique
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true // Trims any whitespace from the username
    },

    // The password of the user is required
    password: {
        type: String,
        required: true
    },

    // The profile image of the user
    profileImg: {
        type: String,
        default: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },

    // The location of the user
    location: {
        type: String,
        default: "test"
    },

    // The date of birth of the user
    dateOfBirth: {
        type: Date,
        default: null
    },

    // Array of user IDs who follow this user, referencing UserModel
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }],

    // Array of user IDs whom this user follows, referencing UserModel
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }]

    // Automatically adds createdAt and updatedAt timestamps
}, { timestamps: true });

// Creating the UserModel in Mongoose
mongoose.model("UserModel", userSchema);