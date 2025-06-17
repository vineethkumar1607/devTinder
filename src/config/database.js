require("dotenv").config();
const mongoose = require("mongoose")

const connectDB = async () => {
    console.log("mongo URI: ", process.env.MONGODB_URI)
    await mongoose.connect(process.env.MONGODB_URI)
}

module.exports = connectDB
