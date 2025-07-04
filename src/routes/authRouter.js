const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user")
// const userValidation = require("../middlewares/userValidation");
const userCreateValidation = require("../middlewares/userCreateValidation")

// router for user signup
router.post("/signup", userCreateValidation, async (req, res) => {
    console.log("STEP 1: Request received:", req.body);
    try {
        // Input validation
        if (!req.body.password) {
            return res.status(400).json({
                success: false,
                error: "Password is required"
            });
        }
        // encrypting the password
        const saltRounds = 10;
        console.log("STEP 1: Received body", req.body);
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        console.log("STEP 2: Password hashed");
        const userData = { ...req.body, password: hashPassword };

        const user = new User(userData);
        await user.save();
        console.log("STEP 3: User saved");

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

//router for user login
router.post("/login", async (req, res) => {
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
        const token = await user.generateAuthToken();

        const isProduction = process.env.NODE_ENV === "production";
        // sending the cookies to the client 
        res.cookie("token", token, {
            httpOnly: true, // js can not access the cookie(XSS),
            sameSite: "Strict",  // Prevents CSRF by not sending cookie on cross-site requests
            secure: isProduction, // dynamically set based on NODE_ENV
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // cookie expires in 7days 
        });
        return res.status(200).json({ success: true, message: "Login successful", user: { user } });


    } catch (error) {
        console.error("Login error details:", error);
        return res.status(500).json({
            success: false, message: "An error occured during login"
        })
    }
});

//router for logout
router.post("/logout", (req, res) => {

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "Strict",
        secure: isProduction
    })
    return res.status(200).json({ success: true, message: "Logged out successfully" })
})


module.exports = router;