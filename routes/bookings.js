import express from "express";

const router = express.Router();

const bookings = [];

router.post("/", (req, res) => {
  try {
    const booking = {
      id: `BOOK-${Date.now()}`,
      businessId: req.body.businessId || req.body.merchantId || "",
      merchantId: req.body.merchantId || req.body.businessId || "",
      businessName: req.body.businessName || "",
      clientId: req.body.clientId || "",
      clientName: req.body.clientName || "",
      clientPhone: req.body.clientPhone || "",
      type: req.body.type || "reservation",
      area: req.body.area || "",
      partySize: Number(req.body.partySize || 1),
      date: req.body.date || "",
      time: req.body.time || "",
      deliveryAddress: req.body.deliveryAddress || "",
      note: req.body.note || "",
      items: Array.isArray(req.body.items) ? req.body.items : [],
      totalPrice: Number(req.body.totalPrice || 0),
      status: "pending",
      merchantResponse: "",
      proposedDate: "",
      proposedTime: "",
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(booking);

    console.log("✅ Réservation créée :", booking);

    return res.json({
      ok: true,
      booking,
    });
  } catch (error) {
    console.error("Erreur création réservation :", error);
    return res.status(500).json({
      ok: false,
      error: "Erreur création réservation",
    });
  }
});

router.get("/by-business/:businessId", (req, res) => {
  const businessId = req.params.businessId;

  const filtered = bookings.filter(
    (booking) =>
      booking.businessId === businessId || booking.merchantId === businessId
  );

  return res.json({
    ok: true,
    bookings: filtered,
  });
});

router.get("/by-client/:clientId", (req, res) => {
  const clientId = req.params.clientId;

  const filtered = bookings.filter((booking) => booking.clientId === clientId);

  return res.json({
    ok: true,
    bookings: filtered,
  });
});

router.patch("/:bookingId/status", (req, res) => {
  const bookingId = req.params.bookingId;

  const booking = bookings.find(
    (item) => item.id === bookingId || item._id === bookingId
  );

  if (!booking) {
    return res.status(404).json({
      ok: false,
      error: "Réservation introuvable",
    });
  }

  booking.status = req.body.status || booking.status;
  booking.merchantResponse = req.body.merchantResponse || "";
  booking.proposedDate = req.body.proposedDate || "";
  booking.proposedTime = req.body.proposedTime || "";
  booking.updatedAt = new Date().toISOString();

  return res.json({
    ok: true,
    booking,
  });
});

export default router;