const request = require("supertest");
const app = require("../../app");
const {
  checkIfUserExists,
  checkUsernamePassword,
} = require("../../services/userService");

jest.mock("../../services/userService");

describe("User Controller Tests", () => {
  describe("POST /users/register", () => {
    it("should register a new user", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
        email: "test@example.com",
      };

      checkIfUserExists.mockResolvedValue(false);

      const response = await request(app)
        .post("/users/register")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe("User created");
    });

    it("should return error if user already exists", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
        email: "test@example.com",
      };

      checkIfUserExists.mockResolvedValue(true);

      const response = await request(app)
        .post("/users/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.err).toBe("User already exists");
    });

    it("should return validation error for invalid input", async () => {
      const invalidUserData = {
        username: "", // Invalid username
        password: "password123",
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/users/register")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.err.length).toBeGreaterThan(0);
    });
  });

  describe("POST /users/login", () => {
    it("should log in an existing user and return a token", async () => {
      const loginData = {
        username: "testuser",
        password: "password123",
      };

      checkUsernamePassword.mockResolvedValue({
        id: 1,
        username: "testuser",
      });

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe("Login successful");
      expect(response.body.token).toBeDefined();
      expect(response.body.token).toContain("Bearer ");
    });

    it("should return error if invalid username or password", async () => {
      const loginData = {
        username: "invaliduser",
        password: "wrongpassword",
      };

      checkUsernamePassword.mockResolvedValue(null);

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid username or password");
    });

    it("should return validation error for invalid input", async () => {
      const invalidLoginData = {
        username: "",
        password: "password123",
      };

      const response = await request(app)
        .post("/users/login")
        .send(invalidLoginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.err.length).toBeGreaterThan(0);
    });
  });
});
