const jwt = require("jsonwebtoken");

const returnPayload = (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  const jwt_payload = jwt.decode(token);
  return jwt_payload;
};

const filterTasks = (tasks, filters) => {
  const { status, priority, tags } = filters;

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

module.exports = {
  returnPayload,
  filterTasks,
};
