import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBPMSync } from "../hooks/useBPMSync";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import { StatCard } from "../components/StatCard";

/**
 * Modo de Lecciones Inmersivas con sincronización BPM
 * Integra YouTube + Tone.js + Ejercicios matemáticos
 */
export default function ModoLecciones({ lessonData, store, setStore, audio, setRockActive }) {
  const [estado, setEstado] = useState("esperando");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [operacionActual, setOperacionActual] = useState(null);
  const [respuestaEsperada, setRespuestaEsperada] = useState(null);
  const inputRef = useRef(null);
  const iframeRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionRef = useRef({ correctas: 0, intentos: 0 });

  const { recordError } = useLocalStorage();
  const { triggerPunch } = useMascotaContext();

  // Colores por materia
  const coloresPorMateria = {
    Potencias: "#a855f7",
    División: "#3b82f6",
    Multiplicación: "#f97316",
  };

  const colorActual = coloresPorMateria[lessonData.materia] || "#f97316";

  /**
   * Generar operación aleatoria según el tipo de lección
   */
  const generarOperacion = useCallback(() => {
    let op1, op2, respuesta, simbolo;

    if (lessonData.materia === "Potencias") {
      op1 = Math.floor(Math.random() * (lessonData.rango.maxBase - lessonData.rango.minBase + 1)) + lessonData.rango.minBase;
      op2 = Math.floor(Math.random() * (lessonData.rango.maxExp - lessonData.rango.minExp + 1)) + lessonData.rango.minExp;
      respuesta = Math.pow(op1, op2);
      simbolo = "^";
    } else if (lessonData.materia === "División") {
      op2 = Math.floor(Math.random() * (lessonData.rango.maxDivisor - lessonData.rango.minDivisor + 1)) + lessonData.rango.minDivisor;
      respuesta = Math.floor(Math.random() * (lessonData.rango.maxDividendo - lessonData.rango.minDividendo + 1)) + lessonData.rango.minDividendo;
      op1 = respuesta * op2;
      simbolo = "÷";
    } else {
      // Multiplicación
      op1 = Math.floor(Math.random() * (lessonData.rango.maxFactor1 - lessonData.rango.minFactor1 + 1)) + lessonData.rango.minFactor1;
      op2 = Math.floor(Math.random() * (lessonData.rango.maxFactor2 - lessonData.rango.minFactor2 + 1)) + lessonData.rango.minFactor2;
      respuesta = op1 * op2;
      simbolo = "×";
    }

    setOperacionActual({ op1, op2, simbolo });
    setRespuestaEsperada(respuesta);
    setInput("");
    setEstado("esperando");

    // Auto-focus
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [lessonData]);

  /**
   * Validar respuesta y aplicar feedback sensorial
   */
  const check = useCallback(async () => {
    if (!input || respuestaEsperada === null) return;
    const respuesta = parseInt(input);
    const isCorrect = respuesta === respuestaEsperada;

    sessionRef.current.intentos++;

    if (isCorrect) {
      setEstado("correcto");
      setScore((s) => s + 1);
      const ns = streak + 1;
      setStreak(ns);
      sessionRef.current.correctas++;
      triggerPunch();

      // Registrar en errorLog
      recordError(
        operacionActual.op1.toString(),
        operacionActual.op2.toString(),
        true,
        operacionActual.simbolo,
        lessonData.banda.nombre
      );

      // Limpiar filtro de error (el audio vuelve a la normalidad)
      // Este callback vendrá del hook useBPMSync

      // Esperar antes de siguiente pregunta
      const id = setTimeout(() => generarOperacion(), 1500);
      timeoutsRef.current.push(id);

      // Actualizar racha global
      setStore((prev) => ({
        ...prev,
        rachaGlobal: prev.rachaGlobal + 1,
        mejorRacha: Math.max(prev.mejorRacha, prev.rachaGlobal + 1),
      }));
    } else {
      setEstado("incorrecto");
      setStreak(0);

      // Registrar error
      recordError(
        operacionActual.op1.toString(),
        operacionActual.op2.toString(),
        false,
        operacionActual.simbolo,
        lessonData.banda.nombre
      );

      // Aquí se aplicaría el efecto sensorial de error
      // triggerError(iframeRef.current)

      await audio.playError("piano");

      setStore((prev) => ({ ...prev, rachaGlobal: 0 }));

      const id = setTimeout(() => generarOperacion(), 2000);
      timeoutsRef.current.push(id);
    }
  }, [input, respuestaEsperada, operacionActual, audio, setStore, recordError, triggerPunch, generarOperacion]);

  /**
   * Callbacks para sincronización BPM
   */
  const onBlockStart = useCallback(() => {
    generarOperacion();
  }, [generarOperacion]);

  const onBeatTick = useCallback((time, beatDuration) => {
    // Aquí se podría agregar un tick visual del metrónomo
  }, []);

  // Hook de sincronización
  useBPMSync(
    lessonData.cancion.bpm,
    lessonData.compasesPorBloque,
    onBeatTick,
    onBlockStart,
    true
  );

  // Cleanup
  useEffect(() => {
    generarOperacion();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      const s = sessionRef.current;
      if (s.intentos > 0) {
        const today = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
        setStore((prev) => ({
          ...prev,
          sesiones: [...prev.sesiones, { fecha: today, correctas: s.correctas, intentos: s.intentos }].slice(-30),
        }));
      }
    };
  }, [lessonData, generarOperacion, setStore]);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      estado === "correcto" ? generarOperacion() : check();
    }
  };

  if (!operacionActual) return null;

  return (
    <div style={{ padding: "16px", maxWidth: "620px", margin: "0 auto" }}>
      {/* Encabezado de Lección */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: `${colorActual}15`,
          border: `2px solid ${colorActual}`,
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 700, color: colorActual, marginBottom: 4 }}>
          {lessonData.banda.imagen} {lessonData.banda.nombre}
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          {lessonData.cancion.titulo} • {lessonData.cancion.bpm} BPM
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: 8 }}>
          "{lessonData.pedagogia}"
        </div>
      </motion.div>

      {/* Reproductor de YouTube (Minimizado) */}
      <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", height: "120px" }}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${lessonData.cancion.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ display: "block" }}
        />
      </div>

      {/* Estadísticas */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="✅ Correctas" value={score} color={colorActual} />
        <StatCard label="🔥 Racha" value={streak} color={colorActual} />
      </div>

      {/* Pregunta Matemática */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        key={`${operacionActual.op1}${operacionActual.simbolo}${operacionActual.op2}`}
        style={{
          background: "#1e293b",
          border: `2px solid ${colorActual}`,
          borderRadius: 12,
          padding: "20px",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "32px", fontWeight: 900, color: colorActual, marginBottom: 12 }}>
          {operacionActual.op1} {operacionActual.simbolo} {operacionActual.op2} = ?
        </div>

        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tu respuesta..."
          autoFocus
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: `2px solid ${colorActual}`,
            background: "#0f172a",
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 12,
          }}
        />

        <button
          onClick={() => (estado === "correcto" ? generarOperacion() : check())}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "none",
            background: colorActual,
            color: "#fff",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          {estado === "correcto" ? "✓ Siguiente" : "Enviar"}
        </button>
      </motion.div>

      {/* Feedback Visual */}
      <AnimatePresence>
        {estado === "incorrecto" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              background: "#dc262615",
              border: "2px solid #dc2626",
              borderRadius: 8,
              padding: "12px",
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            ❌ Incorrecto. La respuesta es {respuestaEsperada}. Intenta de nuevo.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
