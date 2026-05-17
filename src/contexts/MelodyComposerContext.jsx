import { createContext, useContext, useState, useCallback, useRef } from "react";
import { generateNoteForAnswer, generateSongTitle } from "../utils/MelodyGenerator";
import { SONGS, getSongById, DEFAULT_SONG_ID } from "../data/songs";

/**
 * Context para el sistema de composición de melodías
 *
 * Soporta DOS modos:
 *
 * 1. MODO CANCIÓN (por defecto, más motivador):
 *    Cada respuesta correcta toca la SIGUIENTE nota de una canción real
 *    elegida por el niño. Al completar todas las notas, se "desbloquea"
 *    la canción y se celebra con un modal.
 *
 * 2. MODO LIBRE (compositor):
 *    Cada respuesta genera una nota pentatónica aleatoria.
 *    El niño "compone" una melodía única que puede guardar.
 *
 * Los datos persisten en localStorage por perfil.
 */

const MelodyComposerContext = createContext(null);

const STORAGE_KEY_UNLOCKED = "__mal_unlocked_songs";
const STORAGE_KEY_PROGRESS = "__mal_song_progress";
const STORAGE_KEY_SAVED = "__mal_saved_songs";

export function useMelodyComposer() {
  const context = useContext(MelodyComposerContext);
  if (!context) {
    console.warn("[MelodyComposer] usado fuera del Provider");
    return {
      mode: "song",
      setMode: () => {},
      // Modo canción
      currentSongId: DEFAULT_SONG_ID,
      setCurrentSong: () => {},
      songProgress: 0,
      songNotes: [],
      unlockedSongs: [],
      justUnlockedSong: null,
      dismissUnlock: () => {},
      // Modo libre
      notes: [],
      // Comunes
      addNote: () => {},
      clearMelody: () => {},
      lastAddedKey: 0,
      saveSong: () => {},
      savedSongs: [],
      deleteSong: () => {},
    };
  }
  return context;
}

