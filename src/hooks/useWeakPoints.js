import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useWeakPoints(userId) {
  const [weakPoints, setWeakPoints] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar weak_points inicialmente
  const loadWeakPoints = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_progress")
        .select("weak_points")
        .eq("user_id", userId)
        .single();

      if (error?.code === "PGRST116") {
        // Registro no existe, crear uno nuevo
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert([
            {
              user_id: userId,
              weak_points: {},
              unlocked_effects: [],
              nivel: 1,
              mejor_racha: 0,
              racha_global: 0,
            },
          ]);
        if (insertError) throw insertError;
        setWeakPoints({});
      } else if (error) {
        throw error;
      } else {
        setWeakPoints(data?.weak_points || {});
      }
    } catch (err) {
      console.error("Error loading weak_points:", err);
      setWeakPoints({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Registrar intento (acierto/error)
  const recordAttempt = useCallback(
    async (mode, operand1, operand2, isCorrect) => {
      if (!userId) return;

      try {
        // Actualizar weak_points localmente
        setWeakPoints((prev) => {
          const newWP = JSON.parse(JSON.stringify(prev));
          if (!newWP[mode]) newWP[mode] = {};

          const key = mode === "division" ? `${operand1}÷${operand2}` : `${operand1}×${operand2}`;

          if (!newWP[mode][key]) {
            newWP[mode][key] = { errors: 0, total: 0, rate: 0 };
          }

          newWP[mode][key].total++;
          if (!isCorrect) newWP[mode][key].errors++;
          newWP[mode][key].rate = newWP[mode][key].errors / newWP[mode][key].total;

          return newWP;
        });

        // Actualizar en DB (sin await para no bloquear UI)
        setTimeout(async () => {
          try {
            await supabase
              .from("user_progress")
              .update({ weak_points: weakPoints })
              .eq("user_id", userId);

            // Registrar en error_history para analytics
            await supabase.from("error_history").insert([
              {
                user_id: userId,
                mode,
                operand1,
                operand2,
                is_correct: isCorrect,
              },
            ]);
          } catch (err) {
            console.error("Error syncing weak_points:", err);
          }
        }, 500);
      } catch (err) {
        console.error("Error recording attempt:", err);
      }
    },
    [userId, weakPoints]
  );

  // Obtener tasa de error para una operación específica
  const calculateErrorRate = useCallback(
    (mode, key) => {
      return weakPoints[mode]?.[key]?.rate || 0;
    },
    [weakPoints]
  );

  // Obtener todas las operaciones difíciles (rate > 0.5)
  const getDifficultProblems = useCallback(
    (mode) => {
      const problems = [];
      if (!weakPoints[mode]) return problems;

      Object.entries(weakPoints[mode]).forEach(([key, data]) => {
        if (data.rate > 0.5) {
          problems.push({ key, ...data });
        }
      });

      return problems;
    },
    [weakPoints]
  );

  return {
    weakPoints,
    loading,
    loadWeakPoints,
    recordAttempt,
    calculateErrorRate,
    getDifficultProblems,
  };
}
