// const request = require("supertest");
// const app = require("../app");
// const {
//   createTask,
//   getTasks,
//   getTaskById,
//   updateTaskById,
//   deleteTaskById,
//   shareTask,
// } = require("../models/taskModel");
// const { findUserByEmail } = require("../models/userModel");
// // const CustomError = require("../utils/customError");

// jest.mock("../models/taskModel");
// jest.mock("../models/userModel");

// describe("Task Controller Tests", () => {
//   describe("POST /tasks", () => {
//     it("should create a new task", async () => {
//       const taskData = {
//         title: "Test Task",
//         description: "Test Description",
//         due_date: "2024-12-31T00:00:00Z",
//         status: "Pending",
//         priority: "High",
//         tags: ["work", "urgent"],
//       };

//       createTask.mockResolvedValue("taskCreated");

//       const response = await request(app)
//         .post("/tasks")
//         .send(taskData)
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBe("Task created!");
//     });

//     it("should return error if due date is in the past", async () => {
//       const taskData = {
//         title: "Test Task",
//         description: "Test Description",
//         due_date: "2020-12-31T00:00:00Z",
//         status: "Pending",
//         priority: "High",
//         tags: ["work", "urgent"],
//       };

//       const response = await request(app)
//         .post("/tasks")
//         .send(taskData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Due date must be in the future");
//     });
//   });

//   describe("GET /tasks", () => {
//     it("should get all tasks", async () => {
//       const tasks = [
//         { id: 1, title: "Test Task 1", description: "Description 1" },
//         { id: 2, title: "Test Task 2", description: "Description 2" },
//       ];

//       getTasks.mockResolvedValue({ rows: tasks });

//       const response = await request(app)
//         .get("/tasks")
//         .query({ page: 1, limit: 10 })
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.tasks.length).toBeGreaterThan(0);
//     });

//     it("should return error if no tasks found", async () => {
//       getTasks.mockResolvedValue({ rows: [] });

//       const response = await request(app)
//         .get("/tasks")
//         .query({ page: 1, limit: 10 })
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("No tasks found");
//     });
//   });

//   describe("GET /tasks/:id", () => {
//     it("should get a task by ID", async () => {
//       const task = {
//         id: 1,
//         title: "Test Task",
//         description: "Test Description",
//       };

//       getTaskById.mockResolvedValue([task]);

//       const response = await request(app).get(`/tasks/${task.id}`).expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty("id", task.id);
//     });

//     it("should return error if task not found", async () => {
//       getTaskById.mockResolvedValue([]);

//       const response = await request(app).get("/tasks/999").expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Task not found");
//     });
//   });

//   describe("PUT /tasks/:id", () => {
//     it("should update a task", async () => {
//       const task = {
//         id: 1,
//         title: "Test Task",
//         description: "Test Description",
//       };
//       const updatedTask = { title: "Updated Task" };

//       getTaskById.mockResolvedValue([task]);
//       updateTaskById.mockResolvedValue(true);

//       const response = await request(app)
//         .put(`/tasks/${task.id}`)
//         .send(updatedTask)
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBe("Task updated!");
//     });

//     it("should return error if task not found", async () => {
//       getTaskById.mockResolvedValue([]);

//       const response = await request(app)
//         .put("/tasks/999")
//         .send({ title: "Updated Task" })
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Task not found");
//     });
//   });

//   describe("DELETE /tasks/:id", () => {
//     it("should delete a task", async () => {
//       const task = {
//         id: 1,
//         title: "Test Task",
//         description: "Test Description",
//       };

//       getTaskById.mockResolvedValue([task]);
//       deleteTaskById.mockResolvedValue(true);

//       const response = await request(app)
//         .delete(`/tasks/${task.id}`)
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBe("Task deleted!");
//     });

//     it("should return error if task not found", async () => {
//       getTaskById.mockResolvedValue([]);

//       const response = await request(app).delete("/tasks/999").expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Task not found");
//     });
//   });

//   describe("POST /tasks/share", () => {
//     it("should share a task with another user", async () => {
//       const task = {
//         id: 1,
//         title: "Test Task",
//         description: "Test Description",
//       };
//       const user = { id: 2, email: "test@example.com" };

//       getTaskById.mockResolvedValue([task]);
//       findUserByEmail.mockResolvedValue([user]);
//       shareTask.mockResolvedValue([task.id]);

//       const response = await request(app)
//         .post("/tasks/share")
//         .send({ email: "test@example.com", id: 1 })
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBe("Task shared successfully");
//     });

//     it("should return error if user not found", async () => {
//       getTaskById.mockResolvedValue([{ id: 1 }]);
//       findUserByEmail.mockResolvedValue([]);

//       const response = await request(app)
//         .post("/tasks/share")
//         .send({ email: "notfound@example.com", id: 1 })
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("User doesn't exist");
//     });

//     it("should return error if task not found", async () => {
//       getTaskById.mockResolvedValue([]);

//       const response = await request(app)
//         .post("/tasks/share")
//         .send({ email: "test@example.com", id: 999 })
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Task doesn't exist");
//     });
//   });
// });
