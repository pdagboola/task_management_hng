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
    await pool.query(`DROP TABLE IF EXISTS users_tasks`);
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(
      `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), salt BYTEA);`
    );
    await pool.query(
      `CREATE TABLE tasks( id SERIAL PRIMARY KEY, title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), priority VARCHAR(255), created_at VARCHAR, updated_at VARCHAR, created_by VARCHAR(255), user_id UUID, tags JSON);`
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
    await redis.del("users", "usersUsername", "usersEmail");
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
    priority,
    created_at,
    created_by,
    user_id,
    tags
  ) {
    await pool.query(
      `INSERT INTO tasks(title, description, due_date, status, priority, created_at, created_by, user_id, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        title,
        description,
        due_date,
        status,
        priority,
        created_at,
        created_by,
        user_id,
        tags,
      ]
    );
    await redis.del("tasks");
  }
  async getTasks(username, offset) {
    const { rows } = await pool.query(
      `SELECT * FROM tasks WHERE created_by LIKE $1 ORDER BY id LIMIT 5 OFFSET $2;`,
      [username, offset]
    );
    const count = await pool.query(
      `SELECT COUNT(*) FROM tasks where created_by LIKE $1`,
      [username]
    );
    const rowsCount = { rows, count };
    // console.log(rows);
    console.log("gotten tasks");
    return rowsCount;
  }
  async getTaskById(id) {
    const cachedTask = await redis.get("task");
    if (!cachedTask || cachedTask[0].id !== id) {
      await redis.del("task");
    }
    if (cachedTask && cachedTask[0].id === id) {
      return JSON.parse(cachedTask);
    }
    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1;`, [
      id,
    ]);
    await redis.set("task", JSON.stringify(rows));
    return rows;
  }
  async updateTaskById(
    title,
    description,
    due_date,
    status,
    priority,
    updated_at,
    id
  ) {
    await pool.query(
      `UPDATE tasks SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    due_date = COALESCE($3, due_date),
    status = COALESCE($4, status),
    priority = COALESCE($5, priority),
    updated_at = $6,
    tags = COALESCE($7, tags)
  WHERE id = $8;`,
      [title, description, due_date, status, priority, updated_at, tags, id]
    );
    await redis.del("tasks");
  }
  async deleteTaskById(id) {
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    await redis.del("tasks");
  }
  async findUserById(id) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      id,
    ]);
    return rows;
  }
  async findUserByEmail(email) {
    const cachedUser = await redis.get("usersEmail");
    if (!cachedUser || cachedUser[0].email !== email) {
      await redis.del("usersEmail");
    }
    if (cachedUser && cachedUser[0].email === email) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email LIKE $1`,
      [email]
    );
    await redis.set("usersEmail", JSON.stringify(rows));
    return rows;
  }
  async findUserByUsername(username) {
    const cachedUser = await redis.get("userUsername");
    if (!cachedUser || cachedUser[0].username !== username) {
      await redis.del("userUsername");
    }
    if (cachedUser && cachedUser[0].username === username) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username LIKE $1`,
      [username]
    );
    await redis.set("userUsername", JSON.stringify(rows));
    return rows;
  }
}

const populatedb = new Populate();
module.exports = populatedb;

// populatedb.createTable();
