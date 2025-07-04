require("dotenv").config();
const express = require('express');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
const cors = require('cors')

const connectDB = require("./config/database");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require('./routes/user')

const app = express();

app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
// Routes 
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use('/user', userRouter);

// rate limiting for signup 
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for every 15 mins
    max: 10, // only 10 requests allowed
    message: "Too many signup attempts!. Please try again later"
});

// At the bottom, after all routes
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err, err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later."
    });
});


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

