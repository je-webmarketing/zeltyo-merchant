import React from "react";

export default function JournalModule({
  activityLog,
  styles,
  showNotification,
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Journal de contrôle</h3>

      <p style={styles.helper}>
        Cet espace permet de vérifier toutes les actions réalisées dans
        l’application.
      </p>

      <div style={styles.tableLike}>
        {activityLog.length === 0 ? (
          <p style={styles.muted}>Aucune action enregistrée.</p>
        ) : (
          activityLog.slice(0, 5).map((item) => (
            <div key={item.id} style={styles.promoCard}>
              <div style={styles.rowBetween}>
                <div>
                  <div style={{ fontWeight: 900 }}>{item.actor}</div>
                  <div style={styles.muted}>
                    {new Date(item.date).toLocaleString()}
                  </div>
                </div>

                <span
                  style={
                    item.role === "admin"
                      ? styles.badgeGreen
                      : styles.badgeBlue
                  }
                >
                  {item.role === "admin" ? "Admin" : "Employé"}
                </span>
              </div>

              <div style={styles.kpiLine}>
                <div>{item.action}</div>
                <div>
                  <strong>{item.detail}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activityLog.length > 5 && (
        <button
          style={styles.buttonSecondary}
          onClick={() =>
            showNotification("Journal complet bientôt disponible")
          }
        >
          Voir tout le journal
        </button>
      )}
    </div>
  );
}