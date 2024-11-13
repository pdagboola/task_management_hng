const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const crypto = require("node:crypto");
const { isEmail } = require("validator");
const {
  findUserByUsername,
  findUserByEmail,
  createUser,
} = require("../models/populatedb");

const usersRegisterPost = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ success: false, err: "Enter registration details correctly!" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, err: "Invalid email address" });
    }
    const userExists = await findUserByUsername(username);
    const userEmailExists = await findUserByEmail(email);
    console.log("user exists or email exists", userExists, userEmailExists);
    if (
      !userExists ||
      userExists.length === 0 ||
      !userEmailExists ||
      userEmailExists.length === 0
    ) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("heres the first hashed password", hashedPassword);
      await createUser(username, hashedPassword, email, saltRounds);

      return res.status(200).json({
        success: true,
        data: "User created",
        // token: "Bearer " + token,
      });
    }
    if (
      userExists[0].username === username ||
      userEmailExists[0].email === email
    ) {
      return res
        .status(409)
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, err: "Enter details correctly!" });
    }
    const userArray = await findUserByUsername(username);
    const user = userArray[0];

    if (!user)
      return res.status(401).json({ success: false, data: "User not found" });

    // const saltRounds = 10;
    // const newHashedPassword = await bcrypt.hash(password, saltRounds);
    // console.log("heres the new hashed password", newHashedPassword);

    // console.log("Line 113 auth js", newHashedPassword, user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: true, data: "Invalid password" });

    // Create a JWT with user ID and username in the payload
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
  } catch (err) {
    res.status(500).json({
      success: false,
      data: "Couldn't login user",
      err: err.message,
    });
  }
};

module.exports = { usersRegisterPost, usersLoginPost };
