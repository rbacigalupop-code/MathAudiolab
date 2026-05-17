import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NewProfileModal } from "./NewProfileModal";

export function ProfileSelector({ onSelect }) {
  const [profiles, setProfiles] = useState([]);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [longPressProfile, setLongPressProfile] = useState(null);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      const registry = localStorage.getItem("__mal_profiles_registry");
      if (!registry) {
        // Initialize default profiles
        const defaults = {
          version: 1,
          profiles: [
            { id: "cristobal", label: "👨 Cristóbal", emoji: "👨", color: "#3b82f6", createdAt: Date.now() },
            { id: "grace", label: "👩 Grace", emoji: "👩", color: "#ec4899", createdAt: Date.now() }
          ]
        };
        localStorage.setItem("__mal_profiles_registry", JSON.stringify(defaults));
        setProfiles(defaults.profiles);
      } else {
        const parsed = JSON.parse(registry);
        const sorted = parsed.profiles.sort((a, b) => a.createdAt - b.createdAt);
        setProfiles(sorted);
      }
    } catch (e) {
      console.error("Load profiles error:", e);
    }
  };

  const handleSelect = (profileId) => {
    try {
      localStorage.setItem("__mal_profile", profileId);
      onSelect(profileId);
    } catch (e) {
      console.error("Profile selection error:", e);
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

  const handleDeleteProfile = (profileId) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro? Se borrará toda la información de "${profiles.find(p => p.id === profileId)?.label}"`
    );

    if (!confirmDelete) return;

    try {
      // Remove from registry
      const registry = JSON.parse(localStorage.getItem("__mal_profiles_registry"));
      registry.profiles = registry.profiles.filter(p => p.id !== profileId);

      if (registry.profiles.length === 0) {
        alert("No puedes eliminar el único perfil. Crea otro primero.");
        return;
      }

      localStorage.setItem("__mal_profiles_registry", JSON.stringify(registry));

      // Delete profile data
      localStorage.removeItem(`__mal_${profileId}_v1`);

      // If deleted profile was active, switch to first
      const currentProfile = localStorage.getItem("__mal_profile");
      if (currentProfile === profileId) {
        handleSelect(registry.profiles[0].id);
      }

      // Reload profiles
      loadProfiles();
    } catch (e) {
      console.error("Delete profile error:", e);
    }
  };

  const handleMouseDown = (profileId) => {
    const timeout = setTimeout(() => {
      setLongPressProfile(profileId);
    }, 800);
    setTouchStart(timeout);
  };

  const handleMouseUp = () => {
    if (touchStart) clearTimeout(touchStart);
    setTouchStart(null);
  };

  const extractName = (label) => {
    // Remove emoji and get name part
    return label.split(" ").slice(1).join(" ");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 700,
            }}
          >
            ¿Quién eres?
          </p>
          <p
            style={{
              fontSize: "clamp(11px, 2vw, 12px)",
              color: "#64748b",
              margin: 0,
            }}
          >
            Cada perfil guarda tus progresos por separado
          </p>
        </div>

        {/* Profile Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              position="relative"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onMouseDown={() => handleMouseDown(profile.id)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => {
                  if (!longPressProfile) {
                    handleSelect(profile.id);
                  }
                }}
                style={{
                  width: "100%",
                  background: `${profile.color}15`,
                  border: `2px solid ${profile.color}`,
                  borderRadius: 16,
                  padding: "20px 16px",
                  color: profile.color,
                  fontWeight: 800,
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${profile.color}25`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${profile.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${profile.color}15`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px" }}>{profile.emoji}</div>
                <span style={{ fontSize: "12px" }}>{extractName(profile.label)}</span>
              </motion.button>

              {/* Delete button on long press */}
              {longPressProfile === profile.id && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    handleDeleteProfile(profile.id);
                    setLongPressProfile(null);
                  }}
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#dc2626",
                    border: "2px solid #fff",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 900,
                    cursor: "pointer",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Eliminar perfil"
                >
                  ✕
                </motion.button>
              )}
            </motion.div>
          ))}

          {/* Create Profile Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProfileModal(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: "100%",
              background: "#1e293b",
              border: "2px dashed #475569",
              borderRadius: 16,
              padding: "20px 16px",
              color: "#94a3b8",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#334155";
              e.currentTarget.style.borderColor = "#f97316";
              e.currentTarget.style.color = "#f97316";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1e293b";
              e.currentTarget.style.borderColor = "#475569";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <div style={{ fontSize: "28px" }}>➕</div>
            <span style={{ fontSize: "12px" }}>Nuevo Niño</span>
          </motion.button>
        </div>

        <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center", marginTop: 8 }}>
          💡 Presiona largo en un perfil para eliminarlo
        </div>
      </motion.div>

      {/* New Profile Modal */}
      <NewProfileModal
        isOpen={showNewProfileModal}
        onClose={() => setShowNewProfileModal(false)}
        onCreate={handleCreateProfile}
      />
    </>
  );
}
