import { useState, useEffect, useCallback, useRef } from "react";
import { BAND_METADATA } from "../constants/bandMetadata";

/**
 * Hook para manejar pistas progresivas basadas en tiempo
 * Si el usuario demora mucho en responder, la foca da pistas
 *
 * Uso:
 * const { currentHint, hintLevel, resetHints } = useProgressiveHints(
 *   mode,
 *   banda,
 *   10000  // 10 segundos antes de la primera pista
 * );
 */
export function useProgressiveHints(mode, banda = null, hintDelayMs = 10000) {
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  /**
   * Obtener pistas basadas en el modo y banda
   */
  const getHints = useCallback(() => {
    const bandData = banda ? BAND_METADATA[banda] : null;
    if (bandData && bandData.progressiveHints) {
      return bandData.progressiveHints;
    }

    // Fallback a pistas genéricas por modo
    const modeHints = {
      potencias: [
        "Piensa en el número BASE y cuántas veces se multiplica",
        "El exponente dice CUÁNTAS VECES multiplicas la base",
        "Recuerda: 2³ = 2 × 2 × 2, no 2 + 2 + 2",
        "Cuenta los factores: 2 × 2 (dos factores) = 2², 2 × 2 × 2 (tres factores) = 2³",
      ],
      division: [
        "¿Cuántos números tienes que repartir? (dividendo)",
        "¿En cuántos grupos iguales los repartes? (divisor)",
        "¿Cuántos van en cada grupo? (cociente)",
        "Verifica: grupos × notas por grupo = total",
      ],
      ejercicios: [
        "¿Cuántas veces tienes que repetir el número?",
        "Multiplicación es conmutativa: 4 × 6 = 6 × 4",
        "Intenta: primero multiplica los números redondos, luego ajusta",
        "Descomposición: 4 × 6 = 4 × 5 + 4 × 1 = 20 + 4 = 24",
      ],
    };

    return modeHints[mode] || ["¡Lo estás haciendo bien! Piensa con calma."];
  }, [mode, banda]);

  /**
   * Iniciar el sistema de pistas
   */
  useEffect(() => {
    startTimeRef.current = Date.now();
    setHintLevel(0);
    setCurrentHint(null);
    setShowHint(false);

    const hints = getHints();

    const showNextHint = () => {
      setHintLevel((prev) => {
        const next = prev + 1;
        if (next <= hints.length) {
          setCurrentHint(hints[next - 1]);
          setShowHint(true);

          // Programar la siguiente pista
          if (next < hints.length) {
            timerRef.current = setTimeout(
              showNextHint,
              hintDelayMs // Cada hint después de X segundos
            );
          }
        }
        return next;
      });
    };

    // Mostrar la primera pista después de hintDelayMs
    timerRef.current = setTimeout(showNextHint, hintDelayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mode, banda, hintDelayMs, getHints]);

  /**
   * Resetear el sistema de pistas (cuando el usuario responde correctamente)
   */
  const resetHints = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setHintLevel(0);
    setCurrentHint(null);
    setShowHint(false);
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Obtener todas las pistas disponibles
   */
  const allHints = getHints();

  /**
   * Mostrar solo si hay una pista actual
   */
  const hasHint = currentHint !== null;

  return {
    currentHint,
    hintLevel,
    showHint,
    resetHints,
    allHints,
    hasHint,
  };
}
