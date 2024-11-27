const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const {
  usersRegisterPost,
  usersLoginPost,
} = require("../../controllers/userController");
const {
  checkIfUserExists,
  checkUsernamePassword,
} = require("../../services/userService");
const { createUser } = require("../../models/userModel");

jest.mock("../../services/userService");
jest.mock("../../models/userModel");

const app = express();
app.use(express.json());
app.post("/users/register", usersRegisterPost);
app.post("/users/login", usersLoginPost);

const mockUser = {
  username: "peter4523",
  password: "peter1234",
  email: "peter25689@gmail.com",
};

describe("User Controller", () => {
  describe("POST /users/register", () => {
    it("should successfully register a user", async () => {
      checkIfUserExists.mockResolvedValue(false);
      createUser.mockResolvedValue();

      const response = await request(app)
        .post("/users/register")
        .send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: "User created",
      });
      expect(checkIfUserExists).toHaveBeenCalledWith(
        mockUser.username,
        mockUser.password,
        mockUser.email
      );
      expect(createUser).toHaveBeenCalledWith(
        mockUser.username,
        expect.any(String), // hashed password
        mockUser.email,
        expect.any(Number) // salt rounds
      );
    });

    it("should return an error if the user already exists", async () => {
      checkIfUserExists.mockResolvedValue(true);

      const response = await request(app)
        .post("/users/register")
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        err: "User already exists",
      });
      expect(checkIfUserExists).toHaveBeenCalledWith(
        mockUser.username,
        mockUser.password,
        mockUser.email
      );
    });

    it("should return validation errors for invalid input", async () => {
      const invalidUser = {
        username: "",
        password: "short",
        email: "not-an-email",
      };

      const response = await request(app)
        .post("/users/register")
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.err).toBeInstanceOf(Array);
    });
  });

  describe("POST /users/login", () => {
    it("should successfully log in a user", async () => {
      checkUsernamePassword.mockResolvedValue(mockUser);
      jest.spyOn(jwt, "sign").mockReturnValue("mocked-jwt-token");

      const response = await request(app).post("/users/login").send({
        username: mockUser.username,
        password: mockUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: "Login successful",
        user: undefined, // No explicit user returned in your controller
        token: "Bearer mocked-jwt-token",
      });
      expect(checkUsernamePassword).toHaveBeenCalledWith(
        mockUser.username,
        mockUser.password
      );
    });

    it("should return an error for invalid username or password", async () => {
      checkUsernamePassword.mockResolvedValue(null);

      const response = await request(app).post("/users/login").send({
        username: "wronguser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: "Invalid username or password",
      });
      expect(checkUsernamePassword).toHaveBeenCalledWith(
        "wronguser",
        "wrongpassword"
      );
    });

    it("should return validation errors for invalid input", async () => {
      const invalidLoginData = {
        username: "",
        password: "",
      };

      const response = await request(app)
        .post("/users/login")
        .send(invalidLoginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.err).toBeInstanceOf(Array);
    });
  });
});
