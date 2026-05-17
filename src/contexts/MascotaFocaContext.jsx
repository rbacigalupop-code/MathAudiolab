import { createContext, useContext, useState, useCallback } from "react";

/**
 * Context para la mascota interactiva (foca kawaii)
 * Maneja:
 * - Trigger de animación punch cuando el usuario acierta
 * - Modo actual para tooltips contextuales
 * - Sistema de pistas progresivas pedagógicas
 */

export const MascotaFocaContext = createContext();

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
      currentHint: null,
      updateHint: () => {},
      resetHints: () => {},
      resetHintsTrigger: 0,
    };
  }
  return context;
};

export function MascotaFocaProvider({ children }) {
  const [punchTrigger, setPunchTrigger] = useState(0);
  const [currentMode, setCurrentMode] = useState("tabla");
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentHint, setCurrentHint] = useState(null);
  const [resetHintsTrigger, setResetHintsTrigger] = useState(0);

  const triggerPunch = useCallback(() => {
    setPunchTrigger((prev) => prev + 1);
  }, []);

  const updateHint = useCallback((hint) => {
    setCurrentHint(hint);
  }, []);

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
