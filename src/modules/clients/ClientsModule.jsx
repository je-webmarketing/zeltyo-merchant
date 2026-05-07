import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ClientsModule({
  filteredCustomers,
  search,
  setSearch,
  styles,
  COLORS,
  generateMessage,
  useReward,
  openWhatsApp,
  addLog,
  showNotification,

  newCustomer,
  setNewCustomer,
  addCustomer,
  scanId,
  setScanId,
  customers,
  rewardVisit,
  topCustomers,
  clientsToRelance,
  inactiveClients,
  rewardGoal,
}) {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Ajouter un client</h3>

          <input
            style={styles.input}
            placeholder="Nom du client"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="Téléphone"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />

          <button style={styles.buttonFull} onClick={addCustomer}>
            Créer une carte fidélité
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Valider une visite</h3>

          <select
            style={styles.input}
            value={scanId}
            onChange={(e) => setScanId(e.target.value)}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} — {customer.loyaltyId || customer.id}
              </option>
            ))}
          </select>

          <button style={styles.buttonFull} onClick={rewardVisit}>
            Ajouter 1 point après validation
          </button>

          <p style={styles.helper}>
            Chaque validation remonte dans le journal de contrôle.
          </p>
        </div>
      </div>

      <div style={styles.grid3}>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Top clients fidélité</h3>

          {topCustomers.length === 0 ? (
            <p style={styles.muted}>Aucun client fidèle pour le moment.</p>
          ) : (
            topCustomers.map((customer) => (
              <div key={customer.id} style={styles.promoCard}>
                <div style={styles.rowBetween}>
                  <strong>{customer.name}</strong>
                  <span style={styles.badgeGreen}>{customer.tier}</span>
                </div>

                <div style={styles.kpiLine}>
                  Points : <strong>{customer.points}</strong>
                  <br />
                  Visites : <strong>{customer.visits}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Clients à relancer</h3>

          {clientsToRelance.length === 0 ? (
            <p style={styles.muted}>Aucun client à relancer.</p>
          ) : (
            clientsToRelance.map((customer) => (
              <div key={customer.id} style={styles.promoCard}>
                <div style={styles.rowBetween}>
                  <strong>{customer.name}</strong>
                  <span style={styles.badgeOrange}>
                    {rewardGoal - (customer.points % rewardGoal || rewardGoal)} point(s)
                  </span>
                </div>

                <button
                  style={styles.buttonWhatsapp}
                  onClick={() => openWhatsApp(customer)}
                >
                  Relancer via WhatsApp
                </button>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Clients inactifs</h3>

          {inactiveClients.length === 0 ? (
            <p style={styles.muted}>Aucun client inactif.</p>
          ) : (
            inactiveClients.map((customer) => (
              <div key={customer.id} style={styles.promoCard}>
                <div style={styles.rowBetween}>
                  <strong>{customer.name}</strong>
                  <span style={styles.badge}>Inactif</span>
                </div>

                <button
                  style={styles.buttonWhatsapp}
                  onClick={() => openWhatsApp(customer)}
                >
                  Relancer client inactif
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Base clients</h3>

        <div style={styles.searchWrap}>
          <input
            style={styles.input}
            placeholder="Rechercher un client par nom, email ou identifiant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={styles.previewBox}>
            <strong>Vue rapide</strong>
            <p style={{ marginBottom: 0 }}>
              Clients affichés : {filteredCustomers.length}
            </p>
          </div>
        </div>

        <div style={styles.customerGrid}>
          {filteredCustomers.length === 0 ? (
            <p style={styles.muted}>Aucun client trouvé.</p>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} style={styles.customerCard}>
                <div style={styles.rowBetween}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{customer.name}</div>
                    <div style={styles.muted}>{customer.id}</div>
                  </div>

                  <span style={styles.badge}>{customer.tier}</span>
                </div>

                <div style={styles.fakeQrWrap}>
                  <QRCodeSVG
                    value={`https://zeltyo-clients.netlify.app/card/${customer.id}`}
                    size={120}
                    bgColor="#FFFFFF"
                    fgColor="#111111"
                    level="H"
                    includeMargin={false}
                  />

                  <button
                    style={styles.buttonSecondary}
                    onClick={() => {
                      const cardLink = `https://zeltyo-clients.netlify.app/card/${customer.id}`;
                      navigator.clipboard.writeText(cardLink);
                      showNotification("Lien de carte fidélité copié");
                    }}
                  >
                    Copier le lien carte fidélité
                  </button>

                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      color: COLORS.textSoft,
                    }}
                  >
                    Carte fidélité digitale
                  </div>
                </div>

                <div style={styles.kpiLine}>
                  <div>
                    Email : <strong>{customer.email || "Non renseigné"}</strong>
                  </div>
                  <div>
                    Téléphone : <strong>{customer.phone || "Non renseigné"}</strong>
                  </div>
                  <div>
                    Points : <strong>{customer.points}</strong>
                  </div>
                  <div>
                    Visites : <strong>{customer.visits}</strong>
                  </div>
                  <div>
                    Récompenses : <strong>{customer.rewardsAvailable}</strong>
                  </div>
                  <div>
                    Dernière visite : <strong>{customer.lastVisit}</strong>
                  </div>
                </div>

                <button
                  style={styles.buttonReward}
                  onClick={() => useReward(customer.id)}
                  disabled={customer.rewardsAvailable <= 0}
                >
                  Utiliser une récompense
                </button>

                <button
                  style={styles.buttonSecondary}
                  onClick={() => {
                    navigator.clipboard.writeText(generateMessage(customer));

                    addLog(
                      "A copié un message client",
                      `${customer.name} (${customer.id})`
                    );

                    showNotification("Message client copié");
                  }}
                >
                  Copier message client
                </button>

                <button
                  style={styles.buttonWhatsapp}
                  onClick={() => openWhatsApp(customer)}
                >
                  Envoyer via WhatsApp
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}