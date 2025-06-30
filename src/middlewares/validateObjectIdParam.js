const { param, validationResult } = require("express-validator");
const mongoose = require("mongoose")

const validateObjectIdParam = (paramName) => [
    param(paramName)
        .exists().withMessage(`${paramName} is required`)
        .bail()
        .custom(value => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error(`${paramName} is invalid`)
            }
            return true;
        }),

    // errro handler 
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg,
                }))
            });
        }
        next();
    }

];

module.exports= validateObjectIdParam;