import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMascotaContext } from "../contexts/MascotaFocaContext";
import {
  MASCOTA_ANIMATION,
  MASCOTA_SIZE,
  getTooltipForMode,
} from "../constants/mascota";
import AudioLegendModal from "./AudioLegendModal";

/* ============================================================
   MASCOTA FOCA  ·  v2 plush + aplauso lateral
   ------------------------------------------------------------
   - Foca ilustrada con gradientes pastel
   - Aplauso con UNA aleta (la derecha) pivotando en el hombro,
     en abanico de abajo a arriba, 3 palmadas rápidas
   - Inclinación sutil del cuerpo durante el aplauso
   - Halo dorado + estallido de partículas (estrellas, notas,
     corazones, chispas) al acertar
   - Parpadeo aleatorio + respiración pausada en reposo
   ============================================================ */

const STYLE_ID = "mascota-foca-v2-styles";

const MASCOTA_STYLES = `
.mf2-host{ position:fixed; right:20px; bottom:20px; z-index:40; transform-origin: bottom right; }
.mf2-stack{ position:relative; }
.mf2-seal{ display:block; overflow:visible; cursor:pointer; transition: transform .12s ease; }
.mf2-seal:active{ transform: scale(0.96); }

/* Idle breathing + head bob */
@keyframes mf2-breathe { 0%,100%{ transform: scaleY(1) scaleX(1) translateY(0); } 50%{ transform: scaleY(1.02) scaleX(.99) translateY(-1.5px); } }
@keyframes mf2-headBob  { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-1.5px); } }
.mf2-seal #mf2-body{ transform-origin: 120px 230px; transform-box: fill-box; animation: mf2-breathe 3.6s ease-in-out infinite; }
.mf2-seal #mf2-head{ transform-origin: 120px 110px; transform-box: fill-box; animation: mf2-headBob 3.6s ease-in-out infinite; }

/* Happy bounce */
@keyframes mf2-happyBody { 0%{transform: scaleY(1) scaleX(1);} 25%{transform: scaleY(.94) scaleX(1.04);} 50%{transform: scaleY(1.04) scaleX(.97);} 75%{transform: scaleY(.97) scaleX(1.02);} 100%{transform: scaleY(1) scaleX(1);} }
@keyframes mf2-happyHead { 0%{transform: translateY(0) rotate(0);} 20%{transform: translateY(-6px) rotate(-3deg);} 45%{transform: translateY(2px) rotate(2deg);} 70%{transform: translateY(-3px) rotate(-1deg);} 100%{transform: translateY(0) rotate(0);} }
.mf2-seal.mf2-happy #mf2-body{ animation: mf2-happyBody 1.1s ease-in-out; }
.mf2-seal.mf2-happy #mf2-head{ animation: mf2-happyHead 1.1s ease-in-out; }

/* Eyebrows up on happy */
.mf2-seal #mf2-eyebrows{ transition: transform .35s ease; }
.mf2-seal.mf2-happy #mf2-eyebrows{ transform: translateY(-5px); }

/* Blink */
.mf2-seal #mf2-pupils{ transform-origin: 120px 105px; transform-box: fill-box; transition: transform .14s ease; }
.mf2-seal.mf2-blink #mf2-pupils{ transform: scaleY(.08); }

/* Mouth swap */
.mf2-seal #mf2-mouth-happy{ opacity: 0; transition: opacity .25s ease; }
.mf2-seal #mf2-mouth-neutral{ opacity: 1; transition: opacity .25s ease; }
.mf2-seal.mf2-happy #mf2-mouth-happy{ opacity: 1; }
.mf2-seal.mf2-happy #mf2-mouth-neutral{ opacity: 0; }

/* Tail fluke gentle swish */
@keyframes mf2-tailL { 0%,100%{ transform: rotate(-2deg);} 50%{ transform: rotate(2deg);} }
@keyframes mf2-tailR { 0%,100%{ transform: rotate(2deg);}  50%{ transform: rotate(-2deg);} }
.mf2-seal #mf2-tail-l{ transform-origin: 112px 250px; transform-box: fill-box; animation: mf2-tailL 3s ease-in-out infinite; }
.mf2-seal #mf2-tail-r{ transform-origin: 128px 250px; transform-box: fill-box; animation: mf2-tailR 3s ease-in-out infinite; }

/* ONE-FLIPPER clap — right flipper only. Pivot at shoulder. Fan motion. */
.mf2-seal #mf2-flipper-l{ transform-origin: 70px 168px;  transform-box: fill-box; transform: rotate(-8deg); transition: transform .25s ease; }
.mf2-seal #mf2-flipper-r{ transform-origin: 170px 168px; transform-box: fill-box; transform: rotate(8deg);  transition: transform .25s ease; }
@keyframes mf2-clapR {
  0%   { transform: rotate(8deg); }
  14%  { transform: rotate(-58deg); }
  28%  { transform: rotate(10deg); }
  42%  { transform: rotate(-58deg); }
  56%  { transform: rotate(10deg); }
  70%  { transform: rotate(-58deg); }
  100% { transform: rotate(8deg); }
}
.mf2-seal.mf2-clapping #mf2-flipper-r{ animation: mf2-clapR .95s cubic-bezier(.4,.0,.2,1); }

/* Body lean during clap */
.mf2-seal #mf2-pose{ transform-origin: 120px 240px; transform-box: fill-box; }
@keyframes mf2-lean {
  0%   { transform: rotate(0); }
  14%  { transform: rotate(6deg); }
  28%  { transform: rotate(2deg); }
  42%  { transform: rotate(6deg); }
  56%  { transform: rotate(2deg); }
  70%  { transform: rotate(6deg); }
  100% { transform: rotate(0); }
}
.mf2-seal.mf2-clapping #mf2-pose{ animation: mf2-lean .95s cubic-bezier(.4,.0,.2,1); }

/* Halo */
@keyframes mf2-halo { 0%{ transform: translate(-50%, 0) scale(.4); opacity:0; } 30%{ opacity:.55; } 100%{ transform: translate(-50%, 0) scale(1.9); opacity:0; } }
.mf2-halo{ position:absolute; left:50%; bottom:60%; width:220px; height:220px; margin-left:-110px;
  border-radius:50%; pointer-events:none; opacity:0;
  background: radial-gradient(closest-side, rgba(253,224,71,.55), rgba(253,224,71,0) 70%); }
.mf2-halo.mf2-active{ animation: mf2-halo 1.1s ease-out; }

/* Particles */
.mf2-particles{ position:absolute; left:50%; top:30%; width:0; height:0; pointer-events:none; }
.mf2-particle{ position:absolute; left:0; top:0; transform: translate(-50%,-50%) scale(.3); opacity:0; will-change: transform, opacity; }
`;

