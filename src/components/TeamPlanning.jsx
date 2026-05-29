import { useMemo, useState } from "react";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function TeamPlanning({
  employees = [],
  planning = [],
  setPlanning,
  currentUser,
  styles,
  COLORS,
  showNotification,
}) {
  const [form, setForm] = useState({
    employeeId: "",
    day: "Lundi",
    start: "09:00",
    end: "17:00",
    role: "",
    note: "",
  });

  const businessPlanning = useMemo(() => {
    return planning.filter(
      (item) => item.businessId === currentUser.businessId
    );
  }, [planning, currentUser.businessId]);

  function addSlot() {
    if (!form.employeeId || !form.start || !form.end) {
      showNotification("Employé, heure début et fin obligatoires");
      return;
    }

    const employee = employees.find((e) => e.id === form.employeeId);

    const slot = {
      id: `PLAN-${Date.now()}`,
      businessId: currentUser.businessId,
      employeeId: form.employeeId,
      employeeName: employee?.name || "Employé",
      day: form.day,
      start: form.start,
      end: form.end,
      role: form.role,
      note: form.note,
      createdAt: new Date().toISOString(),
    };

    setPlanning((prev) => [slot, ...prev]);

    setForm({
      employeeId: "",
      day: "Lundi",
      start: "09:00",
      end: "17:00",
      role: "",
      note: "",
    });

    showNotification("Créneau ajouté au planning");
  }

  function deleteSlot(slotId) {
    setPlanning((prev) => prev.filter((item) => item.id !== slotId));
    showNotification("Créneau supprimé");
  }

  function getHours(slot) {
    const start = new Date(`2026-01-01T${slot.start}:00`);
    const end = new Date(`2026-01-01T${slot.end}:00`);
    const diff = (end - start) / 3600000;
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }

  const totalHours = businessPlanning.reduce(
    (sum, slot) => sum + getHours(slot),
    0
  );

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Planning employés</h3>

      <div style={styles.grid3}>
        <select
          style={styles.input}
          value={form.employeeId}
          onChange={(e) =>
            setForm({ ...form, employeeId: e.target.value })
          }
        >
          <option value="">Choisir un employé</option>
          {employees
            .filter((e) => e.businessId === currentUser.businessId)
            .map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
        </select>

        <select
          style={styles.input}
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
        >
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="Poste / rôle"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
      </div>

      <div style={styles.grid3}>
        <input
          style={styles.input}
          type="time"
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
        />

        <input
          style={styles.input}
          type="time"
          value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </div>

      <button style={styles.buttonFull} onClick={addSlot}>
        Ajouter au planning
      </button>

      <div style={{ marginTop: 20 }}>
        <div style={{ ...styles.badgeOrange, marginBottom: 14 }}>
          Total prévu : {totalHours.toFixed(1)} h
        </div>

        {DAYS.map((day) => {
          const daySlots = businessPlanning.filter(
            (slot) => slot.day === day
          );

          return (
            <div key={day} style={{ marginBottom: 18 }}>
              <h4 style={{ color: COLORS.goldLight }}>{day}</h4>

              {daySlots.length === 0 ? (
                <p style={styles.muted}>Aucun créneau prévu.</p>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot.id} style={styles.promoCard}>
                    <div style={styles.rowBetween}>
                      <div>
                        <strong>{slot.employeeName}</strong>
                        <div style={styles.muted}>
                          {slot.start} - {slot.end} · {getHours(slot).toFixed(1)} h
                        </div>
                        {slot.role ? (
                          <div style={styles.kpiLine}>{slot.role}</div>
                        ) : null}
                        {slot.note ? (
                          <div style={styles.muted}>{slot.note}</div>
                        ) : null}
                      </div>

                      <button
                        style={styles.buttonDanger}
                        onClick={() => deleteSlot(slot.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}