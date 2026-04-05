import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  sendPush,
  sendNotificationToSubscription,
} from "../services/onesignal.js";

const router = express.Router();


// 🔥 TEST GLOBAL (debug)
router.post("/test", async (req, res) => {
  try {
    const result = await sendPush({
      title: "🔥 Zeltyo Test",
      message: "Tout fonctionne parfaitement 🚀",
      externalIds: ["0600000000"],
    });

    res.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
});


// 🎯 ENVOI À 1 CLIENT
router.post(
  "/send-to-subscription",
  requireAuth,
  requireRole("merchant_admin"),
  async (req, res) => {
  try {
    const { subscriptionId, message } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        ok: false,
        error: "subscriptionId manquant",
      });
    }

    const result = await sendNotificationToSubscription(
      subscriptionId,
      message || "🎁 Nouvelle offre disponible !"
    );

    res.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
  }
);


// 🧠 ENVOI PAR SEGMENT (EXTERNAL IDS)
router.post(
  "/send-to-segment",
  requireAuth,
  requireRole("merchant_admin"),
  async (req, res) => {
  try {
    const { externalIds, title, message } = req.body;

    if (!externalIds || !externalIds.length) {
      return res.status(400).json({
        ok: false,
        error: "externalIds manquant",
      });
    }

    const result = await sendPush({
      title: title || "Zeltyo",
      message: message || "🎁 Offre spéciale pour vous !",
      externalIds,
    });

    res.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
  }
);

export default router;