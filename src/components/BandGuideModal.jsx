import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import educationalManual from "../constants/educationalManual.json";
import { BAND_METADATA } from "../constants/bandMetadata";

/**
 * BandGuideModal - Interactive guide connecting bands to math concepts
 * Shows band info, songs, BPM, and pedagogical tips
 * Integrated into SettingsPanel as "🎸 Band Guide" button
 */
export function BandGuideModal({ isOpen, onClose }) {
  const [selectedBandId, setSelectedBandId] = useState("mcr");
  const bandIds = Object.keys(BAND_METADATA);

  const selectedBand = BAND_METADATA[selectedBandId];
  const selectedManual = educationalManual[selectedBandId];

  if (!isOpen || !selectedBand) return null;

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
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              marginLeft: "-320px",
              marginTop: "-280px",
              width: "640px",
              maxHeight: "560px",
              background: "#0f172a",
              border: "2px solid #f97316",
              borderRadius: 16,
              padding: "20px",
              overflowY: "auto",
              zIndex: 1001,
              boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#f97316" }}>
                🎸 Band Guide
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Band Selection Tabs */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                overflowX: "auto",
                paddingBottom: 8,
                borderBottom: "1px solid #334155",
              }}
            >
              {bandIds.map((bandId) => (
                <button
                  key={bandId}
                  onClick={() => setSelectedBandId(bandId)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: selectedBandId === bandId ? "#f97316" : "#1e293b",
                    color: selectedBandId === bandId ? "#fff" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all .2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBandId !== bandId) {
                      e.currentTarget.style.borderColor = "#f97316";
                    }
                  }}
                >
                  {BAND_METADATA[bandId].name}
                </button>
              ))}
            </div>

            {/* Band Content */}
            <motion.div
              key={selectedBandId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 16 }}
            >
              {/* Band Header */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#f1f5f9", marginBottom: 4 }}>
                  {selectedBand.name}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {selectedBand.genre} • {selectedBand.country}
                </div>
              </div>

              {/* Concept Connection */}
              {selectedManual && (
                <div
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
                    📚 MATH CONCEPT
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#06b6d4",
                      marginBottom: 8,
                    }}
                  >
                    {selectedManual.concept}
                  </div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {selectedManual.conceptExplanation}
                  </div>
                </div>
              )}

              {/* Key Bit */}
              {selectedManual && (
                <div
                  style={{
                    background: "#1e293b",
                    border: `1px solid #475569`,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
                    💡 KEY INSIGHT
                  </div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {selectedManual.keyBit}
                  </div>
                </div>
              )}

              {/* Tracks */}
              <div
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, marginBottom: 8 }}>
                  🎵 TRACKS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedBand.tracks.map((track, idx) => (
                    <div key={idx} style={{ borderLeft: "2px solid #f97316", paddingLeft: 10 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 2 }}>
                        {track.bpm} BPM • {track.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pedagogy Tip */}
              {selectedManual && (
                <div
                  style={{
                    background: "#1e293b",
                    border: "1px solid #06b6d4",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#06b6d4", fontWeight: 700, marginBottom: 6 }}>
                    🎓 LEARNING TIP
                  </div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {selectedManual.pedagogyTip}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Footer */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid #334155",
                fontSize: "11px",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              🎸 Toca una banda para ver cómo se relaciona con matemáticas
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BandGuideModal;