export function MelodyComposerProvider({ children }) {
  // ============================================
  // ESTADO COMÚN
  // ============================================
  const [mode, setMode] = useState("song"); // "song" | "free"
  const [lastAddedKey, setLastAddedKey] = useState(0);
  const noteIdCounter = useRef(0);

  // ============================================
  // MODO CANCIÓN
  // ============================================
  const [currentSongId, setCurrentSongIdState] = useState(DEFAULT_SONG_ID);
  const [songProgress, setSongProgress] = useState(0); // notas completadas
  const [songNotes, setSongNotes] = useState([]); // notas tocadas en esta sesión
  const [justUnlockedSong, setJustUnlockedSong] = useState(null);

  const [unlockedSongs, setUnlockedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UNLOCKED);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Progreso persistente por canción (para retomar)
  const [songProgressMap, setSongProgressMap] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  /**
   * Cambiar la canción actual. Recupera el progreso guardado para esa canción.
   */
  const setCurrentSong = useCallback((songId) => {
    setCurrentSongIdState(songId);
    const savedProgress = songProgressMap[songId] || 0;
    setSongProgress(savedProgress);

    // Reconstruir las notas tocadas hasta el punto guardado
    const song = getSongById(songId);
    if (song && savedProgress > 0) {
      const reconstructed = song.notes.slice(0, savedProgress).map((noteData, i) => ({
        id: i,
        note: noteData[0],
        duration: noteData[1],
        color: getNoteColor(noteData[0]),
        timestamp: Date.now(),
      }));
      setSongNotes(reconstructed);
    } else {
      setSongNotes([]);
    }
  }, [songProgressMap]);

  // ============================================
  // MODO LIBRE
  // ============================================
  const [notes, setNotes] = useState([]);

  const [savedSongs, setSavedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ============================================
  // LÓGICA PRINCIPAL: addNote
  // ============================================
  /**
   * Llamado por cada modo cuando el niño responde correctamente.
   * - En modo canción: toca la siguiente nota de la canción
   * - En modo libre: genera nota pentatónica según respuesta
   */
  const addNote = useCallback((answer, operation = "+", streak = 0, problem = "") => {
    const id = ++noteIdCounter.current;

    if (mode === "song") {
      // ============ MODO CANCIÓN ============
      const song = getSongById(currentSongId);
      if (!song) return;

      const nextIdx = songProgress;
      if (nextIdx >= song.notes.length) {
        // Canción ya completa — no hacer nada (esperar a que el niño elija otra)
        return;
      }

      const [noteName, duration] = song.notes[nextIdx];
      const newNote = {
        id,
        note: noteName,
        duration,
        color: getNoteColor(noteName),
        problem,
        timestamp: Date.now(),
      };

      setSongNotes((prev) => [...prev, newNote]);
      const newProgress = nextIdx + 1;
      setSongProgress(newProgress);

      // Persistir progreso
      setSongProgressMap((prev) => {
        const updated = { ...prev, [currentSongId]: newProgress };
        try {
          localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
        } catch (e) {
          console.error("Error guardando progreso:", e);
        }
        return updated;
      });

      // ¿Canción completada?
      if (newProgress >= song.notes.length) {
        // Desbloquear si no lo estaba
        setUnlockedSongs((prev) => {
          if (prev.find((u) => u.id === song.id)) return prev;
          const updated = [
            ...prev,
            {
              id: song.id,
              title: song.title,
              artist: song.artist,
              emoji: song.emoji,
              unlockedAt: Date.now(),
            },
          ];
          try {
            localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(updated));
          } catch (e) {
            console.error("Error guardando desbloqueada:", e);
          }
          return updated;
        });

        // Trigger modal de celebración
        setJustUnlockedSong(song);
      }
    } else {
      // ============ MODO LIBRE ============
      const noteData = generateNoteForAnswer(answer, operation, streak);
      setNotes((prev) => [
        ...prev,
        {
          id,
          ...noteData,
          problem,
          timestamp: Date.now(),
        },
      ]);
    }

    setLastAddedKey(id);
  }, [mode, currentSongId, songProgress]);

  /**
   * Limpiar/reiniciar la melodía actual
   */
  const clearMelody = useCallback(() => {
    if (mode === "song") {
      setSongNotes([]);
      setSongProgress(0);
      setSongProgressMap((prev) => {
        const updated = { ...prev };
        delete updated[currentSongId];
        try {
          localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
        } catch (e) {
          console.error("Error reiniciando progreso:", e);
        }
        return updated;
      });
    } else {
      setNotes([]);
    }
    setLastAddedKey(0);
  }, [mode, currentSongId]);

  /**
   * Cerrar el modal de "canción desbloqueada"
   */
  const dismissUnlock = useCallback(() => {
    setJustUnlockedSong(null);
    // Auto-reiniciar progreso para que el niño pueda volver a tocarla
    setSongNotes([]);
    setSongProgress(0);
    setSongProgressMap((prev) => {
      const updated = { ...prev };
      delete updated[currentSongId];
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [currentSongId]);

  /**
   * Guardar canción del modo LIBRE en la galería
   */
  const saveSong = useCallback(() => {
    if (notes.length === 0) return null;

    const song = {
      id: `song-${Date.now()}`,
      title: generateSongTitle(notes),
      notes: [...notes],
      noteCount: notes.length,
      createdAt: Date.now(),
    };

    setSavedSongs((prev) => {
      const updated = [song, ...prev].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
      } catch (e) {
        console.error("Error guardando canción:", e);
      }
      return updated;
    });

    return song;
  }, [notes]);

  const deleteSong = useCallback((songId) => {
    setSavedSongs((prev) => {
      const updated = prev.filter((s) => s.id !== songId);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Inicializar progreso de canción al montar
  useState(() => {
    const initialProgress = songProgressMap[DEFAULT_SONG_ID] || 0;
    setSongProgress(initialProgress);
    if (initialProgress > 0) {
      const song = getSongById(DEFAULT_SONG_ID);
      if (song) {
        const reconstructed = song.notes.slice(0, initialProgress).map((noteData, i) => ({
          id: i,
          note: noteData[0],
          duration: noteData[1],
          color: getNoteColor(noteData[0]),
          timestamp: Date.now(),
        }));
        setSongNotes(reconstructed);
      }
    }
  });

  const value = {
    mode,
    setMode,
    // Modo canción
    currentSongId,
    setCurrentSong,
    songProgress,
    songNotes,
    unlockedSongs,
    justUnlockedSong,
    dismissUnlock,
    // Modo libre
    notes,
    // Comunes
    addNote,
    clearMelody,
    lastAddedKey,
    saveSong,
    savedSongs,
    deleteSong,
  };

  return (
    <MelodyComposerContext.Provider value={value}>
      {children}
    </MelodyComposerContext.Provider>
  );
}

/**
 * Color asociado a la octava de una nota (para visualización consistente)
 */
function getNoteColor(noteName) {
  const octave = parseInt(String(noteName).slice(-1), 10);
  const colors = {
    3: "#3b82f6",
    4: "#22c55e",
    5: "#f97316",
    6: "#ec4899",
  };
  return colors[octave] || "#94a3b8";
}
