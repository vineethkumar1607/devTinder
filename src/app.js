require("dotenv").config();
const express = require('express');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');

const connectDB = require("./config/database")
const authRouter = require("./routes/authRouter")
const profileRouter = require("./routes/profile")

const app = express();

app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies

// Routes 
app.use("/auth", authRouter)
app.use("/profile", profileRouter)

// rate limiting for signup 
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for every 15 mins
    max: 10, // only 10 requests allowed
    message: "Too many signup attempts! please try again later"
});

// Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         success: false,
//         error: 'Internal Server Error',
//         // message: process.env.NODE_ENV === 'development' ? err.message : undefined
//         message: err.message || undefined
//     });
// });

// connecting to the mongodb
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 7777;
        console.log("connected to mondodb successfully..");
        //listening to the server
        app.listen(PORT, () => {
            console.log(`server is listening to the port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("Database connection failed:", err)
        // Exit if Mondodb connection fails
        process.exit(1)
    })

