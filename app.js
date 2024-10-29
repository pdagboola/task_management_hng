const express = require("express");
const app = express();
const PORT = 3030;
const taskRouter = require("./routers/tasksRouter");

app.use("/", taskRouter);

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () =>
  console.log(
    `Your task management App is currently listening on port ${PORT}!`
  )
);

console.log(Date());
