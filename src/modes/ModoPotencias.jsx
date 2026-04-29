import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";
import { StatCard } from "../components/StatCard";
import { InstrumentoIndicator } from "../components/InstrumentoIndicator";
import { LessonPanel } from "../components/LessonPanel";
import { useWeightedSampling } from "../hooks/useWeightedSampling";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import { useProgressiveHints } from "../hooks/useProgressiveHints";
import { getBandIdFromName } from "../constants/mascota";

const POTENCIA_NIVELES = [
  { id: 1, label: "Nivel 1", desc: "Exponente 0–3", maxExp: 3 },
  { id: 2, label: "Nivel 2", desc: "Exponente 0–5", maxExp: 5 },
  { id: 3, label: "Nivel 3", desc: "Exponente 0–7", maxExp: 7 },
];

const BASE_FREQ = { 2: "C2", 3: "G2", 5: "E2" };
const DEFAULT_BPM = 120; // Fallback BPM if not synchronized

async function playEscaleraOctavas(base, exponente, audio, instrumento, bpm = DEFAULT_BPM) {
  const s = await audio.getSamplerSync(instrumento);
  const t0 = Tone.now();
  const baseNote = BASE_FREQ[base] || "C2";
  const baseFreq = Tone.Frequency(baseNote).toFrequency();

  // Calculate dynamic step based on BPM (or use default)
  const STEP = audio.calculateStep ? audio.calculateStep(bpm, "8n") : 0.35;

  for (let i = 0; i <= exponente; i++) {
    const freq = baseFreq * Math.pow(base, i);
    if (freq > 4000) break;
    s.triggerAttackRelease(freq, "8n", t0 + i * STEP);
  }
}

