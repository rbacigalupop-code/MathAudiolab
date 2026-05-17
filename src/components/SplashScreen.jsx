import { useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { ProfileSelector } from "./ProfileSelector";

export default function SplashScreen({ onReady }) {
  const [estado, setEstado] = useState("idle");
  const [progreso, setProgreso] = useState(0);

  // Verify deployment timestamp
  if (typeof window !== "undefined") {
    console.log("🎸 MathAudioLab loaded successfully - Build:", __BUILD_TIME__);
  }

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
      setTimeout(() => setEstado("selecting_profile"), 200);
    }, 15000);

    try {
      await Tone.start();
      clearTimeout(timeout);
      clearInterval(interval);
      setProgreso(100);
      setTimeout(() => setEstado("selecting_profile"), 250);
    } catch (e) {
      console.error("Tone init error:", e);
      clearTimeout(timeout);
      clearInterval(interval);
      setProgreso(100);
      setTimeout(() => setEstado("selecting_profile"), 250);
    }
  };

  const handleProfileSelect = (profileId) => {
    setTimeout(onReady, 300);
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
          <div style={{ fontSize: "clamp(48px, 12vw, 64px)", marginBottom: 12 }}>🎹</div>
          <h1 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 900, color: "#f97316", margin: "0 0 6px", letterSpacing: 1 }}>
            MathAudio Lab
          </h1>
          <p style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#94a3b8", margin: "0 0 24px" }}>
            Aprende matemáticas con música 🎵
          </p>
        </motion.div>

        {estado !== "selecting_profile" && (
          <>
            {/* Music-Math Connection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                background: "rgba(249, 115, 22, 0.08)",
                border: "1px solid rgba(249, 115, 22, 0.25)",
                borderRadius: 14,
                padding: "clamp(14px, 3vw, 18px)",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(12px, 2.8vw, 14px)",
                  color: "#f97316",
                  fontWeight: 800,
                  margin: "0 0 12px",
                  textAlign: "center",
                  letterSpacing: 0.3,
                }}
              >
                ✨ La música ES matemática
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: "clamp(10px, 2.2vw, 12px)",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                <div>
                  🎹 <strong style={{ color: "#fbbf24" }}>Octavas</strong> = multiplicar ×2
                  <span style={{ color: "#64748b", fontSize: "0.9em" }}>
                    {" "}(Do₄ 262Hz → Do₅ 524Hz)
                  </span>
                </div>
                <div>
                  🥁 <strong style={{ color: "#fbbf24" }}>Ritmos</strong> = fracciones
                  <span style={{ color: "#64748b", fontSize: "0.9em" }}>
                    {" "}(♩ = 1/4 · ♪ = 1/8 · 𝅘𝅥𝅮 = 1/16)
                  </span>
                </div>
                <div>
                  🎼 <strong style={{ color: "#fbbf24" }}>Acordes</strong> = sumas de notas que vibran juntas
                </div>
                <div>
                  🔢 <strong style={{ color: "#fbbf24" }}>Escalas</strong> = 7 notas + octava
                  <span style={{ color: "#64748b", fontSize: "0.9em" }}>
                    {" "}(Do Re Mi Fa Sol La Si)
                  </span>
                </div>
              </div>
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
              {estado === "idle" && "🎵 Empezar a tocar"}
              {estado === "loading" && `🎶 Afinando instrumentos… ${Math.round(progreso)}%`}
            </motion.button>

            <p style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "#475569", marginTop: 20, lineHeight: 1.6 }}>
              Toca el botón una vez para cargar los sonidos.
              <br />
              Esto puede tomar unos segundos según tu conexión.
            </p>
          </>
        )}

        {estado === "selecting_profile" && (
          <ProfileSelector onSelect={handleProfileSelect} />
        )}
      </div>
    </div>
  );
}
