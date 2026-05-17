import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { useMelodyComposer } from "../contexts/MelodyComposerContext";
import { getSongById } from "../data/songs";

/**
 * Modal de celebración cuando el niño completa todas las notas de una canción.
 *
 * - Muestra la canción desbloqueada con su emoji y reward message
 * - Botón "Tocar la canción completa" para reproducirla
 * - Confetti de partículas para celebrar
 * - Botón "Elegir otra canción" cierra el modal
 */
export function SongCompletionModal({ audio, instrumento }) {
  const { justUnlockedSong, dismissUnlock } = useMelodyComposer();
  const playbackTimeoutsRef = useRef([]);

  // Reproducir automáticamente la canción al abrirse el modal
  const playFullSong = useCallback(async () => {
    if (!justUnlockedSong || !audio) return;

    try {
      const sampler = await audio.getSamplerSync(instrumento);
      const startTime = Tone.now();
      let cumulativeOffset = 0.3;

      const durations = {
        "16n": 0.125,
        "8n": 0.25,
        "4n": 0.5,
        "2n": 1.0,
        "1n": 2.0,
      };

      justUnlockedSong.notes.forEach(([note, dur]) => {
        sampler.triggerAttackRelease(note, dur, startTime + cumulativeOffset);
        cumulativeOffset += (durations[dur] || 0.5) * 0.85;
      });
    } catch (e) {
      console.error("Error reproduciendo canción:", e);
    }
  }, [justUnlockedSong, audio, instrumento]);

  // Auto-reproducir al abrirse
  useEffect(() => {
    if (justUnlockedSong) {
      const timer = setTimeout(playFullSong, 800); // pequeño delay para impacto
      playbackTimeoutsRef.current.push(timer);
      return () => clearTimeout(timer);
    }
  }, [justUnlockedSong, playFullSong]);

  // Cleanup
  useEffect(() => {
    return () => playbackTimeoutsRef.current.forEach(clearTimeout);
  }, []);

  if (!justUnlockedSong) return null;

  const song = justUnlockedSong;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "clamp(16px, 5vw, 24px)",
          backdropFilter: "blur(8px)",
        }}
        onClick={dismissUnlock}
      >
        {/* Confetti de partículas de fondo */}
        <ConfettiBurst />

        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: `linear-gradient(135deg, ${song.color} 0%, #1e293b 120%)`,
            border: `3px solid ${song.color}`,
            borderRadius: 24,
            padding: "clamp(24px, 5vw, 36px) clamp(20px, 4vw, 32px)",
            maxWidth: 450,
            width: "100%",
            textAlign: "center",
            boxShadow: `0 20px 60px ${song.color}80, 0 0 100px ${song.color}40`,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Badge "DESBLOQUEADA" */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 250 }}
            style={{
              display: "inline-block",
              background: "#fbbf24",
              color: "#1e293b",
              padding: "4px 14px",
              borderRadius: 999,
              fontSize: "clamp(10px, 2vw, 12px)",
              fontWeight: 900,
              letterSpacing: 2,
              marginBottom: 16,
              boxShadow: "0 4px 12px rgba(251, 191, 36, 0.5)",
            }}
          >
            🎉 ¡DESBLOQUEADA!
          </motion.div>

          {/* Emoji gigante */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
            style={{ fontSize: "clamp(64px, 18vw, 96px)", marginBottom: 8 }}
          >
            {song.emoji}
          </motion.div>

          {/* Título y artista */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              color: "#ffffff",
              fontSize: "clamp(18px, 4vw, 24px)",
              fontWeight: 900,
              margin: "0 0 4px",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {song.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              color: "#e2e8f0",
              fontSize: "clamp(12px, 2.5vw, 14px)",
              fontWeight: 600,
              margin: "0 0 16px",
              opacity: 0.85,
            }}
          >
            {song.artist}
          </motion.p>

          {/* Reward message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "clamp(13px, 2.8vw, 15px)",
              fontWeight: 700,
              color: "#fef3c7",
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            {song.reward}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              color: "#cbd5e1",
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            🎵 Tocaste <strong style={{ color: "#fff" }}>{song.notes.length} notas</strong> con tus respuestas correctas
            <br />
            <span style={{ opacity: 0.7, fontSize: "0.9em" }}>{song.description}</span>
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={playFullSong}
              style={{
                flex: "1 1 140px",
                background: "#ffffff",
                color: "#1e293b",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: "clamp(12px, 2.5vw, 14px)",
                cursor: "pointer",
                minHeight: 44,
                boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)",
              }}
            >
              🎵 Tocar de nuevo
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={dismissUnlock}
              style={{
                flex: "1 1 140px",
                background: "transparent",
                color: "#fff",
                border: "2px solid #fff",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: "clamp(12px, 2.5vw, 14px)",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              🎼 Elegir otra
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Confetti de fondo (sin librería externa)
 */
function ConfettiBurst() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2.5 + Math.random() * 1.5,
    emoji: ["🎵", "🎶", "⭐", "✨", "🎉", "💫"][i % 6],
    rotation: Math.random() * 360,
  }));

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.x}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 1, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            fontSize: "clamp(20px, 4vw, 28px)",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
