import { Router } from "express";
import { db, bookingSessionsTable, batchesTable, usersTable } from "@workspace/db";
import { eq, and, gte, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

// Level thresholds — min lifetime present classes to reach that level.
const PRACTICE_LEVELS = [
  { level: 1, label: "Beginner", minClasses: 0 },
  { level: 2, label: "Committed Practitioner", minClasses: 10 },
  { level: 3, label: "Dedicated Yogi", minClasses: 30 },
  { level: 4, label: "Wellness Champion", minClasses: 75 },
  { level: 5, label: "Master Practitioner", minClasses: 150 },
];

// Goal → default weekly/monthly targets (by onboarding label).
const GOAL_TARGETS: Record<string, { weeklyTarget: number; monthlyTarget: number }> = {
  "Weight Loss": { weeklyTarget: 5, monthlyTarget: 20 },
  "PCOS":        { weeklyTarget: 5, monthlyTarget: 20 },
  "Prenatal":    { weeklyTarget: 3, monthlyTarget: 12 },
  "Fitness":     { weeklyTarget: 5, monthlyTarget: 20 },
};
const DEFAULT_TARGETS = { weeklyTarget: 5, monthlyTarget: 20 };

function deriveLevel(lifetimePresent: number): { level: number; label: string } {
  for (let i = PRACTICE_LEVELS.length - 1; i >= 0; i--) {
    if (lifetimePresent >= PRACTICE_LEVELS[i].minClasses) {
      return { level: PRACTICE_LEVELS[i].level, label: PRACTICE_LEVELS[i].label };
    }
  }
  return { level: 1, label: "Beginner" };
}

/** Parse a strict "H:MM AM/PM" slot key into { hour, minute } in 24-hour time. */
function strictParseSlot(slotKey: string): { hour: number; minute: number } | null {
  const match = slotKey.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const hour12 = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return null;
  let hour = hour12;
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

/** GET /api/practice/summary */
router.get("/summary", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Date bounds
  const thisMonthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd      = new Date(now.getFullYear(), now.getMonth(), 0);
  const thisMonthStartStr = thisMonthStart.toISOString().split("T")[0];
  const lastMonthStartStr = lastMonthStart.toISOString().split("T")[0];
  const lastMonthEndStr   = lastMonthEnd.toISOString().split("T")[0];
  const daysInThisMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // ISO week start (Monday)
  const dow = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dow);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Parallel fetch: user, all sessions, batches
  const [userRows, sessions, batchRows] = await Promise.all([
    db.select({ onboardingData: usersTable.onboardingData })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1),

    db.select({
        classDate: bookingSessionsTable.classDate,
        status:    bookingSessionsTable.status,
        batchId:   bookingSessionsTable.batchId,
      })
      .from(bookingSessionsTable)
      .where(eq(bookingSessionsTable.userId, userId))
      .orderBy(asc(bookingSessionsTable.classDate)),

    db.select({ id: batchesTable.id, slotKey: batchesTable.slotKey })
      .from(batchesTable),
  ]);

  const user = userRows[0];
  const batchSlot: Record<string, string | null> = Object.fromEntries(
    batchRows.map(b => [b.id, b.slotKey]),
  );

  // Effective status: treat upcoming-past sessions as missed at read-time.
  function effectiveStatus(
    classDate: string,
    rawStatus: string,
    batchId: string | null,
  ): string {
    if (rawStatus !== "upcoming") return rawStatus;
    if (classDate < todayStr) return "missed";
    if (classDate === todayStr && batchId) {
      const slot = batchSlot[batchId];
      if (slot) {
        const parsed = strictParseSlot(slot);
        if (parsed) {
          const classTime = new Date(now);
          classTime.setHours(parsed.hour, parsed.minute, 0, 0);
          if (now > classTime) return "missed";
        }
      }
    }
    return rawStatus;
  }

  // Build effective status map keyed by date (present wins over other statuses).
  const statusByDate = new Map<string, string>();
  for (const s of sessions) {
    const eff = effectiveStatus(s.classDate, s.status, s.batchId);
    const prev = statusByDate.get(s.classDate);
    if (!prev || eff === "present" || (prev === "upcoming" && eff !== "upcoming")) {
      statusByDate.set(s.classDate, eff);
    }
  }

  // --- Onboarding goal & targets ---
  const od = (user?.onboardingData ?? {}) as Record<string, unknown>;
  const rawGoal = String(od.goal ?? od.healthGoal ?? od.primaryGoal ?? "Wellness");
  const targets = GOAL_TARGETS[rawGoal] ?? DEFAULT_TARGETS;
  const weeklyTarget =
    typeof od.frequency === "number" ? od.frequency : targets.weeklyTarget;

  // --- Weekly goal ---
  let weekCompleted = 0;
  for (const [date, eff] of statusByDate) {
    if (date >= weekStartStr && date <= todayStr && eff === "present") weekCompleted++;
  }

  // --- Monthly & lifetime stats ---
  let monthPresent = 0, monthTotal = 0;
  let lastMonthPresent = 0, lastMonthTotal = 0;
  let lifetimePresent = 0;

  for (const s of sessions) {
    const eff = effectiveStatus(s.classDate, s.status, s.batchId);
    if (eff === "present") lifetimePresent++;

    const isScheduled = eff === "present" || eff === "missed" || eff === "workshop";

    if (s.classDate >= thisMonthStartStr && s.classDate <= todayStr) {
      if (eff === "present") { monthPresent++; monthTotal++; }
      else if (eff === "missed" || eff === "workshop") monthTotal++;
    }
    if (s.classDate >= lastMonthStartStr && s.classDate <= lastMonthEndStr) {
      if (eff === "present") { lastMonthPresent++; lastMonthTotal++; }
      else if (isScheduled) lastMonthTotal++;
    }
  }

  // --- Streak ---
  // Walk backwards from today; count days with "present", stop at any "missed".
  let streak = 0;
  const checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < 366; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const dayStatus = statusByDate.get(dateStr);
    if (dayStatus === "present") {
      streak++;
    } else if (dayStatus === "missed") {
      break;
    }
    // No session / upcoming: don't break (could be a rest day or future date)
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // --- Level ---
  const level = deriveLevel(lifetimePresent);

  // --- Goal journey ---
  const goalProgress = Math.min(
    100,
    targets.monthlyTarget > 0
      ? Math.round((monthPresent / targets.monthlyTarget) * 100)
      : 0,
  );
  const goalJourney = {
    goal: rawGoal,
    progress: goalProgress,
    weeklyTarget,
    monthlyTarget: targets.monthlyTarget,
  };

  // --- Monthly insights (no cross-user data) ---
  const monthlyInsights: string[] = [];
  monthlyInsights.push(
    `You attended ${monthPresent} session${monthPresent === 1 ? "" : "s"} this month.`,
  );
  const thisConsistency  = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;
  const lastConsistency  = lastMonthTotal > 0 ? Math.round((lastMonthPresent / lastMonthTotal) * 100) : 0;
  const consistencyDelta = thisConsistency - lastConsistency;
  if (Math.abs(consistencyDelta) >= 5) {
    monthlyInsights.push(
      `Your consistency ${consistencyDelta > 0 ? "improved" : "decreased"} by ${Math.abs(consistencyDelta)}% compared to last month.`,
    );
  }
  const classDelta = monthPresent - lastMonthPresent;
  if (classDelta !== 0) {
    monthlyInsights.push(
      `You completed ${Math.abs(classDelta)} ${classDelta > 0 ? "more" : "fewer"} class${Math.abs(classDelta) === 1 ? "" : "es"} than last month.`,
    );
  }

  // --- Milestones ---
  const milestones = [
    { current: streak,          target: 30,  unit: "Days",    unlock: "30-Day Consistency Badge" },
    { current: lifetimePresent, target: 50,  unit: "Classes", unlock: "50 Classes Achievement" },
  ];

  // --- Attendance calendar (current month only) ---
  const attendanceCalendar = Array.from({ length: daysInThisMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const eff = statusByDate.get(dateStr);
    let status: string;
    if (dateStr === todayStr) {
      status = eff === "present" ? "present" : eff === "missed" ? "missed" : "today";
    } else if (dateStr < todayStr) {
      status = eff ?? "upcoming"; // past day with no record shows as upcoming (no class that day)
    } else {
      status = eff === "workshop" ? "workshop" : "upcoming";
    }
    return { day, status };
  });

  res.json({
    weeklyGoal:        { completed: weekCompleted, target: weeklyTarget },
    streak,
    monthlyAttendance: { completed: monthPresent, total: monthTotal },
    level,
    goalJourney,
    monthlyInsights,
    milestones,
    attendanceCalendar,
  });
});

export default router;
