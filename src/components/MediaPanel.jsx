import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MEDIA_CONTENT = {
  multiplication: {
    title: "Multiplicación",
    youtube: "dQw4w9WgXcQ", // Placeholder - would be actual educational video
    videos: [
      { title: "¿Qué es multiplicación?", id: "dQw4w9WgXcQ" },
      { title: "Tablas de multiplicar", id: "dQw4w9WgXcQ" },
    ],
    spotify: "https://open.spotify.com/playlist/37i9dQZF1DZ52esnJ5UmQN",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DZ52esnJ5UmQN",
  },
  division: {
    title: "División",
    youtube: "dQw4w9WgXcQ",
    videos: [
      { title: "Concepto de división", id: "dQw4w9WgXcQ" },
      { title: "Dividendo, divisor y cociente", id: "dQw4w9WgXcQ" },
    ],
    spotify: "https://open.spotify.com/playlist/37i9dQZF1DZ52esnJ5UmQN",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DZ52esnJ5UmQN",
  },
  powers: {
    title: "Potencias",
    youtube: "dQw4w9WgXcQ",
    videos: [
      { title: "¿Qué es una potencia?", id: "dQw4w9WgXcQ" },
      { title: "Exponentes y bases", id: "dQw4w9WgXcQ" },
    ],
    spotify: "https://open.spotify.com/playlist/37i9dQZF1DZ52esnJ5UmQN",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DZ52esnJ5UmQN",
  },
};

const YOUTUBE_URL = (videoId) => `https://www.youtube.com/embed/${videoId}?rel=0`;

export function MediaPanel({ mode = "ejercicios" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState(0);

  // Map app modes to media content modes
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
                zIndex: 999,
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#0f172a",
                border: "2px solid #a855f7",
                borderRadius: 16,
                padding: "20px",
                zIndex: 1000,
                maxWidth: "95%",
                width: "min(90vw, 600px)",
                maxHeight: "90vh",
                overflowY: "auto",
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
                  {/* YouTube Embed */}
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

                  {/* Video List */}
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
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all .2s",
                        }}
                      >
                        {idx + 1}. {video.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spotify Tab */}
              {activeTab === "spotify" && (
                <div>
                  <div style={{ marginBottom: 12, color: "#cbd5e1", fontSize: "12px" }}>
                    🎵 Playlist recomendada para {content.title.toLowerCase()}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/37i9dQZF1DZ52esnJ5UmQN?utm_source=generator`}
                      width="100%"
                      height="380"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      style={{ borderRadius: 12 }}
                    />
                  </div>

                  <a
                    href={content.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      borderRadius: 8,
                      background: "#1DB954",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "12px",
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1ed760"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#1DB954"; }}
                  >
                    Abrir en Spotify →
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
