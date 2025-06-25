const express = require("express");
const userAuth = require("../middlewares/userAuth")

const router = express.Router();

router.get("/view", userAuth, async (req, res) => {
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

module.exports = router;