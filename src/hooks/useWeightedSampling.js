import { useCallback } from "react";

/**
 * Hook para muestreo ponderado inteligente de problemas
 *
 * Algoritmo:
 * 1. Analiza historial de intentos por operación (modo, operandos)
 * 2. Calcula tasa de error para cada: errores / (correctas + incorrectas)
 * 3. Filtra "problemas difíciles" con tasa de error > 0.5
 * 4. Selecciona ponderadamente: 70% problemas difíciles, 30% generador de nuevos
 *
 * @param {Object} store - Estado global con estructura { erroresPor{Mode}: {...} }
 * @returns {Object} { getWeightedProblem, recordAttempt }
 *
 * @example
 * const { getWeightedProblem, recordAttempt } = useWeightedSampling(store);
 *
 * // Obtener problema ponderado
 * const operacion = getWeightedProblem("multiplication"); // "5×7" | null
 *
 * // Registrar intento
 * const updatedStore = recordAttempt("multiplication", 5, 7, true);
 * setStore(updatedStore);
 */
export function useWeightedSampling(store) {
  /**
   * Obtiene un problema ponderado del historial o null para generar nuevo
   * @param {string} mode - Modo: "multiplication", "division", "powers"
   * @returns {string|null} Clave de problema ("5×7") o null
   */
  const getWeightedProblem = useCallback((mode = "multiplication") => {
    // Validar y normalizar mode
    const normalizedMode = (mode || "multiplication").toLowerCase();
    const validModes = ["multiplication", "division", "powers", "sums", "subtractions", "fractions"];

    if (!validModes.includes(normalizedMode)) {
      console.warn(`[useWeightedSampling] Modo inválido: ${mode}, usando "multiplication"`);
      mode = "multiplication";
    } else {
      mode = normalizedMode;
    }

    // Construir clave de error: erroresPorMultiplication, erroresPorDivision, etc.
    const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
    const errorKey = `erroresPor${modeCapitalized}`;
    const errors = store[errorKey];

    // Validar estructura de store
    if (!errors || typeof errors !== "object") {
      return null; // Sin historial, generar nuevo problema
    }

    // Calcular tasa de error para cada operación
    const operations = [];
    Object.entries(errors).forEach(([key, data]) => {
      if (!data || typeof data !== "object") return;

      const correctas = data.correctas || 0;
      const incorrectas = data.incorrectas || 0;
      const total = correctas + incorrectas;

      if (total > 0) {
        const errorRate = incorrectas / total;
        operations.push({ key, errorRate, total });
      }
    });

    // Filtrar "problemas difíciles" (tasa de error > 0.5)
    const hardProblems = operations.filter(op => op.errorRate > 0.5);

    // Algoritmo de muestreo ponderado: 70% difíciles, 30% nuevo
    const useHardProblem = Math.random() < 0.7 && hardProblems.length > 0;

    if (useHardProblem) {
      // Seleccionar un problema difícil al azar
      const selected = hardProblems[Math.floor(Math.random() * hardProblems.length)];
      return selected.key;
    }

    // 30%: retornar null (componente generará problema nuevo aleatorio)
    return null;
  }, [store]);

  /**
   * Registra un intento y actualiza el historial de errores
   * @param {string} mode - Modo: "multiplication", "division", "powers"
   * @param {number} operand1 - Primer operando
   * @param {number} operand2 - Segundo operando
   * @param {boolean} isCorrect - Si la respuesta fue correcta
   * @returns {Object} store actualizado (para setStore)
   */
  const recordAttempt = useCallback((mode, operand1, operand2, isCorrect) => {
    // Validar parámetros
    if (!mode || typeof mode !== "string" || operand1 == null || operand2 == null) {
      console.warn("[useWeightedSampling] recordAttempt: parámetros inválidos", { mode, operand1, operand2, isCorrect });
      return store;
    }

    // Construir clave de operación: "5×7", "12÷3", "2^3"
    const normalizedMode = mode.toLowerCase();
    let symbol = "×";
    if (normalizedMode === "division") symbol = "÷";
    else if (normalizedMode === "powers") symbol = "^";

    const key = `${operand1}${symbol}${operand2}`;

    // Construir clave de error: erroresPorMultiplication, etc.
    const modeCapitalized = normalizedMode.charAt(0).toUpperCase() + normalizedMode.slice(1);
    const errorKey = `erroresPor${modeCapitalized}`;

    // Obtener historial actual
    const erroresPorMode = store[errorKey] || {};
    const entry = erroresPorMode[key] || { correctas: 0, incorrectas: 0 };

    // Actualizar contadores
    if (isCorrect) {
      entry.correctas += 1;
    } else {
      entry.incorrectas = (entry.incorrectas || 0) + 1;
    }

    // Retornar store actualizado
    return {
      ...store,
      [errorKey]: {
        ...erroresPorMode,
        [key]: { ...entry },
      },
    };
  }, [store]);

  return {
    getWeightedProblem,
    recordAttempt,
  };
}
