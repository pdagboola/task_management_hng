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
} = require("../middlewares/task");
tasks.get("/tasks", passport.authenticate("jwt", { session: false }), taskGet);

tasks.post(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  taskPost
);

tasks.get(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  taskIdGet
);

tasks.put(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  taskPut
);

tasks.delete(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  taskDelete
);

tasks.post(
  "/tasks/share",
  passport.authenticate("jwt", { session: false }),
  taskSharePost
);

module.exports = tasks;
