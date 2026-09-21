import { Router } from "express";
import registerRouter from "./login/register.ts";
import loginRouter from "./login/login.ts";
import googleRouter from "./login/googleAuth.ts";

const router = Router();

router.use("/users", registerRouter);
router.use("/auth", loginRouter);
router.use("/auth", googleRouter);

export default router;
