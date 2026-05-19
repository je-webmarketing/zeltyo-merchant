import { useEffect, useMemo, useState } from "react";
import { buildApiUrl } from "../../config/api";

export default function BookingsManager({ selectedBusiness, businessId: businessIdProp }) {
  const [bookings, setBookings] = useState([]);
  const [viewMode, setViewMode] = useState("active"); // active | archived
   const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [responses, setResponses] = useState({});
  const [openProposalId, setOpenProposalId] = useState("");
  const [activeCount, setActiveCount] = useState(0);
const [archivedCount, setArchivedCount] = useState(0);

  const businessId = useMemo(
  () =>
    businessIdProp ||
    selectedBusiness?.id ||
    selectedBusiness?._id ||
    "",
  [businessIdProp, selectedBusiness]
);
console.log("BOOKINGS MANAGER BUSINESS ID =", businessId);

const rawAuth = localStorage.getItem("zeltyo_merchant_auth");
const auth = rawAuth ? JSON.parse(rawAuth) : null;
const token = auth?.token || "";
  
  const loadBookings = async () => {
    try {
      setErrorMessage("");

      if (!businessId) {
        setBookings([]);
        return;
      }

      setLoading(true);

      const [activeResponse, archivedResponse] = await Promise.all([
  fetch(buildApiUrl(`/bookings/by-business/${businessId}`), {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}),
 fetch(buildApiUrl(`/bookings/archived/${businessId}`), {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}),
]);

const activeData = await activeResponse.json();
const archivedData = await archivedResponse.json();

const activeBookings = Array.isArray(activeData.bookings)
  ? activeData.bookings
  : [];

const archivedBookings = Array.isArray(archivedData.bookings)
  ? archivedData.bookings
  : [];

setActiveCount(activeBookings.length);
setArchivedCount(archivedBookings.length);

const list =
  viewMode === "archived"
    ? archivedBookings
    : activeBookings;

      setBookings(
        viewMode === "archived"
          ? list.filter((booking) => booking.archived === true)
          : list.filter((booking) => booking.archived !== true)
      );
    } catch (error) {
      console.error("Erreur chargement réservations :", error);
      setErrorMessage(error.message || "Impossible de charger les réservations.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (bookingId, status, extra = {}) => {
    try {
      if (!bookingId) return;

      setUpdatingId(bookingId);
      setErrorMessage("");

      const response = await fetch(buildApiUrl(`/bookings/${bookingId}/status`), {
        method: "PATCH",
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
  status,
  merchantResponse: extra.message || "",
  proposedDate: extra.date || "",
  proposedTime: extra.time || "",
}),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erreur mise à jour réservation");
      }

      setResponses((prev) => ({
        ...prev,
        [bookingId]: { message: "", date: "", time: "" },
      }));

      await loadBookings();
    } catch (error) {
      console.error("Erreur update réservation :", error);
      setErrorMessage(error.message || "Erreur mise à jour réservation");
    } finally {
      setUpdatingId("");
    }
  };

  const handleProposeSlot = async (bookingId) => {
  await updateBooking(bookingId, "confirmed", responses[bookingId]);

  setOpenProposalId("");
};

  const restoreBooking = async (bookingId) => {
    try {
      if (!bookingId) return;

      setUpdatingId(bookingId);
      setErrorMessage("");

      const response = await fetch(buildApiUrl(`/bookings/${bookingId}/restore`), {
        method: "PATCH",
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erreur restauration réservation");
      }

      await loadBookings();
    } catch (error) {
      console.error("Erreur restauration réservation :", error);
      setErrorMessage(error.message || "Impossible de restaurer cette réservation.");
    } finally {
      setUpdatingId("");
    }
  };

  useEffect(() => {
  loadBookings();

  const interval = setInterval(() => {
    loadBookings();
  }, 30000);

  return () => clearInterval(interval);
}, [businessId, viewMode]);

  return (
    <div style={wrapperStyle()}>
      <div style={headerStyle()}>
        <h3 style={{ color: "#F2D06B", margin: 0 }}>
          Demandes de réservation
        </h3>

        <div style={toggleWrapperStyle()}>
          <button
            onClick={() => setViewMode("active")}
            style={toggleButtonStyle(viewMode === "active")}
          >
          Actives ({activeCount}) 
          </button>
          <button
            onClick={() => setViewMode("archived")}
            style={toggleButtonStyle(viewMode === "archived")}
          >
           Archives ({archivedCount})
          </button>
        </div>
      </div>

      {errorMessage && <div style={errorStyle()}>{errorMessage}</div>}

      {!businessId ? (
        <p style={{ color: "#CFC7B0" }}>Aucun commerce sélectionné TEST ZELTYO.</p>
      ) : loading ? (
        <p style={{ color: "#CFC7B0" }}>Chargement...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "#CFC7B0" }}>
          {viewMode === "archived"
            ? "Aucune réservation archivée."
            : "Aucune réservation active pour le moment."}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {bookings.map((booking) => {
            const bookingId = booking.id || booking._id;
            const isUpdating = updatingId === bookingId;
            const isPending = booking.status === "pending";

            const statusLabel =
              booking.status === "confirmed"
                ? "Confirmée"
                : booking.status === "cancelled"
                ? "Refusée"
                : booking.status === "completed"
                ? "Terminée"
                : "En attente";

            const statusColor =
              booking.status === "confirmed"
                ? "#22c55e"
                : booking.status === "cancelled"
                ? "#ef4444"
                : booking.status === "completed"
                ? "#38bdf8"
                : "#F2A65A";

            const typeLabel =
              booking.type === "pickup"
                ? "À emporter"
                : booking.type === "delivery"
                ? "Livraison"
                : "Réservation sur place";

            return (
              <div key={bookingId} style={cardStyle()}>
                <div style={{ color: "#F7F4EA", fontWeight: 900 }}>
                  {booking.clientName || "Client"}
                </div>

                <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                  {booking.clientPhone || "Téléphone non renseigné"}
                </div>

                <div style={{ color: "#F2D06B", marginTop: 8, fontWeight: 800 }}>
                  {typeLabel}
                </div>

                <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                  {booking.date || "-"} à {booking.time || "-"}
                </div>

                {booking.type === "reservation" && (
                  <div style={{ color: "#CFC7B0", marginTop: 6 }}>
                    {booking.partySize || 1} personne(s) •{" "}
                    {booking.area || "zone non précisée"}
                  </div>
                )}

                {booking.note && (
                  <div style={{ color: "#CFC7B0", marginTop: 8 }}>
                    Note : {booking.note}
                  </div>
                )}

                {isPending && viewMode === "active" ? (
                  <>
                    <textarea
                      placeholder="Réponse au client..."
                      value={responses[bookingId]?.message || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({
                          ...prev,
                          [bookingId]: {
                            ...prev[bookingId],
                            message: e.target.value,
                          },
                        }))
                      }
                      style={textareaStyle()}
                    />

                    <div style={dateGridStyle()}>
                      <input
                        type="date"
                        value={responses[bookingId]?.date || ""}
                        onChange={(e) =>
                          setResponses((prev) => ({
                            ...prev,
                            [bookingId]: {
                              ...prev[bookingId],
                              date: e.target.value,
                            },
                          }))
                        }
                        style={inputMiniStyle()}
                      />

                      <input
                        type="time"
                        value={responses[bookingId]?.time || ""}
                        onChange={(e) =>
                          setResponses((prev) => ({
                            ...prev,
                            [bookingId]: {
                              ...prev[bookingId],
                              time: e.target.value,
                            },
                          }))
                        }
                        style={inputMiniStyle()}
                      />
                    </div>
                  </>
                ) : null}

               <div
  style={{
    marginTop: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background:
      booking.status === "confirmed"
        ? "rgba(34,197,94,0.15)"
        : booking.status === "cancelled"
        ? "rgba(239,68,68,0.15)"
        : booking.status === "completed"
        ? "rgba(56,189,248,0.15)"
        : "rgba(242,166,90,0.15)",
    color: statusColor,
    border: `1px solid ${statusColor}30`,
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 800,
    width: "fit-content",
  }}
>
  <span
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: statusColor,
    }}
  />
  {statusLabel}
</div>

                {booking.merchantResponse && (
                  <div style={{ color: "#CFC7B0", marginTop: 8 }}>
                    Réponse envoyée :{" "}
                    <strong style={{ color: "#F7F4EA" }}>
                      {booking.merchantResponse}
                    </strong>
                  </div>
                )}

                {booking.proposedDate || booking.proposedTime ? (
                  <div style={{ color: "#CFC7B0", marginTop: 8 }}>
                    Créneau proposé :{" "}
                    <strong style={{ color: "#F7F4EA" }}>
                      {booking.proposedDate || "-"}{" "}
                      {booking.proposedTime ? `à ${booking.proposedTime}` : ""}
                    </strong>
                  </div>
                ) : null}

                {viewMode === "archived" ? (
                  <div
  style={{
    display: "flex",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
                    <button
                      disabled={isUpdating}
                      onClick={() => restoreBooking(bookingId)}
                      style={buttonStyle(isUpdating)}
                    >
                      {isUpdating ? "Restauration..." : "Restaurer"}
                    </button>
                  </div>
                ) : isPending ? (
  <div
    style={{
      display: "flex",
      gap: 10,
      marginTop: 12,
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        updateBooking(bookingId, "confirmed", responses[bookingId])
                      }
                      style={buttonStyle(isUpdating)}
                    >
                      {isUpdating ? "Mise à jour..." : "Accepter"}
                    </button>

                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        updateBooking(bookingId, "cancelled", responses[bookingId])
                      }
                      style={buttonStyleDark(isUpdating)}
                    >
                      Refuser
                    </button>

<div
  style={{
    width: "100%",
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid #2A2A2A",
  }}
>
  {openProposalId === bookingId ? (
    <>
      <button
        disabled={isUpdating}
        onClick={() => handleProposeSlot(bookingId)}
        style={buttonStyle(isUpdating)}
      >
        📅 Envoyer la proposition
      </button>

      <button
        type="button"
        onClick={() => setOpenProposalId("")}
        style={buttonStyleDark(false)}
      >
        Annuler
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => setOpenProposalId(bookingId)}
      style={buttonStyleDark(false)}
    >
      📅 Proposer un autre créneau
    </button>
  )}
</div>
                  </div>
                ) : booking.status === "confirmed" ? (
  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
    <button
      disabled={isUpdating}
      onClick={() => updateBooking(bookingId, "completed")}
      style={buttonStyleDark(isUpdating)}
    >
      {isUpdating ? "Mise à jour..." : "Terminer"}
    </button>
  </div>
) : (
  <div style={{ color: "#CFC7B0", marginTop: 12, fontWeight: 700 }}>
    Réponse déjà envoyée au client.
  </div>
)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function wrapperStyle() {
  return {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  };
}

function headerStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  };
}

function toggleWrapperStyle() {
  return {
    display: "flex",
    gap: 8,
    background: "#0d0d0d",
    padding: 4,
    borderRadius: 14,
    border: "1px solid #2A2A2A",
  };
}

function toggleButtonStyle(active) {
  return {
    background: active ? "#F2D06B" : "transparent",
    color: active ? "#111111" : "#CFC7B0",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  };
}

function cardStyle() {
  return {
    border: "1px solid #2A2A2A",
    borderRadius: 16,
    padding: 14,
    background: "#161616",
    transition: "all 0.2s ease",
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    cursor: "default",
  };
}

function errorStyle() {
  return {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fca5a5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontWeight: 700,
  };
}

function textareaStyle() {
  return {
    width: "100%",
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    background: "#0d0d0d",
    border: "1px solid #2A2A2A",
    color: "#F7F4EA",
    resize: "vertical",
    minHeight: 80,
    boxSizing: "border-box",
  };
}

function dateGridStyle() {
  return {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  };
}

function buttonStyle(disabled = false) {
  return {
    background: disabled ? "#333" : "linear-gradient(135deg, #D97A32, #F2A65A)",
    color: disabled ? "#999" : "#111111",
    border: "none",
    padding: "10px 18px",
    minHeight: 44,
    width: "auto",
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  };
}

function buttonStyleDark(disabled = false) {
  return {
    background: "#1A1A1A",
    color: disabled ? "#777" : "#F7F4EA",
    border: "1px solid #2A2A2A",
    padding: "10px 18px",
    minHeight: 44,
    width: "auto",
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  };
}

function inputMiniStyle() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2A2A2A",
    boxSizing: "border-box",
    fontSize: 14,
    outline: "none",
    background: "#0d0d0d",
    color: "#F7F4EA",
  };
}