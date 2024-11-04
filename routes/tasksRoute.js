const { Router } = require("express");
const router = Router();
const taskController = require("../controllers/taskController");
const authController = require("../middlewares/auth");

router.use("/", taskController);
router.use("/", authController);

module.exports = router;
