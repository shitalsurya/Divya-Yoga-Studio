import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/**
 * Slot-ID → WhatsApp group ID mapping.
 * Group IDs are stored as environment variables so they never appear in source code.
 * Set WA_GROUP_s1 … WA_GROUP_s5 in the workspace secrets.
 */
function getGroupId(slotId: string): string | undefined {
  return process.env[`WA_GROUP_${slotId}`] ?? undefined;
}

/** POST /api/whatsapp/add-to-group */
router.post("/add-to-group", requireAuth, async (req: AuthRequest, res) => {
  const { slotId, mobile } = req.body as {
    slotId?: string;
    mobile?: string;
  };

  if (!slotId || !mobile) {
    res.status(400).json({ error: "slotId and mobile are required" });
    return;
  }

  const groupId = getGroupId(slotId);
  if (!groupId) {
    // Not an error — just no group configured for this batch yet
    res.json({ success: false, reason: "No WhatsApp group configured for this batch" });
    return;
  }

  const waToken = process.env.WHATSAPP_API_TOKEN;
  if (!waToken) {
    res.json({ success: false, reason: "WHATSAPP_API_TOKEN not configured" });
    return;
  }

  // Indian mobile → WhatsApp number with country code
  const waId = `91${mobile}`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${groupId}/participants`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wa_id: waId }),
      },
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      res.json({
        success: false,
        reason: errorData.error?.message ?? `WhatsApp API returned ${response.status}`,
      });
      return;
    }

    const data = await response.json();
    res.json({ success: true, groupId, data });
  } catch (err) {
    res.json({ success: false, reason: "Network error calling WhatsApp API" });
  }
});

export default router;
