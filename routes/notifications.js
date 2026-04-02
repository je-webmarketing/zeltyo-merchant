import express from "express";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { subscriptionId, message } = req.body;

  if (!subscriptionId || !message) {
    return res.status(400).json({
      ok: false,
      error: "subscriptionId et message sont obligatoires",
    });
  }

  try {
    const response = await fetch("https://api.onesignal.com/notifications?c=push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        target_channel: "push",
        include_subscription_ids: [subscriptionId],
        contents: { fr: message, en: message },
        headings: { fr: "Zeltyo", en: "Zeltyo" },
      }),
    });

    const data = await response.json();

    return res.status(response.ok ? 200 : response.status).json({
      ok: response.ok,
      onesignal: data,
    });
  } catch (error) {
    console.error("Erreur OneSignal :", error);
    return res.status(500).json({
      ok: false,
      error: "Erreur serveur",
    });
  }
});

export default router;