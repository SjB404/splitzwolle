import { Router, Request, Response } from "express";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import requireAuth, { requireRole } from "../../middleware/userAuthenticator.ts";
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
  const { name, email, subject, message } = req.body;

  if(!name ||  !email ||  !subject ||  !message){
    res.status(500).send("missing fields")
  }
  try {
    const connection = await pool.getConnection();

    await connection.execute(
      "INSERT INTO contact (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message],
    );
    connection.release();
    res.status(200).send("Message sent successfully");
  } catch (error) {
    res.status(500).send("Error sending message");
  }
});

router.delete("/:id", requireRole("admin"), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    await connection.execute("DELETE FROM contact WHERE id = ?", [id]);
    connection.release();
    res.status(200).send("Message deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting message");
  }
});

export default router;
