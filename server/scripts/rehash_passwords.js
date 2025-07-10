const pool = require('../db');
const { hashPassword } = require('../utils/password');

async function rehashAllUsers() {
  try {
    const users = await pool.query('SELECT user_id, password_hash FROM users');
    for (const user of users.rows) {
      const plainPassword = user.password_hash;
      const hashed = await hashPassword(plainPassword);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2',
        [hashed, user.user_id]
      );
      console.log(`Rehashed user_id ${user.user_id}`);
    }
    console.log('All users rehashed!');
    process.exit(0);
  } catch (err) {
    console.error('Error rehashing users:', err);
    process.exit(1);
  }
}

rehashAllUsers();