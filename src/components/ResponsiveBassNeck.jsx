import React, { useState, useEffect } from "react";

const FP = Array.from({ length: 13 }, (_, n) => Math.round(560 * (1 - Math.pow(2, -n / 12))));
const STRINGS_T = [
  ["G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4"],
  ["D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4"],
  ["A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3"],
  ["E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3"],
];

const NE = {
  C: "Do",
  "C#": "Do#",
  D: "Re",
  "D#": "Re#",
  E: "Mi",
  F: "Fa",
  "F#": "Fa#",
  G: "Sol",
  "G#": "Sol#",
  A: "La",
  "A#": "La#",
  B: "Si",
};

function tEsp(n) {
  const m = n.match(/([A-G]#?)/);
  return m ? NE[m[1]] || m[1] : n;
}

export function ResponsiveBassNeck({ activeNote, onFretClick }) {
  const [W, setW] = useState(580);
  const [H, setH] = useState(118);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setW(Math.max(280, Math.min(600, rect.width - 8)));
      setH(Math.max(60, Math.floor(W * 0.2)));
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [W]);

  const sY = [H * 0.15, H * 0.37, H * 0.59, H * 0.81];

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", margin: "12px 0", borderRadius: 8, overflow: "hidden" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: 8,
          overflow: "hidden",
          cursor: "pointer",
          background: "#140e07",
        }}
      >
        <rect width={W} height={H} fill="#140e07" rx={8} />
        <rect width={W * 0.057} height={H} fill="#1e1408" />

        {[3, 5, 7, 9, 12].map((f) => {
          const cx = (FP[f - 1] + FP[f]) / 2 + W * 0.057;
          return f === 12
            ? [
                <circle key={f + "a"} cx={cx} cy={H / 2 - 16} r={4} fill="#e8d5a0" opacity={0.55} />,
                <circle key={f + "b"} cx={cx} cy={H / 2 + 16} r={4} fill="#e8d5a0" opacity={0.55} />,
              ]
            : <circle key={f} cx={cx} cy={H / 2} r={4} fill="#e8d5a0" opacity={0.45} />;
        })}

        {FP.slice(1).map((x, i) => (
          <line
            key={i}
            x1={x + W * 0.057}
            y1={H * 0.1}
            x2={x + W * 0.057}
            y2={H * 0.9}
            stroke="#5a4a35"
            strokeWidth={i === 11 ? 3 : 1.5}
          />
        ))}

        <rect x={W * 0.054} y={H * 0.1} width={W * 0.009} height={H * 0.8} fill="#e8d5a0" rx={1} />

        {sY.map((y, s) => (
          <line
            key={s}
            x1={W * 0.057}
            y1={y}
            x2={W}
            y2={y}
            stroke={s === 3 ? "#d4a84b" : s === 2 ? "#c8c8c8" : "#b0b0b0"}
            strokeWidth={3.8 - s * 0.55}
          />
        ))}

        {["G", "D", "A", "E"].map((n, s) => (
          <text
            key={s}
            x={W * 0.028}
            y={sY[s] + 5}
            textAnchor="middle"
            fontSize={Math.max(8, W * 0.015)}
            fill="#e8d5a0"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {n}
          </text>
        ))}

        {STRINGS_T.map((str, s) =>
          str.map((note, f) => {
            const x1 = f === 0 ? W * 0.057 : FP[f - 1] + W * 0.057;
            const x2 = FP[f] + W * 0.057;
            const cx = (x1 + x2) / 2;
            const isActive = activeNote === note;

            return (
              <g key={`${s}-${f}`} onClick={() => onFretClick(note)} style={{ cursor: "pointer" }}>
                <rect x={x1 + 1} y={sY[s] - 14} width={x2 - x1 - 2} height={28} fill="transparent" />
                {isActive && (
                  <>
                    <circle cx={cx} cy={sY[s]} r={11} fill="#f97316" />
                    <text
                      x={cx}
                      y={sY[s] + 4}
                      textAnchor="middle"
                      fontSize={8}
                      fill="#fff"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {tEsp(note)}
                    </text>
                  </>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
