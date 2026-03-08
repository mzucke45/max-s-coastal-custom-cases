/**
 * Detailed phone back SVG data for each iPhone model.
 * Each entry describes the camera system, flash, Apple logo position,
 * and frame styling so we can render accurate back illustrations.
 */

export interface CameraLens {
  cx: number; // center x relative to bump
  cy: number; // center y relative to bump
  r: number;  // radius
}

export interface CameraBump {
  x: number;      // position from left edge of phone
  y: number;      // position from top edge of phone
  width: number;
  height: number;
  radius: number;  // corner radius of bump
  lenses: CameraLens[];
  flash: { cx: number; cy: number; r: number }; // relative to bump
  lidar?: { cx: number; cy: number; r: number }; // relative to bump
}

export interface PhoneSvgSpec {
  cameraBump: CameraBump;
  logoY: number;       // center Y of Apple logo relative to phone height (0-1)
  frameColor: string;  // subtle frame tint
  glassColor: string;  // back panel base
  edgeHighlight: boolean;
  titanium?: boolean;  // titanium-style frame
}

// Helper to build dual-lens diagonal layout (iPhone 11/12/13 style)
function dualDiag(bx: number, by: number, bw: number, bh: number, br: number, lr: number): CameraBump {
  return {
    x: bx, y: by, width: bw, height: bh, radius: br,
    lenses: [
      { cx: bw * 0.35, cy: bh * 0.35, r: lr },
      { cx: bw * 0.65, cy: bh * 0.65, r: lr },
    ],
    flash: { cx: bw * 0.65, cy: bh * 0.28, r: 2.5 },
  };
}

// Helper to build triple-lens triangle layout (Pro models)
function triLens(bx: number, by: number, bw: number, bh: number, br: number, lr: number): CameraBump {
  return {
    x: bx, y: by, width: bw, height: bh, radius: br,
    lenses: [
      { cx: bw * 0.5, cy: bh * 0.28, r: lr },   // top center
      { cx: bw * 0.28, cy: bh * 0.68, r: lr },   // bottom left
      { cx: bw * 0.72, cy: bh * 0.68, r: lr },   // bottom right
    ],
    flash: { cx: bw * 0.72, cy: bh * 0.28, r: 2.5 },
    lidar: { cx: bw * 0.28, cy: bh * 0.28, r: 2 },
  };
}

// Dual vertical layout (iPhone 16 style)
function dualVert(bx: number, by: number, bw: number, bh: number, br: number, lr: number): CameraBump {
  return {
    x: bx, y: by, width: bw, height: bh, radius: br,
    lenses: [
      { cx: bw * 0.5, cy: bh * 0.32, r: lr },
      { cx: bw * 0.5, cy: bh * 0.68, r: lr },
    ],
    flash: { cx: bw * 0.82, cy: bh * 0.5, r: 2.5 },
  };
}

// Quad lens (iPhone 16 Pro)
function quadLens(bx: number, by: number, bw: number, bh: number, br: number, lr: number): CameraBump {
  return {
    x: bx, y: by, width: bw, height: bh, radius: br,
    lenses: [
      { cx: bw * 0.32, cy: bh * 0.32, r: lr },  // top-left
      { cx: bw * 0.68, cy: bh * 0.32, r: lr },  // top-right
      { cx: bw * 0.32, cy: bh * 0.68, r: lr },  // bottom-left
      { cx: bw * 0.68, cy: bh * 0.68, r: lr },  // bottom-right
    ],
    flash: { cx: bw * 0.5, cy: bh * 0.5, r: 2.5 },
  };
}

function spec(cameraBump: CameraBump, opts?: Partial<PhoneSvgSpec>): PhoneSvgSpec {
  return {
    cameraBump,
    logoY: 0.48,
    frameColor: "#c8c8cc",
    glassColor: "#e8e8ed",
    edgeHighlight: true,
    ...opts,
  };
}

export const PHONE_SVG_SPECS: Record<string, PhoneSvgSpec> = {
  // ── iPhone 11 Series ──
  "iphone-11":         spec(dualDiag(12, 12, 58, 58, 14, 9)),
  "iphone-11-pro":     spec(triLens(12, 12, 60, 60, 14, 8)),
  "iphone-11-pro-max": spec(triLens(12, 12, 64, 64, 15, 9)),

  // ── iPhone 12 Series ──
  "iphone-12":         spec(dualDiag(12, 12, 56, 56, 13, 8.5)),
  "iphone-12-mini":    spec(dualDiag(10, 10, 52, 52, 12, 8)),
  "iphone-12-pro":     spec(triLens(12, 12, 58, 58, 13, 8)),
  "iphone-12-pro-max": spec(triLens(12, 12, 62, 62, 14, 9)),

  // ── iPhone 13 Series (diagonal bump is more rectangular) ──
  "iphone-13":         spec(dualDiag(12, 12, 56, 56, 13, 9)),
  "iphone-13-mini":    spec(dualDiag(10, 10, 52, 52, 12, 8)),
  "iphone-13-pro":     spec(triLens(12, 12, 62, 62, 14, 8.5)),
  "iphone-13-pro-max": spec(triLens(12, 12, 66, 66, 15, 9.5)),

  // ── iPhone 14 Series ──
  "iphone-14":         spec(dualDiag(12, 12, 56, 56, 13, 9)),
  "iphone-14-plus":    spec(dualDiag(12, 12, 58, 58, 14, 9.5)),
  "iphone-14-pro":     spec(triLens(12, 12, 64, 64, 15, 9), { frameColor: "#a0a0a6" }),
  "iphone-14-pro-max": spec(triLens(12, 12, 68, 68, 16, 9.5), { frameColor: "#a0a0a6" }),

  // ── iPhone 15 Series ──
  "iphone-15":         spec(dualDiag(12, 12, 56, 56, 13, 9)),
  "iphone-15-plus":    spec(dualDiag(12, 12, 60, 60, 14, 9.5)),
  "iphone-15-pro":     spec(triLens(12, 12, 64, 64, 15, 9), { titanium: true, frameColor: "#b8b4ac" }),
  "iphone-15-pro-max": spec(triLens(12, 12, 68, 68, 16, 9.5), { titanium: true, frameColor: "#b8b4ac" }),

  // ── iPhone 16 Series (vertical dual lens) ──
  "iphone-16":         spec(dualVert(12, 12, 40, 70, 18, 9)),
  "iphone-16-plus":    spec(dualVert(12, 12, 42, 74, 19, 9.5)),
  "iphone-16-pro":     spec(quadLens(12, 12, 68, 68, 16, 8.5), { titanium: true, frameColor: "#b8b4ac" }),
  "iphone-16-pro-max": spec(quadLens(12, 12, 72, 72, 17, 9), { titanium: true, frameColor: "#b8b4ac" }),

  // ── XR / XS Series ──
  "iphone-xr":        spec({ x: 12, y: 12, width: 36, height: 36, radius: 10, lenses: [{ cx: 18, cy: 18, r: 10 }], flash: { cx: 30, cy: 10, r: 2.5 } }),
  "iphone-xs":        spec({ x: 12, y: 12, width: 36, height: 36, radius: 10, lenses: [{ cx: 18, cy: 18, r: 10 }], flash: { cx: 30, cy: 10, r: 2.5 } }),
  "iphone-xs-max":    spec({ x: 12, y: 12, width: 38, height: 38, radius: 10, lenses: [{ cx: 19, cy: 19, r: 10 }], flash: { cx: 31, cy: 10, r: 2.5 } }),
};
