const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        // extracting the token 
        const token = req.cookies.token;
        if (!token) {
            throw new Error("Invalid request. Please login again!")
        }
        // decoding the token data 
        const privateKey = "dev@Tinder123";
        const decodedData = jwt.verify(token, privateKey);
        const userId = decodedData._id;
        // finding the user data from DB
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found")
        }
        // console.log(user)
        req.user = user;
        next()
    }
    catch (error) {

        res.status(400).json({ error: error.message })
    }
}

module.exports = userAuth 