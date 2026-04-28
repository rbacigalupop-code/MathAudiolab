import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

/**
 * Hook para sincronizar ejercicios matemáticos con el BPM de una canción
 *
 * @param {number} bpm - BPM de la canción
 * @param {number} compasesPorBloque - Compases entre cada pregunta (ej: 8)
 * @param {function} onBeatTick - Callback cuando llega un beat (para actualizar UI)
 * @param {function} onBlockStart - Callback cuando empieza un nuevo bloque (para mostrar pregunta)
 * @param {boolean} enabled - Si el sincronizador está activo
 * @returns {Object} { isPlaying, start, stop, triggerError, clearError, transportTime }
 */
export function useBPMSync(bpm, compasesPorBloque = 8, onBeatTick, onBlockStart, enabled = true) {
  const transportRef = useRef(null);
  const beatTickIdRef = useRef(null);
  const blockStartIdRef = useRef(null);
  const errorFilterRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Inicializar Tone y crear filtro de error
  useEffect(() => {
    const initTone = async () => {
      if (Tone.Transport.state !== "running") {
        await Tone.start();
      }

      // Crear filtro low-pass para efecto de "agua"
      if (!errorFilterRef.current) {
        errorFilterRef.current = new Tone.Filter({
          frequency: 5000,
          type: "lowpass",
        }).toDestination();
      }
    };

    initTone();

    return () => {
      // Cleanup: Limpiar el filtro cuando se desmonta
      if (errorFilterRef.current) {
        try {
          errorFilterRef.current.dispose();
        } catch (e) {
          // El filtro ya puede estar dispuesto
        }
        errorFilterRef.current = null;
      }
    };
  }, []);

  // Configurar BPM y schedules
  useEffect(() => {
    if (!enabled) return;

    try {
      Tone.Transport.bpm.value = bpm;

      // Duración de un compás en notas (4n = quarter note = 1 compás a 4/4)
      const compasNoteValue = "4n";

      // Calcular duración de un bloque en notas
      const blockNoteDuration = `${compasesPorBloque}n`;

      // Beat tick (cada compás)
      if (beatTickIdRef.current !== null) {
        Tone.Transport.clear(beatTickIdRef.current);
      }
      beatTickIdRef.current = Tone.Transport.scheduleRepeat(
        (time) => {
          if (onBeatTick) {
            onBeatTick(time, Tone.Transport.toSeconds("4n"));
          }
        },
        compasNoteValue,
        0
      );

      // Block start (cada N compases)
      if (blockStartIdRef.current !== null) {
        Tone.Transport.clear(blockStartIdRef.current);
      }
      blockStartIdRef.current = Tone.Transport.scheduleRepeat(
        (time) => {
          if (onBlockStart) {
            onBlockStart(time);
          }
        },
        blockNoteDuration,
        0
      );

      // Iniciar transport si no está corriendo
      if (Tone.Transport.state !== "running") {
        Tone.Transport.start();
        isPlayingRef.current = true;
      }
    } catch (e) {
      console.error("[useBPMSync] Error setting up schedules:", e);
    }

    return () => {
      // Cleanup: Limpiar schedules
      try {
        if (beatTickIdRef.current !== null) {
          Tone.Transport.clear(beatTickIdRef.current);
          beatTickIdRef.current = null;
        }
        if (blockStartIdRef.current !== null) {
          Tone.Transport.clear(blockStartIdRef.current);
          blockStartIdRef.current = null;
        }
      } catch (e) {
        console.warn("[useBPMSync] Cleanup warning:", e);
      }
    };
  }, [bpm, compasesPorBloque, enabled, onBeatTick, onBlockStart]);

  /**
   * Activar efecto de error: bajar volumen y aplicar filtro low-pass
   */
  const triggerError = useCallback((iframeElement) => {
    try {
      // Bajar volumen del iframe de YouTube
      if (iframeElement && typeof iframeElement.setVolume === "function") {
        iframeElement.setVolume(30);
      } else if (iframeElement) {
        // Fallback: manipular el elemento HTML
        iframeElement.style.opacity = "0.5";
      }

      // Aplicar filtro low-pass en Tone.js
      if (errorFilterRef.current) {
        errorFilterRef.current.frequency.rampTo(400, 0.3);
      }
    } catch (e) {
      console.warn("[useBPMSync] triggerError:", e);
    }
  }, []);

  /**
   * Limpiar efecto de error: restaurar volumen y filtro
   */
  const clearError = useCallback((iframeElement) => {
    try {
      // Restaurar volumen del iframe
      if (iframeElement && typeof iframeElement.setVolume === "function") {
        iframeElement.setVolume(100);
      } else if (iframeElement) {
        iframeElement.style.opacity = "1";
      }

      // Restaurar filtro
      if (errorFilterRef.current) {
        errorFilterRef.current.frequency.rampTo(5000, 0.2);
      }
    } catch (e) {
      console.warn("[useBPMSync] clearError:", e);
    }
  }, []);

  /**
   * Obtener tiempo actual del transport
   */
  const getTransportTime = useCallback(() => {
    return Tone.Transport.seconds;
  }, []);

  return {
    isPlaying: isPlayingRef.current,
    triggerError,
    clearError,
    getTransportTime,
    transportState: Tone.Transport.state,
  };
}
