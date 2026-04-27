import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSyncToDatabase(store, userId) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!userId || !store) return;

    // Limpiar timer anterior
    if (timerRef.current) clearTimeout(timerRef.current);

    // Sincronizar con delay de 500ms para evitar muchas llamadas
    timerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("user_progress")
          .update({
            nivel: store.nivel,
            mejor_racha: store.mejorRacha,
            racha_global: store.rachaGlobal,
            weak_points: store.weak_points || {},
            unlocked_effects: store.unlocked_effects || [],
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Sync error:", error);
          // Fallback: mantener en localStorage, reintentar después
        }
      } catch (err) {
        console.error("Error syncing to database:", err);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [store, userId]);
}
