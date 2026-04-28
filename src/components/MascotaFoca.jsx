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
 * Componente MascotaFoca - Foca kawaii interactiva mejorada
 * - Aparece en esquina inferior derecha (fixed)
 * - SVG escalable con diseño más detallado y lindo
 * - Click muestra tooltip con instrucción del modo
 * - Animación de punch: se golpea el costado al acertar
 * - Auto-dimite tooltip después de 4s
 */
const MascotaFoca = React.memo(() => {
  const { punchTrigger, currentMode, showTooltip, setShowTooltip } =
    useMascotaContext();

  const [isHappy, setIsHappy] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
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

  // Trigger punch: happy expression durante 1.2s después del punch
  useEffect(() => {
    if (punchTrigger > 0) {
      setIsHappy(true);
      setIsPunching(true);
      const happyTimeout = setTimeout(() => setIsHappy(false), 1200);
      const punchTimeout = setTimeout(() => setIsPunching(false), 500);
      return () => {
        clearTimeout(happyTimeout);
        clearTimeout(punchTimeout);
      };
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
      {/* SVG de la foca - Diseño mejorado y más cute */}
      <motion.svg
        viewBox={`0 0 ${MASCOTA_SIZE.VIEWPORT_WIDTH} ${MASCOTA_SIZE.VIEWPORT_HEIGHT}`}
        width={MASCOTA_SIZE.BODY_WIDTH}
        height={MASCOTA_SIZE.BODY_HEIGHT}
        onClick={handleClick}
        animate={
          isPunching
            ? {
                x: [0, 15, 0],
                rotateZ: [0, 2, -2, 0],
              }
            : { x: 0, rotateZ: 0 }
        }
        transition={
          isPunching
            ? {
                duration: MASCOTA_ANIMATION.SHAKE_DURATION / 1000,
                ease: "easeInOut",
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: "center center" }}
      >
        {/* Definir gradientes */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8F4F8" />
            <stop offset="50%" stopColor="#FFF8DC" />
            <stop offset="100%" stopColor="#B0D4E3" />
          </linearGradient>
          <radialGradient id="cheekGradient" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FFD4E5" />
            <stop offset="100%" stopColor="#FFB6C1" />
          </radialGradient>
        </defs>

        {/* Cuerpo principal - Óvalo redondeado con gradiente */}
        <ellipse
          cx="100"
          cy="150"
          rx="58"
          ry="75"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="3"
        />

        {/* Barriguita - Mancha clara */}
        <ellipse
          cx="100"
          cy="165"
          rx="38"
          ry="55"
          fill="#FFFACD"
          opacity="0.6"
        />

        {/* Cabeza - Forma más redonda y natural de foca */}
        <ellipse
          cx="100"
          cy="65"
          rx="56"
          ry="58"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="3"
        />

        {/* Oreja izquierda - En forma de foca, redondeada */}
        <ellipse
          cx="35"
          cy="35"
          rx="18"
          ry="28"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2.5"
          transform="rotate(-30 35 35)"
        />
        {/* Interior oreja izquierda */}
        <ellipse
          cx="37"
          cy="38"
          rx="10"
          ry="18"
          fill="#FFE4E1"
          opacity="0.8"
        />

        {/* Oreja derecha - En forma de foca, redondeada */}
        <ellipse
          cx="165"
          cy="35"
          rx="18"
          ry="28"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2.5"
          transform="rotate(30 165 35)"
        />
        {/* Interior oreja derecha */}
        <ellipse
          cx="163"
          cy="38"
          rx="10"
          ry="18"
          fill="#FFE4E1"
          opacity="0.8"
        />

        {/* Aleta frontal izquierda - Brazo para el punch */}
        <ellipse
          cx="50"
          cy="160"
          rx="16"
          ry="32"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2"
          transform="rotate(-20 50 160)"
        />

        {/* Aleta frontal derecha - Brazo para el punch */}
        <ellipse
          cx="150"
          cy="160"
          rx="16"
          ry="32"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2"
          transform="rotate(20 150 160)"
        />

        {/* Mejilla izquierda - Grande y rosada */}
        <circle
          cx="20"
          cy="75"
          r="16"
          fill="url(#cheekGradient)"
          opacity="0.75"
        />

        {/* Mejilla derecha - Grande y rosada */}
        <circle
          cx="180"
          cy="75"
          r="16"
          fill="url(#cheekGradient)"
          opacity="0.75"
        />

        {/* Ojo izquierdo - Muy grande y expresivo */}
        <circle
          cx="68"
          cy="52"
          r="12"
          fill="#1a1a1a"
          stroke="#0a0a0a"
          strokeWidth="1"
        />
        {/* Brillo grande en ojo izquierdo */}
        <circle cx="72" cy="47" r="4.5" fill="white" opacity="0.95" />
        {/* Reflejo pequeño */}
        <circle cx="75" cy="50" r="2" fill="white" opacity="0.6" />

        {/* Ojo derecho - Muy grande y expresivo */}
        <circle
          cx="132"
          cy="52"
          r="12"
          fill="#1a1a1a"
          stroke="#0a0a0a"
          strokeWidth="1"
        />
        {/* Brillo grande en ojo derecho */}
        <circle cx="136" cy="47" r="4.5" fill="white" opacity="0.95" />
        {/* Reflejo pequeño */}
        <circle cx="139" cy="50" r="2" fill="white" opacity="0.6" />

        {/* Párpados - Cambian con expresión happy */}
        {isHappy ? (
          <>
            {/* Párpado izquierdo feliz (semicírculo) */}
            <path
              d="M 62 55 Q 70 62 78 55"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Párpado derecho feliz */}
            <path
              d="M 122 55 Q 130 62 138 55"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {/* Nariz de trufa - Grande y realista */}
        <ellipse
          cx="100"
          cy="85"
          rx="10"
          ry="12"
          fill="#4A2F2A"
          stroke="#3D2620"
          strokeWidth="1.5"
        />
        {/* Orificio nasal izquierdo */}
        <circle cx="96" cy="83" r="2.5" fill="#2D1F1A" />
        {/* Orificio nasal derecho */}
        <circle cx="104" cy="83" r="2.5" fill="#2D1F1A" />

        {/* Boca - Cambia con expresión happy */}
        {isHappy ? (
          // Sonrisa feliz grande (arco)
          <path
            d="M 80 92 Q 100 108 120 92"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          // Boca neutral (línea pequeña)
          <line
            x1="85"
            y1="92"
            x2="115"
            y2="92"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Bigotes izquierdo */}
        <line
          x1="50"
          y1="78"
          x2="20"
          y2="72"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="85"
          x2="18"
          y2="95"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="92"
          x2="20"
          y2="105"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bigotes derecho */}
        <line
          x1="150"
          y1="78"
          x2="180"
          y2="72"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="150"
          y1="85"
          x2="182"
          y2="95"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="150"
          y1="92"
          x2="180"
          y2="105"
          stroke={MASCOTA_COLORS.OUTLINE}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Manchitas decorativas en el cuerpo */}
        <circle cx="75" cy="130" r="6" fill="#B0D4E3" opacity="0.5" />
        <circle cx="125" cy="145" r="5" fill="#B0D4E3" opacity="0.5" />
        <circle cx="90" cy="200" r="4" fill="#B0D4E3" opacity="0.4" />
        <circle cx="110" cy="210" r="4.5" fill="#B0D4E3" opacity="0.4" />
      </motion.svg>

      {/* Pulse/impacto animation durante punch */}
      {isPunching && (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            top: "50%",
            right: "-20px",
            width: "30px",
            height: "30px",
            border: "2px solid #FFD700",
            borderRadius: "50%",
            pointerEvents: "none",
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
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: "clamp(11px, 2vw, 13px)",
            fontWeight: 600,
            border: "1.5px solid #475569",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
            zIndex: 50,
          }}
        >
          {tooltipText}
          {/* Triángulo pointer hacia la foca */}
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              right: "25px",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "10px solid #1e293b",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
});

MascotaFoca.displayName = "MascotaFoca";

export default MascotaFoca;
