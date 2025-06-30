const express = require('express');
const userAuth = require('../middlewares/userAuth');
const router = express.Router();
const ConnectionRequestModel = require("../models/connectionRequest");

const accessSafeData = "firstName lastName gender photoUrl about skills"

// route to check all the received requests(pending: to be accepted or reject )
router.get("/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        // fetching all the pending connection requests(interested)
        const receivedConnectionRequests = await ConnectionRequestModel.find({
            receiverUserId: loggedInUser._id,
            status: "interested"
        }).populate("senderUserId", "firstName lastName gender photoUrl about skills")
            .sort({ createdAt: -1 })

        if (receivedConnectionRequests.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No pending requests to accept",

            })
        }
        return res.status(200).json({
            success: true,
            message: "fetched all pending requests",
            data: receivedConnectionRequests
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
});

router.get("/requests/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        //finding the connection requests that are eaccepted
        const allConnections = await ConnectionRequestModel.find({
            $or: [
                { senderUserId: loggedInUser, status: "accepted" },
                { receiverUserId: loggedInUser, status: "accepted" }
            ]
        }).populate('senderUserId', accessSafeData).populate("receiverUserId", accessSafeData)

        console.log(allConnections)
        /**
         * mapping through all the rowFields 
         * if the senderUserID is loggedInUser it show the receiveruserId (if the logged In user sends the request shows the receives details)
         * if the receiveruserId is loggedInUser it show the senderUserID  (if the logged In user receivers the request shows the sender details)
         */

        const connectionsData = allConnections.map(rowField =>
            rowField.senderUserId === loggedInUser ? rowField.receiverUserId : rowField.senderUserId
        )
        console.log(connectionsData)
        if (connectionsData.length === 0) {
            return res.status(200).json({
                success: true,
                message: "no conetions to show",
            })
        }
        return res.status(200).json({
            success: true,
            message: "Fetched all the connections",
            data: connectionsData
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

module.exports = router;