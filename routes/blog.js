const express = require("express");
const router = express.Router();
const multer = require("multer")();
const { ObjectId } = require("mongodb");
const Auth = require("../helpers/authMiddleware");

function BlogRoutes(db) {
    // Define blog routes
    router.get("/", async (req, res) => {
        var blogs = await db.collections.blogs.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ]).toArray();

        var isAuth = req.user ? true : false;

        res.render("index", { blogs: blogs, isAuth: isAuth, user: req.user });
    });

    router.get("/blog/:id", async (req, res) => {
        var blog = await db.collections.blogs.aggregate([
            {
                $match: { _id: new ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ]).toArray();

        var isAuth = req.user ? true : false;

        res.render("detail", { blog: blog[0], isAuth: isAuth, user: req.user });
    });

    router.get("/create", (req, res) => {
        res.render("create");
    });

    router.post("/create", Auth, multer.single("picture"), async (req, res) => {
        var { headline, sub, content } = req.body;
        var user = req.user;
        var picture = req.file ? req.file.buffer.toString("base64") : null;

        await db.collections.blogs.insertOne(
            {
                headline: headline,
                sub: sub,
                content: content,
                user_id: user._id,
                picture: picture
            }
        )
        return res.redirect("/");
    });

    router.get("/edit/:id", Auth, async (req, res) => {
        var blog = await db.collections.blogs.findOne({ _id: new ObjectId(req.params.id) });
        res.render("edit", { blog: blog });
    });

    router.post("/edit/:id", Auth, multer.single("picture"), async (req, res) => {
        var { headline, sub, content } = req.body;
        var picture = req.file ? req.file.buffer.toString("base64") : null;

        await db.collections.blogs.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    headline: headline,
                    sub: sub,
                    content: content,
                    picture: picture
                }
            }
        )
        return res.redirect("/");
    });

    router.get("/delete/:id", Auth, async (req, res) => {
        await db.collections.blogs.deleteOne({ _id: new ObjectId(req.params.id) });
        return res.redirect("/");
    });

    return router;
}

module.exports = BlogRoutes;
