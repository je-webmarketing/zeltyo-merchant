import express from "express";

const router = express.Router();

// fake DB (remplacé plus tard par vraie DB)
const businesses = [];

router.post("/create", (req, res) => {
  try {
    const { name, ownerName, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        ok: false,
        error: "Nom et email requis",
      });
    }

    const business = {
      id: "BUS-" + Date.now(),
      name,
      ownerName,
      email,
      createdAt: new Date().toISOString(),
    };

    businesses.push(business);

    return res.json({
      ok: true,
      business,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

export default router;