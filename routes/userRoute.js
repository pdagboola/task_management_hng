const { Router } = require("express");
const users = Router();

const {
  usersRegisterPost,
  usersLoginPost,
} = require("../controllers/userController");

users.post("/register", usersRegisterPost);
users.post("/login", usersLoginPost);

module.exports = users;
