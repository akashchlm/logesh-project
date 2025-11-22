const { Pool } = require('pg');

const createPool = () => {
  return new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    max: 10,                     // same as connectionLimit
    idleTimeoutMillis: 30000,    // optional
    connectionTimeoutMillis: 2000
  });
};

const pool = createPool();

module.exports = pool;
