const mongoose = require("mongoose");
const { Schema } = mongoose;

//creating user Schema
const userSchema = new Schema({
    firstName: {
        type: String   // define the type of data it holds 
    },
    lastName: String, // shorthand os {type:String}
    mail: String,
    password: String,

});
// defining a Usermodel which takes two arguments, model name and userSchema
const User = mongoose.model("User", userSchema);
module.exports = User;