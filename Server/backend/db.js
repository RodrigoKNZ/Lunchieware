require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('Conectando a la base de datos:', process.env.DATABASE_URL);

module.exports = pool;
