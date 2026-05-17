import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { generateStudentReport } from "../utils/ReportExporter";

/**
 * ParentDashboard: Main interface for parents to track student progress
 * Displays all assigned students and detailed analytics
 */
export function ParentDashboard({ parentSession, onSessionChange }) {
  const {
    getParentStudents,
    loadStudentDataForParent,
    setParentSelectedStudent,
    getProfiles,
    logoutParent,
    getMostFailedOperations,
  } = useLocalStorage();

  // State
  const [parentStudents, setParentStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(
    parentSession?.selectedStudentId || null
  );
  const [studentData, setStudentData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [allProfiles, setAllProfiles] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Load students and profiles on mount
  useEffect(() => {
    const students = getParentStudents(parentSession.parentId);
    const profiles = getProfiles();

    setParentStudents(students);
    setAllProfiles(profiles);

    // Set initial selected student
    if (students.length > 0) {
      const initialId = selectedStudentId || students[0].id;
      setSelectedStudentId(initialId);
    }
  }, [parentSession.parentId, getParentStudents, getProfiles, selectedStudentId]);

  // Load selected student data
  useEffect(() => {
    if (selectedStudentId && allProfiles.length > 0) {
      const data = loadStudentDataForParent(selectedStudentId);
      const profile = allProfiles.find((p) => p.id === selectedStudentId);

      setStudentData(data);
      setStudentProfile(profile);
      setParentSelectedStudent(selectedStudentId);
    }
  }, [
    selectedStudentId,
    allProfiles,
    loadStudentDataForParent,
    setParentSelectedStudent,
  ]);

  const handleLogout = () => {
    logoutParent();
    onSessionChange(null);
  };

  const handleExportPDF = async () => {
    if (!selectedStudentId || !studentData) return;

    setIsExporting(true);
    try {
      const report = generateStudentReport(
        selectedStudentId,
        parentSession.parentId,
        studentProfile,
        studentData
      );
      if (report) {
        // Trigger download
        const element = document.createElement("a");
        element.href = report;
        element.download = `${studentProfile.label.split(" ").slice(1).join(" ")}_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
    setIsExporting(false);
  };

  // Calculate stats
  const calculateStats = () => {
    if (!studentData) return {};

    const failedOps = getMostFailedOperations(5);
    const globalRate = studentData.sesiones?.length
      ? (studentData.sesiones.filter((s) => s.aciertos > 0).length /
          studentData.sesiones.length) *
        100
      : 0;

    return {
      nivel: studentData.nivel || 1,
      racha: studentData.rachaGlobal || 0,
      mejorRacha: studentData.mejorRacha || 0,
      globalRate: Math.round(globalRate),
      totalSesiones: studentData.sesiones?.length || 0,
      weakPoints: failedOps,
    };
  };

  const stats = calculateStats();

  if (parentStudents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          No hay estudiantes asignados
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#dc2626",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar Sesión
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "clamp(12px, 3vw, 20px)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            gap: "clamp(8px, 3vw, 12px)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 900,
                color: "#f97316",
                margin: 0,
              }}
            >
              📊 Panel de Padres
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: "4px 0 0 0",
              }}
            >
              Bienvenido, {parentSession.name}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            🚪 Cerrar Sesión
          </motion.button>
        </div>

        {/* Student Grid */}
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: 12,
            }}
          >
            Estudiantes Asignados
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {parentStudents.map((student) => (
              <motion.button
                key={student.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStudentId(student.id)}
                style={{
                  padding: "16px 12px",
                  borderRadius: 12,
                  border:
                    selectedStudentId === student.id
                      ? `3px solid ${student.color}`
                      : `2px solid ${student.color}33`,
                  background:
                    selectedStudentId === student.id
                      ? `${student.color}15`
                      : "#1e293b",
                  color: student.color,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${student.color}25`;
                  e.currentTarget.style.boxShadow = `0 0 15px ${student.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    selectedStudentId === student.id
                      ? `${student.color}15`
                      : "#1e293b";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px" }}>{student.emoji}</div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {student.label.split(" ").slice(1).join(" ")}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Student Details */}
        {selectedStudentId && studentData && studentProfile && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStudentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: "#1e293b",
                    border: `2px solid ${studentProfile.color}`,
                    borderRadius: 12,
                    padding: "16px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Nivel
                  </div>
                  <div
                    style={{
                      color: studentProfile.color,
                      fontSize: "24px",
                      fontWeight: 900,
                    }}
                  >
                    {stats.nivel}
                  </div>
                </div>

                <div
                  style={{
                    background: "#1e293b",
                    border: `2px solid ${studentProfile.color}`,
                    borderRadius: 12,
                    padding: "16px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Racha Actual
                  </div>
                  <div
                    style={{
                      color: studentProfile.color,
                      fontSize: "24px",
                      fontWeight: 900,
                    }}
                  >
                    {stats.racha} 🔥
                  </div>
                </div>

                <div
                  style={{
                    background: "#1e293b",
                    border: `2px solid ${studentProfile.color}`,
                    borderRadius: 12,
                    padding: "16px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Mejor Racha
                  </div>
                  <div
                    style={{
                      color: studentProfile.color,
                      fontSize: "24px",
                      fontWeight: 900,
                    }}
                  >
                    {stats.mejorRacha} ⭐
                  </div>
                </div>

                <div
                  style={{
                    background: "#1e293b",
                    border: `2px solid ${studentProfile.color}`,
                    borderRadius: 12,
                    padding: "16px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Tasa Global
                  </div>
                  <div
                    style={{
                      color: studentProfile.color,
                      fontSize: "24px",
                      fontWeight: 900,
                    }}
                  >
                    {stats.globalRate}%
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 16,
                  borderBottom: "2px solid #334155",
                  overflowX: "auto",
                }}
              >
                {[
                  { id: "overview", label: "📋 General" },
                  { id: "analytics", label: "📊 Análisis" },
                  { id: "report", label: "📄 Reporte" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      background: "none",
                      color:
                        activeTab === tab.id ? "#f97316" : "#94a3b8",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      borderBottom:
                        activeTab === tab.id ? "3px solid #f97316" : "none",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "#1e293b",
                      borderRadius: 12,
                      padding: "16px",
                      marginBottom: 16,
                    }}
                  >
                    <h3 style={{ color: "#f1f5f9", fontSize: "14px", margin: "0 0 12px 0" }}>
                      Resumen General
                    </h3>
                    <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
                      <p>
                        <strong>Total de sesiones:</strong> {stats.totalSesiones}
                      </p>
                      <p>
                        <strong>Tabla actual:</strong> Tabla del{" "}
                        {studentData.tabla}
                      </p>
                      <p>
                        <strong>Estado:</strong> Progresando bien en el nivel{" "}
                        {stats.nivel}
                      </p>

                      {stats.weakPoints.length > 0 && (
                        <>
                          <p style={{ marginTop: 12, fontWeight: 700 }}>
                            🎯 Puntos débiles (Top 5):
                          </p>
                          <ul
                            style={{
                              margin: "8px 0 0 0",
                              paddingLeft: "20px",
                            }}
                          >
                            {stats.weakPoints.slice(0, 5).map((op) => (
                              <li key={op.key}>
                                {op.key}: {Math.round(op.rate * 100)}% de error
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "#1e293b",
                      borderRadius: 12,
                      padding: "16px",
                      marginBottom: 16,
                    }}
                  >
                    <h3 style={{ color: "#f1f5f9", fontSize: "14px", margin: "0 0 12px 0" }}>
                      Análisis Detallado
                    </h3>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                      <p>
                        <strong>Tasa de aciertos global:</strong>{" "}
                        {stats.globalRate}%
                      </p>
                      <p>
                        <strong>Racha actual:</strong> {stats.racha} respuestas
                        correctas consecutivas
                      </p>
                      <p>
                        <strong>Mejor racha:</strong> {stats.mejorRacha}{" "}
                        respuestas consecutivas
                      </p>

                      {stats.weakPoints.length > 0 && (
                        <>
                          <p style={{ marginTop: 12, fontWeight: 700 }}>
                            Operaciones con mayor dificultad:
                          </p>
                          <div style={{ marginTop: 8 }}>
                            {stats.weakPoints.map((op) => (
                              <div
                                key={op.key}
                                style={{
                                  marginBottom: 8,
                                  padding: "8px",
                                  background: "#0f172a",
                                  borderRadius: 6,
                                  borderLeft: `3px solid #f97316`,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span>{op.key}</span>
                                  <span
                                    style={{
                                      color: "#f97316",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {Math.round(op.rate * 100)}% error
                                  </span>
                                </div>
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: "11px",
                                    color: "#64748b",
                                  }}
                                >
                                  {op.intentos} intentos
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "report" && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "#1e293b",
                      borderRadius: 12,
                      padding: "16px",
                      marginBottom: 16,
                    }}
                  >
                    <h3 style={{ color: "#f1f5f9", fontSize: "14px", margin: "0 0 12px 0" }}>
                      Descargar Reporte
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>
                      Genera un reporte PDF con el progreso detallado de{" "}
                      {studentProfile.label}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: isExporting ? "#64748b" : "#f97316",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: isExporting ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        opacity: isExporting ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isExporting) {
                          e.currentTarget.style.background = "#ea580c";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isExporting) {
                          e.currentTarget.style.background = "#f97316";
                        }
                      }}
                    >
                      {isExporting ? "📥 Generando..." : "📄 Descargar PDF"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
