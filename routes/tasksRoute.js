const { Router } = require("express");
const tasks = Router();
const { passport } = require("../middlewares/auth");
const {
  taskDelete,
  taskGet,
  taskIdGet,
  taskPost,
  taskPut,
  taskSharePost,
} = require("../controllers/taskController");
tasks.use(passport.authenticate("jwt", { session: false }));
tasks.get("/", taskGet);

tasks.post("/", taskPost);

tasks.get("/:id", taskIdGet);

tasks.put("/:id", taskPut);

tasks.delete("/:id", taskDelete);

tasks.post("/share", taskSharePost);

module.exports = tasks;
