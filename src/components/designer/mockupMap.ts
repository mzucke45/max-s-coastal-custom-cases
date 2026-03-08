// Local fallback mockup images for models without Supabase-uploaded mockups
// Maps model IDs to their closest matching mockup image in /mockups/

export interface LocalMockupFallback {
  imagePath: string;
  caseArea: { x: number; y: number; width: number; height: number };
}

// Default case area — avoids camera bump in upper-left
const CASE_DEFAULT = { x: 0.04, y: 0.28, width: 0.92, height: 0.68 };
const CASE_DUAL   = { x: 0.04, y: 0.26, width: 0.92, height: 0.70 };
const CASE_TRIPLE = { x: 0.04, y: 0.30, width: 0.92, height: 0.66 };
const CASE_SAMSUNG = { x: 0.04, y: 0.32, width: 0.92, height: 0.64 };

export const LOCAL_MOCKUP_MAP: Record<string, LocalMockupFallback> = {
  // iPhone 16 series
  "iphone-16-pro-max": { imagePath: "/mockups/iphone-16-pro-max.png", caseArea: CASE_TRIPLE },
  "iphone-16-pro":     { imagePath: "/mockups/iphone-16-pro.png",     caseArea: CASE_TRIPLE },
  "iphone-16-plus":    { imagePath: "/mockups/iphone-16.png",         caseArea: CASE_DUAL },
  "iphone-16":         { imagePath: "/mockups/iphone-16.png",         caseArea: CASE_DUAL },

  // iPhone 15 series
  "iphone-15-pro-max": { imagePath: "/mockups/iphone-15-pro.png",     caseArea: CASE_TRIPLE },
  "iphone-15-pro":     { imagePath: "/mockups/iphone-15-pro.png",     caseArea: CASE_TRIPLE },
  "iphone-15-plus":    { imagePath: "/mockups/iphone-15.png",         caseArea: CASE_DUAL },
  "iphone-15":         { imagePath: "/mockups/iphone-15.png",         caseArea: CASE_DUAL },

  // iPhone 14 series
  "iphone-14-pro-max": { imagePath: "/mockups/iphone-14-pro.png",     caseArea: CASE_TRIPLE },
  "iphone-14-pro":     { imagePath: "/mockups/iphone-14-pro.png",     caseArea: CASE_TRIPLE },
  "iphone-14-plus":    { imagePath: "/mockups/iphone-14.png",         caseArea: CASE_DUAL },
  "iphone-14":         { imagePath: "/mockups/iphone-14.png",         caseArea: CASE_DUAL },

  // iPhone 13 series
  "iphone-13-pro-max": { imagePath: "/mockups/iphone-13.png",         caseArea: CASE_TRIPLE },
  "iphone-13-pro":     { imagePath: "/mockups/iphone-13.png",         caseArea: CASE_TRIPLE },
  "iphone-13-mini":    { imagePath: "/mockups/iphone-13.png",         caseArea: CASE_DUAL },
  "iphone-13":         { imagePath: "/mockups/iphone-13.png",         caseArea: CASE_DUAL },

  // iPhone 12 series
  "iphone-12-pro-max": { imagePath: "/mockups/iphone-12.png",         caseArea: CASE_TRIPLE },
  "iphone-12-pro":     { imagePath: "/mockups/iphone-12.png",         caseArea: CASE_TRIPLE },
  "iphone-12-mini":    { imagePath: "/mockups/iphone-12.png",         caseArea: CASE_DUAL },
  "iphone-12":         { imagePath: "/mockups/iphone-12.png",         caseArea: CASE_DUAL },

  // iPhone 11 series
  "iphone-11-pro-max": { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_TRIPLE },
  "iphone-11-pro":     { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_TRIPLE },
  "iphone-11":         { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_DUAL },

  // iPhone XR / XS series
  "iphone-xr":         { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_DEFAULT },
  "iphone-xs-max":     { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_DEFAULT },
  "iphone-xs":         { imagePath: "/mockups/iphone-11.png",         caseArea: CASE_DEFAULT },

  // Samsung
  "samsung-s24-ultra":  { imagePath: "/mockups/samsung-s24-ultra.png", caseArea: CASE_SAMSUNG },
  "samsung-s24":        { imagePath: "/mockups/samsung-s24-ultra.png", caseArea: CASE_SAMSUNG },
  "samsung-s23":        { imagePath: "/mockups/samsung-s24-ultra.png", caseArea: CASE_SAMSUNG },
};
