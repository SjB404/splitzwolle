import { Router } from "express";
import loginRouter from "./login/login.ts";
import sessionRouter from "./login/logout.ts";
import googleRouter from "./login/googleAuth.ts";
import registerRouter from "./login/register.ts";
import contactRouter from "./pages/contact.ts";
import reviewsRouter from "./pages/reviews.ts";
import usersRouter from "./admin/users.ts";

const router = Router();

// /auth/login, /auth/me + /auth/logout, /auth/google
router.use("/auth", loginRouter);
router.use("/auth", sessionRouter);
router.use("/auth", googleRouter);

router.use("/users", registerRouter);
router.use("/contact", contactRouter);
router.use("/admin/users", usersRouter);

// the reviews router has its own /reviews paths
router.use(reviewsRouter);

export default router;
