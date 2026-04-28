import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResponsiveBassNeck } from "../components/ResponsiveBassNeck";
import { StatCard } from "../components/StatCard";
import { InstrumentoIndicator } from "../components/InstrumentoIndicator";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import { notaPara, TC } from "../constants/music";

export default function ModoBatalla({ audio, instrumento }) {
  const [vidas, setVidas] = useState(3);
  const [score, setScore] = useState(0);
  const [tabla, setTabla] = useState(2);
  const [factor, setFactor] = useState(null);
  const [input, setInput] = useState("");
  const [estado, setEstado] = useState("esperando");
  const [timeLeft, setTime] = useState(12);
  const [gameOver, setGameOver] = useState(false);
  const [an, setAN] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Hook para mascota interactiva
  const { triggerPunch } = useMascotaContext();

  const allTablas = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const newQ = useCallback(() => {
    setTabla(allTablas[Math.floor(Math.random() * allTablas.length)]);
    setFactor(Math.floor(Math.random() * 10) + 1);
    setInput("");
    setEstado("esperando");
    setTime(12);
  }, []);

  useEffect(() => {
    if (!gameOver) newQ();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || estado !== "esperando") return;
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setVidas((v) => {
            const nv = v - 1;
            if (nv <= 0) {
              setGameOver(true);
              return 0;
            }
            audio.playLoseLife(instrumento);
            setEstado("timeout");
            const id = setTimeout(newQ, 1200);
            timeoutsRef.current.push(id);
            return nv;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [estado, gameOver, newQ, audio, instrumento]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const check = useCallback(async () => {
    if (!input || factor === null || gameOver) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const resp = parseInt(input),
      correct = tabla * factor;
    if (resp === correct) {
      const bonus = Math.ceil(timeLeft / 4);
      setEstado("correcto");
      setScore((s) => s + 1 + bonus);
      triggerPunch(); // Animar la mascota
      const nota = notaPara(tabla, factor);
      setAN(nota.t);

      const s = await audio.getSamplerSync(instrumento);
      const t0 = audio.Tone?.now?.() || 0;
      s.triggerAttackRelease(nota.t, "2n", t0);
      [["G2", "8n"], ["B2", "8n"], ["D3", "8n"], ["G3", "4n"]].forEach(([n, d], i) =>
        s.triggerAttackRelease(n, d, t0 + 0.3 + i * 0.18)
      );

      const id1 = setTimeout(() => setAN(null), 900);
      const id2 = setTimeout(newQ, 900);
      timeoutsRef.current.push(id1, id2);
    } else {
      setEstado("incorrecto");
      setVidas((v) => {
        const nv = v - 1;
        if (nv <= 0) {
          setGameOver(true);
          audio.playLoseLife(instrumento);
          return 0;
        }
        audio.playLoseLife(instrumento);
        const id = setTimeout(newQ, 1200);
        timeoutsRef.current.push(id);
        return nv;
      });
    }
  }, [input, factor, tabla, gameOver, timeLeft, newQ, audio, instrumento]);

  const handleKey = (e) => {
    if (e.key === "Enter") check();
  };
  useEffect(() => {
    if (!gameOver && estado === "esperando") inputRef.current?.focus();
  }, [estado, factor, gameOver]);

  const resetGame = () => {
    setVidas(3);
    setScore(0);
    setGameOver(false);
    setEstado("esperando");
  };

  const c = TC[tabla] || "#f97316";
  const timerColor = timeLeft > 7 ? "#22c55e" : timeLeft > 4 ? "#f97316" : "#ef4444";

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#1e293b",
          borderRadius: 16,
        }}
      >
        <div style={{ fontSize: "clamp(36px, 10vw, 52px)" }}>🔋</div>
        <h2 style={{ color: "#f97316", fontSize: "clamp(18px, 4vw, 22px)", margin: "8px 0" }}>
          Batería agotada
        </h2>
        <p style={{ color: "#94a3b8", margin: "0 0 6px", fontSize: "clamp(12px, 2vw, 14px)" }}>
          Sesión finalizada
        </p>
        <p style={{ color: "#94a3b8", margin: "0 0 6px", fontSize: "clamp(12px, 2vw, 14px)" }}>
          Puntuación: <strong style={{ color: "#f97316", fontSize: "clamp(20px, 5vw, 28px)" }}>{score}</strong>
        </p>
        {score > 0 && (
          <p style={{ color: "#64748b", fontSize: "clamp(10px, 1.5vw, 12px)", margin: "0 0 20px" }}>
            Cada segundo restante suma puntos extra
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          style={{
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "clamp(10px, 2vw, 12px) clamp(20px, 3vw, 28px)",
            fontWeight: 700,
            fontSize: "clamp(13px, 2vw, 15px)",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Recargar y jugar
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div>
      <InstrumentoIndicator instrumento={instrumento} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "stretch", flexWrap: "wrap" }}>
        <div style={{ flex: 1, background: "#1e293b", border: "1.5px solid #334155", borderRadius: 12, padding: "8px 10px", textAlign: "center", minWidth: 70 }}>
          <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b", marginBottom: 2 }}>Vidas</div>
          <div style={{ fontSize: "clamp(16px, 4vw, 20px)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < vidas ? 1 : 0.2 }}>
                ❤️
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "#1e293b",
            border: `1.5px solid ${timerColor}`,
            borderRadius: 12,
            padding: "8px 10px",
            textAlign: "center",
            minWidth: 70,
          }}
        >
          <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b", marginBottom: 2 }}>Tiempo</div>
          <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 800, color: timerColor }}>
            {timeLeft}s
          </div>
        </div>
        <div style={{ flex: 1, background: "#1e293b", border: "1.5px solid #334155", borderRadius: 12, padding: "8px 10px", textAlign: "center", minWidth: 70 }}>
          <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b", marginBottom: 2 }}>Puntos</div>
          <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 800, color: "#f97316" }}>
            {score}
          </div>
        </div>
      </div>

      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
        <motion.div
          animate={{ width: `${(timeLeft / 12) * 100}%`, background: timerColor }}
          style={{ height: "100%", borderRadius: 3, transition: "width 1s linear,background .3s" }}
        />
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

      {factor !== null && (
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
            Responde antes de que se acabe el tiempo
          </div>
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: 2 }}>
            <span style={{ color: c }}>{tabla}</span>
            <span style={{ color: "#475569", margin: "0 8px" }}>×</span>
            <span style={{ color: c }}>{factor}</span>
            <span style={{ color: "#475569", margin: "0 10px" }}>=</span>
            <span style={{ color: "#475569" }}>?</span>
          </div>
          <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "#475569", marginTop: 4 }}>
            +{Math.ceil(timeLeft / 4)} pts bonus
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", margin: "12px 0", flexWrap: "wrap" }}>
            <input
              ref={inputRef}
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={estado !== "esperando"}
              placeholder="?"
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
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "clamp(14px, 2vw, 16px)", marginBottom: 8 }}>
                  🎸 ¡Correcto!
                </div>
              </motion.div>
            )}
            {estado === "incorrecto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "clamp(11px, 1.5vw, 13px)", marginBottom: 8 }}>
                  Era {tabla * factor}
                </div>
              </motion.div>
            )}
            {estado === "timeout" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ color: "#f97316", fontWeight: 600, fontSize: "clamp(11px, 1.5vw, 13px)", marginBottom: 8 }}>
                  ¡Tiempo! Era {tabla * factor}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              Responder ✓
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
