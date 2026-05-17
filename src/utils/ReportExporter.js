import jsPDF from "jspdf";

/**
 * Generate a PDF report for a student
 * @param {string} studentId - Student profile ID
 * @param {string} parentId - Parent ID
 * @param {object} studentProfile - Student profile (with name, emoji, color)
 * @param {object} studentData - Student learning data
 * @returns {string} Data URL for download
 */
export function generateStudentReport(
  studentId,
  parentId,
  studentProfile,
  studentData
) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Helper function to add text
    const addText = (text, size = 12, bold = false, color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.setFont("arial", bold ? "bold" : "normal");
      doc.text(text, 15, yPosition);
      yPosition += size / 2.5 + 2;
    };

    // Helper function for section headers
    const addHeader = (text) => {
      yPosition += 3;
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22); // Orange
      doc.setFont("arial", "bold");
      doc.text(text, 15, yPosition);
      yPosition += 8;
    };

    // Title
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22);
    doc.setFont("arial", "bold");
    doc.text("📊 Reporte de Progreso", 15, yPosition);
    yPosition += 10;

    // Student info
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.setFont("arial", "normal");
    doc.text(
      `Estudiante: ${studentProfile.label} | ${new Date().toLocaleDateString("es-ES")}`,
      15,
      yPosition
    );
    yPosition += 8;

    // Current stats section
    addHeader("📈 Estadísticas Actuales");

    const stats = {
      Nivel: studentData.nivel || 1,
      "Racha Actual": studentData.rachaGlobal || 0,
      "Mejor Racha": studentData.mejorRacha || 0,
      "Tabla Actual": `Tabla del ${studentData.tabla || 2}`,
      "Total Sesiones": studentData.sesiones?.length || 0,
    };

    Object.entries(stats).forEach(([key, value]) => {
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("arial", "normal");
      doc.text(`${key}:`, 15, yPosition);
      doc.setFont("arial", "bold");
      doc.text(String(value), 80, yPosition);
      yPosition += 6;
    });

    // Calculate global rate
    const globalRate =
      studentData.sesiones && studentData.sesiones.length > 0
        ? (studentData.sesiones.filter((s) => s.aciertos > 0).length /
            studentData.sesiones.length) *
          100
        : 0;

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont("arial", "normal");
    doc.text("Tasa Global de Aciertos:", 15, yPosition);
    doc.setFont("arial", "bold");
    doc.setTextColor(249, 115, 22);
    doc.text(`${Math.round(globalRate)}%`, 80, yPosition);
    yPosition += 8;

    // Weak points section
    if (studentData.errorLog && Object.keys(studentData.errorLog).length > 0) {
      addHeader("🎯 Puntos Débiles");

      const weakPoints = Object.entries(studentData.errorLog)
        .map(([key, data]) => ({
          key,
          rate: data.fallos / data.intentos,
          intentos: data.intentos,
        }))
        .filter((item) => item.rate > 0)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);

      weakPoints.forEach(({ key, rate, intentos }) => {
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.setFont("arial", "normal");

        const errorPercent = Math.round(rate * 100);
        const barLength = (errorPercent / 100) * 60;

        doc.text(`${key}`, 15, yPosition);
        doc.setTextColor(220, 38, 38); // Red
        doc.text(`${errorPercent}%`, 90, yPosition);
        doc.setTextColor(150, 150, 150);
        doc.text(`(${intentos} intentos)`, 110, yPosition);

        // Error rate bar
        doc.setFillColor(249, 115, 22); // Orange
        doc.rect(15, yPosition + 1.5, barLength * 0.6, 2, "F");

        yPosition += 7;
      });
    }

    // Recent sessions
    if (studentData.sesiones && studentData.sesiones.length > 0) {
      yPosition += 2;
      addHeader("📋 Últimas Sesiones");

      const recentSessions = studentData.sesiones.slice(-5).reverse();

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      recentSessions.forEach((session, index) => {
        const date = new Date(session.timestamp || Date.now()).toLocaleDateString(
          "es-ES"
        );
        const accuracy =
          session.total > 0
            ? Math.round((session.aciertos / session.total) * 100)
            : 0;

        doc.setTextColor(40, 40, 40);
        doc.setFont("arial", "normal");
        doc.text(
          `${index + 1}. ${date} - ${session.aciertos}/${session.total} aciertos (${accuracy}%)`,
          15,
          yPosition
        );
        yPosition += 5;
      });
    }

    // Recommendations section
    yPosition += 3;
    addHeader("💡 Recomendaciones");

    const recommendations = generateRecommendations(
      studentData,
      globalRate,
      stats
    );

    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setFont("arial", "normal");

    recommendations.forEach((rec) => {
      const lines = doc.splitTextToSize(rec, pageWidth - 30);
      lines.forEach((line) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 15;
        }
        doc.text(line, 15, yPosition);
        yPosition += 4;
      });
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Return as data URL for download
    return doc.output("dataurlstring");
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  }
}

