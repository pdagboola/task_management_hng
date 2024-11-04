const express = require("express");
const app = express();
const PORT = 3030;
const taskRouter = require("./routes/tasksRoute");
const passport = require("passport");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use("/", taskRouter);

app.listen(PORT, () =>
  console.log(`Your task management App is currently running on port ${PORT}!`)
);

// console.log(Date());
