const express = require("express");
const userAuth = require("../middlewares/userAuth");
const userPatchValidation = require('../middlewares/userPatchValidation');
const updatePasswordValidation = require("../middlewares/updatePasswordValidation");
const bcrypt = require("bcrypt")

const router = express.Router();

router.get("/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("user not found")
        }
        return res.json(user)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


router.patch("/edit", userAuth, userPatchValidation, async (req, res) => {
    try {
        const updates = req.body;
        const user = req.user;
        // checks and sets the each value to  the respective key value of the user  
        Object.entries(updates).forEach(([key, value]) => {
            user[key] = value
        });
        await user.save()
        return res.status(200).json({
            success: true,
            message: `${user.firstName} your profile has been updated successfully`,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                gender: user.gender,
                about: user.about,
                photoUrl: user.photoUrl,
                skills: user.skills,
            }
        })
    } catch (error) {
        console.error("UPDATE ERROR:", error.message)
        return res.status(500).json({ success: false, message: "internal server error" })
    }
});


router.patch("/update-password", userAuth, updatePasswordValidation, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;
        // checking is the current password is correct(with stored Db password)
        const isCurrentPasswordMatchesOld = await user.comparePassword(currentPassword)
        if (!isCurrentPasswordMatchesOld) {
            return res.status(400).json({
                sucess: false,
                message: "Current passwpord is incorrect"
            })
        };
        //checking is the new pasword same as the current password
        const isSameAsOldPassword = await user.comparePassword(newPassword);
        if (isSameAsOldPassword) {
            return res.status(400).json({
                sucess: false,
                message: "New password cannot be same as current password"
            })
        }
        // encrypting the new password and saving it to DB
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully "
        })
    }
    catch (error) {
        console.error("ERROR UPDATING PASSWORD:", error);
        return res.send(500).json({
            success: false,
            message: "Error updating the password. Please try again!"
        })
    }
})
module.exports = router;