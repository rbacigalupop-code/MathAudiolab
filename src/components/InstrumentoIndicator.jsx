import { motion } from "framer-motion";
import { INSTRUMENTOS } from "../hooks/useAudioManager";

export function InstrumentoIndicator({ instrumento }) {
  const cfg = INSTRUMENTOS[instrumento];
  if (!cfg) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      key={instrumento}
      style={{
        padding: "8px 12px",
        background: "#f97316",
        borderRadius: 8,
        color: "#fff",
        fontWeight: 700,
        fontSize: "clamp(11px, 2vw, 13px)",
        textAlign: "center",
        marginBottom: 10,
      }}
    >
      🎵 {cfg.label}
    </motion.div>
  );
}
