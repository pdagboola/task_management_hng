const { Router } = require("express");
const router = Router();
const taskController = require("../controllers/taskController");
const auth = require("../middlewares/auth");
const authController = auth.users;

router.use("/", taskController);
router.use("/", authController);

module.exports = router;
