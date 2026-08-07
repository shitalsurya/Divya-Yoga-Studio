import { Router } from "express";
import { db, batchesTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router = Router();

/** GET /api/batches */
router.get("/", async (_req, res) => {
  const batches = await db
    .select()
    .from(batchesTable)
    .orderBy(asc(batchesTable.slotKey));

  res.json({ batches });
});

export default router;