const {
    firstName,
    lastName,
    
    email,
    passwordValidator,
    age,
    gender,
    about,
    photoUrl,
    skills
} = require("../utils/userFields");
const { validationResult } = require('express-validator');

// const userFields = require("./userFields")

const userCreateValidation = [
    firstName,
    lastName,
    email,
    passwordValidator('password'),
    age,
    gender,
    about,
    photoUrl,
    skills,

    // Custom error formatter
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

module.exports = userCreateValidation;