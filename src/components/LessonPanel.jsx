import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LESSONS = {
  multiplication: [
    {
      title: "¿Qué es multiplicación?",
      content: "Multiplicación es contar grupos iguales. Si tienes 3 grupos de 4 elementos, tienes 3 × 4 = 12 elementos en total.",
      example: "3 × 4 = 4 + 4 + 4 = 12",
    },
    {
      title: "Propiedad Conmutativa",
      content: "El orden no importa: 3 × 4 = 4 × 3 = 12. Puedes reorganizar los grupos.",
      example: "4 × 3 = 3 + 3 + 3 + 3 = 12",
    },
  ],
  division: [
    {
      title: "¿Qué es división?",
      content: "División es repartir en grupos iguales. Si tienes 12 elementos y quieres 3 grupos iguales, cada grupo tiene 12 ÷ 3 = 4 elementos.",
      example: "12 ÷ 3 = 4 (tres grupos de 4)",
    },
    {
      title: "División y Multiplicación",
      content: "División es lo opuesto a multiplicación. Si 3 × 4 = 12, entonces 12 ÷ 3 = 4 y 12 ÷ 4 = 3.",
      example: "12 ÷ 3 = 4, porque 3 × 4 = 12",
    },
  ],
  powers: [
    {
      title: "¿Qué es una potencia?",
      content: "Una potencia es una multiplicación repetida. 2³ significa 2 × 2 × 2 = 8. El número pequeño arriba se llama exponente.",
      example: "2³ = 2 × 2 × 2 = 8",
    },
    {
      title: "Exponentes Especiales",
      content: "Cualquier número elevado a 0 es 1. Por ejemplo: 5⁰ = 1, 100⁰ = 1. Y cualquier número elevado a 1 es él mismo.",
      example: "7¹ = 7, 7⁰ = 1",
    },
  ],
};

export function LessonPanel({ mode = "multiplication" }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const lessons = LESSONS[mode] || [];
  const currentLesson = lessons[lessonIdx] || lessons[0];

  if (!isOpen) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%",
          padding: "10px",
          background: "#1e293b",
          border: "1.5px dashed #475569",
          borderRadius: 10,
          color: "#94a3b8",
          fontWeight: 700,
          fontSize: "clamp(11px, 1.5vw, 12px)",
          cursor: "pointer",
          transition: "all .15s",
          marginBottom: 12,
        }}
        onMouseEnter={(e) => { e.target.style.borderColor = "#94a3b8"; }}
        onMouseLeave={(e) => { e.target.style.borderColor = "#475569"; }}
      >
        📖 Ver Lección
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            background: "#1e293b",
            border: "1.5px solid #334155",
            borderRadius: 12,
            padding: "clamp(12px, 2vw, 16px)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
            {currentLesson.title}
          </div>

          <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: "#cbd5e1", lineHeight: 1.5, marginBottom: 8 }}>
            {currentLesson.content}
          </div>

          <div
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px",
              fontSize: "clamp(11px, 1.5vw, 12px)",
              fontFamily: "monospace",
              color: "#22c55e",
              marginBottom: 12,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {currentLesson.example}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {lessons.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setLessonIdx(idx)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: lessonIdx === idx ? "#f97316" : "#334155",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "100%",
              marginTop: 10,
              padding: "8px",
              background: "transparent",
              border: "1.5px solid #475569",
              borderRadius: 8,
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "clamp(10px, 1.5vw, 11px)",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            Cerrar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
