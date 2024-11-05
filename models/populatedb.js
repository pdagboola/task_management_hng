const pool = require("./pool");

class Populate {
  async createTable() {
    console.log("...creating table");
    await pool.query(`DROP TABLE IF EXISTS users`);
    await pool.query(`DROP TABLE IF EXISTS tasks`);
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(
      `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), salt BYTEA);`
    );
    await pool.query(
      `CREATE TABLE tasks( id SERIAL PRIMARY KEY, title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), created_at VARCHAR, updated_at VARCHAR, created_by VARCHAR(255), user_id UUID);`
    );
    console.log("table created");
  }
  async createUser(username, password, email, salt) {
    const { rows } = await pool.query(
      `INSERT INTO users(username, password, email, salt) VALUES ($1, $2, $3, $4) RETURNING username, password;`,
      [username, password, email, salt]
    );

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
    const { rows } = await pool.query(
      `SELECT * FROM tasks ORDER BY id LIMIT 5 OFFSET $1;`,
      [offset]
    );
    return rows;
  }
  async getTaskById(id) {
    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1;`, [
      id,
    ]);
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
  async findUserByUsername(username) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username LIKE $1`,
      [username]
    );
    return rows;
  }
}

const populatedb = new Populate();
module.exports = populatedb;

// populatedb.createTable();
