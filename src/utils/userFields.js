const { body } = require('express-validator');
const validator = require('validator');

// First name validation
exports.nameValidator = (field = "name", isOptional = false) => {
    let validation = body(field)
        .exists().withMessage(`${field} name is required`)
        .bail()
        .isLength({ min: 3, max: 50 }).withMessage(`${field} Must be 3-50 characters`)
        .matches(/^[a-zA-Z\u00C0-\u017F\s'-]+$/).withMessage(`${field} must only contain letters`);

    return isOptional
        // this validation works only when the patch request (update user)
        ? validation.optional().notEmpty().withMessage(`${field} name cannot be empty`)
        // this validation works only when the post request (create user)
        : validation.exists().withMessage(`${field} is required`);

}
// Last name validation 
exports.firstName = body('firstName')
    .exists().withMessage('Last name is required')
    .bail()
    .isLength({ min: 3, max: 50 }).withMessage('Must be 3-50 characters')
    .matches(/^[a-zA-Z\u00C0-\u017F\s'-]+$/).withMessage('Only letters allowed');
// Last name validation 
exports.lastName = body('lastName')
    .exists().withMessage('Last name is required')
    .bail()
    .isLength({ min: 3, max: 50 }).withMessage('Must be 3-50 characters')
    .matches(/^[a-zA-Z\u00C0-\u017F\s'-]+$/).withMessage('Only letters allowed');
// Email validation
exports.email = body('email')
    .exists().withMessage('Email is required')
    .bail()
    .normalizeEmail()
    .bail()
    .isEmail().withMessage('Invalid email format')
    .bail()
    .custom(value => {
        if (!validator.isEmail(value, {
            allow_display_name: false,
            require_tld: true,
            allow_utf8_local_part: false,
            require_valid_protocol: true,
            blacklisted_chars: "\\'",
            host_blacklist: ['tempmail.com', 'mailinator.com']
        })) throw new Error('Disposable email not allowed');
        return true;
    });
// Password validation
exports.passwordValidator = (field = "password") => body(field)
    .exists().withMessage(`${field} is required`)
    .bail()
    .notEmpty().withMessage(`${field} cannot be empty`)
    .bail()
    .isLength({ min: 8, max: 64 }).withMessage('Must be 8-64 characters')
    .bail()
    .custom(value => {
        if (!validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) throw new Error('Must contain: 1 lowercase, 1 uppercase, 1 number, 1 symbol');
        return true;
    });

exports.cofirmPassword = body("confirmPassword")
    .exists().withMessage("Confirm password is required")
    .bail()
    .notEmpty().withMessage("Cofirm password cannot be empty")
    .bail()
    .custom((value, { req }) => {
        if (value !== req.body.NewPassword) {
            throw new Error("New password and confirm password must match")
        }
        return true;
    })
// Age validation
exports.age = body('age')
    .optional()
    .isInt({ min: 18 }).withMessage('Minimum age 18')
    .custom(Number.isInteger).withMessage('Must be whole number');
// Gender validation
exports.gender = body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer not to say'])
    .withMessage('Invalid gender selection');
// PhotoURL validation
exports.photoUrl = body('photoUrl')
    .optional()
    .custom(value => {
        if (!value) return true;

        const isValidUrl = validator.isURL(value, {
            protocols: ['https', 'http'],
            require_protocol: true,
            require_host: true
        });

        const validExtensions = ['.jpg', '.png', '.webp'];
        const isValidExtension = validExtensions.some(ext =>
            value.toLowerCase().endsWith(ext)
        );
        if (!isValidUrl || !isValidExtension) {
            throw new Error('Valid HTTPS image URL required (jpg/png/webp)');
        }
        return true;
    });

// Skills validation 
exports.skills = body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((value) => {
        if (value.length > 10) {
            throw new Error('You can only add a maximum of 10 skills.');
        }
        return true;
    })
    .custom((value) => {
        const invalidSkills = value.filter(skill => typeof skill !== 'string' || skill.length > 50);
        if (invalidSkills.length > 0) {
            throw new Error('Each skill name must be a string and cannot exceed 50 characters.');
        }
        return true;
    })
    .customSanitizer((value) => {
        // Trims each skill string 
        return value.map(skill => skill.trim());
    });


// About validation
exports.about = body('about')
    .optional()
    .trim()
    .isString()
    .withMessage('About section must be a string')
    .isLength({ min: 50 })
    .withMessage('About section should be at least 50 characters')
    .isLength({ max: 2000 })
    .withMessage('About section cannot exceed 2000 characters')
    .default('A passionate developer looking for exciting opportunities.');


exports.currentPassword = body('currentPassword')
    .exists().withMessage("Current password is required")
    .notEmpty().withMessage("Current password cannot be empty");



