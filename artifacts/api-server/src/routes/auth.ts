import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signJwt } from "../lib/jwt.js";

const router = Router();
const BCRYPT_ROUNDS = 12;
const MOBILE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{4}$/;

/** POST /api/auth/signup */
router.post("/signup", async (req, res) => {
  const { name, mobile, pin, onboarding } = req.body as {
    name?: string;
    mobile?: string;
    pin?: string;
    onboarding?: unknown;
  };

  if (!name?.trim() || !mobile || !pin) {
    res.status(400).json({ error: "name, mobile, and pin are required" });
    return;
  }
  if (!MOBILE_RE.test(mobile)) {
    res.status(400).json({ error: "Invalid Indian mobile number (10 digits starting 6–9)" });
    return;
  }
  if (!PIN_RE.test(pin)) {
    res.status(400).json({ error: "PIN must be exactly 4 digits" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.mobile, mobile))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({
      error: "An account with this mobile number already exists. Please sign in.",
    });
    return;
  }

  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  const [user] = await db
    .insert(usersTable)
    .values({
      name: name.trim(),
      mobile,
      pinHash,
      onboardingData: onboarding ?? null,
    })
    .returning();

  const sessionToken = await signJwt({ userId: user.id, mobile: user.mobile });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  res.status(201).json({ userId: user.id, sessionToken, expiresAt });
});

/** POST /api/auth/signin */
router.post("/signin", async (req, res) => {
  const { mobile, pin } = req.body as { mobile?: string; pin?: string };

  if (!mobile || !pin) {
    res.status(400).json({ error: "mobile and pin are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.mobile, mobile))
    .limit(1);

  if (!user) {
    res.status(401).json({
      error: "No account found with this mobile number. Please sign up first.",
    });
    return;
  }

  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect PIN. Please try again." });
    return;
  }

  const sessionToken = await signJwt({ userId: user.id, mobile: user.mobile });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  res.json({
    userId: user.id,
    sessionToken,
    expiresAt,
    user: { name: user.name, mobile: user.mobile, joinedAt: user.joinedAt },
  });
});

export default router;
