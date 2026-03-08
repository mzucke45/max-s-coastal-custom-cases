import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PhoneOutline } from "./phoneOutlines";
import { PHONE_SVG_SPECS, type PhoneSvgSpec, type CameraBump } from "./phoneSvgData";

/**
 * Renders the realistic back of an iPhone as an SVG.
 *  - `layer="back"` renders the base glass panel (bottom layer beneath the design)
 *  - `layer="overlay"` renders camera bump, lenses, flash, Apple logo (top layer above the design)
 */
interface Props {
  phoneId: string;
  phone: PhoneOutline;
  layer: "back" | "overlay";
}

/* ── Apple logo path (simplified, centered at 0,0, ~20x24 units) ── */
const APPLE_LOGO_PATH =
  "M15.5 1.3c-1.2 1.4-3.2 2.5-5 2.4-.2-1.9.7-3.9 1.8-5.1C13.5-2.7 15.6-3.6 17-3.7c.2 2-.6 4-1.5 5zM17 4.2c-2.8-.2-5.2 1.6-6.5 1.6-1.4 0-3.4-1.5-5.7-1.5C1.6 4.4-1.5 6.5-1.5 11.5c0 3.1 1.2 6.3 2.7 8.4 1.3 1.8 2.4 3.3 4.2 3.3 1.7-.1 2.3-1.1 4.3-1.1s2.6 1.1 4.3 1c1.8 0 2.8-1.4 4.1-3.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.8 0-2.4 2-3.5 2.1-3.6-1.2-1.7-3-1.9-3.6-1.9-.4 0-.8.1-1.3.2z";

function renderCameraBump(bump: CameraBump, spec: PhoneSvgSpec) {
  const lensRingOffset = 2;

  return (
    <g transform={`translate(${bump.x}, ${bump.y})`}>
      {/* Bump background — raised island */}
      <rect
        x={0} y={0}
        width={bump.width} height={bump.height}
        rx={bump.radius} ry={bump.radius}
        fill="#1a1a1e"
        stroke="#2a2a2e"
        strokeWidth={1}
      />
      {/* Subtle inner highlight */}
      <rect
        x={1} y={1}
        width={bump.width - 2} height={bump.height - 2}
        rx={bump.radius - 1} ry={bump.radius - 1}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={0.5}
      />

      {/* Camera lenses */}
      {bump.lenses.map((lens, i) => (
        <g key={i}>
          {/* Outer chrome ring */}
          <circle
            cx={lens.cx} cy={lens.cy}
            r={lens.r + lensRingOffset}
            fill="none"
            stroke="#3a3a3e"
            strokeWidth={1.5}
          />
          {/* Lens body */}
          <circle
            cx={lens.cx} cy={lens.cy}
            r={lens.r}
            fill="#0a0a0e"
          />
          {/* Inner reflective ring */}
          <circle
            cx={lens.cx} cy={lens.cy}
            r={lens.r * 0.7}
            fill="none"
            stroke="rgba(80,80,120,0.5)"
            strokeWidth={0.8}
          />
          {/* Lens center highlight */}
          <circle
            cx={lens.cx - lens.r * 0.15}
            cy={lens.cy - lens.r * 0.2}
            r={lens.r * 0.25}
            fill="rgba(100,100,160,0.3)"
          />
          {/* Tiny specular highlight */}
          <circle
            cx={lens.cx - lens.r * 0.25}
            cy={lens.cy - lens.r * 0.3}
            r={lens.r * 0.1}
            fill="rgba(255,255,255,0.4)"
          />
        </g>
      ))}

      {/* Flash */}
      <circle
        cx={bump.flash.cx} cy={bump.flash.cy}
        r={bump.flash.r}
        fill="#f5e6b8"
        opacity={0.9}
      />
      <circle
        cx={bump.flash.cx} cy={bump.flash.cy}
        r={bump.flash.r * 0.5}
        fill="#fffde8"
        opacity={0.7}
      />

      {/* LiDAR sensor */}
      {spec.cameraBump.lidar && (
        <circle
          cx={spec.cameraBump.lidar.cx}
          cy={spec.cameraBump.lidar.cy}
          r={spec.cameraBump.lidar.r}
          fill="#1e1e22"
          stroke="#2e2e32"
          strokeWidth={0.5}
        />
      )}
    </g>
  );
}

const PhoneBackSvg = memo(({ phoneId, phone, layer }: Props) => {
  const spec = PHONE_SVG_SPECS[phoneId];
  const w = phone.width;
  const h = phone.height;

  // Fallback for Samsung or unrecognized models
  if (!spec) {
    if (layer === "back") {
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
          <rect x={0} y={0} width={w} height={h} rx={phone.radius} ry={phone.radius} fill="#e0e0e5" />
        </svg>
      );
    }
    return null;
  }

  if (layer === "back") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Glass gradient */}
          <linearGradient id={`glass-${phoneId}`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor={spec.glassColor} />
            <stop offset="50%" stopColor={spec.glassColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d0d0d5" />
          </linearGradient>
          {/* Edge shimmer */}
          <linearGradient id={`edge-${phoneId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>

        {/* Back glass panel */}
        <rect
          x={0} y={0} width={w} height={h}
          rx={phone.radius} ry={phone.radius}
          fill={`url(#glass-${phoneId})`}
        />

        {/* Subtle texture noise effect via semi-transparent dots */}
        <rect
          x={0} y={0} width={w} height={h}
          rx={phone.radius} ry={phone.radius}
          fill="rgba(0,0,0,0.015)"
        />

        {/* Edge highlight */}
        {spec.edgeHighlight && (
          <rect
            x={0.5} y={0.5}
            width={w - 1} height={h - 1}
            rx={phone.radius} ry={phone.radius}
            fill="none"
            stroke={`url(#edge-${phoneId})`}
            strokeWidth={1}
          />
        )}
      </svg>
    );
  }

  // layer === "overlay"
  const logoScale = Math.min(w, h) * 0.0025;
  const logoCenterX = w / 2;
  const logoCenterY = h * spec.logoY;

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* Camera bump shadow */}
        <filter id={`bump-shadow-${phoneId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      {/* Camera system */}
      <g filter={`url(#bump-shadow-${phoneId})`}>
        {renderCameraBump(spec.cameraBump, spec)}
      </g>

      {/* Apple logo */}
      <g transform={`translate(${logoCenterX}, ${logoCenterY}) scale(${logoScale})`}>
        <path
          d={APPLE_LOGO_PATH}
          fill="rgba(0,0,0,0.08)"
          transform="translate(-8, -12)"
        />
      </g>

      {/* Frame border overlay for dimension */}
      <rect
        x={0} y={0} width={w} height={h}
        rx={phone.radius} ry={phone.radius}
        fill="none"
        stroke={spec.titanium ? "rgba(180,176,168,0.3)" : "rgba(0,0,0,0.06)"}
        strokeWidth={spec.titanium ? 1.5 : 1}
      />
    </svg>
  );
});

PhoneBackSvg.displayName = "PhoneBackSvg";

/**
 * Wraps the back SVG with AnimatePresence for cross-fade on model switch.
 */
export function PhoneBackLayer({
  phoneId, phone, layer,
}: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${phoneId}-${layer}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{ pointerEvents: layer === "overlay" ? "none" : undefined }}
      >
        <PhoneBackSvg phoneId={phoneId} phone={phone} layer={layer} />
      </motion.div>
    </AnimatePresence>
  );
}

export default PhoneBackSvg;
