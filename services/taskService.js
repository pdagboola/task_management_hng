const checkTaskOwnership = (task, username) => task[0].created_by === username;

module.exports = {
  checkTaskOwnership,
};
