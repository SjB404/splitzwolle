import express from "express";
import routes from "./routes/index.ts";
import cors from "cors";

const app = express();
const port = 3000;

// CORS must come before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).end();
});
app.use(express.json());

// Your routes
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
