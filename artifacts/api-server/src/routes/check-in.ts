import { Router } from "express";
import { db, bookingSessionsTable, batchesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/**
 * Parse a strictly-formatted "H:MM AM/PM" slotKey into a Date for today.
 * No normalisation is applied before matching — leading/trailing whitespace
 * and any surrounding text cause the parse to fail.
 * Hours must be 1–12, minutes 0–59.  Returns null for any nonconforming input;
 * callers must fail closed on null.
 */
function parseSlotToday(slotKey: string): Date | null {
  const match = slotKey.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hStr, mStr, meridiem] = match;
  const hour12 = parseInt(hStr, 10);
  const min = parseInt(mStr, 10);
  if (hour12 < 1 || hour12 > 12 || min < 0 || min > 59) return null;
  let hour = hour12;
  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d;
}

/**
 * POST /api/bookings/:batchId/check-in
 *
 * Looks up today's booking_session for the authenticated user in the given
 * batch, then marks it present.  The caller passes their batch ID (not a
 * session row ID) so the client never needs to fetch a session primary key.
 *
 * Check-in window: 15 minutes before class start → +2 hours after class start.
 * Schedule validation always runs — even if the session is already "present" —
 * so a malformed/missing slotKey never bypasses the fail-closed policy.
 */
router.post("/:batchId/check-in", requireAuth, async (req: AuthRequest, res) => {
  const batchId = String(req.params.batchId);
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Look up the user's session for this batch today (ownership enforced via userId).
  const [session] = await db
    .select()
    .from(bookingSessionsTable)
    .where(
      and(
        eq(bookingSessionsTable.userId, req.userId!),
        eq(bookingSessionsTable.batchId, batchId),
        eq(bookingSessionsTable.classDate, today),
      ),
    )
    .limit(1);

  if (!session) {
    res.status(404).json({ error: "No session found for this batch today" });
    return;
  }

  // Validate batch schedule first — fail closed regardless of session status.
  const [batch] = await db
    .select()
    .from(batchesTable)
    .where(eq(batchesTable.id, batchId))
    .limit(1);

  if (!batch?.slotKey) {
    res.status(400).json({ error: "Batch schedule not configured; cannot verify check-in window" });
    return;
  }

  const classStart = parseSlotToday(batch.slotKey);
  if (!classStart) {
    res.status(400).json({ error: "Batch schedule format unrecognised; cannot verify check-in window" });
    return;
  }

  const now = new Date();
  const windowStart = new Date(classStart.getTime() - 15 * 60 * 1000);
  const windowEnd = new Date(classStart.getTime() + 2 * 60 * 60 * 1000);
  if (now < windowStart || now > windowEnd) {
    res.status(400).json({ error: "Outside check-in window" });
    return;
  }

  // Already checked in — idempotent success (schedule already validated above).
  if (session.status === "present") {
    res.json({ sessionId: session.id, status: session.status });
    return;
  }

  const [updated] = await db
    .update(bookingSessionsTable)
    .set({ status: "present" })
    .where(eq(bookingSessionsTable.id, session.id))
    .returning();

  res.json({ sessionId: updated.id, status: updated.status });
});

export default router;
