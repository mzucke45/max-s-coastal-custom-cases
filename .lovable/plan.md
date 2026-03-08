

## Simplify the Designer Canvas — Remove Phone Frame Overlay

### Problem
The phone mockup PNG overlay sitting on top of the design canvas looks broken and horrible. The frame images don't align properly with the design area, creating a poor user experience.

### Solution
Remove the phone frame overlay entirely. Instead, show a clean, rounded canvas with a subtle phone-shaped border where users see their design directly and can add elements on top. The canvas itself becomes the "case preview" — simple, clean, and functional.

### Changes

**`src/components/designer/DesignerCanvas.tsx`**
- Remove the entire "LAYER 3 (Top): Phone Frame Overlay" section (the `<AnimatePresence>` with `<motion.img>` and the fallback outline div, lines 355-401)
- Remove the `frameImageSrc` variable
- Remove the `mockup` prop dependency and `MOCKUP_MAP` config resolution for overlay purposes
- Keep the Konva Stage with its current sizing from the phone config (so canvas proportions still match the phone model)
- Style the canvas container with a clean rounded border, subtle shadow, and the phone model name as a small label — giving a "case shape" feel without a broken overlay
- Keep the `designImageUrl` base image, background color, and all element rendering exactly as-is

**`src/pages/Designer.tsx`**
- Simplify `handlePreviewCase` — just export the Konva stage as a high-res PNG and show it in the modal directly (no compositing with mockup PNG needed)
- Remove the mockup image loading and offscreen canvas compositing logic (lines 227-255)
- Keep the preview modal flow but pass the raw design export as the preview image

### What stays the same
- All element tools (text, images, stickers, shapes, background color)
- Canvas sizing per phone model (proportions still correct)
- Undo/redo, export, add-to-cart
- The preview modal component itself

### Result
A clean design canvas with proper phone-case proportions, no broken overlay images, and users can focus on their design with all the editing tools working perfectly.

