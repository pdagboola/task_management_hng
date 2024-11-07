const lesson = async (email) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email LIKE $1`, [
    email,
  ]);
  return rows;
};

// await lesson(email);
