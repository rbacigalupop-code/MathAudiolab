import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import {
  MASCOTA_TOOLTIPS,
  MASCOTA_ANIMATION,
  MASCOTA_COLORS,
  MASCOTA_SIZE,
} from "../constants/mascota";

/**
 * Componente MascotaFoca - Foca kawaii interactiva
 * - Aparece en esquina inferior derecha (fixed)
 * - SVG escalable que es responsive
 * - Click muestra tooltip con instrucción del modo
 * - Realiza punch animation al acertar (triggerPunch)
 * - Auto-dimite tooltip después de 4s
 */
const MascotaFoca = React.memo(() => {
  const { punchTrigger, currentMode, showTooltip, setShowTooltip } =
    useMascotaContext();

  const [isHappy, setIsHappy] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  // Detectar dispositivo móvil para responsive scaling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Trigger punch: happy expression durante 1s después del punch
  useEffect(() => {
    if (punchTrigger > 0) {
      setIsHappy(true);
      const happyTimeout = setTimeout(() => setIsHappy(false), 1000);
      return () => clearTimeout(happyTimeout);
    }
  }, [punchTrigger]);

  // Auto-cerrar tooltip después de TOOLTIP_TIMEOUT
  useEffect(() => {
    if (showTooltip) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, MASCOTA_ANIMATION.TOOLTIP_TIMEOUT);

      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }
  }, [showTooltip, setShowTooltip]);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
  };

  // Tooltip message para el modo actual
  const tooltipText = MASCOTA_TOOLTIPS[currentMode] || "¡Tócame para ver instrucciones!";

  // Responsive scale basado en tamaño de pantalla
  const scale = isMobileDevice ? 0.7 : window.innerWidth < 1024 ? 0.85 : 1;

  return (
    <motion.div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 40,
        cursor: "pointer",
      }}
      animate={{
        scale: scale,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      {/* SVG de la foca */}
      <motion.svg
        viewBox={`0 0 ${MASCOTA_SIZE.VIEWPORT_WIDTH} ${MASCOTA_SIZE.VIEWPORT_HEIGHT}`}
        width={MASCOTA_SIZE.BODY_WIDTH}
        height={MASCOTA_SIZE.BODY_HEIGHT}
        onClick={handleClick}
        animate={
          punchTrigger > 0
            ? {
                rotateZ: [0, 3, -3, 0],
                scaleX: [1, 1.05, 0.98, 1],
              }
            : { rotateZ: 0, scaleX: 1 }
        }
        transition={
          punchTrigger > 0
            ? {
                duration: MASCOTA_ANIMATION.SHAKE_DURATION / 1000,
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1],
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: "center center" }}
      >
        {/* Cuerpo principal - Óvalo grande para look chubby */}
        <ellipse
          cx="100"
          cy="140"
          rx="55"
          ry="70"
          fill={MASCOTA_COLORS.BODY}
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2.5"
        />

        {/* Cabeza - Círculo encima del cuerpo */}
        <circle
          cx="100"
          cy="70"
          r="48"
          fill={MASCOTA_COLORS.BODY}
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2.5"
        />

        {/* Aleta izquierda */}
        <ellipse
          cx="55"
          cy="135"
          rx="18"
          ry="28"
          fill={MASCOTA_COLORS.BODY}
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
        />

        {/* Aleta derecha */}
        <ellipse
          cx="145"
          cy="135"
          rx="18"
          ry="28"
          fill={MASCOTA_COLORS.BODY}
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
        />

        {/* Mejillas - Para dar más cuteness */}
        <circle
          cx="30"
          cy="75"
          r="12"
          fill={MASCOTA_COLORS.CHEEK}
          opacity="0.6"
        />
        <circle
          cx="170"
          cy="75"
          r="12"
          fill={MASCOTA_COLORS.CHEEK}
          opacity="0.6"
        />

        {/* Ojo izquierdo */}
        <circle
          cx="75"
          cy="55"
          r={MASCOTA_SIZE.EYE_RADIUS}
          fill={MASCOTA_COLORS.EYE}
        />
        {/* Brillo en ojo izquierdo */}
        <circle cx="77" cy="52" r="2.5" fill="white" opacity="0.8" />

        {/* Ojo derecho */}
        <circle
          cx="125"
          cy="55"
          r={MASCOTA_SIZE.EYE_RADIUS}
          fill={MASCOTA_COLORS.EYE}
        />
        {/* Brillo en ojo derecho */}
        <circle cx="127" cy="52" r="2.5" fill="white" opacity="0.8" />

        {/* Párpados - Cambian con expresión happy */}
        {isHappy ? (
          <>
            {/* Párpado izquierdo feliz (semicírculo) */}
            <path
              d="M 67 55 Q 75 60 83 55"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Párpado derecho feliz */}
            <path
              d="M 117 55 Q 125 60 133 55"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {/* Nariz */}
        <circle cx="100" cy="80" r="4" fill={MASCOTA_COLORS.OUTLINE} />

        {/* Boca - Cambia con expresión happy */}
        {isHappy ? (
          // Sonrisa feliz (arco)
          <path
            d="M 85 95 Q 100 108 115 95"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          // Boca neutral (línea)
          <line
            x1="85"
            y1="95"
            x2="115"
            y2="95"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Bigotes */}
        <line
          x1="50"
          y1="85"
          x2="30"
          y2="80"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="90"
          x2="28"
          y2="95"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="150"
          y1="85"
          x2="170"
          y2="80"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="150"
          y1="90"
          x2="172"
          y2="95"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Pulse animation durante punch */}
      {punchTrigger > 0 && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          animate={{ scaleY: [1, 1.15, 1] }}
          transition={{
            duration: MASCOTA_ANIMATION.PULSE_DURATION / 1000,
            ease: "easeInOut",
            delay: MASCOTA_ANIMATION.SHAKE_DURATION / 1000,
          }}
        />
      )}

      {/* Tooltip - Instrucciones del modo */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            bottom: "calc(100% + 15px)",
            right: 0,
            whiteSpace: "nowrap",
            backgroundColor: "#1e293b",
            color: "#f1f5f9",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: "clamp(11px, 2vw, 13px)",
            fontWeight: 600,
            border: "1.5px solid #475569",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            zIndex: 50,
          }}
        >
          {tooltipText}
          {/* Triángulo pointer hacia la foca */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              right: "20px",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #1e293b",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
});

MascotaFoca.displayName = "MascotaFoca";

export default MascotaFoca;
