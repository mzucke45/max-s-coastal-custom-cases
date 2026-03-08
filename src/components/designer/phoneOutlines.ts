// Phone case dimensions (canvas area) keyed by phone model id
// width/height are the case design area in px, radius is corner rounding
export interface PhoneOutline {
  width: number;
  height: number;
  radius: number;
  label: string;
}

const base = (w: number, h: number, r: number, label: string): PhoneOutline => ({ width: w, height: h, radius: r, label });

export const PHONE_OUTLINES: Record<string, PhoneOutline> = {
  // XR / XS series
  "iphone-xr":          base(186, 396, 34, "iPhone XR"),
  "iphone-xs":          base(182, 392, 34, "iPhone XS"),
  "iphone-xs-max":      base(196, 418, 36, "iPhone XS Max"),
  // 11 series
  "iphone-11":          base(186, 396, 34, "iPhone 11"),
  "iphone-11-pro":      base(182, 392, 34, "iPhone 11 Pro"),
  "iphone-11-pro-max":  base(196, 418, 36, "iPhone 11 Pro Max"),
  // 12 series
  "iphone-12":          base(186, 396, 34, "iPhone 12"),
  "iphone-12-mini":     base(176, 376, 32, "iPhone 12 Mini"),
  "iphone-12-pro":      base(186, 396, 34, "iPhone 12 Pro"),
  "iphone-12-pro-max":  base(196, 418, 36, "iPhone 12 Pro Max"),
  // 13 series
  "iphone-13":          base(186, 396, 34, "iPhone 13"),
  "iphone-13-mini":     base(176, 376, 32, "iPhone 13 Mini"),
  "iphone-13-pro":      base(186, 396, 34, "iPhone 13 Pro"),
  "iphone-13-pro-max":  base(196, 418, 36, "iPhone 13 Pro Max"),
  // 14 series
  "iphone-14":          base(188, 398, 36, "iPhone 14"),
  "iphone-14-plus":     base(196, 418, 38, "iPhone 14 Plus"),
  "iphone-14-pro":      base(190, 400, 38, "iPhone 14 Pro"),
  "iphone-14-pro-max":  base(200, 420, 40, "iPhone 14 Pro Max"),
  // 15 series
  "iphone-15":          base(190, 400, 38, "iPhone 15"),
  "iphone-15-plus":     base(198, 420, 40, "iPhone 15 Plus"),
  "iphone-15-pro":      base(190, 400, 38, "iPhone 15 Pro"),
  "iphone-15-pro-max":  base(200, 420, 40, "iPhone 15 Pro Max"),
  // 16 series
  "iphone-16":          base(190, 402, 38, "iPhone 16"),
  "iphone-16-plus":     base(198, 422, 40, "iPhone 16 Plus"),
  "iphone-16-pro":      base(192, 404, 38, "iPhone 16 Pro"),
  "iphone-16-pro-max":  base(202, 424, 40, "iPhone 16 Pro Max"),
  // Samsung
  "samsung-s24-ultra":  base(196, 418, 28, "Galaxy S24 Ultra"),
  "samsung-s24":        base(190, 400, 30, "Galaxy S24"),
  "samsung-s23":        base(188, 398, 30, "Galaxy S23"),
};
