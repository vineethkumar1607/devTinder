
require("dotenv").config();
const express = require('express');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const connectDB = require("./config/database")
const User = require("./models/user")
const rateLimit = require('express-rate-limit');
const userValidation = require("./middlewares/userValidation");
const userAuth = require("./middlewares/auth")



// middleware for parsing the JSON
app.use(express.json());
app.use(cookieParser());

// rate limiting for signup 
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for every 15 mins
    min: 10, // only 10 requests allowed
    message: "Too many signup attempts! please try again later"
});


app.post("/signup", userValidation, async (req, res) => {
    try {
        // Input validation
        if (!req.body.password) {
            return res.status(400).json({
                success: false,
                error: "Password is required"
            });
        }

        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        const userData = { ...req.body, password: hashPassword };

        const user = new User(userData);
        await user.save();

        return res.status(201).send({ success: true, message: "Signed up successfully" });
    } catch (error) {
        console.log("Signup error:", error);

        // Handle duplicate email
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "account_exists",
                    message: "An account with this email already exists."
                }
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "validation_error",
                    message: Object.values(error.errors).map(e => e.message).join(", ")
                }
            });
        }

        // Fallback error
        console.error("Unhandled signup error:", error);
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred during signup"
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // checks whether the 
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required " })
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        // generating the token using JWT
        const token = await user.generateAuthToken()

        // sending the cookies to the client 
        res.cookie("token", token, {
            expires: new Date(Date.now() + 604800000)  // cookie expires in 7days , 604800000 = 7 days in milli seconds
        });
        return res.status(200).json({ success: true, message: "Login successful" });


    } catch (error) {
        console.error("Login error details:", error);
        return res.status(500).json({
            success: false, message: "An error occured during login"
        })
    }
})

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("user not found")
        }
        return res.json(user)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// finding the user by id by using findById method
app.get("/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json("User not found")
        } else {
            return res.json(user)
        }
    } catch (error) {
        return res.status(500).json("something went wrong")
    }
})


// updating the data by using the findByIdAndUpdate query
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params.id;
    const updateUserData = req.body;
    const allowedFields = ["password", "age", "gender", "about", "skills", "photoUrl"];

    const isAllowedUpdate = Object.keys(updateUserData).every(key => allowedFields.includes(key))
    if (!isAllowedUpdate) {
        return res.status(401).json({ message: "Update is not allowed" })
    }
    try {
        const updateUser = await User.findByIdAndUpdate(userId, updateUserData, { returnDocument: 'after' });
        if (!updateUser) {
            return res.status(404).json({ error: "user not found" })
        }
        console.log(updateUser)
        res.json("user updated successfully")
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
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

