import { useState } from "react";

export default function MenuUploader({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState("menu");

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    handleFile(file);
  }

  function handleFile(file) {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      alert("Seules les images et les PDF sont autorisés");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;

      onUpload({
        id: `CONTENT-${Date.now()}`,
        type: selectedType,
        fileName: file.name,
        mimeType: file.type,
        fileData: base64,
        createdAt: new Date().toISOString(),
      });
    };

    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid #2A2A2A",
          background: "#161616",
          color: "#F7F4EA",
          fontWeight: 700,
        }}
      >
        <option value="menu">Carte / menu</option>
        <option value="services">Services</option>
        <option value="tarifs">Tarifs</option>
        <option value="catalogue">Catalogue</option>
        <option value="photo">Photo</option>
      </select>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("menuFileInput").click()}
        style={{
          border: dragActive ? "2px solid #F2A65A" : "2px dashed #555",
          borderRadius: "16px",
          padding: "30px",
          textAlign: "center",
          cursor: "pointer",
          background: "#111",
          color: "#fff",
        }}
      >
        <input
          id="menuFileInput"
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <div style={{ fontWeight: 800, fontSize: "16px" }}>
          📎 Importer menu, carte, services ou tarifs
        </div>

        <div style={{ fontSize: "13px", marginTop: "6px", color: "#aaa" }}>
          Images ou PDF acceptés
        </div>
      </div>
    </div>
  );
}