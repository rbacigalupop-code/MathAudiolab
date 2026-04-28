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
 * @returns {Object} { triggerPunch, setCurrentMode, currentMode, showTooltip, setShowTooltip }
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

  /**
   * Dispara la animación de punch de la foca
   * Se llama desde los modos cuando el usuario acierta
   */
  const triggerPunch = useCallback(() => {
    setPunchTrigger((prev) => prev + 1);
  }, []);

  const value = {
    punchTrigger,
    triggerPunch,
    currentMode,
    setCurrentMode,
    showTooltip,
    setShowTooltip,
  };

  return (
    <MascotaFocaContext.Provider value={value}>
      {children}
    </MascotaFocaContext.Provider>
  );
}
