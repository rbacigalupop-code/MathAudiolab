import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INSTRUMENTO_INFO = {
  "piano": {
    name: "🎹 Piano",
    desc: "Sonido clásico y preciso",
    emoji: "🎹",
    color: "#f97316",
  },
  "bass-electric": {
    name: "🎸 Bajo Eléctrico",
    desc: "Sonido profundo y resonante",
    emoji: "🎸",
    color: "#3b82f6",
  },
  "guitar-acoustic": {
    name: "🎸 Guitarra Acústica",
    desc: "Sonido cálido y natural",
    emoji: "🎸",
    color: "#a855f7",
  },
};

export function InstrumentoSelector({ instrumento, onSelect, audio, disabled = false }) {
  const [hoveredInst, setHoveredInst] = useState(null);
  const [playing, setPlaying] = useState(null);

  const handlePreview = async (instId) => {
    if (disabled || playing) return;

    setPlaying(instId);
    try {
      // Toca una nota de demostración
      const s = await audio.getSamplerSync(instId);
      const notes = ["C3", "E3", "G3"];
      const t0 = audio.Tone.now();

      notes.forEach((note, i) => {
        s.triggerAttackRelease(note, "8n", t0 + i * 0.2);
      });

      setTimeout(() => setPlaying(null), 1000);
    } catch (e) {
      console.error("Preview error:", e);
      setPlaying(null);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: "#64748b", fontWeight: 700, marginBottom: 8 }}>
        🎵 Elige tu instrumento
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
        {Object.entries(INSTRUMENTO_INFO).map(([id, info]) => {
          const isSelected = instrumento === id;
          const isHovered = hoveredInst === id;
          const isPlaying = playing === id;

          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.95 }}
              onClick={() => !disabled && onSelect(id)}
              onMouseEnter={() => setHoveredInst(id)}
              onMouseLeave={() => setHoveredInst(null)}
              disabled={disabled}
              style={{
                padding: "clamp(8px, 2vw, 12px)",
                borderRadius: 12,
                border: isSelected ? `2.5px solid ${info.color}` : `1.5px solid #334155`,
                background: isSelected ? `${info.color}15` : "#1e293b",
                color: isSelected ? info.color : "#94a3b8",
                fontWeight: 700,
                fontSize: "clamp(10px, 1.5vw, 11px)",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all .2s",
                position: "relative",
                overflow: "hidden",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: 4 }}>
                {info.emoji}
              </div>

              <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", lineHeight: 1.2 }}>
                {info.name.split(" ")[1]}
              </div>

              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "12px",
                    }}
                  >
                    🔊
                  </motion.div>
                )}
              </AnimatePresence>

              {(isHovered || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(id);
                  }}
                  role="button"
                  tabIndex={disabled || isPlaying ? -1 : 0}
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: info.color,
                    border: "none",
                    color: "#fff",
                    fontSize: "10px",
                    cursor: isPlaying ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isPlaying ? 0.7 : 1,
                  }}
                  title="Escuchar preview"
                >
                  {isPlaying ? "♪" : "▶"}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={{ marginTop: 8, fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b" }}>
        {instrumento && `Seleccionado: ${INSTRUMENTO_INFO[instrumento]?.name || "Desconocido"}`}
      </div>
    </div>
  );
}
