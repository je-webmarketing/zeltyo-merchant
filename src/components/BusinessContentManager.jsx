import MenuUploader from "./MenuUploader";

export default function BusinessContentManager({
  contents = [],
  onUpload,
  onDelete,
  COLORS,
}) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <MenuUploader onUpload={onUpload} />

      <div style={{ display: "grid", gap: 14 }}>
        {contents.length === 0 ? (
          <p style={{ color: COLORS.textSoft }}>
            Aucun menu, service ou tarif importé.
          </p>
        ) : (
          contents.map((item) => (
            <div
              key={item.id}
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 18,
                padding: 14,
                background: "#111",
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
  <div style={{ fontWeight: 900, color: COLORS.goldLight }}>
    {item.type} · {item.fileName}
  </div>

  <input
    placeholder="Nom du produit ou service"
    value={item.title || ""}
    onChange={(e) =>
      item.onUpdate?.(item.id, {
        ...item,
        title: e.target.value,
      })
    }
    style={{
      padding: 10,
      borderRadius: 10,
      border: `1px solid ${COLORS.border}`,
      background: "#181818",
      color: "#fff",
    }}
  />

  <textarea
    placeholder="Description"
    value={item.description || ""}
    onChange={(e) =>
      item.onUpdate?.(item.id, {
        ...item,
        description: e.target.value,
      })
    }
    style={{
      minHeight: 80,
      padding: 10,
      borderRadius: 10,
      border: `1px solid ${COLORS.border}`,
      background: "#181818",
      color: "#fff",
    }}
  />

  <input
    placeholder="Prix"
    value={item.price || ""}
    onChange={(e) =>
      item.onUpdate?.(item.id, {
        ...item,
        price: e.target.value,
      })
    }
    style={{
      padding: 10,
      borderRadius: 10,
      border: `1px solid ${COLORS.border}`,
      background: "#181818",
      color: "#fff",
    }}
  />
</div>

              {item.mimeType?.startsWith("image/") ? (
                <img
                  src={item.fileData}
                  alt={item.fileName}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    borderRadius: 14,
                    maxHeight: 420,
                    objectFit: "contain",
                    background: "#000",
                  }}
                />
              ) : (
                <a
                  href={item.fileData}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    color: COLORS.goldLight,
                    fontWeight: 800,
                  }}
                >
                  Ouvrir le PDF
                </a>
              )}

              <button
                onClick={() => onDelete(item.id)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "none",
                  background: "#C94B32",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}