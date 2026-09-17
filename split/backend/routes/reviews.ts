import { Router, Request, Response } from "express";
import mysql, { RowDataPacket } from "mysql2/promise";

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

router.get("/reviews", async (req: Request, res: Response) => {
  const { routeID } = req.query;
  const connection = await pool.getConnection();

  const [rows] = await connection.query("SELECT * FROM reviews WHERE routeID = ?", [routeID]);
  res.json(rows);
  connection.release();
});

router.post("/reviews", async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const connection = await pool.getConnection();
  await connection.query("INSERT INTO reviews SET ?", { rating, comment });
  res.json({ message: "Review added" });
  connection.release();
});

export default router;
