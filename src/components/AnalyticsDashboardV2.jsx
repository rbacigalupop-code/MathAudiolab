import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AnalyticsDashboard V2 - Enhanced learning analytics with trends, goals, and AI recommendations
 */
export function AnalyticsDashboardV2({ store, onClose }) {
  const [selectedTab, setSelectedTab] = useState("overview");

  // 📊 Compute enhanced analytics from store
  const analytics = useMemo(() => {
    const errorLog = store.errorLog || {};
    const sesiones = store.sesiones || [];

    // Top difficult operations
    const operations = Object.entries(errorLog)
      .map(([key, data]) => ({
        key,
        intentos: data.intentos || 0,
        fallos: data.fallos || 0,
        tasa: data.rate || 0,
        lastAttempt: data.lastAttempt || 0,
      }))
      .sort((a, b) => (b.tasa || 0) - (a.tasa || 0))
      .slice(0, 10);

    // Session statistics
    const totalSesiones = sesiones.length;
    const totalIntentos = sesiones.reduce((sum, s) => sum + (s.intentos || 0), 0);
    const totalCorrectas = sesiones.reduce((sum, s) => sum + (s.correctas || 0), 0);
    const tasaGlobal = totalIntentos > 0 ? (totalCorrectas / totalIntentos) * 100 : 0;

    // Weekly trend (last 7 sessions)
    const weeklyTrend = sesiones.slice(-7).map(s => ({
      fecha: s.fecha,
      tasa: s.intentos > 0 ? (s.correctas / s.intentos) * 100 : 0,
      correctas: s.correctas,
      intentos: s.intentos,
    }));

    // Weekly average
    const semanaPromedio = weeklyTrend.length > 0
      ? (weeklyTrend.reduce((sum, s) => sum + s.tasa, 0) / weeklyTrend.length).toFixed(0)
      : 0;

    // Calculate trend direction (mejorando/empeorando)
    let trendDirection = "estable";
    if (weeklyTrend.length >= 2) {
      const first = weeklyTrend[0].tasa;
      const last = weeklyTrend[weeklyTrend.length - 1].tasa;
      if (last > first + 5) trendDirection = "mejorando ⬆️";
      else if (last < first - 5) trendDirection = "empeorando ⬇️";
    }

    // Error distribution by operator
    const operatorStats = {};
    Object.entries(errorLog).forEach(([key, data]) => {
      let operator = "";
      if (key.includes("×")) operator = "×";
      else if (key.includes("÷")) operator = "÷";
      else if (key.includes("^")) operator = "^";
      else if (key.includes("+")) operator = "+";
      else if (key.includes("-")) operator = "-";

      if (operator) {
        if (!operatorStats[operator]) {
          operatorStats[operator] = { intentos: 0, fallos: 0 };
        }
        operatorStats[operator].intentos += data.intentos || 0;
        operatorStats[operator].fallos += data.fallos || 0;
      }
    });

    const operatorArray = Object.entries(operatorStats).map(([op, data]) => ({
      operator: op,
      intentos: data.intentos,
      fallos: data.fallos,
      tasa: data.intentos > 0 ? (data.fallos / data.intentos) * 100 : 0,
      successRate: data.intentos > 0 ? ((data.intentos - data.fallos) / data.intentos) * 100 : 0,
    }));

    // 🎯 Weekly goals (meta)
    const weeklyGoal = 85; // Objetivo: 85% de éxito
    const goalProgress = Math.min((semanaPromedio / weeklyGoal) * 100, 100);
    const goalStatus = semanaPromedio >= weeklyGoal ? "✅ Meta alcanzada" : `${(weeklyGoal - semanaPromedio).toFixed(0)}% para meta`;

    // 🤖 AI Recommendations
    const recommendations = [];
    if (operations.length > 0) {
      const topDifficult = operations[0];
      recommendations.push({
        type: "weak",
        icon: "⚠️",
        text: `Enfócate en ${topDifficult.key} (${(topDifficult.tasa * 100).toFixed(0)}% error)`,
        color: "#ef4444",
      });
    }

    const worstOperator = operatorArray.sort((a, b) => b.tasa - a.tasa)[0];
    if (worstOperator && worstOperator.tasa > 0.3) {
      recommendations.push({
        type: "operator",
        icon: "🔢",
        text: `${worstOperator.operator} es difícil. Practica más divisiones`,
        color: "#f97316",
      });
    }

    if (tasaGlobal > 85) {
      recommendations.push({
        type: "strong",
        icon: "⭐",
        text: "¡Excelente trabajo! Intenta el siguiente nivel",
        color: "#22c55e",
      });
    } else if (tasaGlobal > 70) {
      recommendations.push({
        type: "good",
        icon: "👍",
        text: "Buen progreso. Sigue practicando consistentemente",
        color: "#3b82f6",
      });
    }

    return {
      operations,
      totalSesiones,
      totalIntentos,
      totalCorrectas,
      tasaGlobal,
      operatorArray,
      weeklyTrend,
      semanaPromedio,
      trendDirection,
      weeklyGoal,
      goalProgress,
      goalStatus,
      recommendations,
    };
  }, [store.errorLog, store.sesiones]);

  // 📈 Trend Chart Component
  const TrendChart = () => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        📈 Tendencia Semanal
      </div>
      <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        {/* Mini trend line */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: 12 }}>
          {analytics.weeklyTrend.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${day.tasa * 0.8}px` }}
              transition={{ delay: idx * 0.05 }}
              style={{
                flex: 1,
                background:
                  day.tasa > 80
                    ? "#22c55e"
                    : day.tasa > 60
                      ? "#3b82f6"
                      : day.tasa > 40
                        ? "#f97316"
                        : "#ef4444",
                borderRadius: "4px 4px 0 0",
                minHeight: 2,
              }}
              title={`${day.fecha}: ${day.tasa.toFixed(0)}%`}
            />
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 4 }}>Promedio</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#3b82f6" }}>
              {analytics.semanaPromedio}%
            </div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 4 }}>Tendencia</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>
              {analytics.trendDirection}
            </div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 4 }}>Sesiones</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#06b6d4" }}>
              {analytics.weeklyTrend.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🎯 Weekly Goals Component
  const WeeklyGoals = () => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        🎯 Meta Semanal
      </div>
      <div
        style={{
          background: "#1e293b",
          border: `2px solid ${analytics.goalProgress >= 100 ? "#22c55e" : "#f97316"}`,
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>
            Objetivo de éxito: {analytics.weeklyGoal}%
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: analytics.goalProgress >= 100 ? "#22c55e" : "#f97316",
            }}
          >
            {analytics.goalProgress.toFixed(0)}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 12,
            background: "#0f172a",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analytics.goalProgress}%` }}
            transition={{ duration: 0.8 }}
            style={{
              height: "100%",
              background:
                analytics.goalProgress >= 100
                  ? "#22c55e"
                  : analytics.goalProgress >= 50
                    ? "#3b82f6"
                    : "#f97316",
              borderRadius: 6,
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            color:
              analytics.goalProgress >= 100
                ? "#22c55e"
                : analytics.goalProgress >= 50
                  ? "#3b82f6"
                  : "#f97316",
          }}
        >
          {analytics.goalStatus}
        </div>
      </div>
    </div>
  );

  // 🤖 AI Recommendations Component
  const Recommendations = () => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        🤖 Recomendaciones AI
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {analytics.recommendations.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "12px", textAlign: "center", padding: 16 }}>
            Sin recomendaciones. ¡Sigue así! 🎸
          </div>
        ) : (
          analytics.recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: "#1e293b",
                borderLeft: `4px solid ${rec.color}`,
                borderRadius: 6,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "18px" }}>{rec.icon}</span>
              <span style={{ fontSize: "12px", color: "#cbd5e1", flex: 1 }}>{rec.text}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  // Main render
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#0f172a",
            border: "2px solid #f97316",
            borderRadius: 16,
            padding: "24px",
            maxWidth: 700,
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#f97316", margin: 0 }}>
              📊 Analytics 2.0
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Overview Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>Total Sesiones</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#3b82f6" }}>
                {analytics.totalSesiones}
              </div>
            </div>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>Tasa Global</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#f97316" }}>
                {analytics.tasaGlobal.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #334155", paddingBottom: 12 }}>
            {[
              { id: "overview", label: "Resumen" },
              { id: "trend", label: "Tendencia" },
              { id: "goals", label: "Metas" },
              { id: "recommendations", label: "Consejos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  background: selectedTab === tab.id ? "#f97316" : "transparent",
                  color: selectedTab === tab.id ? "#0f172a" : "#94a3b8",
                  border: selectedTab === tab.id ? "none" : "1px solid #334155",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {selectedTab === "overview" && (
              <>
                <TrendChart />
                <WeeklyGoals />
                <Recommendations />
              </>
            )}
            {selectedTab === "trend" && <TrendChart />}
            {selectedTab === "goals" && <WeeklyGoals />}
            {selectedTab === "recommendations" && <Recommendations />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
