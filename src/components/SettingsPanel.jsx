import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsDashboardV2 } from "./AnalyticsDashboardV2";
import { GamificacionAvanzada } from "./GamificacionAvanzada";
import { NewProfileModal } from "./NewProfileModal";

export function SettingsPanel({ store, setStore, profile, switchProfile, zenMode, setZenMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGamificacion, setShowGamificacion] = useState(false);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [profiles, setProfiles] = useState([]);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      const registry = localStorage.getItem("__mal_profiles_registry");
      if (registry) {
        const parsed = JSON.parse(registry);
        const sorted = parsed.profiles.sort((a, b) => a.createdAt - b.createdAt);
        setProfiles(sorted);
      }
    } catch (e) {
      console.error("Load profiles error:", e);
    }
  };

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

  const handleCreateProfile = (name, emoji, color) => {
    try {
      // Generate profile ID
      let profileId = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const allIds = profiles.map(p => p.id);
      let finalId = profileId;
      let counter = 1;
      while (allIds.includes(finalId)) {
        finalId = `${profileId}-${counter}`;
        counter++;
      }

      // Create new profile
      const newProfile = {
        id: finalId,
        label: `${emoji} ${name}`,
        emoji,
        color,
        createdAt: Date.now()
      };

      // Add to registry
      const registry = JSON.parse(localStorage.getItem("__mal_profiles_registry"));
      registry.profiles.push(newProfile);
      localStorage.setItem("__mal_profiles_registry", JSON.stringify(registry));

      // Initialize profile data
      const INITIAL_STATE = {
        version: 1,
        nivel: 1,
        tabla: 2,
        sesiones: [],
        erroresPorTabla: {},
        rachaGlobal: 0,
        mejorRacha: 0,
        weak_points: {},
        unlocked_effects: [],
        errorLog: {},
        preferencias: { zenMode: true },
      };
      localStorage.setItem(`__mal_${finalId}_v1`, JSON.stringify(INITIAL_STATE));

      // Reload profiles
      loadProfiles();
      return true;
    } catch (e) {
      console.error("Create profile error:", e);
      return false;
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 8, maxHeight: 150, overflowY: "auto" }}>
                    {profiles.map((p) => (
                      <div key={p.id} style={{ position: "relative" }}>
                        <button
                          onClick={() => handleProfileSwitch(p.id)}
                          style={{
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: 6,
                            border: profile === p.id ? "2px solid #f97316" : "1px solid #334155",
                            background: profile === p.id ? "#f973161a" : "#1e293b",
                            color: profile === p.id ? "#f97316" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: "14px", marginBottom: 2 }}>{p.emoji}</div>
                          {p.label.split(" ").slice(1).join(" ")}
                        </button>
                        {/* Delete button for non-active profiles */}
                        {profile !== p.id && profiles.length > 1 && (
                          <button
                            onClick={() => {
                              const confirmDelete = window.confirm(`¿Eliminar perfil "${p.label}"?`);
                              if (confirmDelete) {
                                try {
                                  const registry = JSON.parse(localStorage.getItem("__mal_profiles_registry"));
                                  registry.profiles = registry.profiles.filter(profile => profile.id !== p.id);
                                  localStorage.setItem("__mal_profiles_registry", JSON.stringify(registry));
                                  localStorage.removeItem(`__mal_${p.id}_v1`);
                                  loadProfiles();
                                } catch (e) {
                                  console.error("Delete error:", e);
                                }
                              }
                            }}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "#dc2626",
                              border: "none",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: 900,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                            }}
                            title="Eliminar perfil"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowNewProfileModal(true)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1.5px dashed #475569",
                      background: "#1e293b",
                      color: "#94a3b8",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#f97316";
                      e.currentTarget.style.color = "#f97316";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#475569";
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    ➕ Nuevo Perfil
                  </button>
                </div>
              )}

              {/* Zen Mode Toggle */}
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #334155" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>
                  ☮️ Zen Mode
                </div>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 6,
                    border: "2px solid",
                    borderColor: zenMode ? "#06b6d4" : "#f97316",
                    background: zenMode ? "#06b6d41a" : "transparent",
                    color: zenMode ? "#06b6d4" : "#f97316",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = zenMode ? "#06b6d4" : "#f97316";
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {zenMode ? "✓ Zen Mode Activo" : "○ Zen Mode Inactivo"}
                </button>
              </div>

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

              {/* Analytics Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: 8,
                  borderRadius: 8,
                  border: "1.5px solid #06b6d4",
                  background: "#06b6d41a",
                  color: "#06b6d4",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#06b6d433";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#06b6d41a";
                }}
              >
                📊 Analytics Dashboard
              </button>

              {/* Gamificación Button */}
              <button
                onClick={() => setShowGamificacion(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: 8,
                  borderRadius: 8,
                  border: "1.5px solid #f59e0b",
                  background: "#f59e0b1a",
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f59e0b33";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f59e0b1a";
                }}
              >
                🎮 Gamificación Avanzada
              </button>

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

      {/* Analytics Dashboard V2 */}
      {showAnalytics && (
        <AnalyticsDashboardV2
          store={store}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Gamificación Avanzada */}
      {showGamificacion && (
        <GamificacionAvanzada
          store={store}
          onClose={() => setShowGamificacion(false)}
        />
      )}

      {/* New Profile Modal */}
      <NewProfileModal
        isOpen={showNewProfileModal}
        onClose={() => setShowNewProfileModal(false)}
        onCreate={handleCreateProfile}
      />
    </>
  );
}
