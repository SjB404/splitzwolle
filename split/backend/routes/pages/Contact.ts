import { Router, Request, Response } from "express";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";


const router = Router();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "swolla",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


router.post("/", async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  try {
    const connection = await pool.getConnection();

    await connection.execute(
      "INSERT INTO contact (name, email, message) VALUES (?, ?, ?)",
      [name, email, message],
    );
    connection.release();
    res.status(200).send("Message sent successfully");
  } catch (error) {
    res.status(500).send("Error sending message");
  }
});
