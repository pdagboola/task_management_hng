const { Router } = require("express");
const router = Router();
const taskController = require("../controllers/taskController");
const userController = require("../controllers/userController");

router.use("/", taskController);
router.use("/", userController);

module.exports = router;
