// db.js
const { Pool } = require('pg');
//Imports the Pool class from the pg library (PostgreSQL client for Node.js)A Pool manages multiple database connections efficiently

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_VwHRAkxd0ST1@ep-wild-sun-a847eqq8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false, // Optional: allows self-signed certs, safe for Neon
  },
});
pool
  .connect()
  .then(client => {
    console.log('Postgres connected');
    client.release();
  })
  .catch(err => console.error('Postgres connection error:', err));
  
module.exports=pool;