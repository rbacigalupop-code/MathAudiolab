import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "../hooks/useProfileManager";

interface ProfileSelectorProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  loading: boolean;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (nombre: string, edad: number) => Promise<UserProfile | null>;
  onDeleteProfile: (profileId: string) => void;
}

export default function ProfileSelector({
  profiles,
  activeProfile,
  loading,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}: ProfileSelectorProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(13);
  const [creating, setCreating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProfile = async () => {
    if (!newName.trim()) return;

    setCreating(true);
    const result = await onCreateProfile(newName.trim(), newAge);
    setCreating(false);

    if (result) {
      setNewName("");
      setNewAge(13);
      setShowCreator(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#94a3b8",
          fontSize: "clamp(12px, 2vw, 14px)",
        }}
      >
        ⏳ Cargando perfiles...
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Perfil Activo */}
      {activeProfile && (
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            border: "2px solid #f97316",
            borderRadius: 16,
            padding: "clamp(12px, 3vw, 16px)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "clamp(14px, 3vw, 18px)",
                  fontWeight: 900,
                  color: "#f97316",
                  marginBottom: 2,
                }}
              >
                🎸 {activeProfile.nombre}
              </div>
              <div
                style={{
                  fontSize: "clamp(11px, 1.5vw, 12px)",
                  color: "#94a3b8",
                }}
              >
                {activeProfile.edad} años • Racha: {activeProfile.stats.rachaGlobal} •{" "}
                {activeProfile.stats.mejorRacha} mejor
              </div>
            </div>
            {profiles.length > 1 && (
              <button
                onClick={() => setShowCreator(false)}
                style={{
                  background: "transparent",
                  border: "1.5px solid #334155",
                  color: "#94a3b8",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  cursor: "pointer",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                👥 Cambiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selector de Perfiles (si hay múltiples) */}
      <AnimatePresence>
        {showCreator === false && profiles.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              flexWrap: "wrap",
              overflow: "hidden",
            }}
          >
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  background:
                    activeProfile?.id === profile.id ? "#f9731644" : "#1e293b",
                  border:
                    activeProfile?.id === profile.id
                      ? "2px solid #f97316"
                      : "1.5px solid #334155",
                  color:
                    activeProfile?.id === profile.id ? "#f97316" : "#94a3b8",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1.5vw, 12px)",
                  cursor: "pointer",
                  transition: "all .15s",
                  minHeight: 40,
                }}
              >
                <div>{profile.nombre}</div>
                <div
                  style={{
                    fontSize: "clamp(8px, 1vw, 9px)",
                    opacity: 0.7,
                  }}
                >
                  {profile.edad}a
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator de Nuevo Perfil */}
      <AnimatePresence>
        {showCreator ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "#1e293b",
              border: "1.5px solid #334155",
              borderRadius: 12,
              padding: "16px",
              marginBottom: 12,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  color: "#94a3b8",
                  marginBottom: 4,
                  fontWeight: 700,
                }}
              >
                Nombre del alumno
              </label>
              <input
                ref={nameInputRef}
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProfile();
                }}
                placeholder="Ej: Cristóbal"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1.5px solid #334155",
                  background: "#0f172a",
                  color: "#f1f5f9",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border .15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f97316";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                  color: "#94a3b8",
                  marginBottom: 4,
                  fontWeight: 700,
                }}
              >
                Edad: {newAge} años
              </label>
              <input
                type="range"
                min="8"
                max="18"
                value={newAge}
                onChange={(e) => setNewAge(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleCreateProfile}
                disabled={creating || !newName.trim()}
                style={{
                  flex: 1,
                  background: !newName.trim() ? "#475569" : "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px",
                  fontWeight: 700,
                  fontSize: "clamp(12px, 2vw, 13px)",
                  cursor: !newName.trim() ? "default" : "pointer",
                  minHeight: 44,
                  opacity: !newName.trim() ? 0.5 : 1,
                  transition: "all .15s",
                }}
              >
                {creating ? "⏳ Creando..." : "✓ Crear Perfil"}
              </button>
              <button
                onClick={() => setShowCreator(false)}
                style={{
                  flex: 1,
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1.5px solid #334155",
                  borderRadius: 10,
                  padding: "10px",
                  fontWeight: 700,
                  fontSize: "clamp(12px, 2vw, 13px)",
                  cursor: "pointer",
                  minHeight: 44,
                  transition: "all .15s",
                }}
              >
                ✕ Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => {
              setShowCreator(true);
              setTimeout(() => nameInputRef.current?.focus(), 100);
            }}
            style={{
              width: "100%",
              background: "#1e293b",
              color: "#94a3b8",
              border: "1.5px dashed #334155",
              borderRadius: 12,
              padding: "12px",
              fontWeight: 700,
              fontSize: "clamp(12px, 2vw, 14px)",
              cursor: "pointer",
              transition: "all .15s",
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f97316";
              e.currentTarget.style.color = "#f97316";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#334155";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            + Nuevo alumno
          </button>
        )}
      </AnimatePresence>

      {/* Lista de perfiles (para eliminar) */}
      {profiles.length > 0 && !showCreator && (
        <details
          style={{
            marginTop: 12,
            opacity: 0.6,
            fontSize: "clamp(10px, 1.5vw, 11px)",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              color: "#94a3b8",
              fontWeight: 700,
            }}
          >
            ⚙️ Gestionar perfiles
          </summary>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  background: "#0f172a",
                  borderRadius: 6,
                  fontSize: "clamp(10px, 1.5vw, 11px)",
                }}
              >
                <span style={{ color: "#cbd5e1" }}>
                  {profile.nombre} ({profile.edad}a)
                </span>
                {profiles.length > 1 && (
                  <button
                    onClick={() => onDeleteProfile(profile.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                      fontWeight: 700,
                      padding: "2px 6px",
                    }}
                  >
                    ✕ Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
