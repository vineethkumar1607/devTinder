const { param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.validateReceiverUserId = [
    param("receiverUserId")
        .exists().withMessage("Receiver user ID is required")
        .bail()
        .custom(value => mongoose.isValidObjectId(value)).withMessage("Invalid receiver user ID"),

    // Validation error handler middleware
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
