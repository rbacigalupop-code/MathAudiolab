/**
 * Catálogo de canciones desbloqueables
 *
 * Cada canción tiene una melodía icónica codificada como secuencia de notas.
 * El niño "toca" la canción al responder correctamente — cada acierto
 * reproduce la siguiente nota.
 *
 * Formato de notas: [nota_Tone.js, duración_Tone.js]
 * Duraciones: "16n" (semicorchea), "8n" (corchea), "4n" (negra), "2n" (blanca), "1n" (redonda)
 *
 * Nota legal/educativa:
 * Las melodías son fragmentos icónicos cortos (8-20 notas) para reconocimiento
 * y aprendizaje. Uso transformativo educacional. Notas aproximadas en algunos casos
 * para adaptarse al rango pentatónico/melódico de la app.
 */

export const SONGS = [
  // ============================================
  // FÁCILES (canciones cortas, ideales para primeros desbloqueos)
  // ============================================
  {
    id: "twinkle-twinkle",
    title: "Estrellita ¿dónde estás?",
    artist: "Clásica",
    emoji: "⭐",
    difficulty: "facil",
    color: "#fbbf24",
    notes: [
      ["C4", "4n"], ["C4", "4n"], ["G4", "4n"], ["G4", "4n"],
      ["A4", "4n"], ["A4", "4n"], ["G4", "2n"],
      ["F4", "4n"], ["F4", "4n"], ["E4", "4n"], ["E4", "4n"],
      ["D4", "4n"], ["D4", "4n"], ["C4", "2n"],
    ],
    description: "La canción de cuna más conocida del mundo",
    reward: "🌟 ¡Estrella musical!",
  },

  {
    id: "imperial-march",
    title: "Marcha Imperial",
    artist: "Star Wars",
    emoji: "🌌",
    difficulty: "facil",
    color: "#1f2937",
    notes: [
      ["G3", "4n"], ["G3", "4n"], ["G3", "4n"],
      ["Eb3", "8n"], ["Bb3", "16n"],
      ["G3", "4n"],
      ["Eb3", "8n"], ["Bb3", "16n"],
      ["G3", "2n"],
    ],
    description: "El tema de Darth Vader",
    reward: "⚡ ¡Que la Fuerza te acompañe!",
  },

  {
    id: "mario-theme",
    title: "Super Mario Bros",
    artist: "Nintendo",
    emoji: "🍄",
    difficulty: "facil",
    color: "#ef4444",
    notes: [
      ["E5", "8n"], ["E5", "8n"], ["E5", "4n"],
      ["C5", "8n"], ["E5", "4n"],
      ["G5", "2n"],
      ["G4", "2n"],
    ],
    description: "El tema más reconocible de los videojuegos",
    reward: "🍄 ¡Bowser temblará!",
  },

  // ============================================
  // CLÁSICOS (Beethoven, etc. — para construir cultura musical)
  // ============================================
  {
    id: "ode-to-joy",
    title: "Himno a la Alegría",
    artist: "Beethoven",
    emoji: "🎼",
    difficulty: "facil",
    color: "#8b5cf6",
    notes: [
      ["E4", "4n"], ["E4", "4n"], ["F4", "4n"], ["G4", "4n"],
      ["G4", "4n"], ["F4", "4n"], ["E4", "4n"], ["D4", "4n"],
      ["C4", "4n"], ["C4", "4n"], ["D4", "4n"], ["E4", "4n"],
      ["E4", "4n"], ["D4", "8n"], ["D4", "2n"],
    ],
    description: "El símbolo musical de la Unión Europea",
    reward: "🎼 ¡Beethoven estaría orgulloso!",
  },

  // ============================================
  // MY CHEMICAL ROMANCE
  // ============================================
  {
    id: "black-parade",
    title: "Welcome to the Black Parade",
    artist: "My Chemical Romance",
    emoji: "🖤",
    difficulty: "medio",
    color: "#1e1b4b",
    // El icónico intro de piano: "When I was a young boy..."
    notes: [
      ["G4", "4n"], ["G4", "4n"], ["G4", "4n"], ["G4", "4n"],
      ["A4", "4n"], ["G4", "8n"], ["F4", "8n"],
      ["G4", "2n"],
      ["G4", "4n"], ["G4", "4n"], ["G4", "4n"], ["G4", "4n"],
      ["A4", "4n"], ["Bb4", "4n"],
      ["A4", "2n"],
    ],
    description: "El himno emo más legendario de los 2000",
    reward: "🖤 ¡Eres parte del Black Parade!",
  },

  {
    id: "im-not-okay",
    title: "I'm Not Okay",
    artist: "My Chemical Romance",
    emoji: "💔",
    difficulty: "medio",
    color: "#7f1d1d",
    // El riff icónico del coro
    notes: [
      ["D4", "8n"], ["D4", "8n"], ["F4", "8n"], ["A4", "8n"],
      ["G4", "4n"], ["F4", "4n"],
      ["E4", "8n"], ["D4", "8n"], ["E4", "8n"], ["F4", "8n"],
      ["D4", "2n"],
    ],
    description: "Pop punk eterno: \"I'm not okay, you wear me out\"",
    reward: "💔 ¡You're not okay, AND THAT'S OKAY!",
  },

  {
    id: "helena",
    title: "Helena",
    artist: "My Chemical Romance",
    emoji: "🥀",
    difficulty: "medio",
    color: "#831843",
    notes: [
      ["A4", "8n"], ["A4", "8n"], ["G4", "8n"], ["F4", "8n"],
      ["E4", "4n"], ["D4", "4n"],
      ["F4", "8n"], ["G4", "8n"], ["A4", "8n"], ["G4", "8n"],
      ["F4", "2n"],
    ],
    description: "\"So long and goodnight\" — una despedida épica",
    reward: "🥀 ¡So long and goodnight!",
  },

  // ============================================
  // BLACKPINK
  // ============================================
  {
    id: "ddu-du-ddu-du",
    title: "DDU-DU DDU-DU",
    artist: "BLACKPINK",
    emoji: "🖤",
    difficulty: "medio",
    color: "#ec4899",
    // El icónico riff del drop ("hit you with that ddu-du ddu-du")
    notes: [
      ["F#4", "8n"], ["F#4", "8n"], ["A4", "8n"], ["F#4", "8n"],
      ["C5", "8n"], ["A4", "8n"], ["F#4", "4n"],
      ["E4", "8n"], ["F#4", "8n"], ["A4", "4n"],
      ["F#4", "2n"],
    ],
    description: "Hit you with that ddu-du ddu-du du!",
    reward: "🖤💗 ¡BLACKPINK in your area!",
  },

  {
    id: "kill-this-love",
    title: "Kill This Love",
    artist: "BLACKPINK",
    emoji: "💗",
    difficulty: "medio",
    color: "#db2777",
    // Riff icónico de los bronces
    notes: [
      ["C5", "8n"], ["B4", "8n"], ["A4", "8n"], ["G4", "8n"],
      ["A4", "4n"], ["G4", "8n"], ["F4", "8n"],
      ["E4", "8n"], ["D4", "8n"], ["C4", "4n"],
      ["E4", "2n"],
    ],
    description: "Let's Kill This Love! (los bronces icónicos)",
    reward: "💗 ¡Lisa, Jisoo, Jennie, Rosé estarían orgullosas!",
  },

  // ============================================
  // DESAFÍOS (canciones más largas, para sesiones largas)
  // ============================================
  {
    id: "fur-elise",
    title: "Für Elise",
    artist: "Beethoven",
    emoji: "🎹",
    difficulty: "dificil",
    color: "#a78bfa",
    notes: [
      ["E5", "8n"], ["Eb5", "8n"], ["E5", "8n"], ["Eb5", "8n"],
      ["E5", "8n"], ["B4", "8n"], ["D5", "8n"], ["C5", "8n"],
      ["A4", "4n"],
      ["C4", "8n"], ["E4", "8n"], ["A4", "8n"],
      ["B4", "4n"],
      ["E4", "8n"], ["G#4", "8n"], ["B4", "8n"],
      ["C5", "4n"],
    ],
    description: "Una de las melodías de piano más famosas de todos los tiempos",
    reward: "🎹 ¡Eres un virtuoso!",
  },

  {
    id: "happy-birthday",
    title: "Cumpleaños Feliz",
    artist: "Tradicional",
    emoji: "🎂",
    difficulty: "facil",
    color: "#f59e0b",
    notes: [
      ["C4", "8n"], ["C4", "8n"], ["D4", "4n"], ["C4", "4n"], ["F4", "4n"],
      ["E4", "2n"],
      ["C4", "8n"], ["C4", "8n"], ["D4", "4n"], ["C4", "4n"], ["G4", "4n"],
      ["F4", "2n"],
    ],
    description: "Para tocar en cualquier cumpleaños familiar",
    reward: "🎂 ¡Listo para tocar en cumpleaños!",
  },
];

/**
 * Obtener canción por ID
 */
export function getSongById(songId) {
  return SONGS.find((s) => s.id === songId) || null;
}

/**
 * Obtener canciones agrupadas por dificultad
 */
export function getSongsByDifficulty() {
  return {
    facil: SONGS.filter((s) => s.difficulty === "facil"),
    medio: SONGS.filter((s) => s.difficulty === "medio"),
    dificil: SONGS.filter((s) => s.difficulty === "dificil"),
  };
}

/**
 * Canción por defecto al iniciar (la más accesible)
 */
export const DEFAULT_SONG_ID = "twinkle-twinkle";
