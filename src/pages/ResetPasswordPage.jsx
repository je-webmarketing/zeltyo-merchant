import { useState } from "react";
import { buildApiUrl } from "../config/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  async function handleResetPassword() {
    try {
      if (!token) {
        setMessage("Token manquant");
        return;
      }

      if (!password || password.length < 8) {
        setMessage("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }

      if (password !== confirmPassword) {
        setMessage("Les mots de passe ne correspondent pas");
        return;
      }

      const response = await fetch(buildApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setMessage(data.error || "Erreur réinitialisation");
        return;
      }

      setMessage("Mot de passe modifié avec succès ✅");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Erreur serveur");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050505, #111111)",
        color: "#F7F4EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111111",
          border: "1px solid #2A2A2A",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ color: "#F2D06B", marginTop: 0 }}>
          Réinitialiser le mot de passe
        </h1>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleResetPassword} style={buttonStyle}>
          Modifier le mot de passe
        </button>

        {message && (
          <div
            style={{
              marginTop: "16px",
              color: "#CFC7B0",
              lineHeight: 1.6,
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #2A2A2A",
  marginBottom: "12px",
  boxSizing: "border-box",
  background: "#ffffff",
  color: "#111111",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  border: "none",
  background: "linear-gradient(135deg, #D97A32, #F2A65A)",
  color: "#111111",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: 900,
  cursor: "pointer",
};