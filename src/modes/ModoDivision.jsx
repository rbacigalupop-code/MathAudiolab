import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { BeatSlicerVisualizer } from "../components/BeatSlicerVisualizer";
import { LessonPanel } from "../components/LessonPanel";
import { InstrumentoIndicator } from "../components/InstrumentoIndicator";
import { useWeightedSampling } from "../hooks/useWeightedSampling";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMascotaContext } from "../contexts/MascotaFocaContext";

const ACIERTOS_PARA_SUBIR = 5;
const NIVELES_DIVISION = [
  { id: 1, label: "Nivel 1", desc: "Dividendos 6-12, divisores 2-3", minDiv: 6, maxDiv: 12, minDsr: 2, maxDsr: 3 },
  { id: 2, label: "Nivel 2", desc: "Dividendos 12-20, divisores 2-5", minDiv: 12, maxDiv: 20, minDsr: 2, maxDsr: 5 },
  { id: 3, label: "Nivel 3", desc: "Dividendos 20-50, divisores 2-7", minDiv: 20, maxDiv: 50, minDsr: 2, maxDsr: 7 },
  { id: 4, label: "Nivel 4", desc: "Dividendos 50-100, divisores 2-10", minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
  { id: 5, label: "Nivel 5", desc: "Dividendos 50-100 (con residuo), divisores 2-10", minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
];

function generateDivisionProblem(nivel) {
  const cfg = NIVELES_DIVISION[nivel - 1];
  const divisor = Math.floor(Math.random() * (cfg.maxDsr - cfg.minDsr + 1)) + cfg.minDsr;

  // Generate random divisor, then random result, then calculate exact dividend
  const resultado = Math.floor(Math.random() * (cfg.maxDiv - cfg.minDiv + 1)) + cfg.minDiv;
  const dividendo = resultado * divisor;

  return { dividendo, divisor, respuestaEsperada: resultado };
}

export default function ModoDivision({ store, setStore, audio, instrumento, setRockActive, rockActive }) {
  const [nivelSeleccionado, setNivelSeleccionado] = useState(store.nivel || 1);
  const [dividendo, setDividendo] = useState(null);
  const [divisor, setDivisor] = useState(null);
  const [respuestaEsperada, setRespuestaEsperada] = useState(null);
  const [input, setInput] = useState("");
  const [estado, setEstado] = useState("esperando");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionRef = useRef({ correctas: 0, intentos: 0 });

  const c = "#3b82f6"; // Azul para División

  // Hook para muestreo ponderado (70% weak points, 30% nuevo)
  const { getWeightedProblem, recordAttempt } = useWeightedSampling(store);

  // Acceder a recordError del hook de storage
  const { recordError } = useLocalStorage();

  // Hook para mascota interactiva
  const { triggerPunch } = useMascotaContext();

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

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
  }, [nivelSeleccionado, setStore]);

  const newQ = useCallback(() => {
    // Intentar obtener una división ponderada (70% weak points, 30% nuevo)
    const weighted = getWeightedProblem("division");
    let dividendo, divisor, respuestaEsperada;

    if (weighted) {
      // Parsear "12÷3" → dividendo=12, divisor=3, respuesta=4
      const parts = weighted.split("÷");
      dividendo = parseInt(parts[0], 10);
      divisor = parseInt(parts[1], 10);
      respuestaEsperada = Math.floor(dividendo / divisor);
    } else {
      // Generar nueva división aleatoria
      const cfg = NIVELES_DIVISION[nivelSeleccionado - 1];
      const newDivisor = Math.floor(Math.random() * (cfg.maxDsr - cfg.minDsr + 1)) + cfg.minDsr;
      const resultado = Math.floor(Math.random() * (cfg.maxDiv - cfg.minDiv + 1)) + cfg.minDiv;
      dividendo = resultado * newDivisor;
      divisor = newDivisor;
      respuestaEsperada = resultado;
    }

    setDividendo(dividendo);
    setDivisor(divisor);
    setRespuestaEsperada(respuestaEsperada);
    setInput("");
    setEstado("esperando");
  }, [nivelSeleccionado, getWeightedProblem]);

  useEffect(() => {
    newQ();
  }, [nivelSeleccionado, newQ]);

  const check = useCallback(async () => {
    if (!input || divisor === null || respuestaEsperada === null) return;
    const resp = parseInt(input);
    const isCorrect = resp === respuestaEsperada;

    setIntentos((i) => i + 1);
    sessionRef.current.intentos++;

    // Registrar intento granular (dividendo ÷ divisor) en weak_points (OLD SYSTEM)
    const updatedStoreFromRecord = recordAttempt("division", dividendo, divisor, isCorrect);

    // Registrar en el nuevo errorLog (NEW SYSTEM - Pilar 1)
    recordError(dividendo.toString(), divisor.toString(), isCorrect, "÷");

    if (isCorrect) {
      setEstado("correcto");
      setScore((s) => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      sessionRef.current.correctas++;
      triggerPunch(); // Animar la mascota

      await audio.playDivisionSuccess(instrumento, divisor, respuestaEsperada);

      setStore((prev) => {
        const next = { ...updatedStoreFromRecord, rachaGlobal: prev.rachaGlobal + 1, mejorRacha: Math.max(prev.mejorRacha, prev.rachaGlobal + 1) };

        // Effects unlock
        if (ns >= 5 && !next.unlocked_effects?.includes("distortion")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "distortion"];
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

        // Effects unlock
        if (ns >= 5 && !next.unlocked_effects?.includes("distortion")) {
          next.unlocked_effects = [...(next.unlocked_effects || []), "distortion"];
          if (setRockActive) setRockActive(true);
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
      setStore((prev) => ({ ...updatedStoreFromRecord, rachaGlobal: 0 }));
    }
  }, [input, divisor, respuestaEsperada, dividendo, streak, audio, instrumento, setStore, setRockActive, recordAttempt]);

  const handleKey = (e) => {
    if (e.key === "Enter") estado === "correcto" ? newQ() : check();
  };

  useEffect(() => {
    if (estado === "esperando") inputRef.current?.focus();
  }, [estado, dividendo]);

  const progreso = Math.min((streak / ACIERTOS_PARA_SUBIR) * 100, 100);

  return (
    <div>
      <InstrumentoIndicator instrumento={instrumento} />
      <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {NIVELES_DIVISION.map((n) => (
          <button
            key={n.id}
            onClick={() => setNivelSeleccionado(n.id)}
            style={{
              flex: "0 0 auto",
              padding: "clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px)",
              borderRadius: 10,
              border: nivelSeleccionado === n.id ? `2px solid ${c}` : "2px solid #334155",
              background: nivelSeleccionado === n.id ? c : "#1e293b",
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
            <div style={{ fontSize: "clamp(6px, 1vw, 8px)", opacity: 0.75 }}>{n.desc.split(",")[0]}</div>
          </button>
        ))}
      </div>

      {nivelSeleccionado < 5 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b" }}>
              Progreso → Nivel {nivelSeleccionado + 1}
            </span>
            <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: c }}>
              {streak}/{ACIERTOS_PARA_SUBIR}
            </span>
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progreso}%` }}
              style={{ height: "100%", background: c, borderRadius: 3 }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { l: "✅ Correctas", v: score, c: "#22c55e" },
          { l: "📝 Intentos", v: intentos, c: "#64748b" },
          { l: "🔥 Racha", v: streak, c },
        ].map(({ l, v, c: col }) => (
          <StatCard key={l} label={l} value={v} color={col} />
        ))}
      </div>

      <LessonPanel mode="division" />

      <AnimatePresence>
        {levelUpMsg && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{
              textAlign: "center",
              padding: "16px",
              background: c,
              borderRadius: 14,
              margin: "12px 0",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 900 }}>
              🎸 ¡Subiste al Nivel {store.nivel}!
            </div>
            <div style={{ fontSize: "clamp(11px, 2vw, 13px)", opacity: 0.85 }}>
              {NIVELES_DIVISION[store.nivel - 1].desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dividendo !== null && divisor !== null && !levelUpMsg && (
        <motion.div
          key={`${dividendo}÷${divisor}`}
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
            <span style={{ color: c }}>{dividendo}</span>
            <span style={{ color: "#475569", margin: "0 8px" }}>÷</span>
            <span style={{ color: c }}>{divisor}</span>
            <span style={{ color: "#475569", margin: "0 10px" }}>=</span>
            <span style={{ color: "#475569" }}>?</span>
          </div>

          {/* Beat Slicer Visualization - shows rhythm-based division */}
          <BeatSlicerVisualizer
            dividendo={dividendo}
            divisor={divisor}
            bpm={120}
            accentColor={c}
          />

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
                boxShadow: estado === "esperando" ? `0 0 0 3px ${c}33` : "none",
                transition: "all .2s",
              }}
            />
          </div>

          <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b", marginTop: 6, minHeight: 16 }}>
            {estado === "esperando" ? "¿Cuántos elementos en cada grupo? Presiona Enter ↵" : estado === "correcto" ? "¡Distribuido perfectamente! Presiona Enter" : ""}
          </div>

          <AnimatePresence>
            {estado === "correcto" && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "clamp(14px, 2vw, 17px)", marginBottom: 8 }}>
                  🎸 ¡Correcto! {dividendo} ÷ {divisor} = {respuestaEsperada}
                </div>
              </motion.div>
            )}
            {estado === "incorrecto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "clamp(11px, 2vw, 13px)", marginBottom: 8 }}>
                  📊 Reajustando grupos — escucha: {divisor} partes iguales
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {estado === "esperando" && (
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
