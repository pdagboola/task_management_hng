const { Router } = require("express");
const users = Router();
const { usersRegisterPost, usersLoginPost } = require("../middlewares/users");

users.post("/users/register", usersRegisterPost);
users.post("/users/login", usersLoginPost);

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
//           .json({ success: false, data: "Error hashing password" });
//       }
//       await console.log(hashedPassword),
//         await createUser(username, hashedPassword, email, salt),
//         async (username, err) => {
//           if (err) {
//             res.json(500, { succes: false, data: "Couldn't create user" });
//           }
//           const { id } = await findUserByUsername(username);
//           const user = { id, username };
//           const token = jwt.sign(
//             { sub: user.id, username: user.username },
//             "secret",
//             { expiresIn: "1h" }
//           );
//           res.json({ success: true, data: "User created", token });
//         };

//       // console.log(first);
//     }
//   );
//   const { username, password, email } = req.body;
//    const salt = crypto.randomBytes(16);
//    crypto.pbkdf2(
//      password,
//      salt,
//      310000,
//      32,
//      "sha256",
//      async (err, hashedPassword) => {
//        try {
//          await createUser(username, hashedPassword, email, salt);
//        } catch (err) {}
//        console.log(first);
//      }
//    );
// });

module.exports = users;
