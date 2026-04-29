import { createContext, useContext, useState, useCallback } from "react";

/**
 * Context para la mascota interactiva (foca kawaii)
 * Maneja:
 * - Trigger de animación punch cuando el usuario acierta
 * - Modo actual para tooltips contextuales
 * - Estado de visibilidad del tooltip
 */

export const MascotaFocaContext = createContext();

/**
 * Hook para usar el contexto de la mascota
 * @returns {Object} { triggerPunch, setCurrentMode, currentMode, showTooltip, setShowTooltip, currentBanda, setCurrentBanda, audioLegendOpen, setAudioLegendOpen }
 */
export const useMascotaContext = () => {
  const context = useContext(MascotaFocaContext);
  if (!context) {
    console.warn("[MascotaFocaContext] useMascotaContext called outside MascotaFocaProvider");
    return {
      triggerPunch: () => {},
      setCurrentMode: () => {},
      currentMode: "tabla",
      showTooltip: false,
      setShowTooltip: () => {},
      currentBanda: null,
      setCurrentBanda: () => {},
      audioLegendOpen: false,
      setAudioLegendOpen: () => {},
      currentHint: null,
      updateHint: () => {},
      resetHints: () => {},
      resetHintsTrigger: 0,
    };
  }
  return context;
};

/**
 * Provider para envolver toda la app
 * Proporciona funciones para interactuar con la mascota
 */
export function MascotaFocaProvider({ children }) {
  const [punchTrigger, setPunchTrigger] = useState(0);
  const [currentMode, setCurrentMode] = useState("tabla");
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentBanda, setCurrentBanda] = useState(null); // Para tooltips dinámicos de bandas
  const [audioLegendOpen, setAudioLegendOpen] = useState(false); // Para AudioLegendModal
  const [currentHint, setCurrentHint] = useState(null); // Para pistas progresivas
  const [resetHintsTrigger, setResetHintsTrigger] = useState(0); // Trigger para resetear hints

  /**
   * Dispara la animación de punch de la foca
   * Se llama desde los modos cuando el usuario acierta
   */
  const triggerPunch = useCallback(() => {
    setPunchTrigger((prev) => prev + 1);
  }, []);

  /**
   * Actualiza la pista actual
   */
  const updateHint = useCallback((hint) => {
    setCurrentHint(hint);
  }, []);

  /**
   * Resetea el sistema de pistas
   * Se llama cuando el usuario contesta correctamente
   */
  const resetHints = useCallback(() => {
    setCurrentHint(null);
    setResetHintsTrigger((prev) => prev + 1);
  }, []);

  const value = {
    punchTrigger,
    triggerPunch,
    currentMode,
    setCurrentMode,
    showTooltip,
    setShowTooltip,
    currentBanda,
    setCurrentBanda,
    audioLegendOpen,
    setAudioLegendOpen,
    currentHint,
    updateHint,
    resetHints,
    resetHintsTrigger,
  };

  return (
    <MascotaFocaContext.Provider value={value}>
      {children}
    </MascotaFocaContext.Provider>
  );
}
