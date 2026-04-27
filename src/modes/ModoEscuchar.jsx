import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";
import { ResponsiveBassNeck } from "../components/ResponsiveBassNeck";
import { StatCard } from "../components/StatCard";
import { notaPara, SOL } from "../constants/music";

export default function ModoEscuchar({ audio, instrumento }) {
  const [tabla, setTabla] = useState(null);
  const [factor, setFactor] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [estado, setEstado] = useState("esperando");
  const [score, setScore] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [an, setAN] = useState(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  const newQ = useCallback(() => {
    const t = Math.floor(Math.random() * 9) + 2;
    const f = Math.floor(Math.random() * 10) + 1;
    const correct = t * f;
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const d = Math.floor(Math.random() * 8) - 4;
      const v = correct + d;
      if (v > 0 && v <= 100) opts.add(v);
    }
    setTabla(t);
    setFactor(f);
    setOpciones([...opts].sort(() => Math.random() - 0.5));
    setSeleccion(null);
    setEstado("esperando");
  }, []);

  useEffect(() => {
    newQ();
  }, []);

  const playQ = useCallback(async () => {
    if (tabla === null) return;
    const s = await audio.getSamplerSync(instrumento);
    const nota = notaPara(tabla, factor);
    const t0 = Tone.now();
    const STEP = 0.2;
    const maxG = Math.min(tabla, 4);
    const maxN = Math.min(factor, 4);

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let lastBeat = 0;
    for (let g = 0; g < maxG; g++) {
      for (let n = 0; n < maxN; n++) {
        const idx = (g * factor + n) % SOL.length;
        const tNote = t0 + (g * (maxN + 1) + n) * STEP;
        s.triggerAttackRelease(SOL[idx].t, "16n", tNote);
        lastBeat = (g * (maxN + 1) + n) * STEP;
      }
    }

    const tFinal = t0 + lastBeat + 0.3;
    s.triggerAttackRelease(nota.t, "2n", tFinal);

    const visualMs = (lastBeat + 0.3) * 1000;
    const id1 = setTimeout(() => setAN(nota.t), visualMs);
    const id2 = setTimeout(() => setAN(null), visualMs + 800);
    timeoutsRef.current.push(id1, id2);
  }, [tabla, factor, audio, instrumento]);

  const elegir = useCallback(
    async (v) => {
      if (estado !== "esperando") return;
      setSeleccion(v);
      setIntentos((i) => i + 1);
      const correct = tabla * factor;
      if (v === correct) {
        setEstado("correcto");
        setScore((s) => s + 1);
        await audio.playVictory(instrumento);
      } else {
        setEstado("incorrecto");
        await audio.playError(instrumento);
      }
    },
    [estado, tabla, factor, audio, instrumento]
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { l: "✅ Correctas", v: score, c: "#22c55e" },
          { l: "📝 Intentos", v: intentos, c: "#64748b" },
          {
            l: "🎯 Precisión",
            v: intentos > 0 ? Math.round((score / intentos) * 100) + "%" : "—",
            c: "#60a5fa",
          },
        ].map(({ l, v, c }) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <ResponsiveBassNeck
        activeNote={an}
        onFretClick={async (n) => {
          setAN(n);
          await audio.playBass(n, "4n", undefined, instrumento);
          const id = setTimeout(() => setAN(null), 700);
          timeoutsRef.current.push(id);
        }}
      />

      <div style={{ background: "#1e293b", borderRadius: 16, padding: "20px", marginTop: 12, textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: "clamp(11px, 1.5vw, 13px)", margin: "0 0 12px" }}>
          Escucha el bajo y elige el resultado
        </p>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={playQ}
          style={{
            background: "#1e40af",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 28px)",
            fontWeight: 700,
            fontSize: "clamp(14px, 2vw, 16px)",
            cursor: "pointer",
            marginBottom: 16,
            minHeight: 44,
          }}
        >
          🎸 Tocar la pregunta
        </motion.button>
        {tabla && (
          <p style={{ color: "#475569", fontSize: "clamp(10px, 1.5vw, 12px)", marginBottom: 14 }}>
            {tabla} × {factor} = ?
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {opciones.map((v) => {
            const correct = tabla * factor;
            const isCorr = v === correct,
              isSel = seleccion === v;
            let bg = "#0f172a",
              border = "#334155",
              color = "#e2e8f0";
            if (estado !== "esperando" && isCorr) {
              bg = "#14532d";
              border = "#22c55e";
              color = "#86efac";
            } else if (isSel && !isCorr) {
              bg = "#7f1d1d";
              border = "#ef4444";
              color = "#fca5a5";
            }
            return (
              <motion.button
                key={v}
                whileTap={{ scale: 0.93 }}
                onClick={() => elegir(v)}
                disabled={estado !== "esperando"}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  color,
                  borderRadius: 12,
                  padding: "16px",
                  fontWeight: 800,
                  fontSize: "clamp(18px, 5vw, 24px)",
                  cursor: estado === "esperando" ? "pointer" : "default",
                  transition: "all .15s",
                  minHeight: 56,
                }}
              >
                {v}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {estado === "correcto" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#22c55e", fontWeight: 700, marginTop: 10, fontSize: "clamp(12px, 2vw, 14px)" }}>
              🎸 ¡Exacto! {tabla}×{factor}={tabla * factor}
            </motion.p>
          )}
          {estado === "incorrecto" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#ef4444", fontWeight: 600, marginTop: 10, fontSize: "clamp(11px, 1.5vw, 13px)" }}>
              Era {tabla * factor}
            </motion.p>
          )}
        </AnimatePresence>
        {estado !== "esperando" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={newQ}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 10,
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 24px)",
              fontWeight: 700,
              fontSize: "clamp(12px, 2vw, 14px)",
              cursor: "pointer",
              minHeight: 40,
            }}
          >
            Siguiente →
          </motion.button>
        )}
      </div>
    </div>
  );
}
