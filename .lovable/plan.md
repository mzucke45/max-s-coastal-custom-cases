

## Replace SVG Phone Backs with Real Mockup Images

### Overview
Replace the programmatically-drawn SVG camera/phone illustrations with real PNG mockup images stored in Lovable Cloud. The admin can upload a back-panel image and a camera-overlay image per phone model, and the customizer renders those instead of SVGs.

### Database Changes

**New table: `phone_mockups`**
- `id` (uuid, PK)
- `model_id` (text, unique, not null) — matches keys in `PHONE_OUTLINES` e.g. `"iphone-16-pro"`
- `back_image_url` (text) — full phone back panel image (bottom layer)
- `overlay_image_url` (text) — camera bump + hardware PNG with transparent background (top layer, rendered with `pointer-events: none`)
- `case_area_x` (numeric, default 0.08) — % offset from left for designable region
- `case_area_y` (numeric, default 0.04) — % offset from top
- `case_area_width` (numeric, default 0.84) — % width of designable region
- `case_area_height` (numeric, default 0.92) — % height of designable region
- `created_at`, `updated_at`

**New storage bucket: `phone-mockups`** (public)

### Admin UI Changes

**New section in Admin: "Phone Mockups"**
- List all supported phone models from `PHONE_OUTLINES`
- For each model, show upload fields for:
  - Back panel image (bottom layer PNG)
  - Camera overlay image (top layer transparent PNG)
  - Case area percentages (x, y, width, height) with sensible defaults
- Save to `phone_mockups` table

### Customizer Canvas Changes

**`DesignerCanvas.tsx`** — major refactor of layer system:

1. **Fetch mockup data**: New hook `usePhoneMockups()` that queries `phone_mockups` table by `model_id`
2. **Bottom layer**: If `back_image_url` exists, render as `<img>` instead of `PhoneBackLayer` SVG. Cross-fade on model switch using framer-motion.
3. **Middle layer (Konva canvas)**: Position and size based on `caseArea` from the mockup record. Canvas clips to case region.
4. **Top layer**: If `overlay_image_url` exists, render as absolute-positioned `<img>` with `pointer-events: none` instead of SVG overlay.
5. **Fallback**: If no mockup images uploaded for a model, fall back to existing SVG system so nothing breaks.

### File Changes

| File | Change |
|------|--------|
| Migration SQL | Create `phone_mockups` table + bucket |
| `supabase/functions/admin-api/index.ts` | Add CRUD actions for phone mockups |
| `src/lib/adminApi.ts` | Add mockup API methods |
| `src/components/admin/AdminMockups.tsx` | New admin panel for uploading mockups per model |
| `src/components/admin/AdminDashboard.tsx` | Add mockups tab |
| `src/hooks/usePhoneMockups.ts` | New hook to fetch mockup data |
| `src/components/designer/DesignerCanvas.tsx` | Replace SVG layers with image layers, add caseArea clipping |
| `src/pages/Designer.tsx` | Pass mockup data to canvas |

### Layer Architecture
```text
┌─────────────────────────────┐
│  overlay_image_url (PNG)    │  ← pointer-events: none, z-index: 2
│  Camera bump, logo, frame   │
├─────────────────────────────┤
│  Konva Stage                │  ← z-index: 1, clipped to caseArea
│  (base design + user elems) │
├─────────────────────────────┤
│  back_image_url (PNG)       │  ← z-index: 0, phone back panel
└─────────────────────────────┘
```

SVG files (`PhoneBackSvg.tsx`, `phoneSvgData.ts`) are kept as fallbacks but not used when mockup images exist.

