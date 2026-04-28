import { motion } from "framer-motion";

export function ProgressStats({ store }) {
  const calcAccuracy = (mode) => {
    const key = `erroresPor${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    const errors = store[key] || {};
    let total = 0, correct = 0;
    Object.values(errors).forEach(e => {
      const t = (e.correctas || 0) + (e.incorrectas || 0);
      correct += e.correctas || 0;
      total += t;
    });
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  };

  const modes = ["Multiplicación", "División", "Potencias"];
  const modeKeys = ["multiplication", "division", "powers"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: "clamp(12px, 2vw, 16px)",
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        📊 Precisión por Modo
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {modes.map((label, idx) => {
          const accuracy = calcAccuracy(modeKeys[idx]);
          const color = accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#f97316" : "#ef4444";

          return (
            <motion.div
              key={label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                flex: "1 1 auto",
                minWidth: 80,
                padding: "8px 12px",
                background: `${color}15`,
                border: `1.5px solid ${color}`,
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: "#94a3b8", marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 900, color }}>
                {accuracy}%
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
        <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#64748b" }}>
          🎯 Nivel {store.nivel} · 🔥 Racha: {store.rachaGlobal} · ⭐ Mejor: {store.mejorRacha}
        </div>
        {store.unlocked_effects?.length > 0 && (
          <div style={{ fontSize: "clamp(9px, 1.5vw, 10px)", color: "#a855f7", marginTop: 4 }}>
            🎨 Efectos desbloqueados: {store.unlocked_effects.join(", ")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
