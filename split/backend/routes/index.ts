import { Router } from "express";
import registerRouter from "./login/register.ts";
import loginRouter from "./login/login.ts";
import googleRouter from "./login/googleAuth.ts";
import contactRouter from "./pages/contact.ts";
const router = Router();

router.use("/users", registerRouter);
router.use("/auth", loginRouter);
router.use("/auth", googleRouter);
router.use("/contact", contactRouter);

export default router;
