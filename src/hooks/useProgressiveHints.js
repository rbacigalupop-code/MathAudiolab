import { useState, useEffect, useCallback, useRef } from "react";
import { BAND_METADATA } from "../constants/bandMetadata";

/**
 * Hook para pistas progresivas pedagógicas
 *
 * Las pistas se muestran en dos momentos:
 * 1. Cuando el usuario demora mucho en responder (basado en tiempo)
 * 2. Cuando el usuario falla varias veces seguidas (basado en errores)
 *
 * IMPORTANTE: Las pistas NUNCA dan la respuesta directamente.
 * Son guías pedagógicas que ayudan a entender el concepto y
 * desarrollar estrategias propias.
 *
 * Uso:
 * const { currentHint, advanceHintOnError, resetHints } = useProgressiveHints(
 *   "sumas",
 *   null,
 *   10000  // 10 segundos antes de la primera pista por tiempo
 * );
 *
 * // En el handler de error:
 * if (!isCorrect) advanceHintOnError();
 */
export function useProgressiveHints(mode, banda = null, hintDelayMs = 10000) {
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  /**
   * Obtener pistas pedagógicas basadas en el modo y banda
   *
   * Estrategia pedagógica:
   * - Nivel 1: Recordar el concepto general
   * - Nivel 2: Estrategia visual o de descomposición
   * - Nivel 3: Técnica concreta paso a paso
   * - Nivel 4: Ejemplo análogo (NO el problema actual)
   */
  const getHints = useCallback(() => {
    const bandData = banda ? BAND_METADATA[banda] : null;
    if (bandData && bandData.progressiveHints) {
      return bandData.progressiveHints;
    }

    // Pistas pedagógicas por modo (nunca dan la respuesta)
    const modeHints = {
      sumas: [
        "💡 Sumar es juntar cantidades. Empieza por el número más grande y cuenta hacia adelante.",
        "✋ Usa tus dedos o dibuja puntitos para visualizar las cantidades.",
        "🔟 Si el número pasa de 10, descompón: 8 + 5 = 8 + 2 + 3 (primero llega a 10, después suma el resto).",
        "📝 Ejemplo análogo: 7 + 6 → piensa 7 + 3 = 10, después 10 + 3 = 13. Aplica la misma técnica.",
      ],
      restas: [
        "💡 Restar es quitar o ver la diferencia. ¿Cuánto le falta al pequeño para llegar al grande?",
        "🔄 Truco: pregúntate '¿qué número, sumado al segundo, da el primero?'",
        "⬇️ Cuenta hacia atrás desde el primer número, las veces que indica el segundo.",
        "📝 Ejemplo análogo: 14 − 6 → primero baja hasta 10 (resta 4), luego sigue (resta 2 más). Total: bajaste 6.",
      ],
      ejercicios: [
        "💡 Multiplicar es sumar el mismo número varias veces. 4 × 3 = 4 + 4 + 4.",
        "🔄 Conmutatividad: 4 × 6 = 6 × 4. Usa el orden que te resulte más cómodo.",
        "🧩 Descompón: 7 × 8 = 7 × 10 − 7 × 2. (70 − 14). Hazlo paso a paso.",
        "📝 Ejemplo análogo: si no sabes 6 × 7, sabes 6 × 5 = 30. Suma 6 dos veces más: 30 + 12.",
      ],
      division: [
        "💡 Dividir es repartir en grupos iguales. ¿Cuántos hay en cada grupo?",
        "🔄 División y multiplicación son opuestas: si 12 ÷ 4 = ?, pregúntate '4 × ¿cuánto? = 12'.",
        "➕ Suma el divisor varias veces hasta llegar al dividendo. La cantidad de veces es la respuesta.",
        "📝 Ejemplo análogo: 15 ÷ 3 → cuenta de 3 en 3 hasta 15 (3, 6, 9, 12, 15). Contaste 5 veces.",
      ],
      potencias: [
        "💡 La potencia 2³ significa multiplicar el 2 tres veces: 2 × 2 × 2. NO es 2 × 3.",
        "🔢 La BASE es el número grande, el EXPONENTE (chiquito arriba) dice cuántas veces se multiplica.",
        "📈 Calcula paso a paso: primero base × base = resultado1, después resultado1 × base, etc.",
        "📝 Ejemplo análogo: 3² = 3 × 3 = 9. 3³ = 9 × 3 = 27. Cada potencia es la anterior por la base.",
      ],
      fracciones: [
        "💡 Una fracción muestra partes de un entero. El denominador (abajo) dice en cuántas partes se divide.",
        "🍕 Dibuja una pizza partida: 1/4 = una porción de cuatro. 3/4 = tres porciones de cuatro.",
        "➕ Para sumar o restar con MISMO denominador: opera solo los numeradores (de arriba), el de abajo se mantiene.",
        "📝 Ejemplo análogo: 1/4 + 2/4 = 3/4 (sumas 1+2 arriba, el 4 abajo NO cambia).",
      ],
    };

    return (
      modeHints[mode] || [
        "💡 Piensa con calma y respira. Tú puedes.",
        "✏️ Intenta dibujar o usar los dedos para visualizar.",
      ]
    );
  }, [mode, banda]);

  /**
   * Sistema de pistas por TIEMPO (se queda mucho rato sin responder)
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

          if (next < hints.length) {
            timerRef.current = setTimeout(showNextHint, hintDelayMs);
          }
        }
        return next;
      });
    };

    timerRef.current = setTimeout(showNextHint, hintDelayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mode, banda, hintDelayMs, getHints]);

  /**
   * Avanzar el nivel de pista CUANDO EL USUARIO FALLA
   *
   * Cada error muestra una pista más específica, sin nunca dar la respuesta.
   * Esta es la función pedagógica clave: el sistema "se da cuenta" que
   * el alumno está teniendo dificultades y le entrega ayuda gradual.
   */
  const advanceHintOnError = useCallback(() => {
    // Cancelar el timer de tiempo (el usuario sí está respondiendo, solo falla)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const hints = getHints();
    setHintLevel((prev) => {
      const next = Math.min(prev + 1, hints.length);
      if (next > 0) {
        setCurrentHint(hints[next - 1]);
        setShowHint(true);
      }
      return next;
    });

    // Reiniciar timer de tiempo desde ahora
    startTimeRef.current = Date.now();
  }, [getHints]);

  /**
   * Resetear el sistema de pistas (cuando el usuario acierta)
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

  const allHints = getHints();
  const hasHint = currentHint !== null;

  return {
    currentHint,
    hintLevel,
    showHint,
    resetHints,
    advanceHintOnError,
    allHints,
    hasHint,
  };
}
