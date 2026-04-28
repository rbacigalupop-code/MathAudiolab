import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROFILES = [
  { id: "cristobal", label: "👨 Cristóbal" },
  { id: "grace", label: "👩 Grace" },
];

export function SettingsPanel({ store, setStore, profile, switchProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  const settings = store.settings || { volumen: 0.7, bpm: 100 };

  const handleVolumeChange = (vol) => {
    setStore(s => ({
      ...s,
      settings: { ...settings, volumen: vol }
    }));
  };

  const handleBpmChange = (bpm) => {
    setStore(s => ({
      ...s,
      settings: { ...settings, bpm }
    }));
  };

  const handleProfileSwitch = (newProfile) => {
    if (switchProfile) {
      switchProfile(newProfile);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: "1.5px solid #334155",
          background: "#1e293b",
          color: "#94a3b8",
          fontSize: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
      >
        ⚙️
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 1000,
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: "fixed",
                top: "50vh",
                left: "50vw",
                marginLeft: "-180px",
                marginTop: "-200px",
                background: "#0f172a",
                border: "2px solid #f97316",
                borderRadius: 16,
                padding: "20px",
                width: "360px",
                maxHeight: "400px",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                zIndex: 1001,
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#f97316", marginBottom: 16 }}>
                ⚙️ Configuración
              </div>

              {/* Profile Selector */}
              {profile && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #334155" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>
                    👤 Perfil Activo
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {PROFILES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProfileSwitch(p.id)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 6,
                          border: profile === p.id ? "2px solid #f97316" : "1px solid #334155",
                          background: profile === p.id ? "#f973161a" : "#1e293b",
                          color: profile === p.id ? "#f97316" : "#94a3b8",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>
                  🔊 Volumen: {Math.round(settings.volumen * 100)}%
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volumen}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    accentColor: "#f97316",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>
                  ♪ Tempo (BPM): {settings.bpm}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleBpmChange(Math.max(60, settings.bpm - 10))}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #334155",
                      background: "#1e293b",
                      color: "#94a3b8",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="60"
                    max="180"
                    value={settings.bpm}
                    onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                    style={{
                      flex: 2,
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #334155",
                      background: "#0f172a",
                      color: "#f97316",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  />
                  <button
                    onClick={() => handleBpmChange(Math.min(180, settings.bpm + 10))}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #334155",
                      background: "#1e293b",
                      color: "#94a3b8",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#f97316",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ✓ Listo
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
