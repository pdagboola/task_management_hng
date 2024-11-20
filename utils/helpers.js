const jwt = require("jsonwebtoken");

const returnPayload = (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  const jwt_payload = jwt.decode(token);
  return jwt_payload;
};

const filterTasks = (tasks, filters) => {
  const { status, priority, tags } = filters;
  console.log("helper", filters);

  return tasks.filter((task) => {
    const matchesStatus = status ? task.status === status : true;
    const matchesPriority = priority ? task.priority === priority : true;
    const matchesTags =
      tags && tags.length > 0
        ? task.tags.some((tag) => tags.includes(tag))
        : true;

    return matchesStatus && matchesPriority && matchesTags;
  });
};

const checkTaskOwnership = (task, username) => task[0].created_by === username;

class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  returnPayload,
  filterTasks,
  checkTaskOwnership,
  CustomError,
};
