import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import { useMelodyComposer } from "../contexts/MelodyComposerContext";
import { preparePlaybackSequence } from "../utils/MelodyGenerator";
import { SONGS, getSongById, getSongsByDifficulty } from "../data/songs";

/**
 * MelodyPanel
 *
 * Widget pedagógico que conecta cada respuesta correcta con música real.
 *
 * Modos:
 * - 🎼 Canción: Cada acierto toca la siguiente nota de una canción real
 *   elegida (MCR, BlackPink, clásicos). Al completarla → desbloqueo.
 * - 🎨 Libre: Pentatónica aleatoria, compone tu propia canción.
 */
export function MelodyPanel({ audio, instrumento }) {
  const {
    mode,
    setMode,
    currentSongId,
    setCurrentSong,
    songProgress,
    songNotes,
    unlockedSongs,
    notes,
    clearMelody,
    saveSong,
    lastAddedKey,
  } = useMelodyComposer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const playbackTimeoutsRef = useRef([]);

  // Determinar qué notas y canción activa mostrar
  const isSongMode = mode === "song";
  const activeSong = isSongMode ? getSongById(currentSongId) : null;
  const activeNotes = isSongMode ? songNotes : notes;
  const totalNotes = isSongMode && activeSong ? activeSong.notes.length : null;
  const progressPercent = totalNotes ? (songProgress / totalNotes) * 100 : 0;

  /**
   * Reproducir las notas que ya se han tocado
   */
  const playMelody = useCallback(async () => {
    if (activeNotes.length === 0 || isPlaying || !audio) return;
    setIsPlaying(true);

    try {
      const sampler = await audio.getSamplerSync(instrumento);
      const sequence = preparePlaybackSequence(activeNotes);
      const startTime = Tone.now();

      sequence.forEach((n) => {
        sampler.triggerAttackRelease(n.note, n.duration, startTime + n.startOffset);
      });

      const lastNote = sequence[sequence.length - 1];
      const totalDuration = (lastNote.startOffset + 0.6) * 1000;

      const timeoutId = setTimeout(() => setIsPlaying(false), totalDuration);
      playbackTimeoutsRef.current.push(timeoutId);
    } catch (e) {
      console.error("Error reproduciendo melodía:", e);
      setIsPlaying(false);
    }
  }, [activeNotes, isPlaying, audio, instrumento]);

  const handleSave = useCallback(() => {
    const song = saveSong();
    if (song) {
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2500);
    }
  }, [saveSong]);

  const handleClear = useCallback(() => {
    const count = activeNotes.length;
    if (count > 5) {
      const target = isSongMode ? `tu progreso en "${activeSong?.title}"` : `tu canción de ${count} notas`;
      const ok = window.confirm(`¿Reiniciar ${target}? Esto no se puede deshacer.`);
      if (!ok) return;
    }
    clearMelody();
  }, [clearMelody, activeNotes.length, isSongMode, activeSong]);

  const handleSelectSong = useCallback((songId) => {
    setCurrentSong(songId);
    setShowSongPicker(false);
    setExpanded(true);
  }, [setCurrentSong]);

  const songsByDifficulty = getSongsByDifficulty();

  // ============================================
  // RENDER
  // ============================================
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
      {/* ===== Header con info de canción activa o modo libre ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 160px" }}>
          <span style={{ fontSize: "clamp(18px, 3.5vw, 24px)" }}>
            {isSongMode && activeSong ? activeSong.emoji : "🎨"}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "clamp(11px, 2vw, 13px)",
                fontWeight: 800,
                color: "#a855f7",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isSongMode && activeSong ? activeSong.title : "Modo Libre"}
            </div>
            <div
              style={{
                fontSize: "clamp(9px, 1.6vw, 10px)",
                color: "#cbd5e1",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isSongMode && activeSong
                ? `${songProgress} / ${totalNotes} notas · ${activeSong.artist}`
                : `${notes.length} notas compuestas`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {activeNotes.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={playMelody}
              disabled={isPlaying}
              title="Tocar lo que llevas"
              style={{
                background: isPlaying ? "#7c3aed" : "#a855f7",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                fontWeight: 700,
                fontSize: "clamp(10px, 2vw, 12px)",
                cursor: isPlaying ? "default" : "pointer",
                minHeight: 32,
              }}
            >
              {isPlaying ? "🎵" : "▶️"}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setExpanded((v) => !v)}
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

      {/* ===== Barra de progreso (solo modo canción) ===== */}
      {isSongMode && totalNotes && (
        <div
          style={{
            marginTop: 8,
            height: 6,
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${activeSong.color}, #a855f7)`,
              borderRadius: 3,
              boxShadow: `0 0 8px ${activeSong.color}80`,
            }}
          />
        </div>
      )}

      {/* ===== Vista expandida ===== */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginTop: 10 }}
          >
            {/* Toggle modo Canción / Libre */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              <button
                onClick={() => setMode("song")}
                style={{
                  flex: 1,
                  background: isSongMode ? "#a855f7" : "transparent",
                  color: isSongMode ? "#fff" : "#a855f7",
                  border: `1.5px solid #a855f7`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.8vw, 11px)",
                  cursor: "pointer",
                  minHeight: 32,
                }}
              >
                🎼 Canción
              </button>
              <button
                onClick={() => setMode("free")}
                style={{
                  flex: 1,
                  background: !isSongMode ? "#a855f7" : "transparent",
                  color: !isSongMode ? "#fff" : "#a855f7",
                  border: `1.5px solid #a855f7`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.8vw, 11px)",
                  cursor: "pointer",
                  minHeight: 32,
                }}
              >
                🎨 Libre
              </button>
            </div>

            {/* Botón para abrir el selector de canciones */}
            {isSongMode && (
              <button
                onClick={() => setShowSongPicker((v) => !v)}
                style={{
                  width: "100%",
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#a855f7",
                  border: "1.5px solid #a855f7",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontWeight: 700,
                  fontSize: "clamp(11px, 2vw, 12px)",
                  cursor: "pointer",
                  marginBottom: 8,
                  minHeight: 36,
                }}
              >
                {showSongPicker ? "▲ Ocultar canciones" : "🎵 Elegir canción"}
              </button>
            )}

            {/* Selector de canciones */}
            <AnimatePresence>
              {isSongMode && showSongPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    overflow: "hidden",
                    marginBottom: 8,
                    background: "rgba(15, 23, 42, 0.6)",
                    borderRadius: 8,
                    padding: 8,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {["facil", "medio", "dificil"].map((diff) => {
                    const songs = songsByDifficulty[diff];
                    if (!songs || songs.length === 0) return null;
                    return (
                      <div key={diff} style={{ marginBottom: 8 }}>
                        <div
                          style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            color: "#94a3b8",
                            letterSpacing: 1.5,
                            marginBottom: 4,
                            paddingLeft: 4,
                          }}
                        >
                          {diff === "facil" ? "🟢 FÁCIL" : diff === "medio" ? "🟡 MEDIO" : "🔴 DESAFÍO"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                          {songs.map((song) => {
                            const isActive = song.id === currentSongId;
                            const isUnlocked = unlockedSongs.find((u) => u.id === song.id);
                            return (
                              <button
                                key={song.id}
                                onClick={() => handleSelectSong(song.id)}
                                style={{
                                  background: isActive ? song.color : "rgba(30, 41, 59, 0.8)",
                                  color: isActive ? "#fff" : "#cbd5e1",
                                  border: isActive
                                    ? `2px solid ${song.color}`
                                    : "1.5px solid rgba(148, 163, 184, 0.3)",
                                  borderRadius: 8,
                                  padding: "8px 6px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 2,
                                  lineHeight: 1.2,
                                  textAlign: "center",
                                  minHeight: 60,
                                  position: "relative",
                                }}
                                title={`${song.title} — ${song.artist}`}
                              >
                                <div style={{ fontSize: "18px" }}>{song.emoji}</div>
                                <div
                                  style={{
                                    fontSize: "9px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    width: "100%",
                                  }}
                                >
                                  {song.title}
                                </div>
                                {isUnlocked && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: -4,
                                      right: -4,
                                      background: "#fbbf24",
                                      color: "#1e293b",
                                      borderRadius: "50%",
                                      width: 16,
                                      height: 16,
                                      fontSize: "9px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 900,
                                    }}
                                  >
                                    ✓
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notas como círculos coloridos */}
            {activeNotes.length > 0 && (
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
                {activeNotes.map((n) => (
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
                    {String(n.note).replace(/[\d#b]/g, "")}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Botones de acción */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {!isSongMode && activeNotes.length > 0 && (
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
              )}
              {activeNotes.length > 0 && (
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
                  🗑️ {isSongMode ? "Reiniciar" : "Nueva canción"}
                </button>
              )}
            </div>

            {/* Canciones desbloqueadas (galería) */}
            {unlockedSongs.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(168, 85, 247, 0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    fontWeight: 700,
                    marginBottom: 6,
                    letterSpacing: 1,
                  }}
                >
                  🏆 DESBLOQUEADAS ({unlockedSongs.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {unlockedSongs.map((u) => (
                    <div
                      key={u.id}
                      title={`${u.title} — ${u.artist}`}
                      style={{
                        background: "rgba(251, 191, 36, 0.15)",
                        border: "1px solid rgba(251, 191, 36, 0.4)",
                        color: "#fbbf24",
                        borderRadius: 999,
                        padding: "3px 8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span>{u.emoji}</span>
                      <span
                        style={{
                          maxWidth: 80,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
