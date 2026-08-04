/**
 * Idempotent batch seed.
 *
 * The five regular class batches (s1–s5) that match the prototype.html slot
 * data-ids and the TIMETABLE constant in main-app.jsx.  This runs once on
 * server startup; rows already in the table are silently ignored.
 */
import { db, batchesTable } from "@workspace/db";

const BATCH_SEED = [
  {
    id: "s1",
    name: "Morning Batch 6:30 AM",
    schedule: "Mon–Sat 6:30–7:30 AM",
    mode: "offline",
    capacity: 20,
    slotKey: "6:30 AM",
    days: "Mon–Sat",
    meetLink: null,
  },
  {
    id: "s2",
    name: "Morning Batch 7:30 AM",
    schedule: "Mon–Sat 7:30–8:30 AM",
    mode: "offline",
    capacity: 20,
    slotKey: "7:30 AM",
    days: "Mon–Sat",
    meetLink: null,
  },
  {
    id: "s3",
    name: "Morning Batch 8:30 AM",
    schedule: "Mon–Sat 8:30–9:30 AM",
    mode: "offline",
    capacity: 20,
    slotKey: "8:30 AM",
    days: "Mon–Sat",
    meetLink: null,
  },
  {
    id: "s4",
    name: "Evening Online",
    schedule: "Mon–Sat 7:00–8:00 PM",
    mode: "online",
    capacity: 20,
    slotKey: "7:00 PM",
    days: "Mon–Sat",
    meetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "s5",
    name: "Evening Batch",
    schedule: "Mon–Sat 5:30–6:30 PM",
    mode: "offline",
    capacity: 20,
    slotKey: "5:30 PM",
    days: "Mon–Sat",
    meetLink: null,
  },
] as const;

export async function seedBatches(): Promise<void> {
  await db
    .insert(batchesTable)
    .values(BATCH_SEED.map(b => ({ ...b })))
    .onConflictDoNothing();
}
