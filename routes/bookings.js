import express from "express";
import {
  createBooking,
  getBookingsByBusinessId,
  getBookingsByClientId,
  getBookingsByClientPhone,
  updateBookingStatus,
  purgeOldBookings,
} from "../services/bookingStore.js";

const router = express.Router();

router.get("/__debug", (req, res) => {
  res.json({
    ok: true,
    message: "bookings router OK",
    routes: ["/", "/purge/old", "/by-business/:id", "/by-client/:id", "/by-phone/:phone", "/:id/status"],
  });
});

router.get("/purge/old", async (req, res) => {
  try {
    await purgeOldBookings();
    res.json({ ok: true, message: "Purge réservations effectuée" });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Erreur purge réservations" });
  }
});

router.post("/", async (req, res) => {
  const booking = await createBooking(req.body);
  res.status(201).json({ ok: true, message: "Réservation envoyée", booking });
});

router.get("/by-business/:id", async (req, res) => {
  const bookings = await getBookingsByBusinessId(req.params.id);
  res.json({ ok: true, bookings });
});

router.get("/by-client/:id", async (req, res) => {
  const bookings = await getBookingsByClientId(req.params.id);
  res.json({ ok: true, bookings });
});

router.get("/by-phone/:phone", async (req, res) => {
  const bookings = await getBookingsByClientPhone(req.params.phone);
  res.json({ ok: true, bookings });
});

router.patch("/:id/status", async (req, res) => {
  const booking = await updateBookingStatus(req.params.id, req.body);

  if (!booking) {
    return res.status(404).json({ ok: false, error: "Réservation introuvable" });
  }

  res.json({ ok: true, message: "Statut mis à jour", booking });
});

export default router;