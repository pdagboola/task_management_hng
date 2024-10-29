const pool = require("./pool");

class Populate {
  async createTable() {
    await pool.query(`DROP TABLE IF EXISTS users`);
    await pool.query(`DROP TABLE IF EXISTS tasks`);
    await pool.query(
      `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), email VARCHAR(255), password BYTEA`
    );
    await pool.query(
      `CREATE TABLE tasks( title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), created_at VARCHAR, updated_at VARCHAR);`
    );
  }
  async createUser(username, email, password) {
    await pool.query(
      `INSERT INTO TABLE users(username, email, password) VALUES ($1, $2, $3)`,
      [username, email, password]
    );
  }
  async createTask(title, description, due_date, status, created_at) {
    await pool.query(
      `INSERT INTO TABLE tasks(title, description, due_date, status, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [title, description, due_date, status, created_at]
    );
  }
  async getTasks() {
    await pool.query(`SELECT * FROM tasks LIMIT `);
  }
}
