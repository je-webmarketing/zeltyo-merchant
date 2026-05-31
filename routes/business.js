import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function clean(value) {
  return String(value || "").trim();
}

function toDb(data = {}) {
  return {
    id: clean(data.id),
    name: clean(data.name),
    country: clean(data.country),
    city: clean(data.city),
    zone_label: clean(data.zoneLabel),
    radius_km: Number(data.radiusKm || 0),
    latitude: data.latitude ? Number(data.latitude) : null,
    longitude: data.longitude ? Number(data.longitude) : null,
    reward_goal: Number(data.rewardGoal || 10),
    reward_label: clean(data.rewardLabel),

    review_url: clean(data.reviewUrl),
    website: clean(data.website),
    phone: clean(data.phone),
    email: clean(data.email),
    address: clean(data.address),

    updated_at: new Date().toISOString(),
  };
}

function fromDb(row = {}) {
  return {
    id: row.id,
    name: row.name || "",
    country: row.country || "",
    city: row.city || "",
    zoneLabel: row.zone_label || "",
    radiusKm: Number(row.radius_km || 0),
    latitude: row.latitude,
    longitude: row.longitude,
    rewardGoal: Number(row.reward_goal || 10),
    rewardLabel: row.reward_label || "",

    reviewUrl: row.review_url || "",
    website: row.website || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",

    updatedAt: row.updated_at,
  };
}

router.post("/create", async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const ownerName = clean(req.body.ownerName);

    if (!name || !email) {
      return res.status(400).json({
        ok: false,
        error: "Nom et email requis",
      });
    }

    const business = {
      id: `BUS-${Date.now()}`,
      name,
      ownerName,
      email,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        id: business.id,
        name: business.name,
        email: business.email,
        owner_name: ownerName,
        created_at: business.createdAt,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      ok: true,
      business: fromDb(data),
    });
  } catch (err) {
    console.error("Erreur POST /businesses/create :", err);
    return res.status(500).json({
      ok: false,
      error: "Erreur création commerce",
    });
  }
});

router.get("/:businessId", async (req, res) => {
  try {
    const businessId = clean(req.params.businessId);

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        ok: false,
        error: "Commerce introuvable",
      });
    }

    return res.json({
      ok: true,
      business: fromDb(data),
    });
  } catch (err) {
    console.error("Erreur GET /businesses/:businessId :", err);
    return res.status(500).json({
      ok: false,
      error: "Erreur récupération commerce",
    });
  }
});

router.patch("/:businessId", async (req, res) => {
  try {
    const businessId = clean(req.params.businessId);

    if (!businessId) {
      return res.status(400).json({
        ok: false,
        error: "businessId obligatoire",
      });
    }

    const payload = toDb({
      ...req.body,
      id: businessId,
    });

    const { data, error } = await supabase
      .from("businesses")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      ok: true,
      business: fromDb(data),
    });
  } catch (err) {
    console.error("Erreur PATCH /businesses/:businessId :", err);
    return res.status(500).json({
      ok: false,
      error: "Erreur sauvegarde commerce",
    });
  }
});

export default router;