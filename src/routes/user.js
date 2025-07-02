const express = require('express');
const userAuth = require('../middlewares/userAuth');
const router = express.Router();
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require('../models/user');
const { set, connection } = require('mongoose');

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

// route for all the connected users/people
router.get("/requests/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        //finding the connection requests that are eaccepted
        const allConnections = await ConnectionRequestModel.find({
            $or: [
                { senderUserId: loggedInUser, status: "accepted" },
                { receiverUserId: loggedInUser, status: "accepted" }
            ]
        }).populate('senderUserId', accessSafeData).populate("receiverUserId", accessSafeData)

        /**
         * mapping through all the rowFields 
         * if the senderUserID is loggedInUser it show the receiveruserId (if the logged In user sends the request shows the receives details)
         * if the receiveruserId is loggedInUser it show the senderUserID  (if the logged In user receivers the request shows the sender details)
         */

        const connectionsData = allConnections.map(rowField =>
            rowField.senderUserId._id.toString() === loggedInUser.toString() ? rowField.receiverUserId
                : rowField.senderUserId
        )

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
        console.error("Error fetching connections:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
});


// route for feed API
router.get("/feed", userAuth, async (req, res) => {
    try {
        // default pagination config
        const DEFAULT_LIMIT = 2;
        const MAX_LIMIT = 3;
        //pagination query params with default values
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
        // sets the max no.of records per page
        if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
        const skip = (page - 1) * limit;

        const loggedInUser = req.user._id;

        const allConnections = await ConnectionRequestModel.find({
            $or: [
                { senderUserId: loggedInUser },
                { receiverUserId: loggedInUser }
            ],
            status: ["accepted", "interested", "rejected", "ignored"]
        })
        // set of users to be excluded from the user feed
        const excludeUsersfromFeed = new Set();

        allConnections.forEach(connection => {
            if (connection.senderUserId.toString() !== loggedInUser.toString()) {
                excludeUsersfromFeed.add(connection.senderUserId.toString())
            }
            if (connection.receiverUserId.toString() !== loggedInUser.toString()) {
                excludeUsersfromFeed.add(connection.receiverUserId.toString())
            }
        })
        // including the loggedin user to be excluded from the feed
        excludeUsersfromFeed.add(loggedInUser);
        // calculating the total no.of records in the collection
        const totalCount = await User.countDocuments({
            _id: { $nin: Array.from(excludeUsersfromFeed) }
        })

        const totalUsersfeed = await User.find({
            _id: { $nin: Array.from(excludeUsersfromFeed) }
        }).skip(skip)
            .limit(limit)
            .select(accessSafeData) // sends only the selected data in the response

        return res.status(200).json({
            success: true,
            count: totalUsersfeed.length,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount: totalCount,
            data: totalUsersfeed
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
});

module.exports = router;