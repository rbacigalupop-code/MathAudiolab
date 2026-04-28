import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { ResponsiveBassNeck } from "../components/ResponsiveBassNeck";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import { notaPara, TC } from "../constants/music";

export default function ModoTabla({ tabla, setTabla, audio, instrumento }) {
  const [playing, setPlaying] = useState(false);
  const [hl, setHL] = useState(-1);
  const [an, setAN] = useState(null);
  const timeoutsRef = useRef([]);
  const c = TC[tabla];

  // Hook para mascota interactiva
  const { triggerPunch } = useMascotaContext();

  const playTable = useCallback(async () => {
    const s = await audio.getSamplerSync(instrumento);
    setPlaying(true);

    const now = Tone.now();
    const STEP = 0.62;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    for (let i = 1; i <= 10; i++) {
      const nota = notaPara(tabla, i);
      const tNote = now + (i - 1) * STEP;
      s.triggerAttackRelease(nota.t, "4n", tNote);

      const visualDelay = (i - 1) * STEP * 1000;
      const idAN = setTimeout(() => {
        setHL(i);
        setAN(nota.t);
      }, visualDelay);
      timeoutsRef.current.push(idAN);
    }

    const totalMs = 10 * STEP * 1000 + 700;
    const idEnd = setTimeout(() => {
      setPlaying(false);
      setHL(-1);
      setAN(null);
      triggerPunch(); // Animar la mascota como recompensa
    }, totalMs);
    timeoutsRef.current.push(idEnd);
  }, [tabla, audio, instrumento]);

  const playOne = useCallback(
    async (f) => {
      const nota = notaPara(tabla, f);
      setAN(nota.t);
      await audio.playBass(nota.t, "4n", undefined, instrumento);
      const id = setTimeout(() => setAN(null), 700);
      timeoutsRef.current.push(id);
    },
    [tabla, audio, instrumento]
  );

  return (
    <div>
      {/* Selector de tabla */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.88 }}
            onClick={() => setTabla(t)}
            style={{
              width: "clamp(32px, 8vw, 40px)",
              height: "clamp(32px, 8vw, 40px)",
              borderRadius: 10,
              border: `2px solid ${TC[t]}`,
              background: tabla === t ? TC[t] : "transparent",
              color: tabla === t ? "#fff" : TC[t],
              fontWeight: 800,
              fontSize: "clamp(12px, 2vw, 15px)",
              cursor: "pointer",
              transition: "all .15s",
              minHeight: 40,
            }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Mástil */}
      <ResponsiveBassNeck activeNote={an} onFretClick={async (n) => {
        setAN(n);
        await audio.playBass(n, "4n", undefined, instrumento);
        const id = setTimeout(() => setAN(null), 700);
        timeoutsRef.current.push(id);
      }} />

      {/* Botones de práctica */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 12 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => {
          const nota = notaPara(tabla, f);
          return (
            <motion.button
              key={f}
              whileTap={{ scale: 0.93 }}
              onClick={() => playOne(f)}
              animate={{ background: hl === f ? c + "22" : "#1e293b" }}
              style={{
                borderRadius: 10,
                border: `1.5px solid ${hl === f ? c : c + "44"}`,
                padding: "clamp(6px, 1.5vw, 9px) clamp(8px, 1.5vw, 12px)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: hl === f ? c + "22" : "#1e293b",
                transition: "all .15s",
                minHeight: 44,
              }}
            >
              <span style={{ fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 600, color: "#e2e8f0" }}>
                {tabla} × {f} =
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                <span style={{ fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 800, color: c }}>
                  {tabla * f}
                </span>
                <span style={{ fontSize: "clamp(7px, 1vw, 9px)", color: c + "99", fontFamily: "monospace" }}>
                  {nota.e}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Botón play */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={playTable}
        disabled={playing}
        style={{
          marginTop: 12,
          width: "100%",
          background: playing ? "#334155" : c,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "clamp(10px, 2vw, 12px)",
          fontWeight: 700,
          fontSize: "clamp(12px, 2vw, 15px)",
          cursor: playing ? "default" : "pointer",
          minHeight: 44,
        }}
      >
        {playing ? `🎸 Sonando tabla del ${tabla}…` : `🎸 Escuchar tabla del ${tabla}`}
      </motion.button>
    </div>
  );
}
