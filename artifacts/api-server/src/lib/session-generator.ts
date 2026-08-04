/**
 * Recurring session generator for Divya Yoga Studio.
 *
 * Classes run Monday–Friday.  This matches the five-day TIMETABLE constant
 * already used by main-app.jsx (the frontend source of truth); Saturday is
 * not included because the TIMETABLE has no Saturday entry.
 *
 * Calling generateUpcomingSessions() is idempotent: it queries which dates
 * already have rows before inserting, so calling it multiple times (on each
 * Practice-tab open, for example) is safe.
 */
import { db, bookingSessionsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";

/** JS getDay() values that have a class (Mon=1 … Fri=5). */
const CLASS_DAYS = new Set([1, 2, 3, 4, 5]);

/**
 * Return every class date (YYYY-MM-DD) from `from` through the next
 * `windowDays` calendar days, inclusive of `from`.
 */
function classDateStrings(from: Date, windowDays: number): string[] {
  const dates: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  // +1 so "next 28 days" means today through today+28 (29 candidates).
  for (let i = 0; i <= windowDays; i++) {
    if (CLASS_DAYS.has(cursor.getDay())) {
      dates.push(cursor.toISOString().split("T")[0]);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export interface GenerateSessionsOptions {
  userId: number;
  bookingId: number;
  batchId: string;
  /** How many calendar days ahead to cover (default 28 = 4 weeks). */
  windowDays?: number;
}

/**
 * Ensure booking_sessions rows exist for every upcoming class day within the
 * rolling window.  Only inserts dates that are missing.
 *
 * @returns Number of rows inserted (0 when the window is already fully covered).
 */
export async function generateUpcomingSessions({
  userId,
  bookingId,
  batchId,
  windowDays = 28,
}: GenerateSessionsOptions): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split("T")[0];
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + windowDays);
  const endStr = endDate.toISOString().split("T")[0];

  // Fetch existing session dates for this user+batch in the window.
  const existing = await db
    .select({ classDate: bookingSessionsTable.classDate })
    .from(bookingSessionsTable)
    .where(
      and(
        eq(bookingSessionsTable.userId, userId),
        eq(bookingSessionsTable.batchId, batchId),
        gte(bookingSessionsTable.classDate, todayStr),
        lte(bookingSessionsTable.classDate, endStr),
      ),
    );

  const existingSet = new Set(existing.map(r => r.classDate));

  const toInsert = classDateStrings(today, windowDays).filter(
    d => !existingSet.has(d),
  );

  if (toInsert.length === 0) return 0;

  await db.insert(bookingSessionsTable).values(
    toInsert.map(classDate => ({
      bookingId,
      userId,
      classDate,
      batchId,
      status: "upcoming" as const,
    })),
  );

  return toInsert.length;
}
