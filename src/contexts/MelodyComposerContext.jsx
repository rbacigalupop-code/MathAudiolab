import { createContext, useContext, useState, useCallback, useRef } from "react";
import { generateNoteForAnswer, generateSongTitle } from "../utils/MelodyGenerator";

/**
 * Context para el sistema de composición de melodías
 *
 * Cada respuesta correcta en cualquier modo agrega una nota a la melodía actual.
 * El niño puede reproducirla cuando quiera y guardarla como "su canción".
 *
 * La melodía persiste durante toda la sesión (todos los modos comparten la misma).
 * Se resetea solo cuando el niño lo pide o cambia de perfil.
 */

const MelodyComposerContext = createContext(null);

export function useMelodyComposer() {
  const context = useContext(MelodyComposerContext);
  if (!context) {
    console.warn("[MelodyComposer] usado fuera del Provider");
    return {
      notes: [],
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
  const [notes, setNotes] = useState([]);
  const [lastAddedKey, setLastAddedKey] = useState(0);
  const [savedSongs, setSavedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem("__mal_saved_songs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Ref para evitar updates redundantes
  const noteIdCounter = useRef(0);

  /**
   * Agregar una nota a la melodía (llamada desde cada modo al acertar)
   *
   * @param {number} answer - Resultado de la operación
   * @param {string} operation - Operación realizada
   * @param {number} streak - Racha actual
   * @param {string} problem - Problema original (ej: "3+4")
   */
  const addNote = useCallback((answer, operation = "+", streak = 0, problem = "") => {
    const noteData = generateNoteForAnswer(answer, operation, streak);
    const id = ++noteIdCounter.current;

    setNotes((prev) => [
      ...prev,
      {
        id,
        ...noteData,
        problem,
        timestamp: Date.now(),
      },
    ]);

    // Trigger animación de "nueva nota agregada"
    setLastAddedKey(id);
  }, []);

  /**
   * Limpiar la melodía actual (empezar una nueva)
   */
  const clearMelody = useCallback(() => {
    setNotes([]);
    setLastAddedKey(0);
  }, []);

  /**
   * Guardar la canción actual en la lista de "Mis canciones"
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
      const updated = [song, ...prev].slice(0, 20); // máx 20 canciones guardadas
      try {
        localStorage.setItem("__mal_saved_songs", JSON.stringify(updated));
      } catch (e) {
        console.error("Error guardando canción:", e);
      }
      return updated;
    });

    return song;
  }, [notes]);

  /**
   * Eliminar una canción guardada
   */
  const deleteSong = useCallback((songId) => {
    setSavedSongs((prev) => {
      const updated = prev.filter((s) => s.id !== songId);
      try {
        localStorage.setItem("__mal_saved_songs", JSON.stringify(updated));
      } catch (e) {
        console.error("Error eliminando canción:", e);
      }
      return updated;
    });
  }, []);

  const value = {
    notes,
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
