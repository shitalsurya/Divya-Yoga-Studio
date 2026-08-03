import { pgTable, serial, integer, text, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { batchesTable } from "./batches";
import { bookingsTable } from "./bookings";

export const bookingSessionsTable = pgTable("booking_sessions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .references(() => bookingsTable.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  classDate: date("class_date").notNull(),
  batchId: text("batch_id")
    .references(() => batchesTable.id)
    .notNull(),
  // "upcoming" | "present" | "missed" | "workshop"
  status: text("status").notNull().default("upcoming"),
});

export const insertBookingSessionSchema = createInsertSchema(bookingSessionsTable).omit({
  id: true,
});

export type InsertBookingSession = z.infer<typeof insertBookingSessionSchema>;
export type BookingSession = typeof bookingSessionsTable.$inferSelect;
