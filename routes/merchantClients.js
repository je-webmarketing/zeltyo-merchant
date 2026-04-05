import express from "express";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.js";

const router = express.Router();

const clients = [
  {
    id: "client_1",
    businessId: "BUS-2",
    name: "Julie",
    points: 3,
  },
  {
    id: "client_2",
    businessId: "BUS-2",
    name: "Nicolas",
    points: 5,
  },
  {
    id: "client_3",
    businessId: "BUS-1",
    name: "Emma",
    points: 8,
  },
];

router.get(
  "/clients",
  requireAuth,
  requireRole("merchant_admin", "merchant_employee"),
  (req, res) => {
    const businessId = req.user.businessId;

    const items = clients.filter((client) => client.businessId === businessId);

    return res.json({
      ok: true,
      items,
    });
  }
);

export default router;