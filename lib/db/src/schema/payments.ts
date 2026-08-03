import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bookingsTable } from "./bookings";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .references(() => bookingsTable.id)
    .notNull(),
  amount: integer("amount").notNull(),   // in INR
  upiRef: text("upi_ref"),              // optional reference provided by user
  status: text("status").notNull().default("self_reported"), // "self_reported" | "verified" | "failed"
  reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  reportedAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
