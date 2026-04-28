import { motion, AnimatePresence } from "framer-motion";

/**
 * Selector de lecciones inmersivas
 * Muestra las lecciones disponibles para el perfil del usuario
 */
export function LessonSelector({ lecciones, onSelect, profile }) {
  if (!lecciones || lecciones.length === 0) {
    return (
      <div
        style={{
          background: "#1e293b",
          border: "2px solid #475569",
          borderRadius: 12,
          padding: "20px",
          textAlign: "center",
          color: "#94a3b8",
        }}
      >
        <p>No hay lecciones disponibles para tu perfil.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#f97316",
          marginBottom: 4,
        }}
      >
        🎸 Lecciones Inmersivas Disponibles
      </div>

      {lecciones.map((leccion) => (
        <motion.button
          key={leccion.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(leccion)}
          style={{
            padding: "16px",
            borderRadius: 10,
            border: "2px solid #334155",
            background: "#1e293b",
            color: "#f1f5f9",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = leccion.rango.color || "#f97316";
            e.currentTarget.style.background = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#334155";
          }}
        >
          {/* Encabezado */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "14px" }}>
              {leccion.banda.imagen} {leccion.titulo}
            </div>
            <div
              style={{
                fontSize: "11px",
                background: "#334155",
                padding: "4px 8px",
                borderRadius: 6,
                color: "#94a3b8",
              }}
            >
              {leccion.materia}
            </div>
          </div>

          {/* Información de la banda */}
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              display: "flex",
              gap: 12,
            }}
          >
            <span>{leccion.banda.nombre}</span>
            <span>•</span>
            <span>{leccion.cancion.titulo}</span>
          </div>

          {/* BPM y pedagogía */}
          <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
            <div style={{ marginBottom: 4 }}>
              ♪ {leccion.cancion.bpm} BPM | Nivel {leccion.nivel}
            </div>
            <div style={{ fontSize: "10px", fontStyle: "italic", opacity: 0.8 }}>
              "{leccion.pedagogia}"
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
