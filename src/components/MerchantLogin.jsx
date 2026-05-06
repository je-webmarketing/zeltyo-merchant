import { useState } from "react";
import { buildApiUrl } from "../../config/api";
import { saveAuthSession } from "../config/auth";

export default function MerchantLogin() {
  const [email, setEmail] = useState("admin@barberclub.ch");
  const [password, setPassword] = useState("Zeltyo123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(buildApiUrl("/auth/merchant-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Connexion impossible");
      }

      saveAuthSession(data.token, data.user);
      window.location.reload();
    } catch (error) {
      setError(error.message || "Erreur connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", color: "#fff" }}>
      <h1>Connexion commerçant</h1>

      <form onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle()}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          type="password"
          style={inputStyle()}
        />

        {error && <p style={{ color: "#fca5a5" }}>{error}</p>}

        <button disabled={loading} style={buttonStyle()}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
  };
}

function buttonStyle() {
  return {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#D97A32,#F2A65A)",
    fontWeight: 900,
    cursor: "pointer",
  };
}