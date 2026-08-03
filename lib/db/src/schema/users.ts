import { pgTable, serial, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  onboardingData: jsonb("onboarding_data"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  joinedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
