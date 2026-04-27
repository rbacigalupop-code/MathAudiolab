import { motion } from "framer-motion";

export default function PanelProgreso({ store, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        background: "#0f172a",
        borderRadius: 16,
        padding: 20,
        border: "1.5px solid #334155",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#f97316", fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 800, margin: 0 }}>
          📊 Progreso de Cristóbal
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
      <p style={{ color: "#94a3b8", textAlign: "center" }}>Nivel actual: {store.nivel}</p>
      <p style={{ color: "#94a3b8", textAlign: "center" }}>Mejor racha: {store.mejorRacha}</p>
      <p style={{ color: "#94a3b8", textAlign: "center" }}>Sesiones: {store.sesiones.length}</p>
    </motion.div>
  );
}
