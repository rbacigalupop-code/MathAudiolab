import { useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";

export default function SplashScreen({ onReady }) {
  const [estado, setEstado] = useState("idle");
  const [progreso, setProgreso] = useState(0);

  const handleClick = async () => {
    if (estado !== "idle") return;
    setEstado("loading");

    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + 8, 90);
      setProgreso(p);
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgreso(100);
      setTimeout(onReady, 200);
    }, 15000);

    try {
      await Tone.start();
      clearTimeout(timeout);
      clearInterval(interval);
      setProgreso(100);
      setTimeout(onReady, 250);
    } catch (e) {
      console.error("Tone init error:", e);
      clearTimeout(timeout);
      clearInterval(interval);
      setProgreso(100);
      setTimeout(onReady, 250);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: "clamp(48px, 12vw, 64px)", marginBottom: 12 }}>🎸</div>
          <h1 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 900, color: "#f97316", margin: "0 0 6px", letterSpacing: 1 }}>
            MathAudio Lab
          </h1>
          <p style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#94a3b8", margin: "0 0 32px" }}>
            Multiplicaciones con bajo eléctrico
          </p>
        </motion.div>

        <motion.button
          whileTap={{ scale: estado === "idle" ? 0.95 : 1 }}
          onClick={handleClick}
          disabled={estado !== "idle"}
          style={{
            width: "100%",
            background: estado === "loading" ? "#334155" : "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)",
            fontWeight: 800,
            fontSize: "clamp(14px, 3vw, 18px)",
            cursor: estado === "idle" ? "pointer" : "default",
            transition: "background 0.3s",
            minHeight: 48,
          }}
        >
          {estado === "idle" && "🎸 Encender amplificadores"}
          {estado === "loading" && `⚡ Conectando cables… ${Math.round(progreso)}%`}
        </motion.button>

        <p style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "#475569", marginTop: 20, lineHeight: 1.6 }}>
          Toca el botón una vez para cargar los sonidos del bajo.
          <br />
          Esto puede tomar unos segundos según tu conexión.
        </p>
      </div>
    </div>
  );
}
