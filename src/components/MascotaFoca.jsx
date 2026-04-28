import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import {
  MASCOTA_TOOLTIPS,
  MASCOTA_ANIMATION,
  MASCOTA_COLORS,
  MASCOTA_SIZE,
  getTooltipForMode,
} from "../constants/mascota";

/**
 * Componente MascotaFoca - Foca kawaii realista
 * - Aparece en esquina inferior derecha (fixed)
 * - SVG con diseño realista: hocico grande, cabeza redonda
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

  // Trigger punch: happy expression durante 1s después del punch
  useEffect(() => {
    if (punchTrigger > 0) {
      setIsHappy(true);
      setIsPunching(true);
      const happyTimeout = setTimeout(() => setIsHappy(false), 1000);
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

  // Tooltip message para el modo actual - usar contenido dinámico del manual educativo
  const tooltipText = getTooltipForMode(currentMode);

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
      {/* SVG de la foca - Diseño realista */}
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

        {/* Cuerpo principal - Forma redondeada */}
        <ellipse
          cx="100"
          cy="160"
          rx="56"
          ry="70"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="3"
        />

        {/* Barriguita - Mancha clara */}
        <ellipse
          cx="100"
          cy="170"
          rx="36"
          ry="52"
          fill="#FFFACD"
          opacity="0.6"
        />

        {/* Cabeza GRANDE - Tipo burbuja */}
        <circle
          cx="100"
          cy="80"
          r="60"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="3"
        />

        {/* Hocico/Nariz GRANDE y prominente - Característica principal de foca */}
        <ellipse
          cx="100"
          cy="95"
          rx="28"
          ry="32"
          fill="#E0D5C7"
          stroke="#5D4037"
          strokeWidth="2.5"
        />

        {/* Nariz/Trufa - El punto focal */}
        <ellipse
          cx="100"
          cy="92"
          rx="12"
          ry="14"
          fill="#4A3835"
          stroke="#3D2620"
          strokeWidth="1.5"
        />

        {/* Orificio nasal izquierdo */}
        <circle cx="95" cy="90" r="2" fill="#2D1F1A" />
        {/* Orificio nasal derecho */}
        <circle cx="105" cy="90" r="2" fill="#2D1F1A" />

        {/* Mejillas rosadas grandes */}
        <circle
          cx="25"
          cy="80"
          r="18"
          fill="url(#cheekGradient)"
          opacity="0.75"
        />
        <circle
          cx="175"
          cy="80"
          r="18"
          fill="url(#cheekGradient)"
          opacity="0.75"
        />

        {/* Orejas pequeñas (tipo agujeros de foca) */}
        <ellipse
          cx="50"
          cy="35"
          rx="8"
          ry="12"
          fill="#B0D4E3"
          stroke="#5D4037"
          strokeWidth="1.5"
        />
        <ellipse
          cx="150"
          cy="35"
          rx="8"
          ry="12"
          fill="#B0D4E3"
          stroke="#5D4037"
          strokeWidth="1.5"
        />

        {/* Ojos - Medianos en proporción a la cabeza grande */}
        <circle
          cx="70"
          cy="65"
          r="9"
          fill="#1a1a1a"
          stroke="#0a0a0a"
          strokeWidth="1"
        />
        {/* Brillo ojo izquierdo */}
        <circle cx="73" cy="62" r="3.5" fill="white" opacity="0.95" />

        <circle
          cx="130"
          cy="65"
          r="9"
          fill="#1a1a1a"
          stroke="#0a0a0a"
          strokeWidth="1"
        />
        {/* Brillo ojo derecho */}
        <circle cx="133" cy="62" r="3.5" fill="white" opacity="0.95" />

        {/* Párpados - Cambian con expresión happy */}
        {isHappy ? (
          <>
            {/* Párpado izquierdo feliz */}
            <path
              d="M 62 65 Q 70 72 78 65"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Párpado derecho feliz */}
            <path
              d="M 122 65 Q 130 72 138 65"
              stroke={MASCOTA_COLORS.OUTLINE}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {/* Boca - Cambia con expresión happy */}
        {isHappy ? (
          // Sonrisa feliz (arco grande)
          <path
            d="M 80 105 Q 100 118 120 105"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          // Boca neutral (línea pequeña)
          <line
            x1="85"
            y1="105"
            x2="115"
            y2="105"
            stroke={MASCOTA_COLORS.MOUTH}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Aleta frontal izquierda - Para punch */}
        <ellipse
          cx="45"
          cy="165"
          rx="14"
          ry="30"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2"
          transform="rotate(-15 45 165)"
        />

        {/* Aleta frontal derecha - Para punch */}
        <ellipse
          cx="155"
          cy="165"
          rx="14"
          ry="30"
          fill="url(#bodyGradient)"
          stroke="#5D4037"
          strokeWidth="2"
          transform="rotate(15 155 165)"
        />

        {/* Manchitas decorativas suaves */}
        <circle cx="70" cy="140" r="5" fill="#B0D4E3" opacity="0.4" />
        <circle cx="130" cy="150" r="4" fill="#B0D4E3" opacity="0.4" />
        <circle cx="90" cy="190" r="4" fill="#B0D4E3" opacity="0.3" />
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
