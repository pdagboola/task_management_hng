const pool = require("../db/pool");
const Redis = require("ioredis");
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

class userModelClass {
  async createUser(username, password, email, salt) {
    const { rows } = await pool.query(
      `INSERT INTO users(username, password, email, salt) VALUES ($1, $2, $3, $4) RETURNING username, password;`,
      [username, password, email, salt]
    );
    return rows;
  }
  async getUsers() {
    const cachedUser = await redis.get("users");
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    const { rows } = await pool.query(`SELECT * FROM users;`);
    return rows;
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
    return rows;
  }
}

const userModel = new userModelClass();
module.exports = userModel;
