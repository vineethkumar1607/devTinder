const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const { validateReceiverUserId } = require("../middlewares/validateReceverUserID");
const validateObjectIdParam = require("../middlewares/validateObjectIdParam")
const User = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");


//POST: route for sending interested and ignored status connection request
router.post("/send/:status/:receiverUserId", userAuth, validateObjectIdParam("receiverUserId"), async (req, res) => {
    const allowedStatus = {
        interested: {
            message: "Connection request sent successfully",
            httpStatusCode: 201
        },
        ignored: {
            message: "connection request ignored successfully",
            httpStatusCode: 200
        }
    }
    try {
        const { receiverUserId, status } = req.params;
        const loggedInUser = req.user._id;
        // checking is the status request is matched
        if (!allowedStatus[status]) {
            return res.status(400).json({
                success: false,
                message: "Invalid status request"
            })
        }

        // prevents sending request to self
        if (receiverUserId.toString() === loggedInUser.toString()) {
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
                { senderUserId: loggedInUser, receiverUserId },
                { senderUserId: receiverUserId, receiverUserId: loggedInUser }
            ]
        })
        if (isExistingRequest) {
            return res.status(409).json({
                success: false,
                message: "A connction request already exists between these users"
            })
        }

        await ConnectionRequestModel.create({
            senderUserId: loggedInUser, receiverUserId, status
        });
        return res.status(allowedStatus[status].httpStatusCode).json({
            success: true,
            message: allowedStatus[status].message
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing connection request"
        })
    }
});
//POST: route to accept or reject the request
router.post("/review/:status/:requestId", userAuth, validateObjectIdParam("requestId"), async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = {
            accepted: {
                message: "Connection request accepted",
            },
            rejected: {
                message: "connection request rejected",
            }
        }
        if (!allowedStatus[status]) {
            return res.status(400).json({ success: false, message: "Invalid status request" })
        }
        // finding the connection request from requestid,status:interested of loggedin user
        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            receiverUserId: loggedInUser._id,
            status: "interested"
        })

        if (!connectionRequest) {
            return res.status(404).json({ success: false, message: "can not find the connection request" })
        }
        // updating the status and save the data
        connectionRequest.status = status;
        const userData = await connectionRequest.save()
        return res.status(200).json({ success: true, message: allowedStatus[status].message, data: userData })
    } catch (error) {
        console.error("ERROR:", error, error.message)
        return res.status(500).json({ success: false, message: "internal serever error" })
    }
})

module.exports = router;