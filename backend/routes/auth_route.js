// Import statements
const bcryptjs = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for JSON Web Tokens
const { JWT_SECRET } = require('../config'); // Secret key for JWT
const express = require('express'); // Express framework
const router = express.Router(); // Express Router for handling routes
const mongoose = require("mongoose"); // Mongoose library for MongoDB
const UserModel = mongoose.model("UserModel"); // Importing the UserModel
const protectedResource = require('../middleware/protectedResource'); // Middleware for protected resources

// Route for user registration
router.post("/api/auth/register", (req, res) => {
    const { fullName, userName, password, email } = req.body;

    // Check if all mandatory fields are present
    if (!fullName || !userName || !password || !email) {
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    }

    // Check if a user with the same email or userName already exists
    UserModel.findOne({ $or: [{ email: email }, { userName: userName }] })
        .then((userInDB) => {
            if (userInDB) {
                if (userInDB.email === email) {
                    return res.status(400).json({ error: "User with this email already registered" });
                } else {
                    return res.status(400).json({ error: "userName is not available" });
                }
            }

            // If no user found, hash the password and create a new user
            bcryptjs.hash(password, 10)
                .then((hashedPassword) => {
                    const newUser = new UserModel({
                        fullName,
                        userName: userName,
                        password: hashedPassword,
                        email
                    });

                    // Save the new user to the database
                    newUser.save()
                        .then(() => {
                            res.status(201).json({ result: "User Signed up Successfully!" });
                        })
                        .catch((err) => {
                            console.error("Error saving user to database:", err);
                            res.status(500).json({ error: "Failed to register user. Please try again later." });
                        });
                })
                .catch((err) => {
                    console.error("Error hashing password:", err);
                    res.status(500).json({ error: "Failed to register user. Please try again later." });
                });
        })
        .catch((err) => {
            console.error("Error finding user in database:", err);
            res.status(500).json({ error: "Failed to register user. Please try again later." });
        });
});


// Route for user login
router.post("/api/auth/login", (req, res) => {
    const { emailOruserName, password } = req.body;

    // Check if all mandatory fields are present
    if (!emailOruserName || !password) {
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    }

    // Check if user exists with email or userName
    UserModel.findOne({ $or: [{ email: emailOruserName }, { userName: emailOruserName }] })
        .then((userInDB) => {
            if (!userInDB) {
                return res.status(401).json({ error: "Invalid Credentials" });
            }

            // Compare hashed password
            bcryptjs.compare(password, userInDB.password)
                .then((didMatch) => {
                    if (didMatch) {
                        // Generate JWT token
                        const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
                        // Prepare user info to include all fields
                        const userInfo = {
                            _id: userInDB._id,
                            email: userInDB.email,
                            fullName: userInDB.fullName,
                            userName: userInDB.userName,
                            createdAt: userInDB.createdAt,
                            updatedAt: userInDB.updatedAt,
                            dateOfBirth: userInDB.dateOfBirth,
                            location: userInDB.location,
                            profileImg: userInDB.profileImg,
                            followers: userInDB.followers,
                            following: userInDB.following,
                        };

                        // Send response with token and user info
                        res.status(200).json({ result: { token: jwtToken, user: userInfo } });
                    } else {
                        return res.status(401).json({ error: "Invalid Credentials" });
                    }
                })
                .catch((err) => {
                    console.error("Error comparing passwords:", err);
                    res.status(500).json({ error: "Failed to authenticate. Please try again later." });
                });
        })
        .catch((err) => {
            console.error("Error finding user in database:", err);
            res.status(500).json({ error: "Failed to authenticate. Please try again later." });
        });
});

// Exporting the router
module.exports = router; 
