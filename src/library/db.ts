import { DB_CONFIG } from "../config";

const { Pool } = require("pg");

const pool = new Pool(DB_CONFIG);

// Test the connection
pool.connect((err: any) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

export default pool;
