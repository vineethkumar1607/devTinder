
require("dotenv").config();
const express = require('express');
const app = express();
const connectDB = require("./config/database")
const User = require("./models/user")

app.use(express.json())

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
        res.status(400).send({ error: "Failed to SignUp..." });
        console.log(error + "signup failed")
    }
})
// finding the user by id by using findById method
app.get("/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        // if (!mongoose.Types.ObjectId.isValid(userId)) {
        //     return res.status(400).json({ error: "Invalid ID format" });
        // }
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
app.patch("/user", async (req, res) => {
    const userId = req.body.id;
    const updateData = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'before' });
        if (!updatedUser) {
            res.status(404).json({ error: "user not found" })
        }
        console.log(updatedUser)
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

