const pool = require("./pool");
const Redis = require("ioredis");
const redis = new Redis({
  host: "localhost",
  port: 6379,
  // password: "3xD#5957",
});

class Populate {
  async createTable() {
    console.log("...creating tables");
    await pool.query(`DROP TABLE IF EXISTS users`);
    await pool.query(`DROP TABLE IF EXISTS tasks`);
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(
      `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), salt BYTEA);`
    );
    await pool.query(
      `CREATE TABLE tasks( id SERIAL PRIMARY KEY, title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), created_at VARCHAR, updated_at VARCHAR, created_by VARCHAR(255), user_id UUID);`
    );
    await pool.query(
      `CREATE TABLE users_tasks( id SERIAL PRIMARY KEY, user_id UUID);`
    );
    console.log("tables created");
  }
  async createUser(username, password, email, salt) {
    const { rows } = await pool.query(
      `INSERT INTO users(username, password, email, salt) VALUES ($1, $2, $3, $4) RETURNING username, password;`,
      [username, password, email, salt]
    );
    const deleteStatus = await redis.del("users");
    console.log("Cache delete status:", deleteStatus); // Should log a number, 1 if deleted
    return rows;
  }
  async getUsers() {
    const cachedUser = await redis.get("users");
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(`SELECT * FROM users;`);
    // console.log(rows);
    await redis.set("users", JSON.stringify(rows), "EX", 3600);
    return rows;
  }
  async createTask(
    title,
    description,
    due_date,
    status,
    created_at,
    created_by,
    user_id
  ) {
    await pool.query(
      `INSERT INTO tasks(title, description, due_date, status, created_at, created_by, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [title, description, due_date, status, created_at, created_by, user_id]
    );
  }
  async getTasks(offset) {
    // console.log("getting tasks");
    const cachedTasks = await redis.get("tasks");
    // console.log("gotten cached tasks", cachedTasks);
    if (cachedTasks) {
      try {
        // console.log("if block");
        const parsedTasks = JSON.parse(cachedTasks);
        if (parsedTasks.length > 0) {
          return parsedTasks;
        }
      } catch (err) {
        console.log(err.message);
      }
    } else {
      const { rows } = await pool.query(
        `SELECT * FROM tasks ORDER BY id LIMIT 5 OFFSET $1;`,
        [offset]
      );
      // console.log(rows);
      console.log("gotten tasks");
      await redis.set("tasks", JSON.stringify(rows));
      return rows;
    }
  }
  async getTaskById(id) {
    const cachedTask = await redis.get("task");
    if (cachedTask) {
      return JSON.parse(cachedTask);
    }
    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1;`, [
      id,
    ]);
    await redis.set("task", JSON.stringify(rows));
    return rows;
  }
  async updateTaskById(title, description, due_date, status, updated_at, id) {
    await pool.query(
      `UPDATE tasks SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    due_date = COALESCE($3, due_date),
    status = COALESCE($4, status),
    updated_at = $5
  WHERE id = $6;`,
      [title, description, due_date, status, updated_at, id]
    );
  }
  async deleteTaskById(id) {
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
  }
  async findUserById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      id,
    ]);
    return rows;
  }
  async findUserByEmail(email) {
    const cachedUser = await redis.get("users");
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email LIKE $1`,
      [email]
    );
    await redis.set("users", JSON.stringify(rows));
    return rows;
  }
  async findUserByUsername(username) {
    const cachedUser = await redis.get("users");
    if (!cachedUser || cachedUser[0].username !== username) {
      await redis.del("users");
    }
    if (cachedUser && cachedUser[0].username === username) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username LIKE $1`,
      [username]
    );
    await redis.set("users", JSON.stringify(rows));
    return rows;
  }
}

const populatedb = new Populate();
module.exports = populatedb;

// populatedb.createTable();
