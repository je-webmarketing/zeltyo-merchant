import React from "react";

export default function PromosModule({
  currentUser,
  promo,
  setPromo,
  addPromotion,
  sendSmart,
  socialPreview,
  promotions,
  activePromotionList,
  pausedPromotionList,
  archivedPromotionList,
  togglePromotionStatus,
  archivePromotion,
  styles,
}) {

  function copyText(text, label = "Message copié") {
  navigator.clipboard.writeText(text);
  alert(label);
}

function buildChannelMessage(channel) {
  const title = promo.title || "Votre offre fidélité";
  const desc =
    promo.description ||
    "Découvrez notre offre du moment et profitez de votre programme fidélité.";
  const code = promo.code || "PROMO10";
  const cta = promo.ctaUrl ? `\n👉 ${promo.ctaUrl}` : "";

  if (channel === "WhatsApp") {
    return `🎁 ${title}\n\n${desc}\n\nCode : ${code}${cta}`;
  }

  if (channel === "Facebook") {
    return `🎁 ${title}\n\n${desc}\n\nPrésentez votre carte fidélité et utilisez le code : ${code}${cta}`;
  }

  if (channel === "Instagram") {
    return `🎁 ${title}\n\n${desc}\n\nCode : ${code}\n#offre #fidélité #commerceLocal${cta}`;
  }

  if (channel === "Email") {
    return `Bonjour,\n\n${title}\n\n${desc}\n\nCode promotionnel : ${code}${cta}\n\nÀ très bientôt.`;
  }

  return socialPreview;
}

  return (
    <div style={styles.grid2}>
      <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
        <h3 style={styles.cardTitle}>Segmentation intelligente</h3>

        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <button onClick={currentUser.role === "admin" ? () => sendSmart("inactive") : undefined} disabled={currentUser.role !== "admin"} style={styles.buttonGhost}>
            🔁 Inactifs
          </button>

          <button onClick={currentUser.role === "admin" ? () => sendSmart("vip") : undefined} disabled={currentUser.role !== "admin"} style={styles.buttonGhost}>
            💎 VIP
          </button>

          <button onClick={currentUser.role === "admin" ? () => sendSmart("near_reward") : undefined} disabled={currentUser.role !== "admin"} style={styles.buttonGhost}>
            🎁 Presque récompense
          </button>
        </div>

        <p style={styles.helper}>
          Envoyez une promotion ciblée selon le comportement client : clients inactifs, VIP ou proches d’une récompense.
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Gérer les promotions</h3>

        <div style={{ marginBottom: "14px" }}>
          <span style={currentUser.role === "admin" ? styles.badgeGreen : styles.badgeOrange}>
            {currentUser.role === "admin"
              ? "Vous pouvez créer et modifier les promotions"
              : "Mode employé : consultation uniquement"}
          </span>
        </div>

        <input style={styles.input} placeholder="Texte du bouton (ex: Réserver maintenant)" value={promo.ctaLabel} onChange={(e) => setPromo({ ...promo, ctaLabel: e.target.value })} disabled={currentUser.role !== "admin"} />

        <input style={styles.input} placeholder="Lien du bouton (https://...)" value={promo.ctaUrl} onChange={(e) => setPromo({ ...promo, ctaUrl: e.target.value })} disabled={currentUser.role !== "admin"} />

        <input style={styles.input} placeholder="Titre de l'offre" value={promo.title} onChange={(e) => setPromo({ ...promo, title: e.target.value })} disabled={currentUser.role !== "admin"} />

        <input style={styles.input} placeholder="Code promotionnel" value={promo.code} onChange={(e) => setPromo({ ...promo, code: e.target.value })} disabled={currentUser.role !== "admin"} />

        <select style={styles.input} value={promo.channel} onChange={(e) => setPromo({ ...promo, channel: e.target.value })} disabled={currentUser.role !== "admin"}>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>WhatsApp</option>
          <option>Email</option>
          <option>En boutique</option>
        </select>

        <textarea style={styles.textarea} placeholder="Description claire et orientée bénéfice" value={promo.description} onChange={(e) => setPromo({ ...promo, description: e.target.value })} disabled={currentUser.role !== "admin"} />

        <button
  style={styles.buttonFull}
  onClick={addPromotion}
  disabled={!["admin", "merchant_admin"].includes(currentUser.role)}
>
  Publier la promotion
</button>

        <p style={styles.helper}>
          Le commerçant reste autonome pour gérer ses promotions. L’administrateur conserve le contrôle sur la création, la mise en pause et le suivi de chaque offre.
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Aperçu du message</h3>
        <div style={styles.previewBox}>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
  <button
    style={styles.buttonGhost}
    onClick={() => copyText(buildChannelMessage("Instagram"), "Texte Instagram copié")}
  >
    Copier Instagram
  </button>

  <button
    style={styles.buttonGhost}
    onClick={() => copyText(buildChannelMessage("Facebook"), "Texte Facebook copié")}
  >
    Copier Facebook
  </button>

  <button
    style={styles.buttonGhost}
    onClick={() => copyText(buildChannelMessage("WhatsApp"), "Texte WhatsApp copié")}
  >
    Copier WhatsApp
  </button>

  <button
    style={styles.buttonGhost}
    onClick={() => copyText(buildChannelMessage("Email"), "Email copié")}
  >
    Copier Email
  </button>
</div>

          <div style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
            {socialPreview}
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
        <h3 style={styles.cardTitle}>Historique des promotions</h3>

        {activePromotionList.length > 0 && (
          <>
            <h4 style={{ ...styles.sectionTitle, fontSize: "18px" }}>Promotions actives</h4>
            {activePromotionList.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                statusStyle={styles.badgeGreen}
                actionLabel="Mettre en pause"
                styles={styles}
                onToggle={() => togglePromotionStatus(promotion.id)}
                onArchive={() => archivePromotion(promotion.id)}
              />
            ))}
          </>
        )}

        {pausedPromotionList.length > 0 && (
          <>
            <h4 style={{ ...styles.sectionTitle, fontSize: "18px", marginTop: "18px" }}>Promotions en pause</h4>
            {pausedPromotionList.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                statusStyle={styles.badgeOrange}
                actionLabel="Réactiver"
                styles={styles}
                onToggle={() => togglePromotionStatus(promotion.id)}
                onArchive={() => archivePromotion(promotion.id)}
              />
            ))}
          </>
        )}

        {archivedPromotionList.length > 0 && (
          <>
            <h4 style={{ ...styles.sectionTitle, fontSize: "18px", marginTop: "18px" }}>Promotions archivées</h4>
            {archivedPromotionList.map((promotion) => (
              <div key={promotion.id} style={styles.promoCard}>
                <div style={styles.rowBetween}>
                  <div>
                    <div style={styles.promoTitle}>{promotion.title}</div>
                    <div style={styles.muted}>Canal : {promotion.channel} • Code : {promotion.code}</div>
                    <div style={styles.muted}>Créée par : {promotion.createdBy} • {promotion.createdAt}</div>
                    {promotion.archivedAt && <div style={styles.muted}>Archivée le : {promotion.archivedAt}</div>}
                  </div>
                  <span style={styles.badge}>Archivée</span>
                </div>

                <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
                  {promotion.description}
                </p>
              </div>
            ))}
          </>
        )}

        {promotions.length === 0 && (
          <p style={styles.muted}>Aucune promotion enregistrée pour le moment.</p>
        )}
      </div>
    </div>
  );
}

function PromotionCard({
  promotion,
  statusStyle,
  actionLabel,
  styles,
  onToggle,
  onArchive,
}) {
  return (
    <div style={styles.promoCard}>
      <div style={styles.rowBetween}>
        <div>
          <div style={styles.promoTitle}>{promotion.title}</div>
          <div style={styles.muted}>Canal : {promotion.channel} • Code : {promotion.code}</div>
          <div style={styles.muted}>Créée par : {promotion.createdBy} • {promotion.createdAt}</div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span style={statusStyle}>{promotion.status}</span>

          <button style={{ ...styles.buttonGhost, padding: "8px 12px" }} onClick={onToggle}>
            {actionLabel}
          </button>

          <button style={{ ...styles.buttonGhost, padding: "8px 12px" }} onClick={onArchive}>
            Archiver
          </button>
        </div>
      </div>

      <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
        {promotion.description}
      </p>

      {promotion.ctaUrl && (
        <button
          style={styles.buttonSecondary}
          onClick={() => window.open(promotion.ctaUrl, "_blank")}
        >
          {promotion.ctaLabel || "Voir l'offre"}
        </button>
      )}
    </div>
  );
}