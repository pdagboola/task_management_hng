const { Router } = require("express");
const tasks = Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
} = require("../models/populatedb");

tasks.get("/tasks/page/:pagenum", async (req, res) => {
  const { pagenum } = req.params;
  // let offset = 0;
  const offset = (pagenum - 1) * 5;
  try {
    const allTasks = await getTasks(offset);
    if (!allTasks || allTasks.length === 0) {
      res.json({ sucess: true, message: "No tasks created yet" });
    } else {
      res.json({ message: allTasks });
    }
  } catch (err) {
    res.json({ success: false, data: err.message });
  }
});

tasks.post("/tasks", async (req, res) => {
  const { title, description, due_date, status } = req.body;
  console.log("task post request body:", req.body);
  const created_at = Date();
  try {
    await createTask(title, description, due_date, status, created_at);
    // console.log("error from line 34:", err);
    res.json({ success: true, data: "Task created!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

tasks.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await getTaskById(id);
    console.log("here's the task object", task);
    if (!task || task.length === 0) {
      res.json({ success: true, message: "Task not found" });
    } else {
      res.json({ success: true, message: task });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

tasks.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;
  const updated_at = Date();
  try {
    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      res.json({ success: true, message: "Task not found" });
    } else {
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
});

tasks.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await getTaskById(id);
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
});

module.exports = tasks;
