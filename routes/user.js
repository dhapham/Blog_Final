const express = require("express");
const multer = require("multer")();
const router = express.Router();

function UserRoutes(db) {
    //Define user routes
    router.get("/edit", Auth, async (req, res) => {
        res.render("profile/edit", { user: req.user });
    });

    router.post("/edit", Auth, multer.single("profilePicture"), async (req, res) => {
        var { firstName, lastName, email, deletePicture } = req.body;

        var profilePicture = null;
        if (!deletePicture) {
            profilePicture = req.file ? req.file.buffer.toString("base64") : req.user.profilePicture;
        }

        await db.collections.users.updateOne({ _id: req.user._id }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                profilePicture: profilePicture
            }
        });

        res.redirect("/");
    });

    router.get("/delete", Auth, async (req, res) => {
        await db.collections.users.updateOne({ _id: req.user._id }, {
            $set: {
                deletedAt: new Date()
            }
        });

        req.logout((err) => {
            if (err) {
                console.log(err);
                return res.redirect("/");
            }
        });

        res.redirect("/auth/login");
    });

    return router;
}

module.exports = UserRoutes;