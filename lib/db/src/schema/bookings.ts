import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { batchesTable } from "./batches";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  batchId: text("batch_id").references(() => batchesTable.id),
  plan: text("plan").notNull(),          // "regular" | "personal-5d" | "personal-3d"
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "cancelled"
  startDate: date("start_date"),
  participants: integer("participants").default(1),
  amount: integer("amount").notNull(),   // in INR (whole rupees)
  bookedAt: timestamp("booked_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  bookedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
