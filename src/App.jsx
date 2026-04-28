import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";

import { useAudioManager, INSTRUMENTOS } from "./hooks/useAudioManager";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { ResponsiveCanvas } from "./components/ResponsiveCanvas";
import { ProgressStats } from "./components/ProgressStats";
import { InstrumentoSelector } from "./components/InstrumentoSelector";
import { SettingsPanel } from "./components/SettingsPanel";
import { MediaPanel } from "./components/MediaPanel";
import SplashScreen from "./components/SplashScreen";
import LessonReader from "./components/LessonReader";
import ModoTabla from "./modes/ModoTabla";
import ModoEjercicios from "./modes/ModoEjercicios";
import ModoPotencias from "./modes/ModoPotencias";
import ModoDivision from "./modes/ModoDivision";
import ModoEscuchar from "./modes/ModoEscuchar";
import ModoBatalla from "./modes/ModoBatalla";
import SamplesTest from "./components/SamplesTest";

const NIVELES = [
  { id: 1, label: "Nivel 1", desc: "Tablas 1–3", tablas: [1, 2, 3] },
  { id: 2, label: "Nivel 2", desc: "Tablas 2–5", tablas: [2, 3, 4, 5] },
  { id: 3, label: "Nivel 3", desc: "Tablas 4–7", tablas: [4, 5, 6, 7] },
  { id: 4, label: "Nivel 4", desc: "Tablas 6–10", tablas: [6, 7, 8, 9, 10] },
  { id: 5, label: "Nivel 5", desc: "Todas", tablas: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
];

const MODOS = [
  { id: "tabla", label: "📖 Tabla" },
  { id: "ejercicios", label: "✏️ Multiplicar" },
  { id: "potencias", label: "⚡ Potencias" },
  { id: "division", label: "➗ División" },
  { id: "escuchar", label: "👂 Escuchar" },
  { id: "batalla", label: "⚔️ Batalla" },
];

function MainApp({ store, setStore }) {
  const [modo, setModo] = useState("ejercicios");
  const [instrumento, setInstrumento] = useState("piano");
  const [reloading, setReloading] = useState(false);
  const [rockActive, setRockActive] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const audio = useAudioManager();

  if (showDiagnostics) return <SamplesTest onBack={() => setShowDiagnostics(false)} />;

  const cambiarInstrumento = async (id) => {
    if (id === instrumento || reloading) return;
    setReloading(true);
    setInstrumento(id);
    try {
      await audio.getSamplerSync(id);
    } catch {}
    setReloading(false);
  };

  const headerColor = rockActive ? "#dc2626" : "#f97316";
  const bgGradient = rockActive ? "linear-gradient(180deg, #0f172a 0%, #1f0808 100%)" : "#0f172a";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgGradient,
        fontFamily: "sans-serif",
        transition: "background .5s",
        padding: "clamp(10px, 3vw, 14px) clamp(8px, 3vw, 12px) 40px",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: "clamp(16px, 4vw, 18px)",
                fontWeight: 900,
                color: headerColor,
                margin: 0,
                letterSpacing: 1,
                transition: "color .3s",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {rockActive ? "🤘" : "🎸"} MathAudio Lab
            </h1>
            <p style={{ fontSize: "clamp(8px, 2vw, 10px)", color: "#475569", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis" }}>
              Nivel {store.nivel} · Racha: {store.mejorRacha}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              style={{
                background: "#1e293b",
                border: "1.5px solid #334155",
                color: "#94a3b8",
                borderRadius: 10,
                padding: "8px 8px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                minHeight: 40,
                minWidth: 40,
              }}
            >
              📚
            </button>
            <SettingsPanel store={store} setStore={setStore} />
            <MediaPanel mode={modo} />
            <button
              onClick={() => setShowDiagnostics(true)}
              title="Verificar samples de audio"
              style={{
                background: "#1e293b",
                border: "1.5px solid #334155",
                color: "#94a3b8",
                borderRadius: 10,
                padding: "8px 8px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                minHeight: 40,
                minWidth: 40,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = headerColor)}
              onMouseLeave={(e) => (e.target.style.borderColor = "#334155")}
            >
              🔧
            </button>
          </div>
        </div>

        {/* Instrumento selector */}
        <InstrumentoSelector
          instrumento={instrumento}
          onSelect={cambiarInstrumento}
          audio={audio}
          disabled={reloading}
        />

        {/* Visualizer */}
        <ResponsiveCanvas rockModeActive={rockActive} />

        {/* Progress Stats */}
        <ProgressStats store={store} />

        {/* Modo tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            margin: "10px 0",
            background: "#1e293b",
            borderRadius: 14,
            padding: 3,
            overflowX: "auto",
            minHeight: 40,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {MODOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModo(m.id)}
              style={{
                flex: "0 0 auto",
                padding: "clamp(6px, 1.5vw, 8px) clamp(6px, 1.5vw, 10px)",
                borderRadius: 10,
                border: "none",
                background: modo === m.id ? headerColor : "transparent",
                color: modo === m.id ? "#fff" : "#94a3b8",
                fontWeight: 700,
                fontSize: "clamp(9px, 1.5vw, 10px)",
                cursor: "pointer",
                transition: "all .18s",
                whiteSpace: "nowrap",
                minHeight: 32,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Game modes */}
        <div style={{ marginTop: 12 }}>
          <AnimatePresence mode="wait">
            {modo === "tabla" && (
              <motion.div key="tabla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoTabla tabla={store.tabla || 2} setTabla={(t) => setStore((s) => ({ ...s, tabla: t }))} audio={audio} instrumento={instrumento} />
              </motion.div>
            )}
            {modo === "ejercicios" && (
              <motion.div key="ejercicios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoEjercicios store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} />
              </motion.div>
            )}
            {modo === "potencias" && (
              <motion.div key="potencias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoPotencias store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} />
              </motion.div>
            )}
            {modo === "division" && (
              <motion.div key="division" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoDivision store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} />
              </motion.div>
            )}
            {modo === "escuchar" && (
              <motion.div key="escuchar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoEscuchar audio={audio} instrumento={instrumento} />
              </motion.div>
            )}
            {modo === "batalla" && (
              <motion.div key="batalla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoBatalla audio={audio} instrumento={instrumento} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { store, updateStore } = useLocalStorage();

  if (!ready) return <SplashScreen onReady={() => setReady(true)} />;
  return <MainApp store={store} setStore={updateStore} />;
}
