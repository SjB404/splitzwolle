import mysql from "mysql2/promise";
import "dotenv/config";

// one pool for the whole backend, configured from the environment
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "swolla",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
