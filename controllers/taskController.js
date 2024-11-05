const { Router } = require("express");
const tasks = Router();
const { passport } = require("../middlewares/auth");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
} = require("../models/populatedb");
const jwt = require("jsonwebtoken");

returnPayload = (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  console.log(token);
  const jwt_payload = jwt.decode(token);
  return jwt_payload;
};

tasks.get(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username } = returnPayload(req, res);
    const { page } = req.query;
    // let offset = 0;
    const offset = (Number(page) - 1) * 5;
    try {
      const allTasks = await getTasks(offset);
      const userTasks = allTasks.filter((task) => task.created_by === username);
      // console.log(userTasks);
      if (!userTasks || userTasks.length === 0) {
        res.json({ sucess: true, message: "You haven't created tasks yet" });
      } else {
        res.json({ message: userTasks });
      }
    } catch (err) {
      res.json({ success: false, data: err.message });
    }
  }
);

tasks.post(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, sub } = returnPayload(req, res);
    // console.log(token);
    const { title, description, due_date, status } = req.body;
    console.log("task post request body:", req.body);
    const created_at = Date();
    try {
      await createTask(
        title,
        description,
        due_date,
        status,
        created_at,
        username,
        sub
      );
      // console.log("error from line 34:", err);
      res.json({ success: true, data: "Task created!" });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

tasks.get(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username } = returnPayload(req, res);
    const { id } = req.params;
    try {
      const task = await getTaskById(id);
      console.log(task[0].created_by, username);
      if (task[0].created_by !== username) {
        return res.status(401).json({
          success: false,
          message:
            "You are unauthorized to view this task, it belongs to " +
            task[0].created_by,
        });
      }
      console.log("here's the task object", task);
      if (!task || task.length === 0) {
        return res.json({ success: false, message: "Task not found" });
      } else {
        res.json({ success: true, message: task });
      }
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

tasks.put(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { title, description, due_date, status } = req.body;
    console.log("title-status", title, description, due_date, status);
    const updated_at = Date();
    const { username } = returnPayload(req, res);

    try {
      const task = await getTaskById(id);
      if (task.created_by !== username) {
        return res.status(401).json({
          success: false,
          message: "You are unauthorized to update this task",
        });
      }
      // console.log(task);
      if (!task || task.length === 0) {
        res.json({ success: false, message: "Task not found" });
      } else {
        // console.log("else statement block");
        await updateTaskById(
          !title ? task.title : title,
          !description ? task.description : description,
          !due_date ? task.due_date : due_date,
          !status ? task.status : status,
          updated_at,
          id
        );
        res.json({ success: true, message: "Task updated!" });
      }
      // console.log(task);
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

tasks.delete(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { username } = returnPayload(req, res);

    try {
      const task = await getTaskById(id);
      if (task.created_by !== username) {
        return res.status(401).json({
          success: false,
          message: "You are unauthorized to delete this task",
        });
      }
      if (task.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }
    } catch (err) {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
    }
    try {
      await deleteTaskById(id);
      return res.json({ success: true, message: "Task deleted!" });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  }
);

module.exports = tasks;
