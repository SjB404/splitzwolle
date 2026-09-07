import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const app = express();
const port = 3001;

// In production, set these via environment variables instead of hardcoding.
const JWT_SECRET = process.env.JWT_SECRET || "change_this_to_a_long_random_string";
const JWT_PREAUTH_SECRET = process.env.JWT_PREAUTH_SECRET || "change_this_to_a_different_long_random_string";
const APP_NAME = "";

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Async error caught:", err.message);
    res.status(500).json({ error: "Database error" });
  });
};

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});