import { motion } from "framer-motion";

const DIVISION_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#d946ef",
];

export function DivisionTimeline({ dividendo, divisor, estado, respuestaEsperada }) {
  const itemsPerGrupo = respuestaEsperada || Math.floor(dividendo / divisor);

  // Selecciona visualización según tamaño
  const isLarge = dividendo > 50;

  if (isLarge) {
    return <DivisionTimelineHorizontal dividendo={dividendo} divisor={divisor} itemsPerGrupo={itemsPerGrupo} estado={estado} />;
  }

  return <DivisionTimelineVertical dividendo={dividendo} divisor={divisor} itemsPerGrupo={itemsPerGrupo} estado={estado} />;
}

function DivisionTimelineVertical({ dividendo, divisor, itemsPerGrupo, estado }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {Array.from({ length: divisor }).map((_, grupoIdx) => {
        const color = DIVISION_COLORS[grupoIdx % DIVISION_COLORS.length];
        return (
          <motion.div
            key={grupoIdx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: grupoIdx * 0.05 }}
            style={{
              display: "flex",
              gap: 4,
              padding: "6px 8px",
              borderRadius: 8,
              background: color + "15",
              border: `2px solid ${color}`,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: itemsPerGrupo }).map((_, itemIdx) => (
              <motion.div
                key={itemIdx}
                initial={{ scale: 0 }}
                animate={estado === "correcto" ? { scale: 1.1 } : estado === "incorrecto" ? { rotate: [0, -10, 10, 0] } : { scale: 1 }}
                transition={{ delay: (grupoIdx * itemsPerGrupo + itemIdx) * 0.02 }}
                style={{
                  width: "clamp(20px, 5vw, 32px)",
                  aspectRatio: "1",
                  borderRadius: "4px",
                  background: color,
                  opacity: 0.8,
                }}
              />
            ))}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function DivisionTimelineHorizontal({ dividendo, divisor, itemsPerGrupo, estado }) {
  const containerWidth = 100; // porcentaje
  const groupWidth = containerWidth / divisor;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        height: "clamp(60px, 12vw, 100px)",
        gap: 2,
        padding: "0 8px",
      }}
    >
      {Array.from({ length: divisor }).map((_, grupoIdx) => {
        const color = DIVISION_COLORS[grupoIdx % DIVISION_COLORS.length];
        return (
          <motion.div
            key={grupoIdx}
            initial={{ scaleY: 0.5, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: grupoIdx * 0.05 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: 4,
              borderRadius: 6,
              background: color + "15",
              border: `2px solid ${color}`,
              justifyContent: "flex-start",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: itemsPerGrupo }).map((_, itemIdx) => (
              <motion.div
                key={itemIdx}
                initial={{ scale: 0 }}
                animate={estado === "correcto" ? { scale: 1.05 } : estado === "incorrecto" ? { x: [0, -3, 3, 0] } : { scale: 1 }}
                transition={{ delay: (grupoIdx * itemsPerGrupo + itemIdx) * 0.02 }}
                style={{
                  width: "100%",
                  height: "clamp(4px, 2vw, 8px)",
                  borderRadius: "2px",
                  background: color,
                  opacity: 0.85,
                }}
              />
            ))}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
