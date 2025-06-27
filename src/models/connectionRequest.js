
const mongoose = require("mongoose");
const { Schema } = mongoose;


const connectionRequestSchema = new Schema({
    senderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiverUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["accepted", "interested", "ignored", "rejected"]
    }
},
    {
        timestamps: true
    })
// compoundex index for both userId's
connectionRequestSchema.index({ senderUserId: 1, receiverUserId: 1 }, { unique: true })

const ConnectionRequestModel = mongoose.model("ConnectRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel;
