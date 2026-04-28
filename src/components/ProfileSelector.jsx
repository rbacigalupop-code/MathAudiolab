import { motion } from "framer-motion";

const PROFILES = [
  { id: "cristobal", label: "👨 Cristóbal", emoji: "👨", color: "#3b82f6" },
  { id: "grace", label: "👩 Grace", emoji: "👩", color: "#ec4899" },
];

export function ProfileSelector({ onSelect }) {
  const handleSelect = (profileId) => {
    try {
      localStorage.setItem("__mal_profile", profileId);
      onSelect(profileId);
    } catch (e) {
      console.error("Profile selection error:", e);
    }
  };

  return (
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

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {PROFILES.map((profile) => (
          <motion.button
            key={profile.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(profile.id)}
            style={{
              flex: 1,
              maxWidth: 160,
              background: `${profile.color}15`,
              border: `2px solid ${profile.color}`,
              borderRadius: 16,
              padding: "clamp(20px, 5vw, 28px) clamp(16px, 3vw, 20px)",
              color: profile.color,
              fontWeight: 800,
              fontSize: "clamp(16px, 3vw, 18px)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${profile.color}25`;
              e.target.style.boxShadow = `0 0 20px ${profile.color}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `${profile.color}15`;
              e.target.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "32px" }}>{profile.emoji}</div>
            <span>{profile.label.split(" ")[1]}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
