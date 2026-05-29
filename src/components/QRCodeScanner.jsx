import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRCodeScanner({
  onDetected,
  COLORS,
}) {
  const scannerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError("");

      const scanner = new Html5Qrcode("zeltyo-qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
        fps: 15,
qrbox: 280,
aspectRatio: 1,
disableFlip: false,
        },
        async (decodedText) => {
          try {
            console.log("QR détecté :", decodedText);
            alert(decodedText);

            await stopScanner();

            if (onDetected) {
              onDetected(decodedText);
            }
          } catch (err) {
            console.error(err);
          }
        },
        () => {}
      );

      setStarted(true);
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra");
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.error(err);
    }

    setStarted(false);
  };

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
      <h3
        style={{
          color: COLORS.goldLight,
          marginBottom: 16,
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        Scanner QR fidélité
      </h3>

      {!started ? (
        <button
          onClick={startScanner}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 16,
            background:
              "linear-gradient(135deg,#D97A32,#F2A65A)",
            color: "#111111",
          }}
        >
          Ouvrir le scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
            background: "#1A1A1A",
            color: "#FFFFFF",
            marginBottom: 16,
          }}
        >
          Fermer le scanner
        </button>
      )}

 <div
  id="zeltyo-qr-reader"
  style={{
    width: "100%",
    minHeight: 320,
    borderRadius: 18,
    overflow: "hidden",
    background: "#000000",
  }}
/>

      {error ? (
        <div
          style={{
            marginTop: 14,
            color: "#ff6b6b",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}