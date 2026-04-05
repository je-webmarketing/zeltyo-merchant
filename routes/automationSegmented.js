import express from "express";
import { refreshClientSegments } from "../services/clientStore.js";
import {
  sendNotificationToSubscription,
  sendPush,
} from "../services/onesignal.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

console.log("✅ routes/automationSegmented.js chargé");

export async function runSegmentedAutomation(type) {
  const clients = await refreshClientSegments();
  const results = [];

  for (const client of clients) {
    if (!client.subscriptionId) continue;

    const lastVisit = client.lastVisitAt ? new Date(client.lastVisitAt) : null;
    const daysSinceLastVisit =
      lastVisit && !Number.isNaN(lastVisit.getTime())
        ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    let message = null;

    if (type === "inactive" && daysSinceLastVisit !== null && daysSinceLastVisit >= 7) {
      message =
        "On ne vous a pas vu depuis un moment 👀 Revenez profiter d’un avantage.";
    }

    if (type === "loyal" && client.segment === "loyal") {
      message =
        "Merci pour votre fidélité 🙌 Continuez et débloquez votre récompense.";
    }

    if (type === "vip" && client.segment === "vip") {
      message =
        "Client VIP ⭐ Un bonus exclusif vous attend lors de votre prochaine visite.";
    }

    if (!message) continue;

    const result = await sendNotificationToSubscription(
      client.subscriptionId,
      message
    );

    results.push({
      phone: client.phone,
      segment: client.segment,
      type,
      result,
    });
  }

  return results;
}

router.post(
  "/run",
  requireAuth,
  requireRole("merchant_admin"),
  async (req, res) => {
    try {
      const { type } = req.body;
      const results = await runSegmentedAutomation(type);
      return res.json({ ok: true, results });
    } catch (error) {
      console.error("Erreur automation segmentée :", error);
      return res.status(500).json({
        ok: false,
        error: error?.message || "Erreur serveur",
      });
    }
  }
);

router.post(
  "/send-smart-promo",
  requireAuth,
  requireRole("merchant_admin"),
  async (req, res) => {
    try {
      const { type } = req.body;
      const clients = await refreshClientSegments();

      let filteredClients = [];

      if (type === "inactive") {
        filteredClients = clients.filter((client) => client.segment === "inactive");
      }

      if (type === "vip") {
        filteredClients = clients.filter((client) => client.segment === "vip");
      }

      if (type === "near_reward") {
        filteredClients = clients.filter((client) => {
          const points = Number(client.points || 0);
          const rewardGoal = Number(client.rewardGoal || 10);
          return points >= rewardGoal - 2 && points < rewardGoal;
        });
      }

      const withSubscription = filteredClients.filter((client) => client.subscriptionId);

      if (!withSubscription.length) {
        return res.json({
          ok: true,
          count: 0,
          message: "Aucun client ciblé",
        });
      }

      const externalIds = withSubscription
        .map((client) => client.phone)
        .filter(Boolean);

      const result = await sendPush({
        title: "🎯 Offre personnalisée",
        message: "On pense à vous 😉 Revenez profiter d’une offre spéciale !",
        externalIds,
      });

      return res.json({
        ok: true,
        count: withSubscription.length,
        result,
      });
    } catch (error) {
      console.error("Erreur send-smart-promo :", error);
      console.error("Erreur send-smart-promo message :", error?.message);
      console.error("Erreur send-smart-promo code :", error?.code);
      console.error("Erreur send-smart-promo stack :", error?.stack);

      return res.status(500).json({
        ok: false,
        error: error?.message || "Erreur serveur",
      });
    }
  }
);

export default router;