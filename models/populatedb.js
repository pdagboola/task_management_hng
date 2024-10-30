const pool = require("./pool");

class Populate {
  async createTable() {
    try {
      console.log("...creating table");
      await pool.query(`DROP TABLE IF EXISTS users`);
      await pool.query(`DROP TABLE IF EXISTS tasks`);
      await pool.query(
        `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), email VARCHAR(255), password BYTEA);`
      );
      await pool.query(
        `CREATE TABLE tasks( id SERIAL PRIMARY KEY, title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), created_at VARCHAR, updated_at VARCHAR);`
      );
      console.log("table created");
    } catch (err) {
      return err;
    }
  }
  async createUser(username, email, password) {
    try {
      await pool.query(
        `INSERT INTO users(username, email, password) VALUES ($1, $2, $3);`,
        [username, email, password]
      );
    } catch (error) {
      throw err;
    }
  }
  async createTask(title, description, due_date, status, created_at) {
    try {
      await pool.query(
        `INSERT INTO tasks(title, description, due_date, status, created_at) VALUES ($1, $2, $3, $4, $5);`,
        [title, description, due_date, status, created_at]
      );
    } catch (err) {
      throw err;
    }
  }
  async getTasks(offset) {
    try {
    } catch (err) {}
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
  async updateTaskById(
    title,
    description,
    due_date,
    status,
    created_at,
    updated_at,
    id
  ) {
    await pool.query(
      `INSERT INTO tasks(title, desxription, due_date, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) WHERE id = $7;`,
      [title, description, due_date, status, created_at, updated_at, id]
    );
  }
  async deleteTAskById(id) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }
}

const populatedb = new Populate();
module.exports = populatedb;

// populatedb.createTable();
