const bcrypt = require("bcryptjs");

const {
  findUserByUsername,
  findUserByEmail,
  createUser,
} = require("../models/userModel");

const checkIfUserExists = async (username, password, email) => {
  const userExists = await findUserByUsername(username);
  const userEmailExists = await findUserByEmail(email);
  if (userExists.length === 0 && userEmailExists.length === 0) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await createUser(username, hashedPassword, email, saltRounds);
    return false;
  }
  if (
    (userExists.length > 0 && userExists[0].username === username) ||
    (userEmailExists.length > 0 && userEmailExists[0].email === email)
  ) {
    return true;
  }
};

const checkUsernamePassword = async (username, password) => {
  const userArray = await findUserByUsername(username);
  const user = userArray[0];
  if (!user) return false;
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return false;
  return user;
};

module.exports = {
  checkIfUserExists,
  checkUsernamePassword,
};
