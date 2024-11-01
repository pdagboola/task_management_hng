const { Router } = require("express");
const users = Router();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
const { createUser } = require("../models/populatedb");

opts.secretOrKey = "secret";
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

passport.use(
  new JwtStrategy(
    opts,
    (verify = (jwt_payload, done) => {
      User.findone({ id: jwt_payload.sub }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  )
);

users.post("/", (req, res) => {
  const { username, password } = req.body;
});
