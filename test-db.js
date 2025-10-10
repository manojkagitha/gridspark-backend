// This file is for testing the database connection.

// Import the database connection pool from your db.js file
const db = require('./db');

// Create a simple async function to run the test
async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    // Run a simple query to see if we get a response
    const [results] = await db.query('SELECT "Connection successful!" AS message');

    // If the query works, we know the connection is good.
    console.log('✅ Success!');
    console.log('Database says:', results[0].message);

  } catch (error) {
    // If an error occurs, the connection failed.
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);

  } finally {
    // Always close the connection pool so the script can exit.
    db.end();
  }
}

// Run the test function
testConnection();
