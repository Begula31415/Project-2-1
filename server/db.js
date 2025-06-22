// db.js
const { Pool } = require('pg');

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