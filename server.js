const express = require("express");
const session = require("express-session");
const Database = require("./database/database");
const passport = require("passport");

// Import routes
const AuthRouter = require("./routes/auth");
const BlogRouter = require("./routes/blog");

// Import middlewares
const Auth = require("./helpers/authMiddleware");
const UserRoutes = require("./routes/user");

// Create an Express server
const app = express();

async function SetupServer() {
    // Define view engine
    app.set("view engine", "ejs");

    // Setup Database
    const db = new Database();
    await db.setup();

    // Define middleware
    app.use(express.static(__dirname + "/public"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: "cat",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 10 * 1000 }
    }));

    // Setup passport
    app.use(passport.initialize());
    app.use(passport.session());

    //Define route
    app.use("/", BlogRouter(db));
    app.use("/auth", AuthRouter(db));
    app.use("/profile", UserRoutes(db));

    // Define 404 route
    app.use((req, res) => {
        res.status(404).render("404");
    });

    // Start the server
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

SetupServer();