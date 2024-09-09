const mysql = require("mysql2");

require("dotenv").config();

// Create connection
const db = mysql.createConnection({
  host: 'autorack.proxy.rlwy.net',
  port: '23395',
  user: 'root',
  password: 'hXvUrlzwsKvgAeGWqYIltcDYOzMDGnKN',
  database: 'railway',
});

// Establish the connection to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;