/**
 * Generate personalized recommendations based on student data
 */
function generateRecommendations(studentData, globalRate, stats) {
  const recommendations = [];

  // Based on racha
  if (stats["Racha Actual"] < 5) {
    recommendations.push(
      "• Anima al estudiante a mantener una racha consistente. Una pequeña racha diaria es mejor que muchas intermitentes."
    );
  } else if (stats["Racha Actual"] >= 20) {
    recommendations.push(
      "• ¡Excelente trabajo! El estudiante ha mantenido una racha impresionante. Reconoce este logro."
    );
  }

  // Based on global rate
  if (globalRate < 70) {
    recommendations.push(
      `• La tasa actual es ${Math.round(globalRate)}%. Sugiere practicar los puntos débiles identificados.`
    );
  } else if (globalRate >= 85) {
    recommendations.push(
      "• El estudiante muestra un dominio sólido. Considera pasar al siguiente nivel."
    );
  }

  // Based on weak points
  if (
    studentData.errorLog &&
    Object.keys(studentData.errorLog).length > 0
  ) {
    const weakOps = Object.entries(studentData.errorLog)
      .map(([key]) => key)
      .slice(0, 3);
    recommendations.push(
      `• Enfoca práctica adicional en: ${weakOps.join(", ")}`
    );
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      "• El estudiante está progresando bien. Continúa con la práctica regular."
    );
  }

  return recommendations;
}

/**
 * Export student data as CSV
 * @param {string} studentId
 * @param {object} studentProfile
 * @param {object} studentData
 * @returns {string} CSV content
 */
export function generateStudentCSV(
  studentId,
  studentProfile,
  studentData
) {
  const headers = [
    "Fecha",
    "Tipo Sesión",
    "Aciertos",
    "Total",
    "Porcentaje",
    "Racha",
  ];

  const rows = studentData.sesiones
    ? studentData.sesiones.map((session) => {
        const accuracy =
          session.total > 0
            ? ((session.aciertos / session.total) * 100).toFixed(1)
            : 0;
        return [
          new Date(session.timestamp || Date.now()).toLocaleDateString(
            "es-ES"
          ),
          session.tipo || "Ejercicios",
          session.aciertos || 0,
          session.total || 0,
          accuracy,
          session.racha || 0,
        ];
      })
    : [];

  const csv = [
    [
      `Reporte - ${studentProfile.label} - ${new Date().toLocaleDateString("es-ES")}`,
    ],
    [],
    headers,
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(studentId, studentProfile, studentData) {
  try {
    const csv = generateStudentCSV(studentId, studentProfile, studentData);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    element.setAttribute(
      "download",
      `${studentProfile.label.split(" ").slice(1).join(" ")}_${new Date().toISOString().split("T")[0]}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } catch (error) {
    console.error("CSV export error:", error);
  }
}