export default function ModoPotencias({ store, setStore, audio, instrumento, setRockActive, rockActive, bandData = null }) {
  // Ensure nivel is always valid (1-3)
  const validNivel = Math.max(1, Math.min(3, store?.nivel || 1));
  const [nivelSeleccionado, setNivelSeleccionado] = useState(validNivel);
  const [base, setBase] = useState(2);
  const [exp, setExp] = useState(null);
  const [input, setInput] = useState("");
  const [estado, setEstado] = useState("esperando");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [syncedBPM, setSyncedBPMLocal] = useState(DEFAULT_BPM);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Hook para muestreo ponderado (70% weak points, 30% nuevo)
  const { getWeightedProblem, recordAttempt } = useWeightedSampling(store);

  // Acceder a recordError del hook de storage
  const { recordError } = useLocalStorage();

  // Hook para mascota interactiva
  const { triggerPunch, setCurrentBanda, updateHint, resetHints } = useMascotaContext();

  // Hook para pistas progresivas (10 segundos de espera antes de la primera pista)
  // TEMPORARILY DISABLED FOR DEBUGGING
  // const { currentHint, resetHints: resetHintsHook } = useProgressiveHints("potencias", null, 10000);

  // Sincronizar el hint del hook con el contexto de mascota
  // useEffect(() => {
  //   if (currentHint) {
  //     updateHint(currentHint);
  //   }
  // }, [currentHint, updateHint]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  // Sincronizar BPM y actualizar contexto de banda si bandData cambia
  useEffect(() => {
    if (bandData && audio && audio.setSyncedBPM) {
      const bpm = bandData.bpm || DEFAULT_BPM;
      audio.setSyncedBPM(bpm);
      setSyncedBPMLocal(bpm);
      console.log(`[ModoPotencias] BPM sincronizado: ${bpm}`);

      // Actualizar contexto de mascota con banda actual (para tooltips dinámicos)
      const bandId = getBandIdFromName(bandData.name);
      if (bandId) {
        setCurrentBanda(bandId);
        console.log(`[ModoPotencias] Mascota banda actualizada: ${bandId}`);
      }
    } else {
      // Si no hay bandData, limpiar banda del contexto
      setCurrentBanda(null);
    }
  }, [bandData, audio, setCurrentBanda]);

  const newQ = useCallback(() => {
    // Move cfg calculation inside callback to avoid circular dependency
    // with nivelSeleccionado → cfg → cfg.maxExp → newQ → useEffect
    const config = POTENCIA_NIVELES[nivelSeleccionado - 1];
    let newBase, newExp;

    // Generar nueva potencia aleatoria
    newExp = Math.floor(Math.random() * (config.maxExp + 1));
    newBase = [2, 3, 5][Math.floor(Math.random() * 3)];

    setExp(newExp);
    setBase(newBase);
    setInput("");
    setEstado("esperando");
  }, [nivelSeleccionado]);  // Only depend on nivelSeleccionado

  useEffect(() => {
    console.log("[ModoPotencias] Calling newQ - dependencies changed", { nivelSeleccionado });
    newQ();
  }, [nivelSeleccionado, newQ]);

  useEffect(() => {
    if (estado === "esperando") inputRef.current?.focus();
  }, [estado, exp]);

  const correcto = base !== null && exp !== null ? Math.pow(base, exp) : 0;
  const baseColor = base === 2 ? "#f97316" : base === 3 ? "#22c55e" : "#a855f7";
  const rockBorder = (store.unlocked_effects?.includes("distortion") && store.rachaGlobal >= 5) ? "#dc2626" : baseColor;

  const playPista = useCallback(async () => {
    if (exp === null) return;
    await playEscaleraOctavas(base, Math.min(exp, 5), audio, instrumento, syncedBPM);
  }, [base, exp, audio, instrumento, syncedBPM]);

  const check = useCallback(async () => {
    if (!input || exp === null) return;
    const resp = parseInt(input);
    const isCorrect = resp === correcto;

    setIntentos((i) => i + 1);

    // HOTFIX: Remove recordAttempt from dependencies to prevent re-render loops
    // Instead, we'll handle store updates directly
    recordError(base.toString(), exp.toString(), isCorrect, "^");

    if (isCorrect) {
      setEstado("correcto");
      setScore((s) => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      triggerPunch(); // Animar la mascota
      resetHints(); // Resetear pistas progresivas
      // resetHintsHook(); // Resetear el hook de pistas - TEMPORARILY DISABLED
      await playEscaleraOctavas(base, exp, audio, instrumento, syncedBPM);
      setStore((prev) => {
        const next = { ...prev };

        next.rachaGlobal = prev.rachaGlobal + 1;
        next.mejorRacha = Math.max(prev.mejorRacha || 0, next.rachaGlobal);

        // Effects unlock
        if (ns >= 5 && !next.unlocked_effects?.includes("distortion")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "distortion"];
          if (setRockActive) setRockActive(true);
          audio.setRockMode(true);
        }
        if (next.mejorRacha >= 30 && !next.unlocked_effects?.includes("reverb")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "reverb"];
        }
        if (next.mejorRacha >= 50 && !next.unlocked_effects?.includes("wahwah")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "wahwah"];
        }

        return next;
      });
    } else {
      setEstado("incorrecto");
      setStreak(0);
      // Trigger error filter for sensory feedback
      audio.triggerErrorFilter(500);
      await audio.playError(instrumento);
      // Clear error filter after 800ms
      const idClear = setTimeout(() => audio.clearErrorFilter(300), 800);
      timeoutsRef.current.push(idClear);
      setStore((prev) => ({ ...prev, rachaGlobal: 0 }));
    }
  }, [input, exp, base, correcto, streak, audio, instrumento, setStore, setRockActive, recordError, triggerPunch]);

  const handleKey = (e) => {
    if (e.key === "Enter") estado === "correcto" ? newQ() : check();
  };

  return (
    <div>
      <InstrumentoIndicator instrumento={instrumento} />
      <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {POTENCIA_NIVELES.map((n) => (
          <button
            key={n.id}
            onClick={() => setNivelSeleccionado(n.id)}
            style={{
              flex: "0 0 auto",
              padding: "clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px)",
              borderRadius: 10,
              border: nivelSeleccionado === n.id ? "2px solid #f97316" : "2px solid #334155",
              background: nivelSeleccionado === n.id ? "#f97316" : "#1e293b",
              color: nivelSeleccionado === n.id ? "#fff" : "#94a3b8",
              fontWeight: 700,
              fontSize: "clamp(8px, 1.5vw, 10px)",
              cursor: "pointer",
              transition: "all .15s",
              minHeight: 40,
              minWidth: 70,
            }}
          >
            <div>{n.label}</div>
            <div style={{ fontSize: "clamp(6px, 1vw, 8px)", opacity: 0.75 }}>{n.desc}</div>
          </button>
        ))}
      </div>

      {nivelSeleccionado < 5 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b" }}>
              Progreso → Nivel {nivelSeleccionado + 1}
            </span>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#f97316" }}>
              {streak}/{5}
            </span>
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${Math.min((streak / 5) * 100, 100)}%` }}
              style={{ height: "100%", background: "#f97316", borderRadius: 3 }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { l: "✅ Correctas", v: score, c: "#22c55e" },
          { l: "📝 Intentos", v: intentos, c: "#64748b" },
          { l: (store.unlocked_effects?.includes("distortion") && streak >= 5) ? "🤘 ROCK" : "🔥 Racha", v: streak, c: (store.unlocked_effects?.includes("distortion") && streak >= 5) ? "#dc2626" : baseColor },
        ].map(({ l, v, c }) => (
          <StatCard key={l} label={l} value={v} color={c} variant={rockActive ? "dark" : "default"} />
        ))}
      </div>

      <LessonPanel mode="powers" />

      {exp !== null && (
        <motion.div
          key={`${base}-${exp}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: rockActive ? "#1f0808" : "#1e293b",
            border: `2px solid ${rockBorder}`,
            borderRadius: 16,
            padding: "clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#64748b", marginBottom: 8 }}>
            ¿Cuánto es esta potencia?
          </div>

          <div style={{ fontSize: "clamp(32px, 10vw, 48px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: 1, lineHeight: 1 }}>
            <span style={{ color: baseColor }}>{base}</span>
            <sup style={{ fontSize: "clamp(16px, 5vw, 24px)", color: rockBorder, marginLeft: 2 }}>{exp}</sup>
          </div>
          <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#64748b", margin: "8px 0 14px" }}>
            "{base} elevado a {exp}"
          </div>

          <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", flexWrap: "wrap", margin: "10px 0 16px" }}>
            {exp === 0 ? (
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: baseColor + "22",
                  border: `1.5px solid ${baseColor}`,
                  color: baseColor,
                  fontWeight: 700,
                  fontSize: "clamp(12px, 2vw, 14px)",
                }}
              >
                cualquier número⁰ = 1
              </div>
            ) : (
              Array.from({ length: exp }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: baseColor + "22",
                      border: `2px solid ${baseColor}`,
                      color: baseColor,
                      fontWeight: 800,
                      fontSize: "clamp(14px, 3vw, 18px)",
                      minWidth: 30,
                      textAlign: "center",
                    }}
                  >
                    {base}
                  </motion.div>
                  {i < exp - 1 && <span style={{ fontSize: "clamp(14px, 3vw, 18px)", color: "#475569", fontWeight: 700 }}>×</span>}
                </div>
              ))
            )}
          </div>

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
                width: 120,
                textAlign: "center",
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 800,
                borderRadius: 10,
                border: `2.5px solid ${estado === "correcto" ? "#22c55e" : estado === "incorrecto" ? "#ef4444" : rockBorder}`,
                padding: "10px 4px",
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
                <div
                  style={{
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: "clamp(14px, 2vw, 17px)",
                    marginBottom: 8,
                  }}
                >
                  {rockActive ? "🤘 ¡ROCK!" : "🎸 ¡Correcto!"} {base}
                  <sup>{exp}</sup> = {correcto}
                  <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "#22c55e88", marginTop: 4 }}>
                    Escucha cómo cada paso duplica la frecuencia (octava)
                  </div>
                </div>
              </motion.div>
            )}
            {estado === "incorrecto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "clamp(11px, 2vw, 13px)", marginBottom: 8 }}>
                  🎵 Escucha nuevamente: {exp === 0 ? "cualquier número elevado a 0 es 1" : `${base}${exp > 1 ? `¹ × ` : ""} = ${Array.from({ length: Math.min(exp, 3) }, () => base).join(" × ")}${exp > 3 ? "..." : ""}`}
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
                    background: rockBorder,
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
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={playPista}
                  style={{
                    background: "transparent",
                    color: rockBorder,
                    border: `2px solid ${rockBorder}`,
                    borderRadius: 10,
                    padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                    fontWeight: 600,
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                    cursor: "pointer",
                    minHeight: 40,
                  }}
                >
                  🎸 Escalera de octavas
                </motion.button>
              </>
            )}
            {estado !== "esperando" && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={newQ}
                style={{
                  background: rockBorder,
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

      <AnimatePresence>
        {rockActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "linear-gradient(90deg,#7f1d1d,#dc2626)",
              borderRadius: 12,
              color: "#fff",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "clamp(11px, 1.5vw, 13px)",
            }}
          >
            🤘 ROCK MODE ACTIVADO — 5 aciertos seguidos
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
