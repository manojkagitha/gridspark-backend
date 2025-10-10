// Import the dotenv library to read .env files
require('dotenv').config();

// Import the mysql2 library
const mysql = require('mysql2');

// Create a connection pool using the credentials from your .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool's promise-based interface for modern async/await syntax
module.exports = pool.promise();
