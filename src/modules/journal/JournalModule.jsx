import React, { useState } from "react";

export default function JournalModule({
  activityLog,
  archiveLog,
  restoreLog,
  purgeOldLogs,
  formatDate,
  styles,
  showNotification,
}) {
  const [viewMode, setViewMode] = useState("active");

  const activeLogs = activityLog.filter((item) => item.archived !== true);
  const archivedLogs = activityLog.filter((item) => item.archived === true);

  const displayedLogs = viewMode === "archived" ? archivedLogs : activeLogs;

  const getLogDate = (item) => {
    return item.date || item.createdAt || item.archivedAt || item.id;
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Journal de contrôle</h3>

      <p style={styles.helper}>
        Cet espace permet de vérifier les actions réalisées dans l’application.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          style={viewMode === "active" ? styles.buttonFull : styles.buttonSecondary}
          onClick={() => setViewMode("active")}
        >
          Actif ({activeLogs.length})
        </button>

        <button
          style={viewMode === "archived" ? styles.buttonFull : styles.buttonSecondary}
          onClick={() => setViewMode("archived")}
        >
          Archives ({archivedLogs.length})
        </button>
      </div>

      {viewMode === "archived" && archivedLogs.length > 0 && (
        <button style={styles.buttonDanger} onClick={purgeOldLogs}>
          Purger les archives de plus de 30 jours
        </button>
      )}

      <div style={styles.tableLike}>
        {displayedLogs.length === 0 ? (
          <p style={styles.muted}>
            {viewMode === "archived"
              ? "Aucune action archivée."
              : "Aucune action active enregistrée."}
          </p>
        ) : (
          displayedLogs.slice(0, 20).map((item) => (
            <div key={item.id} style={styles.promoCard}>
              <div style={styles.rowBetween}>
                <div>
                  <div style={{ fontWeight: 900 }}>{item.actor}</div>
                  <div style={styles.muted}>
                    {formatDate(getLogDate(item))}
                  </div>
                </div>

                <span
                  style={
                    item.role === "admin" ? styles.badgeGreen : styles.badgeBlue
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

              {viewMode === "active" ? (
                <button
                  style={styles.buttonSecondary}
                  onClick={() => archiveLog(item.id)}
                >
                  Archiver
                </button>
              ) : (
                <button
                  style={styles.buttonSecondary}
                  onClick={() => restoreLog(item.id)}
                >
                  Restaurer
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {displayedLogs.length > 20 && (
        <button
          style={styles.buttonSecondary}
          onClick={() => showNotification("Affichage complet bientôt disponible")}
        >
          Voir plus
        </button>
      )}
    </div>
  );
}