import { useCallback } from "react";

/**
 * Hook para muestreo ponderado de problemas difíciles
 * 70% probabilidad de problemas con tasa de error > 0.5
 * 30% probabilidad de problemas aleatorios
 */
export function useWeightedSampling(nivel, store) {
  const getWeightedProblem = useCallback((mode = "multiplication") => {
    const errorKey = `erroresPor${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    const errors = store[errorKey] || {};

    // Calcular tasa de error para cada operación
    const operations = [];
    Object.entries(errors).forEach(([key, data]) => {
      const total = data.correctas + (data.incorrectas || 0);
      if (total > 0) {
        const errorRate = (data.incorrectas || 0) / total;
        operations.push({ key, errorRate, total, data });
      }
    });

    // Separar problemas difíciles (errorRate > 0.5) y fáciles
    const hardProblems = operations.filter(op => op.errorRate > 0.5);

    // Decidir si usar problema difícil (70%) o aleatorio (30%)
    const useHardProblem = Math.random() < 0.7 && hardProblems.length > 0;

    if (useHardProblem) {
      // Seleccionar un problema difícil
      const selected = hardProblems[Math.floor(Math.random() * hardProblems.length)];
      return selected.key;
    }

    // Si no hay problemas difíciles o seleccionamos aleatorio, retornar null
    // El componente generará un problema nuevo
    return null;
  }, [store]);

  const recordAttempt = useCallback((mode, operand1, operand2, isCorrect) => {
    const key = `${operand1}${mode === "division" ? "÷" : "×"}${operand2}`;
    const errorKey = `erroresPor${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

    const erroresPorMode = store[errorKey] || {};
    const entry = erroresPorMode[key] || { correctas: 0, incorrectas: 0 };

    if (isCorrect) {
      entry.correctas += 1;
    } else {
      entry.incorrectas = (entry.incorrectas || 0) + 1;
    }

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
