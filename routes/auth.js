const express = require("express");
const router = express.Router();
const passport = require("passport");
const SetupPassport = require("../configs/passport");
const multer = require("multer")();
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const salt = 10;

function AuthRouter(db) {
    // Setup Passport
    SetupPassport(db)

    // Define auth routes
    router.get("/login", (req, res) => {
        res.render("auth/login", { error: null });
    });

    router.get("/register", (req, res) => {
        res.render("auth/register", { error: null });
    });

    router.post("/login", (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return res.render("auth/login", { error: err });
            }
            if (!user) {
                return res.render("auth/login", { error: info });
            }
            req.login(user, (err) => {
                if (err) {
                    console.log(err);
                    return res.render("auth/login", { error: "An error occurred" });
                }
                return res.redirect("/");
            })
        })(req, res, next);
    })

    router.post("/register", multer.single("profilePicture"), async (req, res) => {
        var {
            firstName,
            lastName,
            email,
            password,
            confirmPassword
        } = req.body;

        var profilePicture = req.file ? req.file.buffer.toString("base64") : null;

        if (password !== confirmPassword) {
            console.log("Password does not match");
            return res.redirect("/auth/register");
        }

        var user = await db.collections.users.findOne({ email: email }).catch((err) => {
            if (err) {
                console.log(err);
                return res.redirect("/auth/register");
            }
        });

        if (user) {
            return res.render("auth/register", { error: "Email already exists" });
        }

        var hashedPassword = await bcrypt.hash(password, salt);

        await db.collections.users.insertOne(
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                profilePicture: profilePicture,
                deletedAt: null
            }
        ).catch((err) => {
            if (err) {
                console.log(err);
                return res.redirect("/auth/register");
            }
        });

        return res.redirect("/auth/login");
    });

    router.get("/logout", (req, res) => {
        req.logout((err) => {
            if (err) {
                console.log(err);
                return res.redirect("/");
            }
        });
        res.redirect("/");
    });

    return router;
}

module.exports = AuthRouter;