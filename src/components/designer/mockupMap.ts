// Explicit 1:1 mapping from model ID → mockup image path and case area dimensions.
// Never auto-generate filenames. Every model must be listed explicitly.

export interface MockupConfig {
  /** Path to the mockup PNG in /public/mockups/ */
  imagePath: string;
  /** Case area as percentages of the phone container dimensions */
  caseArea: { top: number; left: number; width: number; height: number };
  /** Display dimensions for the phone container (px) */
  containerWidth: number;
  containerHeight: number;
  /** Corner radius for the case area (px, at container scale) */
  caseRadius: number;
}

// Standardized case areas per camera-bump style
const CASE_STANDARD = { top: 0.03, left: 0.04, width: 0.92, height: 0.94 };

/**
 * Every supported model explicitly mapped to its mockup file and layout config.
 * Keys match the model IDs in PHONE_OUTLINES and phoneModels.
 */
export const MOCKUP_MAP: Record<string, MockupConfig> = {
  // ──── iPhone 11 series ────
  "iphone-11": {
    imagePath: "/mockups/iphone-11.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-11-pro": {
    imagePath: "/mockups/iphone-11-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 274,
    containerHeight: 556,
    caseRadius: 28,
  },
  "iphone-11-pro-max": {
    imagePath: "/mockups/iphone-11-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 30,
  },

  // ──── iPhone 12 series ────
  "iphone-12": {
    imagePath: "/mockups/iphone-12.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-12-mini": {
    imagePath: "/mockups/iphone-12-mini.png",
    caseArea: CASE_STANDARD,
    containerWidth: 264,
    containerHeight: 532,
    caseRadius: 26,
  },
  "iphone-12-pro": {
    imagePath: "/mockups/iphone-12-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-12-pro-max": {
    imagePath: "/mockups/iphone-12-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 30,
  },

  // ──── iPhone 13 series ────
  "iphone-13": {
    imagePath: "/mockups/iphone-13.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-13-mini": {
    imagePath: "/mockups/iphone-13-mini.png",
    caseArea: CASE_STANDARD,
    containerWidth: 264,
    containerHeight: 532,
    caseRadius: 26,
  },
  "iphone-13-pro": {
    imagePath: "/mockups/iphone-13-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-13-pro-max": {
    imagePath: "/mockups/iphone-13-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 30,
  },

  // ──── iPhone 14 series ────
  "iphone-14": {
    imagePath: "/mockups/iphone-14.png",
    caseArea: CASE_STANDARD,
    containerWidth: 282,
    containerHeight: 564,
    caseRadius: 30,
  },
  "iphone-14-plus": {
    imagePath: "/mockups/iphone-14-plus.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 32,
  },
  "iphone-14-pro": {
    imagePath: "/mockups/iphone-14-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 286,
    containerHeight: 568,
    caseRadius: 32,
  },
  "iphone-14-pro-max": {
    imagePath: "/mockups/iphone-14-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 300,
    containerHeight: 596,
    caseRadius: 34,
  },

  // ──── iPhone 15 series ────
  "iphone-15": {
    imagePath: "/mockups/iphone-15.png",
    caseArea: CASE_STANDARD,
    containerWidth: 286,
    containerHeight: 568,
    caseRadius: 32,
  },
  "iphone-15-plus": {
    imagePath: "/mockups/iphone-15-plus.png",
    caseArea: CASE_STANDARD,
    containerWidth: 298,
    containerHeight: 594,
    caseRadius: 34,
  },
  "iphone-15-pro": {
    imagePath: "/mockups/iphone-15-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 286,
    containerHeight: 568,
    caseRadius: 32,
  },
  "iphone-15-pro-max": {
    imagePath: "/mockups/iphone-15-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 300,
    containerHeight: 596,
    caseRadius: 34,
  },

  // ──── iPhone 16 series ────
  "iphone-16": {
    imagePath: "/mockups/iphone-16.png",
    caseArea: CASE_STANDARD,
    containerWidth: 286,
    containerHeight: 570,
    caseRadius: 32,
  },
  "iphone-16-plus": {
    imagePath: "/mockups/iphone-16-plus.png",
    caseArea: CASE_STANDARD,
    containerWidth: 298,
    containerHeight: 598,
    caseRadius: 34,
  },
  "iphone-16-pro": {
    imagePath: "/mockups/iphone-16-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 288,
    containerHeight: 572,
    caseRadius: 32,
  },
  "iphone-16-pro-max": {
    imagePath: "/mockups/iphone-16-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 304,
    containerHeight: 602,
    caseRadius: 34,
  },

  // ──── Samsung ────
  "samsung-s24-ultra": {
    imagePath: "/mockups/samsung-s24-ultra.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 22,
  },
  "samsung-s24": {
    imagePath: "/mockups/samsung-s24-ultra.png",
    caseArea: CASE_STANDARD,
    containerWidth: 286,
    containerHeight: 568,
    caseRadius: 24,
  },
  "samsung-s23": {
    imagePath: "/mockups/samsung-s24-ultra.png",
    caseArea: CASE_STANDARD,
    containerWidth: 282,
    containerHeight: 564,
    caseRadius: 24,
  },

  // ──── Legacy (XR/XS) ────
  "iphone-xr": {
    imagePath: "/mockups/iphone-11.png",
    caseArea: CASE_STANDARD,
    containerWidth: 280,
    containerHeight: 560,
    caseRadius: 28,
  },
  "iphone-xs": {
    imagePath: "/mockups/iphone-11-pro.png",
    caseArea: CASE_STANDARD,
    containerWidth: 274,
    containerHeight: 556,
    caseRadius: 28,
  },
  "iphone-xs-max": {
    imagePath: "/mockups/iphone-11-pro-max.png",
    caseArea: CASE_STANDARD,
    containerWidth: 294,
    containerHeight: 590,
    caseRadius: 30,
  },
};
