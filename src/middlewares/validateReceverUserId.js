const { param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.validateReceiverUserId = [
    param("receiverUserId")
        .exists().withMessage("receiver user id is required")
        .bail()
        .custom(value => mongoose.isValidObjectId(value).withMessage("Invalid receiver user id")),


    // Error handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];