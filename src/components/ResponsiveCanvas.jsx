import { useRef, useEffect } from "react";
import * as Tone from "tone";

const NOTE_COLORS = {
  Sol: "#f97316",
  La: "#eab308",
  Si: "#22c55e",
  Do: "#06b6d4",
  Re: "#3b82f6",
  Mi: "#8b5cf6",
  "Fa#": "#ec4899",
};

export function ResponsiveCanvas({ rockModeActive = false }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const anRef = useRef(null);
  const fftRef = useRef(null);

  useEffect(() => {
    const an = new Tone.Analyser("waveform", 512);
    const fft = new Tone.Analyser("fft", 64);
    Tone.getDestination().connect(an);
    Tone.getDestination().connect(fft);
    anRef.current = an;
    fftRef.current = fft;

    const c = ref.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    const updateSize = () => {
      const rect = c.getBoundingClientRect();
      c.width = Math.floor(rect.width * window.devicePixelRatio);
      c.height = Math.floor(rect.height * window.devicePixelRatio);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateSize();

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const v = an.getValue();
      const fftData = fft.getValue();

      let maxIdx = 0,
        maxVal = -Infinity;
      for (let i = 0; i < fftData.length; i++) {
        if (fftData[i] > maxVal) {
          maxVal = fftData[i];
          maxIdx = i;
        }
      }

      const sampleRate = Tone.getContext().sampleRate || 44100;
      const peakFreq = (maxIdx * sampleRate) / (fftData.length * 2);
      let color = "#f97316";

      if (peakFreq > 50 && maxVal > -60) {
        const noteName = Tone.Frequency(peakFreq).toNote();
        const m = noteName.match(/([A-G]#?)/);
        if (m) {
          const espMap = {
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
          const esp = espMap[m[1]];
          if (NOTE_COLORS[esp]) color = NOTE_COLORS[esp];
        }
      }

      if (rockModeActive) color = "#dc2626";

      const w = ref.current?.getBoundingClientRect().width || 580;
      const h = ref.current?.getBoundingClientRect().height || 56;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1e293b66";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      const step = w / v.length;
      v.forEach((val, i) => {
        const x = i * step;
        const y = h / 2 + val * (h / 2) * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    draw();

    window.addEventListener("resize", updateSize);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", updateSize);
      an.dispose();
      fft.dispose();
    };
  }, [rockModeActive]);

  return (
    <canvas
      ref={ref}
      style={{
        width: "100%",
        height: "56px",
        borderRadius: 8,
        display: "block",
        background: "#0f172a",
      }}
    />
  );
}
