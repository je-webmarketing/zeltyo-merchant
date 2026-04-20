import { useEffect, useState } from "react";
import { buildApiUrl } from "../config/api";

export default function BookingsManager({ selectedBusiness }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    try {
      if (!selectedBusiness?.id) return;

      setLoading(true);

      const response = await fetch(
        buildApiUrl(`/bookings/by-business/${selectedBusiness.id}`)
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erreur chargement réservations");
      }

      setBookings(data.bookings || []);
    console.log("bookings chargées =", data.bookings);  
    } catch (error) {
      console.error("Erreur chargement réservations :", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (bookingId, status) => {
    try {
      const response = await fetch(
        buildApiUrl(`/bookings/${bookingId}/status`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erreur mise à jour réservation");
      }

      await loadBookings();
    } catch (error) {
      console.error("Erreur update réservation :", error);
      alert(error.message || "Erreur mise à jour réservation");
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedBusiness?.id]);

  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #2A2A2A",
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
      }}
    >
      <h3 style={{ color: "#F2D06B", marginTop: 0 }}>
        Demandes de réservation
      </h3>

      {loading ? (
        <p style={{ color: "#CFC7B0" }}>Chargement...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "#CFC7B0" }}>Aucune réservation pour le moment.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                border: "1px solid #2A2A2A",
                borderRadius: 16,
                padding: 14,
                background: "#161616",
              }}
            >
              <div style={{ color: "#F7F4EA", fontWeight: 800 }}>
                {booking.clientName}
              </div>

              <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                {booking.clientPhone}
              </div>

              <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                {booking.date} à {booking.time}
              </div>

              <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                {booking.partySize} personne(s) • {booking.area}
              </div>

              {booking.note ? (
                <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                  Note : {booking.note}
                </div>
              ) : null}

              <div style={{ color: "#F2A65A", marginTop: 8, fontWeight: 700 }}>
                Statut : {booking.status}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button
                  onClick={() => updateBooking(booking.id, "accepted")}
                  style={buttonStyle()}
                >
                  Accepter
                </button>

                <button
                  onClick={() => updateBooking(booking.id, "rejected")}
                  style={buttonStyleDark()}
                >
                  Refuser
                </button>

                <button
                  onClick={() => updateBooking(booking.id, "completed")}
                  style={buttonStyleDark()}
                >
                  Terminé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buttonStyle() {
  return {
    background: "linear-gradient(135deg, #D97A32, #F2A65A)",
    color: "#111111",
    border: "none",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  };
}

function buttonStyleDark() {
  return {
    background: "#1A1A1A",
    color: "#F7F4EA",
    border: "1px solid #2A2A2A",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  };
}