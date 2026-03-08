// Explicit mapping from model ID → mockup image path, container dimensions, and case area.
// Container dimensions follow model-group sizing for consistent visual proportions.

export interface MockupConfig {
  /** Path to the mockup PNG in /public/mockups/ */
  imagePath: string;
  /** Case area as percentages of the container */
  caseArea: { top: number; left: number; width: number; height: number };
  /** Display dimensions for the phone container (px) */
  containerWidth: number;
  containerHeight: number;
  /** Corner radius for the case area (px, at container scale) */
  caseRadius: number;
}

// ─── Model group sizing (px) ───
const SIZE_MINI     = { containerWidth: 320, containerHeight: 693 };
const SIZE_STANDARD = { containerWidth: 350, containerHeight: 759 };
const SIZE_PLUS     = { containerWidth: 385, containerHeight: 833 };
const SIZE_PRO      = { containerWidth: 360, containerHeight: 780 };
const SIZE_PRO_MAX  = { containerWidth: 385, containerHeight: 833 };

// Standardized case insets (percentage of container)
const CASE_INSET = { top: 0.02, left: 0.05, width: 0.90, height: 0.96 };

// Corner radii per group
const RADIUS_MINI     = 38;
const RADIUS_STANDARD = 44;
const RADIUS_PLUS     = 46;
const RADIUS_PRO      = 44;
const RADIUS_PRO_MAX  = 46;

/** Helper to build a config entry */
function cfg(
  imagePath: string,
  size: { containerWidth: number; containerHeight: number },
  caseRadius: number,
): MockupConfig {
  return { imagePath, caseArea: CASE_INSET, ...size, caseRadius };
}

/**
 * Every supported model explicitly mapped to its mockup file and layout config.
 * Keys match the model IDs in PHONE_OUTLINES and phoneModels.
 */
export const MOCKUP_MAP: Record<string, MockupConfig> = {
  // ──── iPhone 11 series ────
  "iphone-11":          cfg("/mockups/iphone-11.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-11-pro":      cfg("/mockups/iphone-11-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-11-pro-max":  cfg("/mockups/iphone-11-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── iPhone 12 series ────
  "iphone-12":          cfg("/mockups/iphone-12.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-12-mini":     cfg("/mockups/iphone-12-mini.png",     SIZE_MINI,     RADIUS_MINI),
  "iphone-12-pro":      cfg("/mockups/iphone-12-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-12-pro-max":  cfg("/mockups/iphone-12-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── iPhone 13 series ────
  "iphone-13":          cfg("/mockups/iphone-13.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-13-mini":     cfg("/mockups/iphone-13-mini.png",     SIZE_MINI,     RADIUS_MINI),
  "iphone-13-pro":      cfg("/mockups/iphone-13-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-13-pro-max":  cfg("/mockups/iphone-13-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── iPhone 14 series ────
  "iphone-14":          cfg("/mockups/iphone-14.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-14-plus":     cfg("/mockups/iphone-14-plus.png",     SIZE_PLUS,     RADIUS_PLUS),
  "iphone-14-pro":      cfg("/mockups/iphone-14-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-14-pro-max":  cfg("/mockups/iphone-14-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── iPhone 15 series ────
  "iphone-15":          cfg("/mockups/iphone-15.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-15-plus":     cfg("/mockups/iphone-15-plus.png",     SIZE_PLUS,     RADIUS_PLUS),
  "iphone-15-pro":      cfg("/mockups/iphone-15-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-15-pro-max":  cfg("/mockups/iphone-15-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── iPhone 16 series ────
  "iphone-16":          cfg("/mockups/iphone-16.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-16-plus":     cfg("/mockups/iphone-16-plus.png",     SIZE_PLUS,     RADIUS_PLUS),
  "iphone-16-pro":      cfg("/mockups/iphone-16-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-16-pro-max":  cfg("/mockups/iphone-16-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),

  // ──── Samsung ────
  "samsung-s24-ultra":  cfg("/mockups/samsung-s24-ultra.png",  SIZE_PRO_MAX,  36),
  "samsung-s24":        cfg("/mockups/samsung-s24-ultra.png",  SIZE_STANDARD, 38),
  "samsung-s23":        cfg("/mockups/samsung-s24-ultra.png",  SIZE_STANDARD, 38),

  // ──── Legacy (XR/XS) ────
  "iphone-xr":          cfg("/mockups/iphone-11.png",          SIZE_STANDARD, RADIUS_STANDARD),
  "iphone-xs":          cfg("/mockups/iphone-11-pro.png",      SIZE_PRO,      RADIUS_PRO),
  "iphone-xs-max":      cfg("/mockups/iphone-11-pro-max.png",  SIZE_PRO_MAX,  RADIUS_PRO_MAX),
};
