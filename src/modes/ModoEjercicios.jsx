import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";
import { DynamicFretboard } from "../components/DynamicFretboard";
import { StatCard } from "../components/StatCard";
import { notaPara, TC, NIVELES, ACIERTOS_PARA_SUBIR, SOL } from "../constants/music";

export default function ModoEjercicios({ store, setStore, audio, instrumento, setRockActive }) {
  const nivel = store.nivel;
  const cfg = NIVELES[nivel - 1];
  const [tabla, setTabla] = useState(cfg.tablas[0]);
  const [factor, setFactor] = useState(null);
  const [input, setInput] = useState("");
  const [estado, setEstado] = useState("esperando");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [an, setAN] = useState(null);
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionRef = useRef({ correctas: 0, intentos: 0 });
  const c = TC[tabla] || "#f97316";

  // Cleanup
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  // Sesión
  useEffect(() => {
    sessionRef.current = { correctas: 0, intentos: 0 };
    return () => {
      const s = sessionRef.current;
      if (s.intentos === 0) return;
      const today = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
      setStore((prev) => {
        const next = {
          ...prev,
          sesiones: [...prev.sesiones, { fecha: today, correctas: s.correctas, intentos: s.intentos }].slice(-30),
        };
        return next;
      });
    };
  }, [nivel, setStore]);

  const rndTabla = useCallback(() => {
    const err = store.erroresPorTabla;
    const weighted = cfg.tablas.flatMap((t) => {
      const e = err[t];
      if (!e) return [t, t];
      const pct = e.correctas / (e.correctas + e.incorrectas || 1);
      return pct < 0.6 ? [t, t, t] : pct < 0.8 ? [t, t] : [t];
    });
    return weighted[Math.floor(Math.random() * weighted.length)];
  }, [cfg, store.erroresPorTabla]);

  const newQ = useCallback(() => {
    const t = rndTabla();
    setTabla(t);
    setFactor(Math.floor(Math.random() * 10) + 1);
    setInput("");
    setEstado("esperando");
  }, [rndTabla]);

  useEffect(() => {
    newQ();
  }, [nivel]);

  const check = useCallback(async () => {
    if (!input || factor === null) return;
    const resp = parseInt(input),
      correct = tabla * factor;
    const isCorrect = resp === correct;

    setIntentos((i) => i + 1);
    sessionRef.current.intentos++;

    setStore((prev) => {
      const next = { ...prev };
      const e = next.erroresPorTabla[tabla] || { correctas: 0, incorrectas: 0 };
      if (isCorrect) e.correctas++;
      else e.incorrectas++;
      next.erroresPorTabla = { ...next.erroresPorTabla, [tabla]: { ...e } };
      return next;
    });

    if (isCorrect) {
      setEstado("correcto");
      setScore((s) => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      sessionRef.current.correctas++;
      const nota = notaPara(tabla, factor);
      setAN(nota.t);

      const s = await audio.getSamplerSync(instrumento);
      const t0 = Tone.now();
      s.triggerAttackRelease(nota.t, "2n", t0);
      [["G2", "8n"], ["B2", "8n"], ["D3", "8n"], ["G3", "4n"]].forEach(([n, d], i) =>
        s.triggerAttackRelease(n, d, t0 + 0.3 + i * 0.18)
      );

      const id = setTimeout(() => setAN(null), 900);
      timeoutsRef.current.push(id);

      setStore((prev) => {
        const next = { ...prev, rachaGlobal: prev.rachaGlobal + 1, mejorRacha: Math.max(prev.mejorRacha, prev.rachaGlobal + 1) };

        // Effects unlock
        if (ns >= 5 && !next.unlocked_effects?.includes("distortion")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "distortion"];
          if (setRockActive) setRockActive(true);
        }
        if (next.mejorRacha >= 30 && !next.unlocked_effects?.includes("reverb")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "reverb"];
        }
        if (next.mejorRacha >= 50 && !next.unlocked_effects?.includes("wahwah")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "wahwah"];
        }

        if (next.nivel < 5 && ns >= ACIERTOS_PARA_SUBIR) {
          next.nivel = Math.min(5, next.nivel + 1);
          next.rachaGlobal = 0;
          setLevelUpMsg(true);
          const idLvl = setTimeout(() => setLevelUpMsg(false), 3500);
          timeoutsRef.current.push(idLvl);
          audio.playLevelUp(instrumento);
        }
        return next;
      });
    } else {
      setEstado("incorrecto");
      setStreak(0);
      setStore((prev) => ({ ...prev, rachaGlobal: 0 }));
      await audio.playError(instrumento);
    }
  }, [input, factor, tabla, streak, audio, instrumento, setStore]);

  const playHint = useCallback(async () => {
    if (!factor) return;
    const s = await audio.getSamplerSync(instrumento);
    const t0 = Tone.now();
    const STEP = 0.2;
    const maxG = Math.min(tabla, 4);
    const maxN = Math.min(factor, 4);
    for (let g = 0; g < maxG; g++) {
      for (let n = 0; n < maxN; n++) {
        const idx = (g * factor + n) % SOL.length;
        const tNote = t0 + (g * (maxN + 1) + n) * STEP;
        s.triggerAttackRelease(SOL[idx].t, "16n", tNote);
        const id = setTimeout(() => {
          setAN(SOL[idx].t);
        }, (g * (maxN + 1) + n) * STEP * 1000);
        timeoutsRef.current.push(id);
      }
    }
    const idEnd = setTimeout(() => setAN(null), maxG * (maxN + 1) * STEP * 1000 + 200);
    timeoutsRef.current.push(idEnd);
  }, [tabla, factor, audio, instrumento]);

  const handleKey = (e) => {
    if (e.key === "Enter") estado === "correcto" ? newQ() : check();
  };

  useEffect(() => {
    if (estado === "esperando") inputRef.current?.focus();
  }, [estado, factor]);

  const progreso = Math.min((streak / ACIERTOS_PARA_SUBIR) * 100, 100);

  return (
    <div>
      {nivel < 5 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b" }}>
              Progreso → Nivel {nivel + 1}
            </span>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#f97316" }}>
              {streak}/{ACIERTOS_PARA_SUBIR}
            </span>
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progreso}%` }}
              style={{ height: "100%", background: "#f97316", borderRadius: 3 }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { l: "✅ Correctas", v: score, c: "#22c55e" },
          { l: "📝 Intentos", v: intentos, c: "#64748b" },
          { l: "🔥 Racha", v: streak, c: "#f97316" },
        ].map(({ l, v, c }) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <DynamicFretboard
        instrumento={instrumento}
        activeNote={an}
        onFretClick={async (n) => {
          setAN(n);
          await audio.playBass(n, "4n", undefined, instrumento);
          const id = setTimeout(() => setAN(null), 700);
          timeoutsRef.current.push(id);
        }}
      />

      <AnimatePresence>
        {levelUpMsg && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#f97316",
              borderRadius: 14,
              margin: "12px 0",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 900 }}>
              🎸 ¡Subiste al Nivel {nivel}!
            </div>
            <div style={{ fontSize: "clamp(11px, 2vw, 13px)", opacity: 0.85 }}>
              Tablas: {NIVELES[nivel - 1].desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {factor !== null && !levelUpMsg && (
        <motion.div
          key={`${tabla}x${factor}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            marginTop: 12,
            background: "#1e293b",
            border: `2px solid ${c}`,
            borderRadius: 16,
            padding: "clamp(14px, 3vw, 18px) clamp(10px, 2vw, 14px)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#64748b", marginBottom: 4 }}>
            ¿Cuánto es?
          </div>
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: 2, lineHeight: 1 }}>
            <span style={{ color: c }}>{tabla}</span>
            <span style={{ color: "#475569", margin: "0 8px" }}>×</span>
            <span style={{ color: c }}>{factor}</span>
            <span style={{ color: "#475569", margin: "0 10px" }}>=</span>
            <span style={{ color: "#475569" }}>?</span>
          </div>

          {cfg.grupos && (
            <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", margin: "10px 0" }}>
              {Array.from({ length: Math.min(tabla, 5) }).map((_, g) => (
                <div
                  key={g}
                  style={{
                    display: "flex",
                    gap: 2,
                    padding: "4px 6px",
                    borderRadius: 8,
                    border: `1.5px solid ${c}55`,
                    background: c + "18",
                  }}
                >
                  {Array.from({ length: Math.min(factor, 5) }).map((_, n) => (
                    <div key={n} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
                  ))}
                  {factor > 5 && (
                    <span style={{ fontSize: "clamp(7px, 1vw, 9px)", color: c, alignSelf: "center" }}>
                      +{factor - 5}
                    </span>
                  )}
                </div>
              ))}
              {tabla > 5 && (
                <span style={{ alignSelf: "center", fontSize: "clamp(9px, 1.5vw, 11px)", color: "#64748b" }}>
                  …+{tabla - 5}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", margin: "10px 0", flexWrap: "wrap" }}>
            <input
              ref={inputRef}
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={estado !== "esperando"}
              placeholder="?"
              autoFocus
              style={{
                width: 100,
                textAlign: "center",
                fontSize: "clamp(20px, 5vw, 26px)",
                fontWeight: 800,
                borderRadius: 10,
                border: `2.5px solid ${estado === "correcto" ? "#22c55e" : estado === "incorrecto" ? "#ef4444" : c}`,
                padding: "8px 4px",
                outline: "none",
                color: "#1f2937",
                background: "#fff",
                minHeight: 44,
              }}
            />
          </div>

          <AnimatePresence>
            {estado === "correcto" && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "clamp(14px, 2vw, 17px)", marginBottom: 8 }}>
                  🎸 ¡Correcto! {tabla} × {factor} = {tabla * factor}
                  <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "#22c55e88", marginTop: 2 }}>
                    Nota: {notaPara(tabla, factor).e} · escala de Sol
                  </div>
                </div>
              </motion.div>
            )}
            {estado === "incorrecto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "clamp(11px, 2vw, 13px)", marginBottom: 8 }}>
                  Intenta de nuevo{cfg.grupos ? ` — ${tabla} grupos de ${factor}` : ""}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {estado === "esperando" && (
              <>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={check}
                  style={{
                    background: c,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 22px)",
                    fontWeight: 700,
                    fontSize: "clamp(12px, 2vw, 14px)",
                    cursor: "pointer",
                    minHeight: 40,
                  }}
                >
                  Comprobar ✓
                </motion.button>
                {cfg.pista && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={playHint}
                    style={{
                      background: "transparent",
                      color: c,
                      border: `2px solid ${c}`,
                      borderRadius: 10,
                      padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                      fontWeight: 600,
                      fontSize: "clamp(11px, 1.5vw, 12px)",
                      cursor: "pointer",
                      minHeight: 40,
                    }}
                  >
                    🎸 Pista musical
                  </motion.button>
                )}
              </>
            )}
            {estado === "correcto" && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={newQ}
                style={{
                  background: c,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 24px)",
                  fontWeight: 700,
                  fontSize: "clamp(12px, 2vw, 15px)",
                  cursor: "pointer",
                  minHeight: 40,
                }}
              >
                Siguiente →
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
