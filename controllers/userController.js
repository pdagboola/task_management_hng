const jwt = require("jsonwebtoken");
const {
  checkIfUserExists,
  checkUsernamePassword,
} = require("../services/userService");
const { createUser } = require("../models/userModel");
const userSchema = require("../schemas/userSchema");
const userLoginSchema = require("../schemas/userLoginSchema");
const bcrypt = require("bcryptjs");

const usersRegisterPost = async (req, res) => {
  console.log("entered");
  try {
    const result = userSchema.safeParse(req.body);
    if (result.error) {
      return res.status(400).json({
        success: false,
        err: result.error.errors.map((error) => error.message),
      });
    }
    const { username, password, email } = result.data;
    const doesUserExist = await checkIfUserExists(username, password, email);
    console.log("exit");
    if (!doesUserExist) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await createUser(username, hashedPassword, email, saltRounds);
      return res.status(200).json({
        success: true,
        data: "User created",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, err: "User already exists" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, data: "Couldn't create user", err: err.message });
  }
};

const usersLoginPost = async (req, res) => {
  try {
    const result = userLoginSchema.safeParse(req.body);
    if (result.error) {
      return res.status(400).json({
        success: false,
        err: result.error.errors.map((error) => error.message),
      });
    }
    const { username, password } = result.data;
    const user = await checkUsernamePassword(username, password);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    } else {
      const token = jwt.sign(
        { sub: user.id, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        success: true,
        data: "Login successful",
        user: req.username,
        token: "Bearer " + token,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      data: "Couldn't login user",
      err: err.message,
    });
  }
};

module.exports = { usersRegisterPost, usersLoginPost };
