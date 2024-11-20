const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  findUserByEmail,
  shareTask,
} = require("../models/populatedb");

const {
  returnPayload,
  filterTasks,
  checkTaskOwnership,
  CustomError,
} = require("../utils/helpers");

const taskCreateSchema = require("../schemas/taskCreateSchema");
const taskQuerySchema = require("../schemas/taskQuerySchema");
const taskUpdateSchema = require("../schemas/taskUpdateSchema");

const taskGet = async (req, res) => {
  try {
    const result = taskQuerySchema.safeParse(req.query);
    console.log(result);
    if (result.error) {
      const errorMessages = result.error.errors.map((err) => err.message);
      return res.status(400).json({ success: false, error: errorMessages });
    }
    const { page = 1, status, priority, tags, limit = 10 } = result.data;
    console.log(result.error);

    const parsedTags = tags || [];
    const { sub } = returnPayload(req, res);
    const maxLimit = 10;
    const validLimit = Math.min(Math.max(Number(limit), 1), maxLimit);
    const offset = (page - 1) * validLimit;

    const { rows: tasks } = await getTasks(sub, offset);
    console.log(tasks);

    const filteredTasks = filterTasks(tasks, {
      status,
      priority,
      tags: parsedTags,
    });

    const filteredCount = filteredTasks.length;
    const pagesToExist = Math.ceil(filteredCount / limit);

    if (filteredCount === 0 || page > pagesToExist) {
      throw new CustomError(404, "No tasks found");
    }

    const paginatedTasks = filteredTasks.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      data: {
        tasks: paginatedTasks,
        metadata: {
          current_page: page,
          total_no_of_tasks: filteredCount,
          pages_to_exist: pagesToExist,
        },
      },
    });
  } catch (err) {
    return res
      .status(err.status || 404)
      .json({ success: false, error: err.message });
  }
};

const taskPost = async (req, res) => {
  try {
    const { username, sub } = returnPayload(req, res);
    const parsedData = taskCreateSchema.parse(req.body);
    const { title, description, due_date, status, priority, tags } = parsedData;

    const current_date = new Date();
    const dueDate = new Date(due_date);
    if (dueDate < current_date) {
      throw new CustomError(400, "Due date must be in the future");
    }

    const created_at = Date();
    const newTags = JSON.stringify(tags);

    await createTask(
      title,
      description,
      due_date,
      status,
      priority,
      created_at,
      username,
      sub,
      newTags
    );

    return res.status(200).json({ success: true, data: "Task created!" });
  } catch (err) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.errors
        ? err.errors.map((e) => e.message).join(", ")
        : err.message,
    });
  }
};

const taskIdGet = async (req, res) => {
  try {
    const { username } = returnPayload(req, res);
    const { id } = req.params;

    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      throw new CustomError(404, "Task not found");
    }

    if (!checkTaskOwnership(task, username)) {
      throw new CustomError(401, "You are unauthorized to view this task");
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ success: false, error: err.message });
  }
};

const taskPut = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, status, priority } = req.body;
    const updated_at = Date();
    const { username } = returnPayload(req, res);

    const validationResult = taskUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new CustomError(400, "Invalid input data");
    }

    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      throw new CustomError(400, "Task not found");
    }

    if (!checkTaskOwnership(task, username)) {
      throw new CustomError(401, "You are unauthorized to update this task");
    }

    await updateTaskById(
      title || task.title,
      description || task.description,
      due_date || task.due_date,
      status || task.status,
      priority || task.priority,
      updated_at,
      id
    );

    return res.status(200).json({ success: true, data: "Task updated!" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ success: false, error: err.message });
  }
};

const taskDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = returnPayload(req, res);

    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      throw new CustomError(400, "Task not found");
    }

    if (!checkTaskOwnership(task, username)) {
      throw new CustomError(401, "You are unauthorized to delete this task");
    }

    await deleteTaskById(id);

    return res.status(200).json({ success: true, data: "Task deleted!" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ success: false, error: err.message });
  }
};

const taskSharePost = async (req, res) => {
  try {
    const { email, id } = req.body;

    const userTask = await getTaskById(id);
    if (!userTask || userTask.length === 0) {
      throw new CustomError(404, "Task doesn't exist");
    }

    const rows = await findUserByEmail(email);
    if (rows.length === 0) {
      throw new CustomError(404, "User doesn't exist");
    }

    const newTags = JSON.stringify(userTask[0].tags);
    const receivingUser = rows[0].username;
    const receivingUserId = rows[0].id;

    const newId = await shareTask(
      userTask[0].title,
      userTask[0].description,
      userTask[0].due_date,
      userTask[0].status,
      userTask[0].priority,
      userTask[0].created_at,
      userTask[0].created_by,
      receivingUserId,
      newTags,
      receivingUser
    );

    const updated_at = new Date();

    await updateTaskById(
      userTask[0].title,
      userTask[0].description,
      userTask[0].due_date,
      userTask[0].status,
      userTask[0].priority,
      updated_at,
      newTags,
      receivingUser,
      newId[0].id
    );

    return res
      .status(200)
      .json({ success: true, data: "Task shared successfully" });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  taskDelete,
  taskGet,
  taskIdGet,
  taskPost,
  taskPut,
  taskSharePost,
};
