import express, { type NextFunction, type Request, type Response } from "express";
import routes from "./routes/index.ts";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT ?? 3000);

// CORS must come before routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(404).end();
});
app.use(express.json());

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
