const express = require("express");
const app = express();
const PORT = 3030;
const taskRoutes = require("./routes/tasksRoute");
const userRoutes = require("./routes/userRoute");
const passport = require("passport");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () =>
  console.log(`Your task management App is currently running on port ${PORT}!`)
);
