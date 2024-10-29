const { Router } = require("express");
const tasks = Router();

tasks.post("/tasks", (req, res) => {
  const { title, description, due_date, status, created_at } = req.body;
});

module.exports = {
  tasksController,
};