/* ============================================================
   SVG de la foca
   ============================================================ */

function FocaSVG() {
  return (
    <svg viewBox="0 0 240 280" width={MASCOTA_SIZE.BODY_WIDTH ? MASCOTA_SIZE.BODY_WIDTH * 1.9 : 190} height={MASCOTA_SIZE.BODY_HEIGHT ? MASCOTA_SIZE.BODY_HEIGHT * 1.57 : 220} className="mf2-seal-svg">
      <defs>
        <linearGradient id="mf2-bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#dfe7ee" />
          <stop offset="55%" stopColor="#b9c7d2" />
          <stop offset="100%" stopColor="#8a9caa" />
        </linearGradient>
        <linearGradient id="mf2-bellyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#fff6e6" />
          <stop offset="100%" stopColor="#f6d9b8" />
        </linearGradient>
        <radialGradient id="mf2-cheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#ffc4d3" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffc4d3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mf2-headLight" cx="35%" cy="25%" r="55%">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mf2-floorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mf2-flipperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#c9d4dd" />
          <stop offset="100%" stopColor="#7d8e9c" />
        </linearGradient>
        <linearGradient id="mf2-tailGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#b6c4d0" />
          <stop offset="100%" stopColor="#7d8e9c" />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="262" rx="70" ry="9" fill="url(#mf2-floorShadow)" />

      <g id="mf2-pose">
        {/* COLA */}
        <g id="mf2-tail-l">
          <path d="M 112 250 Q 44 238 57 228 Q 80 240 104 248 Q 110 250 112 250 Z"
                fill="url(#mf2-tailGrad)" stroke="#5a6776" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        <g id="mf2-tail-r">
          <path d="M 128 250 Q 196 238 183 228 Q 160 240 136 248 Q 130 250 128 250 Z"
                fill="url(#mf2-tailGrad)" stroke="#5a6776" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* CUERPO */}
        <g id="mf2-body">
          <path d="M 120 70 C 60 70, 48 130, 52 180 C 56 230, 88 258, 120 258 C 152 258, 184 230, 188 180 C 192 130, 180 70, 120 70 Z"
                fill="url(#mf2-bodyGrad)" stroke="#5a6776" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 120 130 C 90 130, 80 170, 86 210 C 92 240, 110 248, 120 248 C 130 248, 148 240, 154 210 C 160 170, 150 130, 120 130 Z"
                fill="url(#mf2-bellyGrad)" />
          <path d="M 120 168 Q 116 178 120 188" stroke="#e3cfae" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          <path d="M 120 198 Q 124 208 120 218" stroke="#e3cfae" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45"/>
        </g>

        {/* ALETA IZQ (estática) */}
        <g id="mf2-flipper-l">
          <path d="M 70 160 C 50 168, 38 200, 48 230 C 58 244, 78 240, 84 222 C 92 200, 90 175, 78 160 C 75 158, 72 158, 70 160 Z"
                fill="url(#mf2-flipperGrad)" stroke="#5a6776" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 56 218 Q 60 226 65 230" stroke="#5a6776" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M 66 222 Q 70 230 74 232" stroke="#5a6776" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
        </g>

        {/* ALETA DER (la que aplaude) */}
        <g id="mf2-flipper-r">
          <path d="M 170 160 C 190 168, 202 200, 192 230 C 182 244, 162 240, 156 222 C 148 200, 150 175, 162 160 C 165 158, 168 158, 170 160 Z"
                fill="url(#mf2-flipperGrad)" stroke="#5a6776" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 184 218 Q 180 226 175 230" stroke="#5a6776" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M 174 222 Q 170 230 166 232" stroke="#5a6776" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
        </g>

        {/* CABEZA */}
        <g id="mf2-head">
          <ellipse cx="120" cy="100" rx="72" ry="68" fill="url(#mf2-bodyGrad)" stroke="#5a6776" strokeWidth="2.5" />
          <ellipse cx="120" cy="100" rx="72" ry="68" fill="url(#mf2-headLight)" />
          <ellipse cx="56"  cy="78" rx="5" ry="8" fill="#6b7986" />
          <ellipse cx="184" cy="78" rx="5" ry="8" fill="#6b7986" />

          <g id="mf2-eyebrows">
            <path d="M 78 80 Q 92 73 106 80"   stroke="#5a6776" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 134 80 Q 148 73 162 80" stroke="#5a6776" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>

          <circle cx="68"  cy="118" r="14" fill="url(#mf2-cheekGrad)" />
          <circle cx="172" cy="118" r="14" fill="url(#mf2-cheekGrad)" />

          <ellipse cx="92"  cy="103" rx="12" ry="14" fill="#fafcff" stroke="#3b4753" strokeWidth="1.2" />
          <ellipse cx="148" cy="103" rx="12" ry="14" fill="#fafcff" stroke="#3b4753" strokeWidth="1.2" />
          <g id="mf2-pupils">
            <ellipse cx="93"  cy="105" rx="7" ry="9" fill="#1a2230" />
            <ellipse cx="149" cy="105" rx="7" ry="9" fill="#1a2230" />
            <circle cx="96"  cy="101" r="2.6" fill="#ffffff" />
            <circle cx="152" cy="101" r="2.6" fill="#ffffff" />
            <circle cx="90"  cy="109" r="1.2" fill="#ffffff" opacity="0.85" />
            <circle cx="146" cy="109" r="1.2" fill="#ffffff" opacity="0.85" />
          </g>

          <ellipse cx="120" cy="138" rx="30" ry="22" fill="#f6e7d2" stroke="#5a6776" strokeWidth="2" />
          <ellipse cx="120" cy="142" rx="26" ry="16" fill="#e8d4b9" opacity="0.55" />

          <path d="M 113 126 Q 120 119 127 126 Q 130 134 120 138 Q 110 134 113 126 Z" fill="#2b1f1a" stroke="#170f0a" strokeWidth="1.2" />
          <ellipse cx="117" cy="123" rx="2.4" ry="1.6" fill="#ffffff" opacity="0.7" />

          <path id="mf2-mouth-neutral" d="M 108 146 Q 120 152 132 146" stroke="#5a6776" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path id="mf2-mouth-happy"   d="M 108 148 Q 120 162 132 148 Q 126 156 120 156 Q 114 156 108 148 Z" fill="#7a4a3d" stroke="#3a2520" strokeWidth="1.3" strokeLinejoin="round" />

          <g stroke="#f5f5f5" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.85">
            <path d="M 92 138 Q 70 136 56 132" />
            <path d="M 92 142 Q 70 144 54 144" />
            <path d="M 92 146 Q 72 150 58 156" />
            <path d="M 148 138 Q 170 136 184 132" />
            <path d="M 148 142 Q 170 144 186 144" />
            <path d="M 148 146 Q 168 150 182 156" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ============================================================
   Partículas (Web Animations API)
   ============================================================ */

const PARTICLE_COLORS = ["#fde047", "#f9a8d4", "#86efac", "#93c5fd", "#fdba74", "#a5f3fc"];
const PARTICLE_GLYPHS = [
  (c) => (<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill={c} stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" /></svg>),
  (c) => (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21 C 6 16, 2 13, 2 8.5 A 4.5 4.5 0 0 1 12 6 A 4.5 4.5 0 0 1 22 8.5 C 22 13, 18 16, 12 21 Z" fill={c} stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" /></svg>),
  (c) => (<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 18 a 3 2.5 0 1 0 3 2.5 V 6 l 7 -2 V 14 a 3 2.5 0 1 0 3 2.5 V 2 L 9 5 Z" fill={c} stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" /></svg>),
  (c) => (<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 1 L13.5 10.5 L23 12 L13.5 13.5 L12 23 L10.5 13.5 L1 12 L10.5 10.5 Z" fill={c} /></svg>),
];

function ParticleBurst({ trigger }) {
  const layerRef = useRef(null);

  const particles = useMemo(() => {
    if (!trigger) return [];
    const n = 14;
    return Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
      const dist = 110 + Math.random() * 60;
      return {
        id: `${trigger}-${i}`,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 24,
        kind: Math.floor(Math.random() * PARTICLE_GLYPHS.length),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        rot: (Math.random() - 0.5) * 720,
        delay: Math.random() * 220,
      };
    });
  }, [trigger]);

  useEffect(() => {
    if (!trigger || !layerRef.current) return;
    const nodes = Array.from(layerRef.current.querySelectorAll("[data-particle-idx]"));
    const anims = nodes.map((el, i) => {
      const p = particles[i];
      if (!p) return null;
      return el.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.3)", opacity: 0, offset: 0 },
          { transform: `translate(calc(-50% + ${p.tx * 0.45}px), calc(-50% + ${p.ty * 0.45}px)) rotate(${p.rot * 0.3}deg) scale(1.15)`, opacity: 1, offset: 0.18 },
          { transform: `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) rotate(${p.rot}deg) scale(1)`, opacity: 1, offset: 0.7 },
          { transform: `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty + 30}px)) rotate(${p.rot}deg) scale(0.7)`, opacity: 0, offset: 1 },
        ],
        { duration: 1400, delay: p.delay, easing: "ease-out", fill: "forwards" }
      );
    }).filter(Boolean);
    return () => anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  }, [trigger, particles]);

  return (
    <>
      <div className={"mf2-halo " + (trigger ? "mf2-active" : "")} key={`mf2-halo-${trigger}`} />
      <div className="mf2-particles" ref={layerRef}>
        {particles.map((p, i) => (
          <div key={p.id} className="mf2-particle" data-particle-idx={i}>
            {PARTICLE_GLYPHS[p.kind](p.color)}
          </div>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   Componente principal
   ============================================================ */

const MascotaFoca = React.memo(() => {
  const {
    punchTrigger,
    currentMode,
    showTooltip,
    setShowTooltip,
    currentBanda,
    audioLegendOpen,
    setAudioLegendOpen,
    currentHint,
  } = useMascotaContext();

  const [isHappy, setIsHappy]       = useState(false);
  const [clapKey, setClapKey]       = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showHintBubble, setShowHintBubble] = useState(false);
  const tooltipTimer = useRef(null);
  const hintTimer    = useRef(null);

  // Inyectar CSS una sola vez (a nivel head)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = MASCOTA_STYLES;
    document.head.appendChild(styleEl);
  }, []);

  // Responsive
  useEffect(() => {
    const checkMobile = () => setIsMobileDevice(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Trigger punch → happy + clap + particles
  useEffect(() => {
    if (punchTrigger > 0) {
      setIsHappy(true);
      setClapKey(punchTrigger);
      const t1 = setTimeout(() => setIsHappy(false), 1100);
      return () => clearTimeout(t1);
    }
  }, [punchTrigger]);

  // Parpadeo aleatorio natural
  useEffect(() => {
    let cancelled = false;
    let outer, inner;
    const schedule = () => {
      outer = setTimeout(() => {
        if (cancelled) return;
        setIsBlinking(true);
        inner = setTimeout(() => {
          if (cancelled) return;
          setIsBlinking(false);
          schedule();
        }, 160);
      }, 2400 + Math.random() * 2800);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(outer); clearTimeout(inner); };
  }, []);

  // Tooltip auto-cierre
  useEffect(() => {
    if (showTooltip) {
      tooltipTimer.current = setTimeout(
        () => setShowTooltip(false),
        MASCOTA_ANIMATION?.TOOLTIP_TIMEOUT ?? 4000
      );
      return () => clearTimeout(tooltipTimer.current);
    }
  }, [showTooltip, setShowTooltip]);

  // Hint bubble
  useEffect(() => {
    if (currentHint) {
      setShowHintBubble(true);
      hintTimer.current = setTimeout(() => setShowHintBubble(false), 6000);
      return () => clearTimeout(hintTimer.current);
    } else {
      setShowHintBubble(false);
    }
  }, [currentHint]);

  const tooltipText = getTooltipForMode(currentMode, currentBanda);
  const scale = isMobileDevice ? 0.78 : window.innerWidth < 1024 ? 0.9 : 1;
  const sealClass = ["mf2-seal", isHappy ? "mf2-happy" : "", clapKey ? "mf2-clapping" : "", isBlinking ? "mf2-blink" : ""].filter(Boolean).join(" ");

  return (
    <>
      <AudioLegendModal
        isOpen={audioLegendOpen}
        onClose={() => setAudioLegendOpen(false)}
      />

      <motion.div
        className="mf2-host"
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <div className="mf2-stack">
          <ParticleBurst trigger={clapKey} />

          <div className={sealClass} key={clapKey} onClick={() => setShowTooltip(!showTooltip)}>
            <FocaSVG />
          </div>

          {/* Pista (verde) */}
          <AnimatePresence>
            {showHintBubble && currentHint && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 80px)",
                  right: "-20px",
                  whiteSpace: "normal",
                  maxWidth: 220,
                  backgroundColor: "#059669",
                  color: "#f0fdf4",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: "clamp(10px, 1.8vw, 12px)",
                  fontWeight: 600,
                  border: "2px solid #10b981",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                  zIndex: 51,
                  lineHeight: 1.4,
                }}
              >
                💡 {currentHint}
                <div
                  style={{
                    position: "absolute",
                    bottom: -12,
                    right: 30,
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "12px solid #059669",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón "Cómo Funcionan" sobre el tooltip */}
          {showTooltip && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAudioLegendOpen(true)}
              style={{
                position: "absolute",
                bottom: "calc(100% + 70px)",
                right: 10,
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                zIndex: 50,
              }}
            >
              🎵 Cómo Funcionan
            </motion.button>
          )}

          {/* Tooltip */}
          <AnimatePresence>
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
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  zIndex: 50,
                }}
              >
                {tooltipText}
                <div
                  style={{
                    position: "absolute",
                    bottom: -10,
                    right: 25,
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: "10px solid #1e293b",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
});

MascotaFoca.displayName = "MascotaFoca";

export default MascotaFoca;
