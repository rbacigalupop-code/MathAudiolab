import React, { useState, useEffect } from "react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PIANO_NOTES = [];
for (let octave = 2; octave <= 5; octave++) {
  NOTES.forEach((note) => {
    PIANO_NOTES.push(`${note}${octave}`);
  });
}

const NE = {
  C: "Do", "C#": "Do#", D: "Re", "D#": "Re#", E: "Mi", F: "Fa", "F#": "Fa#",
  G: "Sol", "G#": "Sol#", A: "La", "A#": "La#", B: "Si",
};

function tEsp(n) {
  const m = n.match(/([A-G]#?)/);
  return m ? NE[m[1]] || m[1] : n;
}

const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", "F#", "G#", "A#"];

export function PianoKeyboard({ activeNote, onFretClick }) {
  const [W, setW] = useState(600);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setW(Math.max(280, Math.min(680, rect.width - 8)));
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const keyWidth = W / 28; // ~4 octavas × 7 notas blancas
  const whiteKeyHeight = keyWidth * 4;
  const blackKeyHeight = whiteKeyHeight * 0.6;
  const blackKeyWidth = keyWidth * 0.6;

  let whiteIdx = 0;

  return (
    <div ref={containerRef} style={{ width: "100%", padding: "8px 0", display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: W, height: whiteKeyHeight + 8, background: "#0f172a", borderRadius: 8, padding: 4 }}>
        {/* White keys */}
        {PIANO_NOTES.map((nota, idx) => {
          const noteName = nota.match(/([A-G]#?)/)[1];
          if (!WHITE_KEYS.includes(noteName)) return null;

          const octave = parseInt(nota[nota.length - 1]);
          const noteIdx = WHITE_KEYS.indexOf(noteName);
          const x = (octave - 2) * (keyWidth * 7) + noteIdx * keyWidth;
          const isActive = activeNote === nota;

          return (
            <div
              key={nota}
              onClick={() => onFretClick(nota)}
              style={{
                position: "absolute",
                left: x,
                top: 4,
                width: keyWidth - 1,
                height: whiteKeyHeight,
                background: isActive ? "#f97316" : "#f8f8f8",
                border: `2px solid ${isActive ? "#f97316" : "#d1d5db"}`,
                borderRadius: "0 0 4px 4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
                fontSize: "10px",
                fontWeight: "bold",
                color: isActive ? "#fff" : "#333",
                transition: "all 0.2s",
                boxShadow: isActive ? "0 4px 8px rgba(249, 115, 22, 0.4)" : "none",
              }}
            >
              {isActive ? tEsp(noteName) : ""}
            </div>
          );
        })}

        {/* Black keys */}
        {PIANO_NOTES.map((nota) => {
          const noteName = nota.match(/([A-G]#?)/)[1];
          if (!BLACK_KEYS.includes(noteName)) return null;

          const octave = parseInt(nota[nota.length - 1]);
          const noteIdx = NOTES.indexOf(noteName);
          const prevWhiteIdx = WHITE_KEYS.indexOf(noteName[0]);
          const x = (octave - 2) * (keyWidth * 7) + prevWhiteIdx * keyWidth + keyWidth * 0.7;
          const isActive = activeNote === nota;

          return (
            <div
              key={nota}
              onClick={() => onFretClick(nota)}
              style={{
                position: "absolute",
                left: x,
                top: 4,
                width: blackKeyWidth,
                height: blackKeyHeight,
                background: isActive ? "#ff6b35" : "#1f2937",
                border: `2px solid ${isActive ? "#ff6b35" : "#111"}`,
                borderRadius: "0 0 3px 3px",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 2,
                fontSize: "8px",
                fontWeight: "bold",
                color: isActive ? "#fff" : "#64748b",
                transition: "all 0.2s",
                zIndex: 10,
                boxShadow: isActive ? "0 2px 4px rgba(255, 107, 53, 0.5)" : "none",
              }}
            >
              {isActive ? tEsp(noteName) : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
