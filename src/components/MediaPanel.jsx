import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MEDIA_CONTENT = {
  multiplication: {
    title: "Multiplicación",
    youtube: "3QPpyuNycQI",
    videos: [
      { title: "MULTIPLICACIÓN y DIVISIÓN - Matemáticas para niños", id: "3QPpyuNycQI" },
      { title: "Aprendiendo a multiplicar - Happy Learning", id: "YFtEaVw5k1A" },
    ],
    spotify: "https://open.spotify.com/playlist/6bx2DXYetqJT0mf748kEUe",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/6bx2DXYetqJT0mf748kEUe?utm_source=generator",
  },
  division: {
    title: "División",
    youtube: "zF4GYIbSMzg",
    videos: [
      { title: "La división - Aprende con los monos", id: "zF4GYIbSMzg" },
      { title: "Aprendiendo a dividir - Happy Learning", id: "iA0fP4tL67s" },
    ],
    spotify: "https://open.spotify.com/playlist/2itdA3rmYpuqo1bcJR24x7",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/2itdA3rmYpuqo1bcJR24x7?utm_source=generator",
  },
  powers: {
    title: "Potencias",
    youtube: "loEjcsaXh2Y",
    videos: [
      { title: "Las potencias para niños - Matemáticas", id: "loEjcsaXh2Y" },
      { title: "POTENCIAS Super fácil - Para principiantes", id: "-K0ZSm9lPeY" },
    ],
    spotify: "https://open.spotify.com/playlist/2BhCL66fcE7KgwnNhmMrQs",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/2BhCL66fcE7KgwnNhmMrQs?utm_source=generator",
  },
};

const YOUTUBE_URL = (videoId) => `https://www.youtube.com/embed/${videoId}?rel=0`;

export function MediaPanel({ mode = "ejercicios" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState(0);

  const modeMap = {
    tabla: "multiplication",
    ejercicios: "multiplication",
    potencias: "powers",
    division: "division",
    escuchar: "multiplication",
    batalla: "multiplication",
  };

  const mediaMode = modeMap[mode] || "multiplication";
  const content = MEDIA_CONTENT[mediaMode];

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        title="Contenido multimedia"
        style={{
          padding: "8px",
          borderRadius: 10,
          border: "1.5px solid #334155",
          background: "#1e293b",
          color: "#94a3b8",
          fontWeight: 700,
          fontSize: "16px",
          cursor: "pointer",
          minHeight: 40,
          minWidth: 40,
          transition: "all .2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#a855f7";
          e.currentTarget.style.color = "#a855f7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#334155";
          e.currentTarget.style.color = "#94a3b8";
        }}
      >
        🎬
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
                background: "rgba(0,0,0,0.8)",
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
                marginLeft: "-300px",
                marginTop: "-280px",
                background: "#0f172a",
                border: "2px solid #a855f7",
                borderRadius: 16,
                padding: "20px",
                width: "600px",
                maxHeight: "560px",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                zIndex: 1001,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: "#a855f7" }}>
                  🎬 Multimedia - {content.title}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
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

              {/* Tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #334155", paddingBottom: 8 }}>
                {["videos", "spotify"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: activeTab === tab ? "#a855f7" : "transparent",
                      color: activeTab === tab ? "#fff" : "#94a3b8",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    {tab === "videos" ? "📹 Videos" : "🎵 Música"}
                  </button>
                ))}
              </div>

              {/* Videos Tab */}
              {activeTab === "videos" && (
                <div>
                  <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden" }}>
                    <iframe
                      width="100%"
                      height="315"
                      src={YOUTUBE_URL(content.videos[selectedVideo].id)}
                      title={content.videos[selectedVideo].title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 10 }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {content.videos.map((video, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVideo(idx)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: selectedVideo === idx ? "2px solid #a855f7" : "1px solid #334155",
                          background: selectedVideo === idx ? "#a855f755" : "transparent",
                          color: "#f1f5f9",
                          fontWeight: 700,
                          fontSize: "12px",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all .2s",
                        }}
                      >
                        {selectedVideo === idx ? "▶ " : "○ "}{video.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spotify Tab */}
              {activeTab === "spotify" && (
                <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#64748b", textAlign: "center" }}>
                    🎵 Abre Spotify en otra pestaña<br />
                    <a
                      href={content.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#a855f7", textDecoration: "none" }}
                    >
                      → Ir a Playlist
                    </a>
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
