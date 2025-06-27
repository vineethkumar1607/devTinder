const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const { validateReceiverUserId } = require("../middlewares/validateReceverUserID");
const User = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");

const STATUS_CONFIG = {
    interested: {
        message: "Connection request sent successfully",
        httpStatusCode: 201
    },
    ignored: {
        message: "connection request ignored successfully",
        httpStatusCode: 200
    }
}

router.post("/:status/:receiverUserId", userAuth, validateReceiverUserId, async (req, res) => {
    try {
        const { receiverUserId, status } = req.params;
        const senderUserId = req.user._id;
        // checking is the status request is matched
        if (!STATUS_CONFIG[status]) {
            return res.status(400).json({
                success: false,
                message: "Invalid status request"
            })
        }

        // preventing sending request to self
        if (senderUserId === receiverUserId) {
            return res.status(409).json({
                success: false,
                message: "you cannot send request to yourself"
            })
        }

        // checking is the receiver user id  exists in the DB
        const isExistingUser = await User.findById(receiverUserId);
        if (!isExistingUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver user id"
            })
        }
        // checking is the request already exists between the users
        const isExistingRequest = await ConnectionRequestModel.findOne({
            $or: [
                { senderUserId, receiverUserId },
                { senderUserId: receiverUserId, receiverUserId: senderUserId }
            ]
        })
        if (isExistingRequest) {
            return res.status(409).json({
                success: false,
                message: "A connction request already exists between these users"
            })
        }

        await ConnectionRequestModel.create({
            senderUserId, receiverUserId, status
        });
        return res.status(STATUS_CONFIG[status].httpStatusCode).json({
            success: true,
            message: STATUS_CONFIG[status].message
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing connection request"
        })
    }
})

module.exports = router;