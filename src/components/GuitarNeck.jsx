import React, { useState, useEffect } from "react";

const FP = Array.from({ length: 13 }, (_, n) => Math.round(560 * (1 - Math.pow(2, -n / 12))));
const STRINGS_T = [
  ["E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5"],
  ["B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"],
  ["G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4"],
  ["D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4"],
  ["A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3"],
  ["E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3"],
];

const NE = {
  C: "Do", "C#": "Do#", D: "Re", "D#": "Re#", E: "Mi", F: "Fa", "F#": "Fa#",
  G: "Sol", "G#": "Sol#", A: "La", "A#": "La#", B: "Si",
};

function tEsp(n) {
  const m = n.match(/([A-G]#?)/);
  return m ? NE[m[1]] || m[1] : n;
}

export function GuitarNeck({ activeNote, onFretClick }) {
  const [W, setW] = useState(580);
  const [H, setH] = useState(160);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setW(Math.max(280, Math.min(600, rect.width - 8)));
      setH(Math.max(80, Math.floor(W * 0.27)));
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [W]);

  const sY = [H * 0.1, H * 0.27, H * 0.44, H * 0.61, H * 0.78, H * 0.95];

  return (
    <div ref={containerRef} style={{ width: "100%", padding: "8px 0" }}>
      <svg width={W} height={H} style={{ display: "block", margin: "0 auto", background: "#0f172a" }}>
        <defs>
          <linearGradient id="fretGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Frets */}
        {FP.map((x, i) => (
          <line key={`fret-${i}`} x1={x} y1={sY[0] - 4} x2={x} y2={sY[5] + 4} stroke="url(#fretGrad)" strokeWidth="1.5" />
        ))}

        {/* Strings */}
        {sY.map((y, strIdx) => (
          <line key={`string-${strIdx}`} x1={0} y1={y} x2={W} y2={y} stroke="#475569" strokeWidth="2" />
        ))}

        {/* Fret markers (dots) */}
        {[3, 5, 7, 9, 12].map((fret) => (
          <circle key={`marker-${fret}`} cx={FP[fret]} cy={H / 2} r="3" fill="#94a3b8" opacity="0.4" />
        ))}

        {/* Frets clickables */}
        {STRINGS_T.map((cuerdaNota, strIdx) =>
          cuerdaNota.map((nota, fretIdx) => {
            const x = FP[fretIdx];
            const y = sY[strIdx];
            const isActive = activeNote === nota;
            return (
              <g key={`fret-${strIdx}-${fretIdx}`} onClick={() => onFretClick(nota)} style={{ cursor: "pointer" }}>
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 10 : 6}
                  fill={isActive ? "#f97316" : "#64748b"}
                  opacity={isActive ? 1 : 0.5}
                  style={{ transition: "all 0.2s" }}
                />
                {isActive && <text x={x} y={y + 18} textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="bold">{tEsp(nota)}</text>}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
