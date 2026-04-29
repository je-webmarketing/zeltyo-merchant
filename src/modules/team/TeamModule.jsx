import React from "react";
import JournalModule from "../journal/JournalModule";

export default function TeamModule({
  currentUser,
  newEmployee,
  setNewEmployee,
  addEmployee,
  employees,
  isWorking,
  startShift,
  endShift,
  getTodayShifts,
  totalByEmployee,
  activityLog,
  styles,
  COLORS,
  showNotification,
}) {
  return (
    <div style={styles.grid2}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Équipe</h3>

        <div style={{ marginBottom: "18px" }}>
          <span
            style={
              currentUser.role === "admin"
                ? styles.badgeGreen
                : styles.badgeOrange
            }
          >
            {currentUser.role === "admin"
              ? "Vous pouvez ajouter un employé ou un administrateur"
              : "Mode employé : consultation uniquement"}
          </span>
        </div>

        <input
          style={styles.input}
          placeholder="Nom du membre"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          disabled={currentUser.role !== "admin"}
        />

        <input
          style={styles.input}
          placeholder="Email du membre"
          value={newEmployee.email}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, email: e.target.value })
          }
          disabled={currentUser.role !== "admin"}
        />

        <input
          style={styles.input}
          type="number"
          placeholder="Coût horaire (ex: 25)"
          value={newEmployee.hourlyCost}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, hourlyCost: e.target.value })
          }
          disabled={currentUser.role !== "admin"}
        />

        <select
          style={styles.input}
          value={newEmployee.role}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, role: e.target.value })
          }
          disabled={currentUser.role !== "admin"}
        >
          <option value="employee">Employé</option>
          <option value="admin">Administrateur</option>
        </select>

        <button style={styles.buttonFull} onClick={addEmployee}>
          Ajouter un employé ou un administrateur
        </button>

        <div style={{ ...styles.tableLike, marginTop: "20px" }}>
          {employees.length === 0 ? (
            <p style={styles.muted}>Aucun membre enregistré pour le moment.</p>
          ) : (
            employees.map((employee) => {
              const working = isWorking(employee.id);

              return (
                <div key={employee.id} style={styles.promoCard}>
                  <div style={styles.rowBetween}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{employee.name}</div>
                      <div style={styles.muted}>
                        {employee.id} • {employee.email}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={
                          employee.role === "admin"
                            ? styles.badgeGreen
                            : styles.badgeBlue
                        }
                      >
                        {employee.role === "admin" ? "Administrateur" : "Employé"}
                      </span>

                      <span style={working ? styles.badgeGreen : styles.badgeOrange}>
                        {working ? "En service" : "Hors service"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.kpiLine}>
                    Dernière action connue :{" "}
                    <strong>{employee.lastAction || "Aucune"}</strong>
                  </div>

                  <div style={styles.kpiLine}>
                    Coût horaire : <strong>{employee.hourlyCost || 0} €</strong>
                  </div>

                  {working ? (
                    <button
                      style={styles.buttonDanger}
                      onClick={() => endShift(employee.id)}
                    >
                      🔴 Terminer le service
                    </button>
                  ) : (
                    <button
                      style={styles.buttonFull}
                      onClick={() => startShift(employee.id)}
                    >
                      🟢 Prendre le service
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Pointages du jour</h3>

        <div
          style={{
            marginBottom: "14px",
            padding: "12px",
            borderRadius: "14px",
            background: COLORS.surfaceSoft,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.goldLight,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          ⏱ Temps total aujourd’hui :{" "}
          {(() => {
            const totalMs = getTodayShifts().reduce((total, shift) => {
              if (!shift.end) return total;
              return total + (new Date(shift.end) - new Date(shift.start));
            }, 0);

            const totalMin = Math.floor(totalMs / 60000);
            const totalSec = Math.floor((totalMs % 60000) / 1000);

            return totalMin === 0
              ? `${totalSec} sec`
              : `${totalMin} min ${totalSec} sec`;
          })()}
        </div>

        <div style={styles.tableLike}>
          {getTodayShifts().length === 0 ? (
            <p style={styles.muted}>Aucun pointage aujourd’hui.</p>
          ) : (
            getTodayShifts().map((shift) => {
              const employee = employees.find((e) => e.id === shift.employeeId);

              const durationMs = shift.end
                ? new Date(shift.end) - new Date(shift.start)
                : 0;

              const hours = durationMs / 3600000;
              const cost = hours * (employee?.hourlyCost || 0);

              const totalMs = totalByEmployee[shift.employeeId] || 0;
              const totalEmployeeMin = Math.floor(totalMs / 60000);
              const totalEmployeeSec = Math.floor((totalMs % 60000) / 1000);

              const totalLabel =
                totalEmployeeMin === 0
                  ? `${totalEmployeeSec} sec`
                  : `${totalEmployeeMin} min ${totalEmployeeSec} sec`;

              return (
                <div key={shift.id} style={styles.promoCard}>
                  <div style={styles.rowBetween}>
                    <strong>{employee?.name || "Employé inconnu"}</strong>
                    <span style={shift.end ? styles.badge : styles.badgeGreen}>
                      {shift.end ? "Terminé" : "En service"}
                    </span>
                  </div>

                  <div style={styles.kpiLine}>
                    Début :{" "}
                    <strong>{new Date(shift.start).toLocaleTimeString()}</strong>
                    {" — "}
                    Fin :{" "}
                    <strong>
                      {shift.end
                        ? new Date(shift.end).toLocaleTimeString()
                        : "En cours"}
                    </strong>
                  </div>

                  <div style={styles.kpiLine}>
                    Coût du temps travaillé :{" "}
                    <strong>{cost.toFixed(2)} €</strong>
                  </div>

                  <div style={styles.kpiLine}>
                    Total employé aujourd’hui : <strong>{totalLabel}</strong>
                  </div>

                  <div style={styles.kpiLine}>
                    Durée :{" "}
                    <strong>
                      {shift.end
                        ? (() => {
                            const diffMs =
                              new Date(shift.end) - new Date(shift.start);
                            const diffMin = Math.floor(diffMs / 60000);
                            const diffSec = Math.floor((diffMs % 60000) / 1000);

                            return diffMin === 0
                              ? `${diffSec} sec`
                              : `${diffMin} min ${diffSec} sec`;
                          })()
                        : "En cours"}
                    </strong>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <JournalModule
        activityLog={activityLog}
        styles={styles}
        showNotification={showNotification}
      />
    </div>
  );
}