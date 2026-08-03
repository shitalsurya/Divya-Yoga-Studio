import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, bookingsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** POST /api/payments/mark-paid */
router.post("/mark-paid", requireAuth, async (req: AuthRequest, res) => {
  const {
    bookingId,
    amount,
    upiRef,
  } = req.body as {
    bookingId?: number;
    amount?: number;
    upiRef?: string;
  };

  if (!bookingId || amount == null) {
    res.status(400).json({ error: "bookingId and amount are required" });
    return;
  }

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      bookingId,
      amount,
      upiRef: upiRef ?? null,
      status: "self_reported",
    })
    .returning();

  // Confirm the booking once payment is self-reported
  await db
    .update(bookingsTable)
    .set({ status: "confirmed" })
    .where(eq(bookingsTable.id, bookingId));

  res.status(201).json({ paymentId: payment.id, status: payment.status });
});

export default router;
