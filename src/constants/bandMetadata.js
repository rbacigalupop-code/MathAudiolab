/**
 * Band Metadata for Educational Integration
 * Maps real bands to mathematical concepts with audio properties
 */

export const BAND_METADATA = {
  mcr: {
    name: "My Chemical Romance",
    concept: "powers",
    genre: "Emo/Rock",
    tracks: [
      {
        title: "Welcome to the Black Parade",
        videoId: "ZXhIPtWfYl0",
        bpm: 132,
        description: "Iconic rock anthem - perfect for exponential growth visualization"
      }
    ]
  },

  bunkers: {
    name: "Los Bunkers",
    concept: "division",
    genre: "Rock Chileno",
    tracks: [
      {
        title: "Ven Aquí",
        videoId: "dQw4w9WgXcQ",  // Placeholder - replace with actual
        bpm: 95,
        description: "Rhythmic patterns ideal for division practice"
      }
    ]
  },

  twice: {
    name: "Twice",
    concept: "multiplication",
    genre: "K-Pop",
    tracks: [
      {
        title: "Fancy",
        videoId: "tz3-kVzIY58",
        bpm: 124,
        description: "Choreography-based multiplication counting"
      },
      {
        title: "Likey",
        videoId: "V6DiYvFZkaY",
        bpm: 116,
        description: "Rhythmic counting patterns for multiplication"
      }
    ]
  },

  blackpink: {
    name: "Blackpink",
    concept: "multiplication",
    genre: "K-Pop",
    tracks: [
      {
        title: "Shut Down",
        videoId: "OJ4pHLqulO0",
        bpm: 108,
        description: "Strong beats for multiplication practice"
      },
      {
        title: "DDU-DU DDU-DU",
        videoId: "IHNzOHi8sJs",
        bpm: 104,
        description: "High-energy multiplication drills"
      }
    ]
  }
};

/**
 * Get all available bands
 * @returns {Array} Array of band objects
 */
export function getAllBands() {
  return Object.entries(BAND_METADATA).map(([id, data]) => ({
    id,
    ...data
  }));
}

/**
 * Get a specific band by ID
 * @param {string} bandId - Band identifier (e.g., "mcr", "twice")
 * @returns {Object|null} Band metadata or null if not found
 */
export function getBandById(bandId) {
  return BAND_METADATA[bandId] || null;
}

/**
 * Get bands by mathematical concept
 * @param {string} concept - Concept name (e.g., "powers", "division", "multiplication")
 * @returns {Array} Bands associated with the concept
 */
export function getBandsByConc(concept) {
  return Object.entries(BAND_METADATA)
    .filter(([_, data]) => data.concept === concept)
    .map(([id, data]) => ({
      id,
      ...data
    }));
}

/**
 * Get a random track from a specific band
 * @param {string} bandId - Band identifier
 * @returns {Object|null} Track object or null if band not found
 */
export function getRandomTrackFromBand(bandId) {
  const band = BAND_METADATA[bandId];
  if (!band || !band.tracks || band.tracks.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * band.tracks.length);
  return band.tracks[randomIndex];
}

export default BAND_METADATA;
