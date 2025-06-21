
require("dotenv").config();
const express = require('express');
const app = express();
const connectDB = require("./config/database")
const User = require("./models/user")
const rateLimit = require('express-rate-limit');
const userValidation = require("./middlewares/userValidation")

// middleware for parsing the JSON
app.use(express.json());


// rate limiting for signup 
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for every 15 mins
    min: 10, // only 10 requests allowed
    message: "Too many signup attempts! please try again later"
})


// POST request to MongoDB. signing up the user
app.post("/signup", async (req, res) => {
    try {
        //instance of the user model
        console.log(req.body)
        const user = new User(req.body)
        //saves the data to the mongodb
        await user.save()
        res.status(201).send({ user: "SignedUp sucessfully..." })
    } catch (error) {
        console.log("Signup error (sanitized):", error.message || "Unknown error");

        // Duplicate key (email already exists)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "account_exists",
                    message: "An account with this email already exists. Please log in or reset your password."
                }
            });
        }

        // Mongoose validation errors (e.g., too many skills, weak password, etc.)
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "validation_error",
                    message: Object.values(error.errors).map(e => e.message).join(", ")
                }
            });
        }

        // Fallback generic error
        return res.status(400).json({
            success: false,
            error: "Invalid request"
        });
    }
})
// finding the user by id by using findById method
app.get("/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json("User not found")
        } else {
            res.json(user)
        }
    } catch (error) {
        res.status(500).json("something went wrong")
    }
})


// get request for finding the signle user
app.get("/user", async (req, res) => {
    // for finding  one user we use findOne method 
    const userMail = req.body.mail;
    try {
        const user = await User.findOne({ mail: userMail })
        if (!user) {
            res.status(404).json("user not found")
        } else {
            res.json(user)
        }
    } catch (error) {
        res.status(500).json("something went wrong")
    }
})

// get request for finding the multiple users
app.get("/feed", async (req, res) => {
    // for finding multiple users we use find method
    const userMail = req.body.mail
    try {
        const users = await User.find({ mail: userMail });
        if (users.length === 0) {
            res.status(404).json("No Users found")
        } else {
            res.json(users)
        }
    } catch (error) {
        res.status(500).json({ error: "something went wrong" })
    }
})
// DELETE request to delete the user by using foundByIdAndDelete query
app.delete("/user", async (req, res) => {
    const userId = req.body.id;
    try {
        const deleteUser = await User.findByIdAndDelete(userId)
        if (!deleteUser) {
            res.status(404).json({ error: "user not found" })
        }
        res.json("user deleted successfully")
    } catch (error) {
        res.status(500).json("Something went wrong")
    }
})

// updating the data by using the findByIdAndUpdate query
app.patch("/user/:userId", async (req, res) => {
    const userId = req.body.id;
    const updateUserData = req.body;
    try {
        const allowedFields = ["password", "age", "gender", "about", "skills"];
        const isAllowedUpdate = Object.keys(updateUserData).every(key => allowedFields.includes(key))
        if (!isAllowedUpdate) {
            throw new Error("Update is not allowed")
        }
        const updateUser = await User.findByIdAndUpdate(userId, updateUserData, { returnDocument: 'after' });
        if (!updateUser) {
            res.status(404).json({ error: "user not found" })
        }
        console.log(updateUser)
        res.json("user updated successfully")
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" })
    }
})


// connecting to the mongodb
connectDB()
    .then(() => {
        console.log("connected to mondodb successfully..");
        //listening to the server
        app.listen(7777, () => {
            console.log("server is listening to the port 7777")
        })
    })
    .catch((err) => {
        console.log("Error connecting the mongodb...", err)
        // Exit if Mondodb connection fails
        process.exit(1)
    })

