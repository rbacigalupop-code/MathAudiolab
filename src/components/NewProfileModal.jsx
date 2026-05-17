import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal para crear nuevos perfiles de usuario
 */
export function NewProfileModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🧒");
  const [selectedColor, setSelectedColor] = useState("#06b6d4");
  const [error, setError] = useState("");

  const EMOJIS = ["👨", "👩", "🧒", "👦", "👧", "🎓", "📚", "🌟", "⭐", "🎮", "🎨", "🎵"];
  const COLORS = [
    { hex: "#3b82f6", label: "Azul" },
    { hex: "#ec4899", label: "Rosa" },
    { hex: "#06b6d4", label: "Cyan" },
    { hex: "#8b5cf6", label: "Púrpura" },
    { hex: "#f59e0b", label: "Ámbar" },
    { hex: "#22c55e", label: "Verde" }
  ];

  const handleCreate = () => {
    setError("");

    // Validación
    if (!name.trim()) {
      setError("Ingresa un nombre");
      return;
    }
    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (name.trim().length > 20) {
      setError("El nombre no puede exceder 20 caracteres");
      return;
    }

    // Crear perfil
    if (onCreate) {
      const success = onCreate(name.trim(), selectedEmoji, selectedColor);
      if (success) {
        // Reset form
        setName("");
        setSelectedEmoji("🧒");
        setSelectedColor("#06b6d4");
        setError("");
        onClose();
      } else {
        setError("Error al crear el perfil. Intenta de nuevo.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 2000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#0f172a",
              border: "2px solid #f97316",
              borderRadius: 16,
              padding: "24px",
              maxWidth: 450,
              width: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              zIndex: 2001,
            }}
          >
            {/* Header */}
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#f97316", margin: "0 0 20px 0" }}>
              ➕ Crear Nuevo Niño
            </h2>

            {/* Name Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                Nombre:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ej: Juan, María, Pedro..."
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: "2px solid #334155",
                  background: "#1e293b",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  fontWeight: 700,
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                onBlur={(e) => (e.target.style.borderColor = "#334155")}
              />
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: 4 }}>
                {name.length}/20 caracteres
              </div>
            </div>

            {/* Emoji Picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                Emoji:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: selectedEmoji === emoji ? "#f973161a" : "#1e293b",
                      border: selectedEmoji === emoji ? "2px solid #f97316" : "1px solid #334155",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 24,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                Color:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {COLORS.map((colorOption) => (
                  <motion.button
                    key={colorOption.hex}
                    onClick={() => setSelectedColor(colorOption.hex)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: colorOption.hex,
                      border: selectedColor === colorOption.hex ? "3px solid #f1f5f9" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 8,
                      padding: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 60,
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: selectedColor === colorOption.hex ? "#f1f5f9" : "rgba(255,255,255,0.7)" }}>
                      {colorOption.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div
              style={{
                background: "#1e293b",
                borderRadius: 10,
                padding: 16,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: 8 }}>
                Vista previa:
              </div>
              <div
                style={{
                  background: selectedColor + "1a",
                  border: `2px solid ${selectedColor}`,
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: "24px" }}>{selectedEmoji}</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
                  {name || "Nombre"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#dc262615",
                  border: "1px solid #dc2626",
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 16,
                  color: "#dc2626",
                  fontSize: "12px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#94a3b8",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#334155";
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || name.trim().length < 2}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: !name.trim() || name.trim().length < 2 ? "#64748b" : "#f97316",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: !name.trim() || name.trim().length < 2 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: !name.trim() || name.trim().length < 2 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!(!name.trim() || name.trim().length < 2)) {
                    e.currentTarget.style.background = "#ea580c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!name.trim() || name.trim().length < 2)) {
                    e.currentTarget.style.background = "#f97316";
                  }
                }}
              >
                ✓ Crear Perfil
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
