// Importing the JSON Web Token library
const jwt = require("jsonwebtoken");

// Importing the JWT secret key from the configuration file
const { JWT_SECRET } = require('../config');

// Importing Mongoose library for MongoDB
const mongoose = require("mongoose");

// Getting the UserModel from Mongoose
const UserModel = mongoose.model("UserModel");

// Middleware function to authenticate the user
module.exports = (req, res, next) => {

    // Extracting the authorization header
    const { authorization } = req.headers;

    // Check if the authorization header is present
    if (!authorization) {

        // If no authorization header, respond with an error
        return res.status(401).json({ error: "User not logged in" });
    }

    // Extract the token by removing the "Bearer " prefix
    const token = authorization.replace("Bearer ", "");

    // Verify the token using the JWT secret key
    jwt.verify(token, JWT_SECRET, (error, payload) => {
        if (error) {

            // If token verification fails, respond with an error
            return res.status(401).json({ error: "User not logged in" });
        }

        // Extract user ID from the token payload
        const { _id } = payload;

        // Find the user in the database by ID
        UserModel.findById(_id)
            .then((dbUser) => {

                // Attach the user object to the request
                req.user = dbUser;

                next();
            })
    });
}