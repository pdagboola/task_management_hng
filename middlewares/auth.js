require("dotenv").config();
const { findUserById } = require("../models/populatedb");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
// const { createUser } = require("../models/populatedb");
// console.log("line 10 auth.js", crypto);

opts.secretOrKey = process.env.SECRET_KEY; //seret
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //extractor
// opts.issuer = "google.com";

passport.use(
  new JwtStrategy(
    opts,
    (verify = async (jwt_payload, done) => {
      console.log("jwt_payload:", jwt_payload);
      try {
        const user = await findUserById(jwt_payload.sub);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    })
  )
);

// users.get(
//   "/protected",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     try {
//       res.status(200).json({
//         data: "You have accessed a protected route!",
//         user: { username: req.user[0].username, id: req.user[0].id },
//         // user: { username: req.user.username, id: req.user.id },
//       });
//     } catch (err) {
//       res.status(500).json({ success: false, err: err.message });
//     }
//   }
// );

module.exports = { passport };
