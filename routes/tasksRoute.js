const { Router } = require("express");
const tasks = Router();
const { passport } = require("../middlewares/auth");
const {
  taskDelete,
  taskGet,
  createTaskPost,
  getTaskWithId,
  updateTaskPut,
  taskSharePost,
} = require("../controllers/taskController");
tasks.use(passport.authenticate("jwt", { session: false }));
tasks.get("/", taskGet);

tasks.post("/", createTaskPost);

tasks.get("/:id", getTaskWithId);

tasks.put("/:id", updateTaskPut);

tasks.delete("/:id", taskDelete);

tasks.post("/share", taskSharePost);

module.exports = tasks;
