const { Router } = require("express");
const router = Router();
const taskController = require("../controllers/taskController");

router.use("/", taskController);

module.exports = router;
