const { Pool } = require("pg");
const pool = new Pool({
  connectionString: `postgresql://apple:password@localhost:5432/apple`,
  ssl: false,
});

module.exports = pool;
