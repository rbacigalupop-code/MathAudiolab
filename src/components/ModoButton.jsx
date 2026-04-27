import { motion } from "framer-motion";

export function ModoButton({ children, onClick, disabled = false, variant = "primary", color = "#f97316" }) {
  if (variant === "secondary") {
    return (
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        disabled={disabled}
        style={{
          background: "transparent",
          border: `2px solid ${color}`,
          color,
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 600,
          fontSize: "clamp(10px, 2vw, 12px)",
          cursor: disabled ? "default" : "pointer",
          transition: "all .15s",
          minHeight: "clamp(40px, 10vw, 48px)",
          minWidth: 100,
        }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#334155" : color,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "10px 22px",
        fontWeight: 700,
        fontSize: "clamp(12px, 2vw, 14px)",
        cursor: disabled ? "default" : "pointer",
        transition: "background .3s",
        minHeight: "clamp(40px, 10vw, 48px)",
      }}
    >
      {children}
    </motion.button>
  );
}
