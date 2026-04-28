/**
 * Constantes para la mascota interactiva
 * Incluye tooltips, animaciones y configuración visual
 */

import educationalManual from "./educationalManual.json";

/**
 * Static tooltips as fallback
 */
export const MASCOTA_TOOLTIPS = {
  tabla: "📖 Tabla: Presiona para ver la tabla completa",
  ejercicios: "✅ Multiplicación: Escribe tu respuesta y presiona Enter",
  potencias: "⚡ Potencias: Cuenta cuántas veces se repite el número",
  division: "➗ División: Divide el número y escribe el resultado",
  escuchar: "👂 Escuchar: Reconoce la nota que tocó",
  batalla: "⚔️ Batalla: Compite contra otros jugadores",
  sumas: "➕ Sumas: Combina números y suma",
  restas: "➖ Restas: Quita para encontrar la diferencia",
  fracciones: "🔀 Fracciones: Divide el mundo en partes",
  lecciones: "📚 Lecciones: Aprende con bandas reales",
};

/**
 * Get dynamic tooltip for current mode and optional banda
 * Uses educationalManual.json for rich pedagogical content
 * @param {string} mode - Current game mode (ejercicios, potencias, etc)
 * @param {string} banda - Optional band name (mcr, bunkers, twice, blackpink)
 * @returns {string} Rich tooltip text with pedagogy tip
 */
export function getTooltipForMode(mode, banda = null) {
  const modeMap = {
    ejercicios: "powers", // Map mode names to concept names
    multiplicacion: "powers",
    tabla: "powers",
    potencias: "powers",
    division: "division",
    sumas: "sums",
    restas: "subtractions",
    fracciones: "fractions",
  };

  const concept = modeMap[mode] || mode;

  // Try to get band-specific content first
  if (banda && educationalManual[banda]) {
    const bandContent = educationalManual[banda];
    return bandContent.mascotaQuip || MASCOTA_TOOLTIPS[mode];
  }

  // Fall back to general concept content
  if (educationalManual.general && educationalManual.general[concept]) {
    const conceptContent = educationalManual.general[concept];
    return conceptContent.mascotaQuip || MASCOTA_TOOLTIPS[mode];
  }

  // Final fallback to static tooltip
  return MASCOTA_TOOLTIPS[mode] || "¡Tócame para instrucciones!";
}

/**
 * Configuración de animaciones para el punch
 */
export const MASCOTA_ANIMATION = {
  PUNCH_DURATION: 500,        // ms total
  SHAKE_DURATION: 250,        // ms para shake phase
  PULSE_DURATION: 250,        // ms para pulse phase
  TOOLTIP_TIMEOUT: 4000,      // ms antes de auto-cerrar tooltip
  PUNCH_ROTATION: 3,          // grados de rotación en shake
  PUNCH_SCALE_MAX: 1.15,      // escala máxima en pulse
};

/**
 * Paleta de colores para la foca
 */
export const MASCOTA_COLORS = {
  BODY: "#FFF8DC",            // Cream/tan para el cuerpo
  OUTLINE: "#8B7355",         // Marrón para outline
  EYE: "#000000",             // Negro para los ojos
  MOUTH: "#8B7355",           // Marrón para la boca
  CHEEK: "#FFB6C1",           // Rosa claro para mejillas
};

/**
 * Dimensiones de la foca
 */
export const MASCOTA_SIZE = {
  BODY_WIDTH: 100,
  BODY_HEIGHT: 140,
  EYE_RADIUS: 8,
  VIEWPORT_WIDTH: 200,
  VIEWPORT_HEIGHT: 250,
};
