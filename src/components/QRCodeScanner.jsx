import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QRCodeScanner({ onDetected, COLORS, customers = [] }) {
  const scannerRef = useRef(null);
  const isReadingRef = useRef(false);
  const readerId = "zeltyo-qr-reader";

  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState?.();
        if (state === 2) await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.error("Erreur arrêt scanner :", err);
    }

    isReadingRef.current = false;
    setStarted(false);
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    try {
      setError("");
      isReadingRef.current = false;
      await stopScanner();

      const scanner = new Html5Qrcode(readerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        async (decodedText) => {
          if (isReadingRef.current) return;
          isReadingRef.current = true;

          console.log("QR détecté =", decodedText);

          await stopScanner();

          if (onDetected && decodedText) {
            onDetected(decodedText);
          }
        },
        () => {}
      );

      setStarted(true);
    } catch (err) {
      console.error("Erreur scanner QR :", err);
      setError("Impossible d'accéder à la caméra.");
      await stopScanner();
    }
  }

  return (
    <div
      style={{
        background: "#111111",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <h3 style={{ color: COLORS.goldLight, marginBottom: 16, fontSize: 22, fontWeight: 900 }}>
        Scanner QR fidélité
      </h3>

      <select
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          marginTop: 14,
          background: "#111",
          color: "#fff",
          border: `1px solid ${COLORS.border}`,
          fontWeight: 700,
        }}
      >
        <option value="">Sélectionner un client</option>
        {[...customers]
  .sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "fr", {
      sensitivity: "base",
    })
  )
  .map((customer) => (
          <option
            key={customer.id || customer.loyaltyId}
            value={customer.loyaltyId || customer.id}
          >
            {customer.name || "Client"} — {customer.loyaltyId || customer.id}
          </option>
        ))}
      </select>

      <select
  value={manualCode}
  onChange={(e) => setManualCode(e.target.value)}
  style={{
    width: "100%",
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  }}
>
  <option value="">
    Sélectionner un client...
  </option>

  {customers.map((customer) => (
    <option
      key={customer.id}
      value={customer.id}
    >
      {customer.name} ({customer.points || 0} pts)
    </option>
  ))}
</select>

      <button
        type="button"
        onClick={() => {
          if (!manualCode.trim()) return;
          onDetected(manualCode.trim());
        }}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 14,
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg,#D97A32,#F2A65A)",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Valider ce client
      </button>

      {!started ? (
        <button
          type="button"
          onClick={startScanner}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "14px 18px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 16,
            background: "linear-gradient(135deg,#D97A32,#F2A65A)",
            color: "#111111",
          }}
        >
          Ouvrir le scanner
        </button>
      ) : (
        <button
          type="button"
          onClick={stopScanner}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "14px 18px",
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
            background: "#1A1A1A",
            color: "#FFFFFF",
          }}
        >
          Fermer le scanner
        </button>
      )}

      <div
        id={readerId}
        style={{
          width: "100%",
          minHeight: 320,
          borderRadius: 18,
          overflow: "hidden",
          background: "#000000",
          marginTop: 16,
        }}
      />

      {error && (
        <div style={{ marginTop: 14, color: "#ff6b6b", fontWeight: 700 }}>
          {error}
        </div>
      )}
    </div>
  );
}