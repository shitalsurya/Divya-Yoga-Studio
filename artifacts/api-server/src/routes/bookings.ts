import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** POST /api/bookings */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const {
    plan,
    slotId,
    startDate,
    participants,
    amount,
  } = req.body as {
    plan?: string;
    slotId?: string | null;
    startDate?: string | null;
    participants?: number;
    amount?: number;
  };

  if (!plan) {
    res.status(400).json({ error: "plan is required" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId: req.userId!,
      batchId: slotId ?? null,
      plan,
      status: "pending",
      startDate: startDate ?? null,
      participants: participants ?? 1,
      amount: amount ?? 0,
    })
    .returning();

  res.status(201).json({ bookingId: booking.id, status: booking.status });
});

export default router;
