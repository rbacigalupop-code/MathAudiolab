import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AnalyticsDashboard - Visualize learning analytics and progress
 * Shows:
 * - Top difficult operations (highest error rate)
 * - Session progress over time
 * - Global statistics
 * - Error distribution by operator
 * - Achievements unlocked
 */
export function AnalyticsDashboard({ store, onClose }) {
  const [selectedTab, setSelectedTab] = useState("overview");

  // 📊 Compute analytics from store
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

    // Error distribution by operator
    const operatorStats = {};
    Object.entries(errorLog).forEach(([key, data]) => {
      // Detectar operador del key (ej: "5×7", "12÷3", "2^3", "3+4")
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

    // Convert to array
    const operatorArray = Object.entries(operatorStats).map(([op, data]) => ({
      operator: op,
      intentos: data.intentos,
      fallos: data.fallos,
      tasa: data.intentos > 0 ? (data.fallos / data.intentos) * 100 : 0,
    }));

    return {
      operations,
      totalSesiones,
      totalIntentos,
      totalCorrectas,
      tasaGlobal,
      operatorArray,
    };
  }, [store.errorLog, store.sesiones]);

  // 📈 Chart: Operation difficulty (horizontal bar)
  const DifficultyChart = () => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        📊 Top Operaciones Difíciles (Tasa de Error)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {analytics.operations.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            Sin datos de error aún. ¡Sigue practicando!
          </div>
        ) : (
          analytics.operations.map((op, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Label */}
              <div
                style={{
                  minWidth: 60,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  textAlign: "right",
                }}
              >
                {op.key}
              </div>

              {/* Bar */}
              <div
                style={{
                  flex: 1,
                  height: 28,
                  background: "#1e293b",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid #334155",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${op.tasa * 100}%` }}
                  transition={{ duration: 0.6 }}
                  style={{
                    height: "100%",
                    background:
                      op.tasa > 0.7
                        ? "#ef4444"
                        : op.tasa > 0.4
                          ? "#f97316"
                          : "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                  }}
                >
                  {op.tasa > 0.15 && (
                    <span style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}>
                      {(op.tasa * 100).toFixed(0)}%
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Stats */}
              <div style={{ minWidth: 80, fontSize: "11px", color: "#64748b" }}>
                {op.fallos}/{op.intentos}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 📈 Chart: Operator distribution
  const OperatorChart = () => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
        🔢 Rendimiento por Operador
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
        {analytics.operatorArray.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "12px", gridColumn: "1/-1" }}>
            Sin datos de operadores aún.
          </div>
        ) : (
          analytics.operatorArray.map((op, idx) => {
            const successRate = ((op.intentos - op.fallos) / op.intentos) * 100;
            const color =
              successRate > 80
                ? "#22c55e"
                : successRate > 60
                  ? "#3b82f6"
                  : successRate > 40
                    ? "#f97316"
                    : "#ef4444";

            return (
              <div
                key={idx}
                style={{
                  background: "#1e293b",
                  border: `2px solid ${color}`,
                  borderRadius: 10,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 900, color: color, marginBottom: 4 }}>
                  {op.operator}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: 8 }}>
                  {op.intentos} intentos
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: color }}>
                  {successRate.toFixed(0)}%
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: 6 }}>
                  ✓ {op.intentos - op.fallos} | ✗ {op.fallos}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // 📅 Sessions history
  const SessionHistory = () => {
    const sesiones = store.sesiones || [];
    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          📅 Historial de Sesiones (Últimas 10)
        </div>
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155" }}>
                <th style={{ textAlign: "left", padding: "8px 4px", color: "#94a3b8" }}>Fecha</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: "#94a3b8" }}>Correctas</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: "#94a3b8" }}>Intentos</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: "#94a3b8" }}>Tasa</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "12px", color: "#64748b" }}>
                    Sin sesiones registradas
                  </td>
                </tr>
              ) : (
                sesiones.slice(-10).reverse().map((s, idx) => {
                  const tasa = s.intentos > 0 ? ((s.correctas / s.intentos) * 100).toFixed(0) : 0;
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #1e293b",
                        background: idx % 2 === 0 ? "#0f172a" : "#1e293b",
                      }}
                    >
                      <td style={{ padding: "8px 4px", color: "#cbd5e1" }}>{s.fecha}</td>
                      <td style={{ textAlign: "center", padding: "8px 4px", color: "#22c55e", fontWeight: 700 }}>
                        {s.correctas}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 4px", color: "#94a3b8" }}>
                        {s.intentos}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "8px 4px",
                          color: tasa > 70 ? "#22c55e" : tasa > 50 ? "#f97316" : "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        {tasa}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 🏆 Achievements
  const AchievementsSection = () => {
    const effects = store.unlocked_effects || [];
    const achievements = [
      { id: "distortion", label: "🎸 Rock Activado", desc: "5+ racha", unlocked: effects.includes("distortion") },
      { id: "reverb", label: "🔊 Reverberación", desc: "30+ mejor racha", unlocked: effects.includes("reverb") },
      { id: "wahwah", label: "🌊 Wah-Wah", desc: "50+ mejor racha", unlocked: effects.includes("wahwah") },
    ];

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          🏆 Logros Desbloqueados
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
          {achievements.map((ach, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: ach.unlocked ? "#1e293b" : "#0f172a",
                border: ach.unlocked ? "2px solid #f97316" : "2px solid #334155",
                borderRadius: 10,
                padding: 12,
                textAlign: "center",
                opacity: ach.unlocked ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: 4 }}>{ach.label.split(" ")[0]}</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: ach.unlocked ? "#f97316" : "#64748b" }}>
                {ach.label.split(" ").slice(1).join(" ")}
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: 4 }}>{ach.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

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
              📊 Analytics Dashboard
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
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>Total Intentos</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#06b6d4" }}>
                {analytics.totalIntentos}
              </div>
            </div>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: 4 }}>Correctas</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#22c55e" }}>
                {analytics.totalCorrectas}
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
              { id: "operations", label: "Operaciones" },
              { id: "operators", label: "Operadores" },
              { id: "history", label: "Historial" },
              { id: "achievements", label: "Logros" },
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
                <DifficultyChart />
                <OperatorChart />
              </>
            )}
            {selectedTab === "operations" && <DifficultyChart />}
            {selectedTab === "operators" && <OperatorChart />}
            {selectedTab === "history" && <SessionHistory />}
            {selectedTab === "achievements" && <AchievementsSection />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
