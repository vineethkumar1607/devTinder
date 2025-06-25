const { passwordValidator, currentPassword } = require("../utils/userFields");
const { validationResult } = require("express-validator");

const updatePasswordValidation = [
    // validation of current password
    currentPassword,
    // validation update password with same password validation
    passwordValidator("newPassword"),

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

module.exports = updatePasswordValidation;