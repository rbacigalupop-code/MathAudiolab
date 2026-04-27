import { useState } from "react";

const educationalManual = [
  {
    id: "L01",
    materia: "Multiplicación",
    titulo: "Tabla del 7 con Seven Nation Army",
    ejemploMusical: "Rock — White Stripes",
    descripcion: "El riff principal tiene 7 notas que se repiten.",
    config: { modo: "ejercicios", nivel: 4, tabla: 7, instrumento: "bass-electric" },
  },
  {
    id: "L02",
    materia: "Multiplicación",
    titulo: "Tabla del 4 con ritmo Pop",
    ejemploMusical: "Pop — 4/4",
    descripcion: "La tabla del 4 es contar grupos de 4 beats.",
    config: { modo: "ejercicios", nivel: 2, tabla: 4, instrumento: "piano" },
  },
];

export default function LessonReader({ onLoadConfig }) {
  const [activeId, setActiveId] = useState(null);
  const active = educationalManual.find((l) => l.id === activeId);

  const materias = [...new Set(educationalManual.map((l) => l.materia))];
  const [filtro, setFiltro] = useState("Todas");
  const lecciones = filtro === "Todas" ? educationalManual : educationalManual.filter((l) => l.materia === filtro);

  return (
    <div style={{ background: "#1e293b", borderRadius: 16, padding: 16, border: "1.5px solid #334155" }}>
      <h2 style={{ color: "#f97316", fontSize: "clamp(13px, 3vw, 15px)", fontWeight: 800, margin: "0 0 12px" }}>
        📚 Manual educativo
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
        {["Todas", ...materias].map((m) => (
          <button
            key={m}
            onClick={() => setFiltro(m)}
            style={{
              padding: "5px 12px",
              borderRadius: 18,
              border: filtro === m ? "1.5px solid #f97316" : "1.5px solid #334155",
              background: filtro === m ? "#f9731622" : "transparent",
              color: filtro === m ? "#f97316" : "#94a3b8",
              fontWeight: 700,
              fontSize: "clamp(9px, 1.5vw, 11px)",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Lista de lecciones */}
      {!active && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {lecciones.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveId(l.id)}
              style={{
                textAlign: "left",
                background: "#0f172a",
                border: "1.5px solid #334155",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div style={{ fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>
                {l.titulo}
              </div>
              <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#94a3b8" }}>
                <span style={{ color: "#f97316" }}>{l.materia}</span> · {l.ejemploMusical}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detalle */}
      {active && (
        <div>
          <button
            onClick={() => setActiveId(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "clamp(9px, 1.5vw, 11px)",
              cursor: "pointer",
              padding: 0,
              marginBottom: 10,
            }}
          >
            ← Volver
          </button>
          <div style={{ background: "#0f172a", borderRadius: 12, padding: 14, border: "1.5px solid #334155" }}>
            <h3 style={{ color: "#f1f5f9", fontSize: "clamp(13px, 3vw, 15px)", fontWeight: 800, margin: "0 0 8px" }}>
              {active.titulo}
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "clamp(11px, 2vw, 13px)", lineHeight: 1.5, margin: "0 0 14px" }}>
              {active.descripcion}
            </p>
            <button
              onClick={() => onLoadConfig(active.config)}
              style={{
                width: "100%",
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px",
                fontWeight: 700,
                fontSize: "clamp(11px, 2vw, 13px)",
                cursor: "pointer",
                minHeight: 40,
              }}
            >
              ▶ Practicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
