import { Router } from "express";
import registerRouter from "./login/register.ts";
import loginRouter from "./login/login.ts";
import googleRouter from "./login/googleAuth.ts";
import contactRouter from "./pages/contact.ts";
import authMeRouter from "./login/logout.ts"
const router = Router();


router.use("/auth", loginRouter);
router.use("/auth", authMeRouter)
router.use("/auth", googleRouter);

router.use("/users", registerRouter);
router.use("/contact", contactRouter);


export default router;
