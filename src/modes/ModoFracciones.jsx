import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { LessonPanel } from "../components/LessonPanel";
import { InstrumentoIndicator } from "../components/InstrumentoIndicator";
import { useWeightedSampling } from "../hooks/useWeightedSampling";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMascotaContext } from "../contexts/MascotaFocaContext";

const NIVELES_FRACCIONES = [
  { id: 1, label: "Nivel 1", desc: "Denominadores 2-4" },
  { id: 2, label: "Nivel 2", desc: "Denominadores 2-6" },
  { id: 3, label: "Nivel 3", desc: "Denominadores 2-8" },
  { id: 4, label: "Nivel 4", desc: "Denominadores 2-10" },
  { id: 5, label: "Nivel 5", desc: "Denominadores 2-12" },
];

const ACIERTOS_PARA_SUBIR = 5;

// Simplificar fracción
const simplificarFraccion = (num, den) => {
  if (den === 0) return { num, den };
  let mcd = (a, b) => (b === 0 ? a : mcd(b, a % b));
  const divisor = mcd(Math.abs(num), Math.abs(den));
  return { num: num / divisor, den: den / divisor };
};

export default function ModoFracciones({ store, setStore, audio, instrumento, setRockActive, rockActive }) {
  const [nivelSeleccionado, setNivelSeleccionado] = useState(store.nivel || 1);
  const [num1, setNum1] = useState(null);
  const [den1, setDen1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [den2, setDen2] = useState(null);
  const [operacion, setOperacion] = useState("+");
  const [inputNum, setInputNum] = useState("");
  const [inputDen, setInputDen] = useState("");
  const [estado, setEstado] = useState("esperando");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const inputNumRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionRef = useRef({ correctas: 0, intentos: 0 });
  const cfg = NIVELES_FRACCIONES[nivelSeleccionado - 1];

  const c = "#ec4899"; // Rosa para Fracciones

  const { getWeightedProblem, recordAttempt } = useWeightedSampling(store);
  const { recordError } = useLocalStorage();
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
    const maxDen = cfg.desc.includes("12") ? 12 : cfg.desc.includes("10") ? 10 : cfg.desc.includes("8") ? 8 : cfg.desc.includes("6") ? 6 : 4;
    const operaciones = ["+", "-", "×", "÷"];
    const op = operaciones[Math.floor(Math.random() * operaciones.length)];

    const n1 = Math.floor(Math.random() * maxDen) + 1;
    const d1 = Math.floor(Math.random() * (maxDen - 1)) + 2;
    const n2 = Math.floor(Math.random() * maxDen) + 1;
    const d2 = Math.floor(Math.random() * (maxDen - 1)) + 2;

    setNum1(n1);
    setDen1(d1);
    setNum2(n2);
    setDen2(d2);
    setOperacion(op);
    setInputNum("");
    setInputDen("");
    setEstado("esperando");
  }, [cfg]);

  useEffect(() => {
    newQ();
  }, [nivelSeleccionado, newQ]);

  useEffect(() => {
    if (estado === "esperando") inputNumRef.current?.focus();
  }, [estado, num1]);

  const calcularRespuesta = useCallback(() => {
    if (!num1 || !den1 || !num2 || !den2) return null;

    let resNum, resDen;

    if (operacion === "+") {
      resNum = num1 * den2 + num2 * den1;
      resDen = den1 * den2;
    } else if (operacion === "-") {
      resNum = num1 * den2 - num2 * den1;
      resDen = den1 * den2;
    } else if (operacion === "×") {
      resNum = num1 * num2;
      resDen = den1 * den2;
    } else if (operacion === "÷") {
      resNum = num1 * den2;
      resDen = den1 * num2;
    }

    return simplificarFraccion(resNum, resDen);
  }, [num1, den1, num2, den2, operacion]);

  const respuesta = calcularRespuesta();
  const progreso = Math.min((streak / ACIERTOS_PARA_SUBIR) * 100, 100);

  const check = useCallback(async () => {
    if (!inputNum || !inputDen || !respuesta) return;

    const userNum = parseInt(inputNum);
    const userDen = parseInt(inputDen);
    const isCorrect = userNum === respuesta.num && userDen === respuesta.den;

    setIntentos((i) => i + 1);
    sessionRef.current.intentos++;

    const recordKey = `${num1}/${den1}${operacion}${num2}/${den2}`;
    const updatedStoreFromRecord = recordAttempt("fractions", num1, den1, isCorrect);
    recordError(recordKey, "", isCorrect, operacion);

    if (isCorrect) {
      setEstado("correcto");
      setScore((s) => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      sessionRef.current.correctas++;
      triggerPunch();

      setStore((prev) => {
        const next = {
          ...updatedStoreFromRecord,
          rachaGlobal: prev.rachaGlobal + 1,
          mejorRacha: Math.max(prev.mejorRacha, prev.rachaGlobal + 1),
        };

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
      // Trigger error filter for sensory feedback
      audio.triggerErrorFilter(500);
      await audio.playError(instrumento);
      // Clear error filter after 800ms
      const idClear = setTimeout(() => audio.clearErrorFilter(300), 800);
      timeoutsRef.current.push(idClear);
      setStore((prev) => ({ ...updatedStoreFromRecord, rachaGlobal: 0 }));
    }
  }, [inputNum, inputDen, respuesta, num1, den1, num2, den2, operacion, streak, audio, instrumento, setStore, setRockActive, recordAttempt]);

  const handleKey = (e) => {
    if (e.key === "Enter") estado === "correcto" ? newQ() : check();
  };

  return (
    <div>
      <InstrumentoIndicator instrumento={instrumento} />
      <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        {NIVELES_FRACCIONES.map((n) => (
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

      <LessonPanel mode="fractions" />

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
              {NIVELES_FRACCIONES[store.nivel - 1].desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {num1 !== null && respuesta && !levelUpMsg && (
        <motion.div
          key={`${num1}/${den1}${operacion}${num2}/${den2}`}
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
          <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#64748b", marginBottom: 8 }}>
            ¿Cuál es el resultado?
          </div>

          <div style={{ fontSize: "clamp(24px, 8vw, 40px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: 1, lineHeight: 1.2, marginBottom: 12 }}>
            <span style={{ display: "inline-block", margin: "0 6px" }}>
              <span style={{ color: c }}>{num1}</span>
              <div style={{ borderTop: `2px solid ${c}`, margin: "4px 0", minWidth: "30px" }}>
                <span style={{ color: c }}>{den1}</span>
              </div>
            </span>
            <span style={{ color: "#475569", margin: "0 8px", verticalAlign: "middle" }}>
              {operacion === "÷" ? "÷" : operacion === "×" ? "×" : operacion === "-" ? "−" : "+"}
            </span>
            <span style={{ display: "inline-block", margin: "0 6px" }}>
              <span style={{ color: c }}>{num2}</span>
              <div style={{ borderTop: `2px solid ${c}`, margin: "4px 0", minWidth: "30px" }}>
                <span style={{ color: c }}>{den2}</span>
              </div>
            </span>
            <span style={{ color: "#475569", margin: "0 8px", verticalAlign: "middle" }}>=</span>
            <span style={{ color: "#475569" }}>?</span>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <input
                ref={inputNumRef}
                type="number"
                value={inputNum}
                onChange={(e) => setInputNum(e.target.value)}
                onKeyDown={handleKey}
                disabled={estado !== "esperando"}
                placeholder="Num"
                autoFocus
                style={{
                  width: 70,
                  textAlign: "center",
                  fontSize: "clamp(16px, 4vw, 20px)",
                  fontWeight: 800,
                  borderRadius: 8,
                  border: `2.5px solid ${estado === "correcto" ? "#22c55e" : estado === "incorrecto" ? "#ef4444" : c}`,
                  padding: "8px",
                  outline: "none",
                  color: "#1f2937",
                  background: "#fff",
                  minHeight: 40,
                }}
              />
              <div style={{ borderTop: `2px solid ${c}`, width: "60px" }}></div>
              <input
                type="number"
                value={inputDen}
                onChange={(e) => setInputDen(e.target.value)}
                onKeyDown={handleKey}
                disabled={estado !== "esperando"}
                placeholder="Den"
                style={{
                  width: 70,
                  textAlign: "center",
                  fontSize: "clamp(16px, 4vw, 20px)",
                  fontWeight: 800,
                  borderRadius: 8,
                  border: `2.5px solid ${estado === "correcto" ? "#22c55e" : estado === "incorrecto" ? "#ef4444" : c}`,
                  padding: "8px",
                  outline: "none",
                  color: "#1f2937",
                  background: "#fff",
                  minHeight: 40,
                }}
              />
            </div>
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
                  🎸 ¡Correcto!
                </div>
              </motion.div>
            )}
            {estado === "incorrecto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "clamp(11px, 2vw, 13px)", marginBottom: 8 }}>
                  🎵 Incorrecto. La respuesta es {respuesta.num}/{respuesta.den}
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
            {estado !== "esperando" && (
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
