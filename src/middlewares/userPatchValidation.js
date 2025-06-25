const {
    firstName,
    lastName,
    nameValidator,
    age,
    gender,
    about,
    photoUrl,
    skills
} = require("../utils/userFields");
const { validationResult } = require('express-validator');

const allowedEditFields = ['firstName',
    'lastName',
    'age',
    'gender',
    'about',
    'photoUrl',
    'skills'];
// check the request body should not be empty
const validateAllowedFields = (allowedEditFields) => (req, res, next) => {
    const incomingFields = Object.keys(req.body)
    if (incomingFields.length === 0) {
        return res.status(400).json({ success: false, message: "Fields cannot be empty" })
    }
    //checks if the fields are allowed to be modified
    const isAllwedfields = incomingFields.every(field => allowedEditFields.includes(field));
    console.log(isAllwedfields);
    if (!isAllwedfields) {
        return res.status(400).json({
            success: false,
            message: `Invalid update fields. Only the following fields are allowed: ${allowedEditFields.join(', ')}`
        })
    }
    next()
}

const userPatchValidation = [
    validateAllowedFields(allowedEditFields),
    // firstName.optional().notEmpty().withMessage("First name cannot be empty"),
    // lastName.optional().notEmpty().withMessage("Last name cannot be empty"),
    nameValidator('firstName', true),
    nameValidator('laststName', true),
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
]

module.exports = userPatchValidation;