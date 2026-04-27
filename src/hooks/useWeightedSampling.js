import { useCallback } from "react";

export function useWeightedSampling(weakPoints, mode, level) {
  const generateProblems = useCallback(() => {
    // Obtener problemas difíciles (rate > 0.5)
    const difficultProblems = [];
    if (weakPoints[mode]) {
      Object.entries(weakPoints[mode]).forEach(([key, data]) => {
        if (data.rate > 0.5) {
          difficultProblems.push(key);
        }
      });
    }

    // 70% de probabilidad: elegir problema difícil
    if (difficultProblems.length > 0 && Math.random() < 0.7) {
      const key = difficultProblems[Math.floor(Math.random() * difficultProblems.length)];
      const [op1, op2] = mode === "division" ? key.split("÷") : key.split("×");
      return { operand1: parseInt(op1), operand2: parseInt(op2) };
    }

    // 30% de probabilidad: elegir al azar según nivel
    if (mode === "multiplication") {
      return generateRandomMultiplication(level);
    } else if (mode === "division") {
      return generateRandomDivision(level);
    } else if (mode === "powers") {
      return generateRandomPower(level);
    }
  }, [weakPoints, mode, level]);

  return { generateProblems };
}

function generateRandomMultiplication(level) {
  // Basado en NIVELES
  const ranges = {
    1: { minTable: 1, maxTable: 3 },
    2: { minTable: 2, maxTable: 5 },
    3: { minTable: 4, maxTable: 7 },
    4: { minTable: 6, maxTable: 10 },
    5: { minTable: 2, maxTable: 10 },
  };

  const range = ranges[level] || ranges[5];
  const table = Math.floor(Math.random() * (range.maxTable - range.minTable + 1)) + range.minTable;
  const factor = Math.floor(Math.random() * 10) + 1;

  return { operand1: table, operand2: factor };
}

function generateRandomDivision(level) {
  const ranges = {
    1: { minDiv: 6, maxDiv: 12, minDsr: 2, maxDsr: 3 },
    2: { minDiv: 12, maxDiv: 20, minDsr: 2, maxDsr: 5 },
    3: { minDiv: 20, maxDiv: 50, minDsr: 2, maxDsr: 7 },
    4: { minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
    5: { minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
  };

  const range = ranges[level] || ranges[5];
  const divisor = Math.floor(Math.random() * (range.maxDsr - range.minDsr + 1)) + range.minDsr;
  const dividendo = Math.floor(Math.random() * (range.maxDiv - range.minDiv + 1)) + range.minDiv;

  // Asegurar que sea divisible exactamente
  const resultado = Math.floor(dividendo / divisor);
  const dividendoExacto = resultado * divisor;

  return { operand1: dividendoExacto, operand2: divisor };
}

function generateRandomPower(level) {
  const bases = [2, 3, 5];
  const ranges = {
    1: { maxExp: 3 },
    2: { maxExp: 5 },
    3: { maxExp: 7 },
    4: { maxExp: 9 },
    5: { maxExp: 10 },
  };

  const range = ranges[level] || ranges[5];
  const base = bases[Math.floor(Math.random() * bases.length)];
  const exponent = Math.floor(Math.random() * (range.maxExp + 1));

  return { operand1: base, operand2: exponent };
}
