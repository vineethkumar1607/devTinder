const { body, validationResult } = require('express-validator');
const validator = require('validator');

const userValidation = [


    body('*').trim().escape(),
    // Required fields validation

    // First name validation
    body('firstName')
        .exists().withMessage('First name is required')
        .bail()
        .isLength({ min: 3, max: 50 }).withMessage('Must be 3-50 characters')
        .matches(/^[a-zA-Z\u00C0-\u017F\s'-]+$/).withMessage('Only letters allowed'),

    // Last name validation 
    body('lastName')
        .exists().withMessage('Last name is required')
        .bail()
        .isLength({ min: 3, max: 50 }).withMessage('Must be 3-50 characters')
        .matches(/^[a-zA-Z\u00C0-\u017F\s'-]+$/).withMessage('Only letters allowed'),

    // Email validation
    body('email')
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
        }),

    // Password validation
    body('password')
        .exists().withMessage('Password is required')
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
        }),

    // Optional  fields  validation 
    // Age validation
    body('age')
        .optional()
        .isInt({ min: 18 }).withMessage('Minimum age 18')
        .custom(Number.isInteger).withMessage('Must be whole number'),

    // Gender validation
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer not to say'])
        .withMessage('Invalid gender selection'),

    // PhotoURL validation
    body('photoUrl')
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
        }),

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

module.exports = userValidation;