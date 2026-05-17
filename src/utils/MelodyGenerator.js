/**
 * MelodyGenerator
 *
 * Convierte respuestas matemáticas correctas en notas musicales.
 * Usa escala PENTATÓNICA en Do mayor (C, D, E, G, A) que es famosa por
 * sonar armoniosa en cualquier orden — perfecta para que las melodías
 * generadas por los niños siempre suenen agradables.
 *
 * Conexión pedagógica:
 * - El VALOR de la respuesta determina la nota (resultados similares → notas similares)
 * - El TIPO de operación determina el ritmo (sumas más rápidas, potencias más largas)
 * - La RACHA (streak) determina la octava (mayor racha → notas más agudas/emocionantes)
 */

// Escala pentatónica en Do mayor, abarcando 3 octavas (rango cómodo para piano/bajo)
export const PENTATONIC_SCALE = [
  "C3", "D3", "E3", "G3", "A3",
  "C4", "D4", "E4", "G4", "A4",
  "C5", "D5", "E5", "G5", "A5",
];

// Duraciones por tipo de operación (notación Tone.js)
const DURATION_BY_OPERATION = {
  "+": "8n",   // sumas: corcheas (ágil)
  "-": "8n",   // restas: corcheas
  "×": "4n",   // multiplicaciones: negras (medio)
  "*": "4n",
  "÷": "4n",   // división: negras
  "/": "4n",
  "^": "2n",   // potencias: blancas (largo, dramático)
  "frac": "4n", // fracciones: negras
};

/**
 * Convertir una respuesta numérica a una nota musical
 *
 * @param {number} answer - Resultado de la operación
 * @param {string} operation - Símbolo de la operación
 * @param {number} streak - Racha actual de aciertos
 * @returns {{note: string, duration: string, color: string}}
 */
export function generateNoteForAnswer(answer, operation = "+", streak = 0) {
  // Normalizar respuesta: módulo para mantener en rango pentatónico
  const safeAnswer = Math.abs(Math.floor(Number(answer) || 0));

  // Calcular índice base en la escala (resultados pequeños = notas graves)
  let scaleIndex = safeAnswer % PENTATONIC_SCALE.length;

  // Boost por racha: cada 3 aciertos seguidos, subir una octava
  const streakBoost = Math.min(2, Math.floor(streak / 3)) * 5;
  scaleIndex = Math.min(scaleIndex + streakBoost, PENTATONIC_SCALE.length - 1);

  const note = PENTATONIC_SCALE[scaleIndex];
  const duration = DURATION_BY_OPERATION[operation] || "4n";

  // Color asociado a la octava (para visualización)
  const octave = parseInt(note.slice(-1), 10);
  const colors = {
    3: "#3b82f6", // azul (grave)
    4: "#22c55e", // verde (medio)
    5: "#f97316", // naranja (agudo)
    6: "#ec4899", // rosa (muy agudo)
  };
  const color = colors[octave] || "#94a3b8";

  return { note, duration, color };
}

/**
 * Convertir array de notas en formato de reproducción Tone.js
 * Calcula offsets de tiempo acumulativos
 */
export function preparePlaybackSequence(notes, baseDelay = 0.3) {
  const durations = {
    "16n": 0.125,
    "8n": 0.25,
    "4n": 0.5,
    "2n": 1.0,
    "1n": 2.0,
  };

  let cumulativeTime = baseDelay;
  return notes.map((n) => {
    const startTime = cumulativeTime;
    const noteDuration = durations[n.duration] || 0.5;
    cumulativeTime += noteDuration * 0.85; // ligero solape para sentirse conectado
    return {
      ...n,
      startOffset: startTime,
    };
  });
}

/**
 * Generar un título amigable para la canción según número de notas y fecha
 */
export function generateSongTitle(notes) {
  if (!notes || notes.length === 0) return "Canción vacía";

  const date = new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
  });

  // Adjetivos según cantidad de notas
  const adjective =
    notes.length < 5 ? "Pequeña"
    : notes.length < 15 ? "Bonita"
    : notes.length < 30 ? "Épica"
    : "Sinfonía";

  return `${adjective} canción del ${date}`;
}
