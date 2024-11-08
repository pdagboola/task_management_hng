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
    try {
      const { username } = returnPayload(req, res);
      const { page } = req.query;
      // let offset = 0;
      const offset = (Number(page) - 1) * 5;
      const allTasks = await getTasks(username, offset);
      const userTasks = allTasks.rows;
      const count = allTasks.count.rows[0].count;
      // console.log("allTasks:", allTasks);
      // const userTasks = allTasks.filter((task) => task.created_by === username);
      console.log("usertasks", userTasks);
      // console.log(userTasks);
      const pages_to_exist = Math.ceil(count / 5);
      if (page > pages_to_exist) {
        return res
          .status(404)
          .json({ success: false, data: "Uh oh, page doesn't exist" });
      }
      if (!userTasks || userTasks.length === 0) {
        return res.json({
          sucess: true,
          data: "You haven't created tasks yet",
        });
      } else {
        return res.json({
          success: true,
          data: {
            tasks: userTasks,
            metadata: {
              current_page: Number(page),
              total_no_of_tasks: count,
              page_to_exist: pages_to_exist,
            },
          },
        });
      }
    } catch (err) {
      return res.status(500).json({ success: false, err: err.message });
    }
  }
);

tasks.post(
  "/tasks",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { username, sub } = returnPayload(req, res);
      // console.log(token);
      const { title, description, due_date, status } = req.body;
      if (!title || !description || !due_date || !status) {
        return res
          .status(400)
          .json({ success: false, err: "Enter all task details correctly!" });
      }
      const current_date = new Date();
      const dueDate = new Date(due_date);
      console.log(dueDate);
      if (dueDate < current_date) {
        return res
          .status(400)
          .json({ success: false, err: "Due date must be in the future" });
      }
      console.log("task post request body:", req.body);
      const created_at = Date();
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
      return res.json({ success: true, data: "Task created!" });
    } catch (err) {
      return res.status(500).json({ success: false, data: err.message });
    }
  }
);

tasks.get(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { username } = returnPayload(req, res);
      const { id } = req.params;
      const task = await getTaskById(id);
      if (!task || task.length === 0) {
        console.log(task);
        return res.status(404).json({ success: false, data: "Task not found" });
      }
      if (task.length > 0 && task[0].created_by !== username) {
        console.log(task[0].created_by, username);
        return res.status(401).json({
          success: false,
          data: "You are unauthorized to view this task",
        });
      }
      console.log("here's the task object", task);

      return res.status(200).json({ success: true, data: task });
    } catch (err) {
      return res.status(500).json({ success: false, data: err.message });
    }
  }
);

tasks.put(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, due_date, status } = req.body;
      console.log("title-status", title, description, due_date, status);
      const updated_at = Date();
      const { username } = returnPayload(req, res);
      const task = await getTaskById(id);
      if (task[0].created_by !== username) {
        return res.status(401).json({
          success: false,
          data: "You are unauthorized to update this task",
        });
      }
      // console.log(task);
      if (!task || task.length === 0) {
        res.json({ success: false, data: "Task not found" });
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
        return res.json({ success: true, data: "Task updated!" });
      }
      // console.log(task);
    } catch (err) {
      return res.status(500).json({ success: false, data: err.message });
    }
  }
);

tasks.delete(
  "/tasks/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = returnPayload(req, res);
      const task = await getTaskById(id);
      if (task[0].created_by !== username) {
        return res.status(401).json({
          success: false,
          data: "You are unauthorized to delete this task",
        });
      }
      if (task.length === 0) {
        return res.json({ success: false, data: "User not found" });
      }
      await deleteTaskById(id);
      return res.json({ success: true, data: "Task deleted!" });
    } catch (err) {
      return res.status(500).json({ success: false, data: err.message });
    }
  }
);

module.exports = tasks;
