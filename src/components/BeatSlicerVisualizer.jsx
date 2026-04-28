import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * BeatSlicerVisualizer - Division visualization using rhythm/beats
 *
 * Shows how a number (dividendo) is divided into equal groups (divisor)
 * Each beat (●) represents one unit
 * Grouped by division markers (|) to show equal parts
 *
 * Example: 12 ÷ 3 = 4
 * ● ● ● ● | ● ● ● ● | ● ● ● ●
 * Group 1    Group 2    Group 3
 * (4 items each)
 */
export function BeatSlicerVisualizer({ dividendo, divisor, bpm = 120, accentColor = "#3b82f6" }) {
  // HOTFIX: Validate inputs strictly to avoid negative widths
  if (!dividendo || !divisor || divisor === 0 || divisor < 0 || dividendo < 0 || dividendo > 1000 || divisor > 1000) {
    console.warn("[BeatSlicerVisualizer] Invalid inputs:", { dividendo, divisor });
    return null;
  }

  const itemsPerGroup = Math.floor(dividendo / divisor);
  const remainder = dividendo % divisor;

  // Create array of beats with group assignments
  const beats = useMemo(() => {
    return Array.from({ length: dividendo }, (_, i) => ({
      index: i,
      groupIndex: Math.floor(i / itemsPerGroup),
      isRemainder: i >= divisor * itemsPerGroup,
    }));
  }, [dividendo, itemsPerGroup, divisor]);

  // Group colors for visual distinction
  const groupColors = [
    "#f97316", // Orange
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#ec4899", // Pink
    "#14b8a6", // Teal
  ];

  const getGroupColor = (groupIndex) => {
    return groupColors[groupIndex % groupColors.length];
  };

  // Container for beats
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  // Individual beat animation
  const beatVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div
      style={{
        background: "#1e293b",
        border: `2px solid ${accentColor}`,
        borderRadius: 12,
        padding: "20px",
        marginBottom: 16,
      }}
    >
      {/* Header with division expression */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#f1f5f9",
          }}
        >
          🎵 Division Rhythm: {dividendo} ÷ {divisor} = {itemsPerGroup}
          {remainder > 0 && <span style={{ color: "#ef4444" }}> (resto: {remainder})</span>}
        </div>
        {bpm && (
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
            {bpm} BPM
          </div>
        )}
      </div>

      {/* Beat visualization */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          padding: "16px",
          background: "#0f172a",
          borderRadius: 8,
        }}
      >
        {beats.map((beat, idx) => (
          <motion.div
            key={idx}
            variants={beatVariants}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Beat (●) */}
            <motion.div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: beat.isRemainder ? "#6b7280" : getGroupColor(beat.groupIndex),
                boxShadow: `0 0 8px ${beat.isRemainder ? "rgba(107, 114, 128, 0.5)" : getGroupColor(beat.groupIndex)}80`,
              }}
              whileHover={{
                scale: 1.3,
              }}
              title={`Beat ${idx + 1} (Grupo ${beat.groupIndex + 1})`}
            />

            {/* Group separator label */}
            {(beat.index + 1) % itemsPerGroup === 0 && beat.groupIndex < divisor - 1 && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  fontWeight: 600,
                  position: "absolute",
                  marginTop: 32,
                }}
              >
                |
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Legend explaining the groups */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
          fontSize: "12px",
        }}
      >
        {Array.from({ length: divisor }, (_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: groupColors[i % groupColors.length],
              }}
            />
            <span style={{ color: "#cbd5e1" }}>
              Grupo {i + 1}: {itemsPerGroup} items
            </span>
          </div>
        ))}
        {remainder > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#6b7280",
              }}
            />
            <span style={{ color: "#ef4444" }}>Resto: {remainder}</span>
          </div>
        )}
      </div>

      {/* Pedagogical tip */}
      <div
        style={{
          marginTop: 12,
          padding: "8px 12px",
          background: "#1e293b",
          borderRadius: 6,
          fontSize: "11px",
          color: "#a1a5b4",
          fontStyle: "italic",
        }}
      >
        💡 Cada grupo (separado por |) tiene exactamente {itemsPerGroup} beats
        {remainder > 0 && ` y hay ${remainder} beat${remainder > 1 ? 's' : ''} que no caben.`}
      </div>
    </div>
  );
}

export default BeatSlicerVisualizer;
