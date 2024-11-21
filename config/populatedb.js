const pool = require("./pool");

class Populate {
  async createTable() {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(
      `CREATE TABLE users(id uuid DEFAULT uuid_generate_v4() PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), salt BYTEA);`
    );
    await pool.query(
      `CREATE TABLE tasks( id SERIAL PRIMARY KEY, title VARCHAR(255), description VARCHAR(255), due_date DATE, status VARCHAR(255), priority VARCHAR(255), created_at VARCHAR, updated_at VARCHAR, created_by VARCHAR(255), user_id UUID, tags JSON, delegated_to VARCHAR(255));`
    );
    await pool.query(
      `CREATE TABLE users_tasks( id SERIAL PRIMARY KEY, user_id UUID);`
    );
  }
}

const populatedb = new Populate();
populatedb();
