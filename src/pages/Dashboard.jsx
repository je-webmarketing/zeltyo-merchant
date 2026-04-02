import { useEffect, useState } from "react";

export default function Dashboard() {
  const [clients, setClients] = useState([]);

  const fetchClients = () => {
    fetch("http://localhost:3001/clients/segments")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch((err) => console.error("Erreur fetch clients:", err));
  };

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 5000);
    return () => clearInterval(interval);
  }, []);

  const count = (segment) =>
    clients.filter((c) => c.segment === segment).length;

  return (
    <div style={{ padding: 20 }}>
      <h1>Zeltyo Dashboard</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <Card title="Nouveaux" value={count("nouveau")} />
        <Card title="Fidèles" value={count("loyal")} />
        <Card title="VIP" value={count("vip")} />
        <Card title="Inactifs" value={count("inactive")} />
      </div>

      <h2>Clients</h2>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Visites</th>
            <th>Points</th>
            <th>Segment</th>
            <th>Dépenses</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.visits}</td>
              <td>{c.points}</td>
              <td>{c.segment}</td>
              <td>{c.totalSpent ?? 0} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
        width: 160,
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 28, margin: 0 }}>{value}</p>
    </div>
  );
}