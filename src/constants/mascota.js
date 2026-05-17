/**
 * Constantes para la mascota interactiva
 * Incluye tooltips, animaciones y configuración visual
 */

import educationalManual from "./educationalManual.json";

/**
 * Static tooltips por modo de juego
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
  lecciones: "📚 Lecciones: Aprende con música",
};

/**
 * Get dynamic tooltip for current mode
 * Uses educationalManual.json for rich pedagogical content
 *
 * NOTE: The 2nd param (legacy 'banda') is ignored — kept only for backwards
 * compatibility with any leftover call sites until full cleanup.
 *
 * @param {string} mode - Current game mode (ejercicios, potencias, etc)
 * @returns {string} Rich tooltip text with pedagogy tip
 */
export function getTooltipForMode(mode /* , _ignoredBanda */) {
  const modeMap = {
    ejercicios: "powers",
    multiplicacion: "powers",
    tabla: "powers",
    potencias: "powers",
    division: "division",
    sumas: "sums",
    restas: "subtractions",
    fracciones: "fractions",
  };

  const concept = modeMap[mode] || mode;

  // Use general concept content from educationalManual
  if (educationalManual.general && educationalManual.general[concept]) {
    const conceptContent = educationalManual.general[concept];
    return conceptContent.mascotaQuip || MASCOTA_TOOLTIPS[mode];
  }

  return MASCOTA_TOOLTIPS[mode] || "¡Tócame para instrucciones!";
}

/**
 * Configuración de animaciones para el punch
 */
export const MASCOTA_ANIMATION = {
  PUNCH_DURATION: 500,
  SHAKE_DURATION: 250,
  PULSE_DURATION: 250,
  TOOLTIP_TIMEOUT: 4000,
  PUNCH_ROTATION: 3,
  PUNCH_SCALE_MAX: 1.15,
};

/**
 * Paleta de colores para la foca
 */
export const MASCOTA_COLORS = {
  BODY: "#FFF8DC",
  OUTLINE: "#8B7355",
  EYE: "#000000",
  MOUTH: "#8B7355",
  CHEEK: "#FFB6C1",
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
