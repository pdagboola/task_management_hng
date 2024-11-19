const { Router } = require("express");
const router = Router();

const userController = require("../controllers/userController");

router.use("/", userController);

module.exports = router;
