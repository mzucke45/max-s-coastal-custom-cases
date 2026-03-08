

## Client-Side Mockup Compositing

### What Changes

Replace the broken Gelato API mockup generation with instant browser-side compositing. The "Preview My Case" button will composite the phone mockup PNG + user design into a single image using an offscreen HTML Canvas — no API calls, no storage uploads, instant result.

### File Changes

| File | Change |
|------|--------|
| `src/pages/Designer.tsx` | Rewrite `handlePreviewCase` to: (1) export Konva stage as dataURL, (2) load the mockup PNG from `MOCKUP_MAP`, (3) draw mockup PNG on offscreen canvas, (4) draw design export into the `caseArea` rect, (5) draw overlay if exists, (6) export composite as dataURL, (7) show in preview modal. Remove Gelato edge function call, storage upload, and `GELATO_PRODUCT_UIDS` import. |
| `src/components/designer/MockupPreviewModal.tsx` | No changes needed — already works with any image URL/dataURL. |

### Compositing Logic

```text
Offscreen Canvas (high-res, e.g. 1200×2400):
1. Draw phone back mockup PNG (full canvas)
2. Clip to caseArea rect, draw Konva stage export
3. If DB overlay exists, draw it on top
4. Export as dataURL → show in modal
```

### What Gets Removed
- The `handlePreviewCase` no longer calls `generate-mockup` edge function
- No more uploading to `design-previews` storage bucket for preview
- No more dependency on `GELATO_PRODUCT_UIDS` for preview (kept for future order flow)

### Key Detail
The compositing uses the same `MOCKUP_MAP` config that `DesignerCanvas` already uses, so the preview image will match exactly what the user sees in the editor.

