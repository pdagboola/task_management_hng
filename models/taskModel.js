const pool = require("../db/pool");
const Redis = require("ioredis");
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

class taskModelClass {
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
  async getTasks(id, limit, offset) {
    const { rows } = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY id LIMIT $2 OFFSET $3;`,
      [id, limit, offset]
    );
    const count = await pool.query(
      `SELECT COUNT(*) FROM tasks where user_id = $1`,
      [id]
    );
    const rowsCount = { rows, count };
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
    tags,
    delegated_to,
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
    tags = COALESCE($7, tags),
    delegated_to = COALESCE($8, delegated_to)
  WHERE id = $9;`,
      [
        title,
        description,
        due_date,
        status,
        priority,
        updated_at,
        tags,
        delegated_to,
        id,
      ]
    );
    await redis.del("tasks");
  }
  async deleteTaskById(id) {
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    await redis.del("tasks");
  }
  async shareTask(
    title,
    description,
    due_date,
    status,
    priority,
    created_at,
    created_by,
    user_id,
    tags,
    delegated_to
  ) {
    const { rows } = await pool.query(
      `INSERT INTO tasks(title, description, due_date, status, priority, created_at, created_by, user_id, tags, delegated_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`,
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
        delegated_to,
      ]
    );
    await redis.del("tasks");
    return rows;
  }
}

const taskModel = new taskModelClass();
module.exports = taskModel;
