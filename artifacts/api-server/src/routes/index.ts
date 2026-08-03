import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import bookingsRouter from "./bookings.js";
import checkInRouter from "./check-in.js";
import paymentsRouter from "./payments.js";
import whatsappRouter from "./whatsapp.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/bookings", bookingsRouter);
router.use("/bookings", checkInRouter);
router.use("/payments", paymentsRouter);
router.use("/whatsapp", whatsappRouter);

export default router;
