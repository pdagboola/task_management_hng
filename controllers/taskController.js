const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  shareTask,
} = require("../models/taskModel");
const { findUserByEmail } = require("../models/userModel");

const { returnPayload, filterTasks } = require("../utils/helpers");
const { checkTaskOwnership } = require("../services/taskService");
const CustomError = require("../utils/customError");

const taskCreateSchema = require("../schemas/taskCreateSchema");
const taskQuerySchema = require("../schemas/taskQuerySchema");
const taskUpdateSchema = require("../schemas/taskUpdateSchema");

const taskGet = async (req, res, next) => {
  try {
    const result = taskQuerySchema.safeParse(req.query);
    if (result.error) {
      const errorMessages = result.error.errors.map((err) => err.message);
      return next(new CustomError(400, errorMessages.join(", ")));
    }
    const { page = 1, status, priority, tags, limit } = result.data;
    const parsedTags = tags || [];
    const { sub } = returnPayload(req, res);
    const offset = (page - 1) * limit;
    const { rows: tasks } = await getTasks(sub, limit, offset);
    const filteredTasks = filterTasks(tasks, {
      status,
      priority,
      tags: parsedTags,
    });
    const filteredCount = filteredTasks.length;
    const pagesToExist = Math.ceil(filteredCount / limit);
    if (filteredCount === 0 || page > pagesToExist) {
      return next(new CustomError(404, "No tasks found"));
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
    return next(err);
  }
};

const createTaskPost = async (req, res, next) => {
  try {
    const { username, sub } = returnPayload(req, res);
    const parsedData = taskCreateSchema.parse(req.body);
    const { title, description, due_date, status, priority, tags } = parsedData;
    const current_date = new Date();
    const dueDate = new Date(due_date);
    if (dueDate < current_date) {
      return next(new CustomError(400, "Due date must be in the future"));
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
    return next(err);
  }
};

const getTaskWithId = async (req, res, next) => {
  try {
    const { username } = returnPayload(req, res);
    const { id } = req.params;

    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      return next(new CustomError(404, "Task not found"));
    }

    if (!checkTaskOwnership(task, username)) {
      return next(
        new CustomError(401, "You are unauthorized to view this task")
      );
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

const updateTaskPut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, status, priority } = req.body;
    const updated_at = Date();
    const { username } = returnPayload(req, res);

    const validationResult = taskUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return next(new CustomError(400, "Invalid input data"));
    }

    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      return next(new CustomError(400, "Task not found"));
    }

    if (!checkTaskOwnership(task, username)) {
      return next(
        new CustomError(401, "You are unauthorized to update this task")
      );
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
    return next(err);
  }
};

const taskDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username } = returnPayload(req, res);
    const task = await getTaskById(id);
    if (!task || task.length === 0) {
      return next(new CustomError(400, "Task not found"));
    }
    if (!checkTaskOwnership(task, username)) {
      return next(
        new CustomError(401, "You are unauthorized to delete this task")
      );
    }
    await deleteTaskById(id);

    return res.status(200).json({ success: true, data: "Task deleted!" });
  } catch (err) {
    return next(err);
  }
};

const taskSharePost = async (req, res, next) => {
  try {
    const { email, id } = req.body;

    const userTask = await getTaskById(id);
    if (!userTask || userTask.length === 0) {
      return next(new CustomError(404, "Task doesn't exist"));
    }

    const rows = await findUserByEmail(email);
    if (rows.length === 0) {
      return next(new CustomError(404, "User doesn't exist"));
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
    return next(err);
  }
};

module.exports = {
  taskDelete,
  taskGet,
  createTaskPost,
  getTaskWithId,
  updateTaskPut,
  taskSharePost,
};
