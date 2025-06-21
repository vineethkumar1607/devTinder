const mongoose = require("mongoose");
const validator = require("validator")
const { Schema } = mongoose;

//creating user Schema
const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: [true, "First name is required"],
        minlength: [3, 'First name must be at least 3 characters long.'],
        maxlength: [50, 'First name cannot exceed 50 characters.'],
        match: [/^[a-zA-Z\u00C0-\u017F\s'-]+$/, 'Name can only contain letters and valid characters'],
        set: function (value) {
            if (value) {
                return value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            }
            return value;
        }
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, "Last name is required"],
        minlength: [3, 'Last name must be at least 3 characters long.'],
        maxlength: [50, 'last name cannot exceed 50 characters.'],
        match: [/^[a-zA-Z]+$/, 'Name can only contain letters (a-z, A-Z).'],
        set: function (value) {
            if (value) {
                return value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            }
            return value;
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value, {
                    allow_display_name: false,  // NOT ALLOWS "Name <email@domain.com>" format
                    require_tld: true,           // Must have a domain extension (.com, .net)
                    allow_utf8_local_part: false, // Only standard ASCII characters
                    require_valid_protocol: true,  // Rejects mailto: prefixes
                    blacklisted_chars: "\\'",   // Blocks apostrophes
                    host_blacklist: ["tempmail.com", "mailinator.com"]  // Block disposable emails
                })
            },
            message: props => `${props.value} is not a valid mail address`
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 8,
        maxlength: 64,
        validate: [{
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minSymbols: 1,
                    minNumbers: 1
                })
            },
            message: 'Password must be at least 8 characters with 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
        }, {
            validator: function (value) {
                return !validator.isIn(value, [
                    "password", "1234567890", this.firstName, this.lastName, this.email.split('@')[0]
                ]
                )
            },
            message: 'Password cannot be common or contain personal information'
        }]
    },
    age: {
        type: Number,
        min: [18, "Minimum age is 18"],
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} value must be a whole number"
        }
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "other", "prefer not to say"],
            message: "Gender must be one of:Male, Female, other,Prefer not to say"
        },
        default: "Prefer not to say",
        trim: true,
        lowercase: true
    },
    photoUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (value === this.default) return true;

                const isUrlValid = validator.isURL(value, {
                    protocols: ['http', 'https'],  // Only allows these protocols
                    require_protocol: true,      //URL Must start with http:// or https://
                    require_host: true,          // URL Must have domain
                    allow_underscores: true      // Allows _ in URLs
                });
                const allowedExtensions = ['.jpg', '.png', '.webp'];
                const hasValidExtension = allowedExtensions.some(ext =>
                    value.toLowerCase().endsWith(ext)
                );
                return isUrlValid && hasValidExtension;
            },
            message: 'Must be a valid image URL (jpg/png/webp) with HTTPS'
        },
        default: "https://t4.ftcdn.net/jpg/13/26/34/17/240_F_1326341728_2qtb9sV6KuP7dgSs32MbUb9Y0HiFSRPO.jpg"
    },
    about: {
        type: String,
        trim: true,
        minlength: [50, 'About section should be at least 50 characters'],
        maxlength: [500, 'About section cannot exceed 2000 characters.'],
        default: 'A passionate developer looking for exciting opportunities.'
    },
 skills: {
    type: [String],
    trim: true,
    maxlength: [500, 'Skills section cannot exceed 500 characters.'],
    default: [],
    validate: [
        {
            validator: function (value) {
                const maxAllowedSkillsCount = 10;
                return value.length <= maxAllowedSkillsCount;
            },
            message: `You can only add a maximum of 10 skills.`
        },
        {
            validator: function (value) {
                return value.every(skill => typeof skill === "string" && skill.length <= 50);
            },
            message: 'Each skill name must be a string and cannot exceed 50 characters.'
        }
    ]
}


},
    {
        timestamps: true,
    });
// defining a Usermodel which takes two arguments, model name and userSchema
const User = mongoose.model("User", userSchema);
module.exports = User;