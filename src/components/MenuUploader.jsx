import { useState } from "react";

export default function MenuUploader({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    handleFile(file);
  }

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Seules les images sont autorisées");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;
      onUpload(base64);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput").click()}
      style={{
        border: dragActive ? "2px solid #F2A65A" : "2px dashed #555",
        borderRadius: "12px",
        padding: "30px",
        textAlign: "center",
        cursor: "pointer",
        background: "#111",
        color: "#fff",
      }}
    >
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div style={{ fontWeight: 700 }}>
        📸 Glissez votre carte menu ici
      </div>

      <div style={{ fontSize: "13px", marginTop: "6px", color: "#aaa" }}>
        ou cliquez pour importer
      </div>
    </div>
  );
}