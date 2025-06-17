
require("dotenv").config();
const express = require('express');
const app = express();
const connectDB = require("./config/database")
const User = require("./models/user")

app.post("/signup", async (req, res) => {
    const userData = {
        firstName: "kl",
        lastName: "rahul",
        mail: "rahul@gmail.com",
        password: "rahul@123"
    }
    try {
        //instance of the user model
        const user = new User(userData)
        //saves the data to the mongodb
        await user.save()
        res.status(201).send({ user: "SignedUp sucessfully..." })

    } catch (error) {
        res.status(400).send({ error: "Failed to SignUp..." });
        console.log(error + "sihnup failed")
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

