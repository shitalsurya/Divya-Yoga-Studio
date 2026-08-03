import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const batchesTable = pgTable("batches", {
  id: text("id").primaryKey(),           // e.g. "s1", "s2", "p10"
  name: text("name").notNull(),
  schedule: text("schedule").notNull(),  // human-readable e.g. "Mon–Sat 6:30–7:30 AM"
  mode: text("mode").notNull().default("offline"), // "offline" | "online"
  capacity: integer("capacity").notNull().default(20),
  whatsappGroupId: text("whatsapp_group_id"),
  // Schedule fields matching the app BATCHES array shape
  slotKey: text("slot_key"),             // e.g. "7:00 PM" — used for time-window checks
  days: text("days"),                    // e.g. "Mon–Sat"
  meetLink: text("meet_link"),           // null for Offline batches; Meet URL for Online batches
});

export const insertBatchSchema = createInsertSchema(batchesTable);

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;
