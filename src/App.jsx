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
import { LessonSelector } from "./components/LessonSelector";
import SplashScreen from "./components/SplashScreen";
import LessonReader from "./components/LessonReader";
import AuthGate from "./components/AuthGate";
import ModoTabla from "./modes/ModoTabla";
import ModoEjercicios from "./modes/ModoEjercicios";
import ModoSumas from "./modes/ModoSumas";
import ModoRestas from "./modes/ModoRestas";
import ModoPotencias from "./modes/ModoPotencias";
import ModoDivision from "./modes/ModoDivision";
import ModoFracciones from "./modes/ModoFracciones";
import ModoEscuchar from "./modes/ModoEscuchar";
import ModoBatalla from "./modes/ModoBatalla";
import ModoLecciones from "./modes/ModoLecciones";
import SamplesTest from "./components/SamplesTest";
import { MascotaFocaProvider, useMascotaContext } from "./contexts/MascotaFocaContext";
import { MelodyComposerProvider } from "./contexts/MelodyComposerContext";
import MascotaFoca from "./components/MascotaFoca";
import { MelodyPanel } from "./components/MelodyPanel";
import lessonesData from "./data/lessons.json";

const NIVELES = [
  { id: 1, label: "Nivel 1", desc: "Tablas 1–3", tablas: [1, 2, 3] },
  { id: 2, label: "Nivel 2", desc: "Tablas 2–5", tablas: [2, 3, 4, 5] },
  { id: 3, label: "Nivel 3", desc: "Tablas 4–7", tablas: [4, 5, 6, 7] },
  { id: 4, label: "Nivel 4", desc: "Tablas 6–10", tablas: [6, 7, 8, 9, 10] },
  { id: 5, label: "Nivel 5", desc: "Todas", tablas: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
];

// Ordenados por complejidad pedagógica: de lo más básico a lo más complejo
const MODOS = [
  { id: "sumas", label: "➕ Sumas" },           // 1. Operación base
  { id: "restas", label: "➖ Restas" },         // 2. Inversa de sumar
  { id: "ejercicios", label: "✖️ Multiplicar" }, // 3. Suma repetida
  { id: "tabla", label: "📖 Tabla" },           // 4. Referencia para multiplicar
  { id: "division", label: "➗ División" },     // 5. Inversa de multiplicar
  { id: "potencias", label: "⚡ Potencias" },   // 6. Multiplicación repetida
  { id: "fracciones", label: "🔀 Fracciones" }, // 7. Partes de un entero
  { id: "escuchar", label: "👂 Escuchar" },     // 8. Reconocer auditivamente
  { id: "batalla", label: "⚔️ Batalla" },       // 9. Reto combinado
];

export function MainApp({ store, setStore, profile, switchProfile, onProfileChange, onSwitchToParent }) {
  const [modo, setModo] = useState("sumas");
  const [instrumento, setInstrumento] = useState("piano");
  const [reloading, setReloading] = useState(false);
  const [rockActive, setRockActive] = useState(false);
  const [zenMode, setZenModeLocal] = useState(() => store.preferencias?.zenMode ?? true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

  const audio = useAudioManager();
  const { setCurrentMode } = useMascotaContext();

  // Filtrar lecciones por perfil del usuario
  const leccionesDisponibles = lessonesData.lecciones.filter((l) => l.perfil === profile);

  // Sincronizar zenMode con store
  const setZenMode = (value) => {
    setZenModeLocal(value);
    setStore(s => ({
      ...s,
      preferencias: { ...s.preferencias, zenMode: value }
    }));
  };

  // Sincronizar modo con contexto de la mascota para tooltips
  useEffect(() => {
    setCurrentMode(modo);
  }, [modo, setCurrentMode]);

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

  // Sistema de colores dinámico: Zen Mode + Rock Mode
  const getThemeColors = () => {
    if (rockActive) {
      // Rock mode siempre es rojo (override)
      return {
        headerColor: "#dc2626",
        bgGradient: "linear-gradient(180deg, #0f172a 0%, #1f0808 100%)",
        accentColor: "#dc2626",
      };
    }

    if (zenMode) {
      // Zen mode: colores suaves, azul y verde
      return {
        headerColor: "#3b82f6",
        bgGradient: "linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)",
        accentColor: "#06b6d4",
      };
    }

    // Modo normal: naranja vibrante
    return {
      headerColor: "#f97316",
      bgGradient: "#0f172a",
      accentColor: "#f97316",
    };
  };

  const themeColors = getThemeColors();
  const headerColor = themeColors.headerColor;
  const bgGradient = themeColors.bgGradient;
  const accentColor = themeColors.accentColor;

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
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setModo("lecciones")}
              title="Lecciones Inmersivas"
              style={{
                background: modo === "lecciones" ? "#f97316" : "#1e293b",
                border: "1.5px solid #334155",
                color: modo === "lecciones" ? "#fff" : "#94a3b8",
                borderRadius: 10,
                padding: "8px 8px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                minHeight: 40,
                minWidth: 40,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f97316";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
              }}
            >
              📚
            </motion.button>
            <SettingsPanel store={store} setStore={setStore} profile={profile} switchProfile={switchProfile} zenMode={zenMode} setZenMode={setZenMode} />
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

        {/* Melody Composer: cada acierto agrega una nota */}
        <MelodyPanel audio={audio} instrumento={instrumento} />

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

        {/* Mostrar ModoLecciones si hay una lección seleccionada */}
        {leccionSeleccionada && (
          <AnimatePresence mode="wait">
            <motion.div key="leccion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setLeccionSeleccionada(null)}
                style={{
                  marginBottom: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#94a3b8",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ← Volver a Lecciones
              </button>
              <ModoLecciones
                lessonData={leccionSeleccionada}
                store={store}
                setStore={setStore}
                audio={audio}
                setRockActive={setRockActive}
                onBack={() => setLeccionSeleccionada(null)}
              />
            </motion.div>
          </AnimatePresence>
        )}

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
                <ModoEjercicios store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "sumas" && (
              <motion.div key="sumas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoSumas store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "restas" && (
              <motion.div key="restas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoRestas store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "potencias" && (
              <motion.div key="potencias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoPotencias store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "division" && (
              <motion.div key="division" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoDivision store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "fracciones" && (
              <motion.div key="fracciones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoFracciones store={store} setStore={setStore} audio={audio} instrumento={instrumento} setRockActive={setRockActive} rockActive={rockActive} />
              </motion.div>
            )}
            {modo === "escuchar" && (
              <motion.div key="escuchar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ModoEscuchar audio={audio} instrumento={instrumento} />
              </motion.div>
            )}
            {modo === "lecciones" && (
              <motion.div key="lecciones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LessonSelector
                  lecciones={leccionesDisponibles}
                  onSelect={setLeccionSeleccionada}
                  profile={profile}
                />
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
  const [selectedProfile, setSelectedProfile] = useState(null);
  const { store, updateStore, profile, switchProfile } = useLocalStorage();

  if (!ready) return <SplashScreen onReady={() => setReady(true)} />;

  // If a student profile is selected, show MainApp
  if (selectedProfile) {
    return (
      <MascotaFocaProvider>
        <MelodyComposerProvider>
          <MainApp
            store={store}
            setStore={updateStore}
            profile={profile}
            switchProfile={switchProfile}
            onProfileChange={(newProfile) => setSelectedProfile(newProfile)}
            onSwitchToParent={() => setSelectedProfile(null)}
          />
          <MascotaFoca />
        </MelodyComposerProvider>
      </MascotaFocaProvider>
    );
  }

  // Otherwise, show AuthGate for mode selection
  return (
    <MascotaFocaProvider>
      <MelodyComposerProvider>
        <AuthGate onProfileSelected={(profileId) => setSelectedProfile(profileId)} />
        <MascotaFoca />
      </MelodyComposerProvider>
    </MascotaFocaProvider>
  );
}
