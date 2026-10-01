import { Router } from "express";
import requireAuth from "../../middleware/userAuthenticator.ts";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});


router.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ ok: true });
});

export default router;