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
tasks.get("/", passport.authenticate("jwt", { session: false }), taskGet);

tasks.post("/", passport.authenticate("jwt", { session: false }), taskPost);

tasks.get("/:id", passport.authenticate("jwt", { session: false }), taskIdGet);

tasks.put("/:id", passport.authenticate("jwt", { session: false }), taskPut);

tasks.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  taskDelete
);

tasks.post(
  "/share",
  passport.authenticate("jwt", { session: false }),
  taskSharePost
);

module.exports = tasks;
