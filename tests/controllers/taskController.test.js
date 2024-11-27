const request = require("supertest");
const express = require("express");
const {
  taskDelete,
  taskGet,
  createTaskPost,
  getTaskWithId,
  updateTaskPut,
  taskSharePost,
} = require("../../controllers/taskController");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
  shareTask,
} = require("../../models/taskModel");
const { findUserByEmail } = require("../../models/userModel");
const { checkTaskOwnership } = require("../../services/taskService");
const CustomError = require("../../utils/customError");

jest.mock("../../models/taskModel");
jest.mock("../../models/userModel");
jest.mock("../../services/taskService");

const app = express();
app.use(express.json());
app.get("/tasks", taskGet);
app.post("/tasks", createTaskPost);
app.get("/tasks/:id", getTaskWithId);
app.put("/tasks/:id", updateTaskPut);
app.delete("/tasks/:id", taskDelete);
app.post("/tasks/share", taskSharePost);

const mockTask = {
  id: 1,
  title: "Test Task",
  description: "This is a test task.",
  due_date: "2024-12-31",
  status: "pending",
  priority: "high",
  tags: ["work", "personal"],
  created_at: "2024-11-01",
  created_by: "user1",
  assigned_to: "user2",
};

const mockUser = {
  id: 1,
  username: "user1",
  email: "user1@example.com",
};

const mockRequestPayload = {
  sub: mockUser.id,
  username: mockUser.username,
};

jest.mock("../../utils/helpers", () => ({
  returnPayload: jest.fn(() => mockRequestPayload),
  filterTasks: jest.fn((tasks, filters) => tasks),
}));

describe("Task Controller", () => {
  describe("GET /tasks", () => {
    it("should return paginated tasks", async () => {
      getTasks.mockResolvedValue({ rows: [mockTask] });

      const response = await request(app)
        .get("/tasks")
        .query({ limit: 1, page: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          tasks: [mockTask],
          metadata: {
            current_page: 1,
            total_no_of_tasks: 1,
            pages_to_exist: 1,
          },
        },
      });
      expect(getTasks).toHaveBeenCalledWith(mockRequestPayload.sub, 1, 0);
    });

    it("should return 404 if no tasks found", async () => {
      getTasks.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get("/tasks")
        .query({ limit: 1, page: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No tasks found" });
    });
  });

  describe("POST /tasks", () => {
    it("should successfully create a task", async () => {
      createTask.mockResolvedValue();

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Test Task",
          description: "Task description",
          due_date: "2024-12-31",
          status: "pending",
          priority: "high",
          tags: ["work", "personal"],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: "Task created!" });
      expect(createTask).toHaveBeenCalled();
    });

    it("should return 400 for invalid due date", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Test Task",
          description: "Task description",
          due_date: "2022-01-01",
          status: "pending",
          priority: "high",
          tags: ["work", "personal"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Due date must be in the future",
      });
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return task by ID", async () => {
      getTaskById.mockResolvedValue([mockTask]);
      checkTaskOwnership.mockReturnValue(true);

      const response = await request(app).get(`/tasks/${mockTask.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: [mockTask] });
    });

    it("should return 404 if task not found", async () => {
      getTaskById.mockResolvedValue([]);

      const response = await request(app).get(`/tasks/${mockTask.id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Task not found" });
    });
  });

  describe("PUT /tasks/:id", () => {
    it("should update a task", async () => {
      getTaskById.mockResolvedValue([mockTask]);
      checkTaskOwnership.mockReturnValue(true);
      updateTaskById.mockResolvedValue();

      const response = await request(app).put(`/tasks/${mockTask.id}`).send({
        title: "Updated Task",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: "Task updated!" });
    });

    it("should return 401 for unauthorized access", async () => {
      getTaskById.mockResolvedValue([mockTask]);
      checkTaskOwnership.mockReturnValue(false);

      const response = await request(app).put(`/tasks/${mockTask.id}`).send({
        title: "Updated Task",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "You are unauthorized to update this task",
      });
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task", async () => {
      getTaskById.mockResolvedValue([mockTask]);
      checkTaskOwnership.mockReturnValue(true);
      deleteTaskById.mockResolvedValue();

      const response = await request(app).delete(`/tasks/${mockTask.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: "Task deleted!" });
    });
  });

  describe("POST /tasks/share", () => {
    it("should share a task", async () => {
      getTaskById.mockResolvedValue([mockTask]);
      findUserByEmail.mockResolvedValue([{ id: 2, username: "user2" }]);
      shareTask.mockResolvedValue([{ id: 2 }]);
      updateTaskById.mockResolvedValue();

      const response = await request(app).post("/tasks/share").send({
        email: "user2@example.com",
        id: mockTask.id,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: "Task shared successfully",
      });
    });
  });
});
