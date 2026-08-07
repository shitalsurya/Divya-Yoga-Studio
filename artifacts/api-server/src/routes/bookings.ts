import { Router } from "express";
import { db, bookingsTable, batchesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { generateUpcomingSessions } from "../lib/session-generator.js";
import { logger } from "../lib/logger.js";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";

const router = Router();

/** GET /api/bookings/current */
router.get("/current", requireAuth, async (req: AuthRequest, res) => {
  const [booking] = await db
    .select({
      bookingId: bookingsTable.id,
      status: bookingsTable.status,
      batch: batchesTable,
    })
    .from(bookingsTable)
    .leftJoin(batchesTable, eq(bookingsTable.batchId, batchesTable.id))
    .where(
      and(
        eq(bookingsTable.userId, req.userId!),
        isNotNull(bookingsTable.batchId),
        ne(bookingsTable.status, "cancelled"),
      ),
    )
    .orderBy(desc(bookingsTable.bookedAt))
    .limit(1);

  res.json({
    bookingId: booking?.bookingId ?? null,
    status: booking?.status ?? null,
    batch: booking?.batch ?? null,
  });
});

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

  // Generate the next 4 weeks of booking_sessions immediately (non-blocking).
  if (slotId) {
    generateUpcomingSessions({
      userId: req.userId!,
      bookingId: booking.id,
      batchId: slotId,
    }).catch(err => logger.warn({ err }, "initial session generation failed non-fatally"));
  }

  res.status(201).json({ bookingId: booking.id, status: booking.status });
});

export default router;
