const { Router } = require("express");
const tasks = Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTAskById,
} = require("../models/populatedb");

tasks.get("/tasks/page/:pagenum", async (req, res) => {
  const { pagenum } = req.params;
  // let offset = 0;
  const offset = (pagenum - 1) * 5;
  const allTasks = await getTasks(offset);
  if (!allTasks || allTasks.length === 0) {
    res.send(JSON.stringify({ message: "No tasks created yet" }));
  } else {
    res.send(JSON.stringify(allTasks));
  }
});

tasks.post("/tasks", async (req, res) => {
  const { title, description, due_date, status } = req.body;
  console.log("task post request body:", req.body);
  const created_at = Date();
  const err = await createTask(
    title,
    description,
    due_date,
    status,
    created_at
  );
  console.log("error from line 34:", err);
  if (err) {
    res.send(JSON.stringify({ message: "Task could not be created" }));
  } else {
    res.send(JSON.stringify({ message: "Task created!" }));
  }
});

tasks.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const task = await getTaskById(id);
  console.log("here's the task object", task);
  if (!task || task.length === 0) {
    res.send(JSON.stringify({ message: "task not found" }));
  } else {
    res.send(JSON.stringify({ task }));
  }
});

tasks.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;
  const updated_at = Date();
  const task = await getTaskById(id);
  // console.log(task);
  await updateTaskById(
    !title ? task.title : title,
    !description ? task.description : description,
    !due_date ? task.due_date : due_date,
    !status ? task.status : status,
    updated_at,
    id
  );
  res.send(JSON.stringify({ message: "Task updated!" }));
});

tasks.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await deleteTAskById(id);
  res.send(JSON.stringify({ message: "Task deleted!" }));
});

module.exports = tasks;
