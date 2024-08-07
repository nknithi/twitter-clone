// Importing required modules
const express = require('express'); // Express framework for Node.js
const path = require('path'); // Path module for handling file paths
const app = express(); // Creating an instance of Express application
const cors = require('cors'); // CORS middleware for enabling cross-origin requests
const mongoose = require('mongoose'); // MongoDB object modeling tool
const { MONGODB_URL } = require('./config'); // Importing MongoDB URL from configuration file

// Setting global variable for base directory path
global.__basedir = __dirname;

// Connecting to MongoDB database
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });


// Event listeners for MongoDB connection
mongoose.connection.on('connected', () => {
    console.log("DB connected");
});

mongoose.connection.on('error', (error) => {
    console.log("Some error while connecting to DB", error);
});

// Importing models
require('./models/user_model');
require('./models/tweet_model');


// Middleware setup
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));


// Routes setup
app.use(require('./routes/user_route'));
app.use(require('./routes/tweet_route'));
app.use(require('./routes/auth_route'));


// Defining the port number for the server
const PORT = process.env.PORT || 5000;


// Starting the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
