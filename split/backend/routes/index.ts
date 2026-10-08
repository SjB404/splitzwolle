import { Router } from "express";
import registerRouter from "./login/register.ts";
import loginRouter from "./login/login.ts";
import googleRouter from "./login/googleAuth.ts";
import contactRouter from "./pages/contact.ts";
import usersRouter from "./admin/users.ts";
import reviewsRouter from "./pages/reviews.ts";
import authMeRouter from "./login/logout.ts"
const router = Router();


router.use("/auth", loginRouter);
router.use("/auth", authMeRouter)
router.use("/auth", googleRouter);

router.use("/users", registerRouter);
router.use("/contact", contactRouter);

router.use("/admin/users", usersRouter);
// the reviews router carries its own /reviews paths
router.use(reviewsRouter);


export default router;
