import { motion } from "framer-motion";

const DIVISION_COLORS = [
  "#ef4444", // Rojo
  "#f97316", // Naranja
  "#eab308", // Amarillo
  "#22c55e", // Verde
  "#06b6d4", // Cian
  "#3b82f6", // Azul
  "#8b5cf6", // Púrpura
  "#ec4899", // Rosa
  "#f43f5e", // Rojo profundo
  "#d946ef", // Magenta
];

export function DivisionGrid({ dividendo, divisor, estado, respuestaEsperada }) {
  const itemsPerGrupo = respuestaEsperada || Math.floor(dividendo / divisor);
  const numGrupos = divisor;

  // Array de colores, uno por grupo
  const colores = Array.from({ length: numGrupos }, (_, i) => DIVISION_COLORS[i % DIVISION_COLORS.length]);

  // Crear items con información de grupo
  const items = [];
  for (let g = 0; g < numGrupos; g++) {
    for (let i = 0; i < itemsPerGrupo; i++) {
      items.push({ groupIdx: g, itemIdx: i });
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0 },
    },
  };

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    success: { scale: 1.1, transition: { duration: 0.4 } },
    error: { rotate: [0, -5, 5, -5, 0], transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${itemsPerGrupo}, minmax(30px, 1fr))`,
        gap: "6px 4px",
        justifyContent: "center",
        padding: "0 12px",
        alignItems: "start",
      }}
      variants={containerVariants}
      initial="hidden"
      animate={estado === "esperando" ? "visible" : estado === "correcto" ? "success" : "error"}
    >
      {items.map((item, idx) => {
        const color = colores[item.groupIdx];
        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            style={{
              width: "clamp(24px, 100%, 50px)",
              aspectRatio: "1",
              borderRadius: "4px",
              background: color,
              border: `2px solid ${color}`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </motion.div>
  );
}
