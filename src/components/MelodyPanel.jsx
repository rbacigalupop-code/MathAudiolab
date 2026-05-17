import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { useMelodyComposer } from "../contexts/MelodyComposerContext";
import { preparePlaybackSequence } from "../utils/MelodyGenerator";

/**
 * MelodyPanel
 *
 * Widget compacto que muestra el progreso de la melodía actual.
 * El niño puede ver las notas que ha "compuesto" con sus respuestas correctas
 * y reproducir la canción completa cuando quiera.
 *
 * Filosofía pedagógica:
 * - Refuerza visualmente que CADA acierto genera música
 * - Da un reward acumulativo al final (puedes escuchar tu canción)
 * - Conecta directamente matemática con resultado musical
 */
export function MelodyPanel({ audio, instrumento }) {
  const { notes, clearMelody, saveSong, lastAddedKey } = useMelodyComposer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const playbackTimeoutsRef = useRef([]);

  /**
   * Reproducir la melodía completa
   */
  const playMelody = useCallback(async () => {
    if (notes.length === 0 || isPlaying || !audio) return;
    setIsPlaying(true);

    try {
      const sampler = await audio.getSamplerSync(instrumento);
      const sequence = preparePlaybackSequence(notes);
      const startTime = Tone.now();

      sequence.forEach((n) => {
        sampler.triggerAttackRelease(n.note, n.duration, startTime + n.startOffset);
      });

      // Calcular duración total para resetear estado isPlaying
      const lastNote = sequence[sequence.length - 1];
      const totalDuration = (lastNote.startOffset + 0.6) * 1000;

      const timeoutId = setTimeout(() => setIsPlaying(false), totalDuration);
      playbackTimeoutsRef.current.push(timeoutId);
    } catch (e) {
      console.error("Error reproduciendo melodía:", e);
      setIsPlaying(false);
    }
  }, [notes, isPlaying, audio, instrumento]);

  const handleSave = useCallback(() => {
    const song = saveSong();
    if (song) {
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2500);
    }
  }, [saveSong]);

  const handleClear = useCallback(() => {
    if (notes.length > 5) {
      const ok = window.confirm(
        `¿Borrar tu canción de ${notes.length} notas? Esto no se puede deshacer.`
      );
      if (!ok) return;
    }
    clearMelody();
  }, [clearMelody, notes.length]);

  // Si no hay notas, mostrar invitación discreta
  if (notes.length === 0) {
    return (
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(168, 85, 247, 0.08)",
          border: "1px dashed rgba(168, 85, 247, 0.3)",
          borderRadius: 10,
          fontSize: "clamp(10px, 2vw, 12px)",
          color: "#a855f7",
          textAlign: "center",
          margin: "10px 0",
        }}
      >
        🎼 Cada respuesta correcta agregará una nota a tu canción
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))",
        border: "1.5px solid rgba(168, 85, 247, 0.35)",
        borderRadius: 12,
        padding: "10px 12px",
        margin: "10px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 140px" }}>
          <span style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>🎼</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "clamp(10px, 2vw, 12px)",
                fontWeight: 800,
                color: "#a855f7",
                lineHeight: 1.2,
              }}
            >
              Mi canción
            </div>
            <div
              style={{
                fontSize: "clamp(9px, 1.6vw, 10px)",
                color: "#cbd5e1",
                lineHeight: 1.2,
              }}
            >
              {notes.length} {notes.length === 1 ? "nota" : "notas"} compuestas
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={playMelody}
            disabled={isPlaying}
            title="Tocar mi canción"
            style={{
              background: isPlaying ? "#7c3aed" : "#a855f7",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              fontWeight: 700,
              fontSize: "clamp(10px, 2vw, 12px)",
              cursor: isPlaying ? "default" : "pointer",
              transition: "background .2s",
              minHeight: 32,
            }}
          >
            {isPlaying ? "🎵 Sonando…" : "▶️ Tocar"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Ocultar notas" : "Ver notas"}
            style={{
              background: "transparent",
              color: "#a855f7",
              border: "1.5px solid #a855f7",
              borderRadius: 8,
              padding: "6px 8px",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              minHeight: 32,
            }}
          >
            {expanded ? "▲" : "▼"}
          </motion.button>
        </div>
      </div>

      {/* Vista expandida: notas visuales + acciones */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginTop: 10 }}
          >
            {/* Notas como círculos coloridos */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                padding: "8px 4px",
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: 8,
                marginBottom: 8,
                maxHeight: 100,
                overflowY: "auto",
              }}
            >
              {notes.map((n) => (
                <motion.div
                  key={n.id}
                  initial={
                    n.id === lastAddedKey
                      ? { scale: 0, opacity: 0 }
                      : { scale: 1, opacity: 1 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  title={`${n.note}${n.problem ? ` · ${n.problem}` : ""}`}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: n.color,
                    border: "2px solid rgba(255,255,255,0.2)",
                    fontSize: "8px",
                    fontWeight: 800,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${n.color}40`,
                  }}
                >
                  {n.note.replace(/\d/g, "")}
                </motion.div>
              ))}
            </div>

            {/* Botones de acción */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={handleSave}
                style={{
                  flex: "1 1 100px",
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.8vw, 11px)",
                  cursor: "pointer",
                  minHeight: 32,
                }}
              >
                💾 Guardar
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: "1 1 100px",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1.5px solid #ef4444",
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.8vw, 11px)",
                  cursor: "pointer",
                  minHeight: 32,
                }}
              >
                🗑️ Nueva canción
              </button>
            </div>

            {/* Leyenda de colores */}
            <div
              style={{
                marginTop: 8,
                fontSize: "clamp(8px, 1.4vw, 9px)",
                color: "#94a3b8",
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              🔵 Graves · 🟢 Medios · 🟠 Agudos · 🌸 Muy agudos
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje "Guardada" flotante */}
      <AnimatePresence>
        {showSavedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: -8,
              right: 8,
              background: "#22c55e",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 12,
              fontSize: "10px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)",
            }}
          >
            ✅ Canción guardada
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
