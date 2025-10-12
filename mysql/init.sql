-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS gridspark_db;

-- Use the database
USE gridspark_db;

-- Create user (only if not already created)
CREATE USER IF NOT EXISTS 'gridspark_api_us'@'%' 
IDENTIFIED WITH caching_sha2_password BY 'MyS3cur3P@ssw0rd!';

-- Grant permissions
GRANT ALL PRIVILEGES ON gridspark_db.* TO 'gridspark_api_us'@'%';
FLUSH PRIVILEGES;

-- Example user registration table (you can expand later)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

