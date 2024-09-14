const mysql = require("mysql2");

require("dotenv").config();

// Create connection
const db = mysql.createConnection({
  host: 'junction.proxy.rlwy.net',
  port: '34196',
  user: 'root',
  password: 'NVDEiSZwGyoIVSaFCvWhXDmvDqyEiKfa',
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