const mysql = require("mysql2");

const dbConfig = {
    connectionLimit: 10,
    host: process.env.DB_HOST , // HOST NAME
    user: process.env.DB_USER , // USER NAME
    database: process.env.DB_NAME , // DATABASE NAME
    password: process.env.DB_PASSWORD , // DATABASE PASSWORD
  };


    const db_connection = mysql.createPool(dbConfig);
  
    // Testing the connection
    db_connection.getConnection((err, connection) => {
      if (err) {
        console.error("Failed to connect to Database - ", err);
        return;
      }
  
      connection.ping((pingErr) => {
        // connection.release();
  
        if (pingErr) {
          console.error("Failed to ping the database - ", pingErr);
          return;
        }
  
        console.log("Connected to the database!");
      });
    });
  
    db_connection.on("error", (err) => {
      console.error("Database connection error - ", err);
    });
  


module.exports = db_connection;