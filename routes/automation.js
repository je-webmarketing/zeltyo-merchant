import express from "express";
import { clients } from "../services/fakeDB.js";
import { sendPush } from "../services/onesignal.js";

const router = express.Router();

router.get("/reward-ready", async (req, res) => {
  const results = [];

  for (const client of clients) {
    if (client.points >= client.rewardGoal && !client.rewardNotified) {
      const result = await sendPush(
        client.subscriptionId,
        "🎁 Ta récompense est disponible chez Zeltyo !"
      );

      results.push({
        clientId: client.id,
        name: client.name,
        result,
      });

      if (result?.ok) {
        client.rewardNotified = true;
      }
    }
  }

  return res.json({
    ok: true,
    route: "reward-ready",
    results,
  });
});

router.get("/inactive", async (req, res) => {
  const today = new Date();
  const results = [];

  for (const client of clients) {
    const lastVisit = new Date(client.lastVisitAt);
    const diffDays = Math.floor(
      (today - lastVisit) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 7) {
      const result = await sendPush(
        client.subscriptionId,
        "🔥 Ça fait un moment ! Passe nous voir cette semaine ☕"
      );

      results.push({
        clientId: client.id,
        name: client.name,
        diffDays,
        result,
      });
    }
  }

  return res.json({
    ok: true,
    route: "inactive",
    results,
  });
});

export default router;