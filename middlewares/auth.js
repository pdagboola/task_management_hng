const { Router } = require("express");
const users = Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
require("dotenv").config();
const {
  findUserById,
  findUserByUsername,
  createUser,
} = require("../models/populatedb");
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

users.post("/users/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("heres the first hashed password", hashedPassword);
    await createUser(username, hashedPassword, email, saltRounds);

    // const token = jwt.sign(
    //   { sub: newUser.id, username: newUser.username },
    //   "secret",
    //   { expiresIn: "1h" }
    // );

    res.json({
      success: true,
      message: "User created",
      // token: "Bearer " + token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Couldn't create user", err: err.msg });
  }
});

// users.post("/users/register", (req, res) => {
//   const { username, password, email } = req.body;
//   console.log({ username, password, email });

//   const salt = crypto.randomBytes(16);
//   crypto.pbkdf2(
//     password,
//     salt,
//     310000,
//     32,
//     "sha256",
//     async (err, hashedPassword) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ success: false, message: "Error hashing password" });
//       }
//       await console.log(hashedPassword),
//         await createUser(username, hashedPassword, email, salt),
//         async (username, err) => {
//           if (err) {
//             res.json(500, { succes: false, message: "Couldn't create user" });
//           }
//           const { id } = await findUserByUsername(username);
//           const user = { id, username };
//           const token = jwt.sign(
//             { sub: user.id, username: user.username },
//             "secret",
//             { expiresIn: "1h" }
//           );
//           res.json({ success: true, message: "User created", token });
//         };

//       // console.log(first);
//     }
//   );
// });

users.post(
  "/users/login",
  async (req, res) => {
    const { username, password } = req.body;
    const userArray = await findUserByUsername(username);
    const user = userArray[0];
    if (!user) return res.status(401).json({ message: "User not found" });
    // const saltRounds = 10;
    // const newHashedPassword = await bcrypt.hash(password, saltRounds);
    // console.log("heres the new hashed password", newHashedPassword);

    // console.log("Line 113 auth js", newHashedPassword, user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    // Create a JWT with user ID and username in the payload
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.username,
      token: "Bearer " + token,
    });
  }
  //   const { username, password, email } = req.body;
  //   const salt = crypto.randomBytes(16);
  //   crypto.pbkdf2(
  //     password,
  //     salt,
  //     310000,
  //     32,
  //     "sha256",
  //     async (err, hashedPassword) => {
  //       try {
  //         await createUser(username, hashedPassword, email, salt);
  //       } catch (err) {}
  //       console.log(first);
  //     }
  //   );
);
users.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      message: "You have accessed a protected route!",
      user: { username: req.user[0].username, id: req.user[0].id },
      // user: { username: req.user.username, id: req.user.id },
    });
  }
);

module.exports = { users, passport };
