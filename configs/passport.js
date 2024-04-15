const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
bcrypt.genSaltSync(10);

const { ObjectId } = require("mongodb");

function SetupPassport(db) {
    var localStrategy = new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    },
        async function verify(email, password, callback) {
            var user = await db.collections.users.findOne({ email: email, deletedAt: null }).catch((err) => {
                if (err) {
                    return callback("Invalid email or password", null);
                }
            })
            if (!user) {
                return callback("Invalid email or password", null);
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return callback("Invalid email or password", null);
            }
            return callback(null, user);
        }
    )

    passport.use(localStrategy);

    passport.serializeUser((user, callback) => {
        return callback(null, user._id);
    });

    passport.deserializeUser(async (id, callback) => {
        var user = await db.collections.users.findOne({ _id: new ObjectId(id) }).catch((err) => {
            if (err) {
                return callback(err, null);
            }
        });
        return callback(null, user);
    })
}

module.exports = SetupPassport;