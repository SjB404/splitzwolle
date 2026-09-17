import { Router } from "express";
import registerRouter from "./register.ts";
import loginRouter from "./login.ts";
import googleRouter from "./googleAuth.ts";

const router = Router();

router.use("/users", registerRouter);
router.use("/auth", loginRouter);
router.use("/auth", googleRouter);

export default router;
