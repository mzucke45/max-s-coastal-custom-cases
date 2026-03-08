

## Fix Canvas Clipping and Mobile Layout

### Problems
1. **Rounded corners clip content** — The canvas wrapper has `overflow: hidden` + `borderRadius: 44px`, cutting off text/elements near edges
2. **Not optimized for mobile** — The canvas area is too tall on small screens, forcing scroll
3. **Scroll indicator showing** — The page layout doesn't fit in viewport on mobile

### Changes

**`src/components/designer/DesignerCanvas.tsx`**
- Remove `overflow: hidden` and `borderRadius` from the canvas wrapper div (line 257-267). The design canvas should show the full rectangular area without clipping
- Remove the decorative border div (lines 354-368) that also uses rounded corners
- Instead, use a simple clean border on the canvas wrapper (no border-radius, or very minimal like 8px)
- Remove `minHeight: 440` constraint on the outer container
- Make the outer container use `overflow: visible` instead of `overflow-hidden`

**`src/pages/Designer.tsx`**
- Compute `scale` dynamically based on available viewport height on mobile, not just width — use `Math.min(widthScale, heightScale)` so the entire design + toolbar fits without scrolling
- Add a `useEffect` that calculates scale from `window.innerHeight` minus space for header, step indicator, toolbar, and action buttons (~350px overhead)
- Remove the `ScrollArea` wrapper around toolbar content (line 503) — use a simple div instead to eliminate the scroll indicator
- Reduce toolbar `max-h` or remove it entirely, letting content flow naturally
- Add `overflow-hidden` to the page container to prevent any page-level scroll on mobile

### Scale Calculation (mobile-aware)
```typescript
useEffect(() => {
  const updateScale = () => {
    const config = MOCKUP_MAP[selectedModel];
    if (!config) return;
    const cW = config.containerWidth;
    const cH = config.containerHeight;
    const availW = window.innerWidth - 48;
    const availH = window.innerHeight - 380; // header + steps + toolbar + buttons
    const s = Math.min(1, availW / cW, availH / cH);
    setScale(s);
  };
  updateScale();
  window.addEventListener('resize', updateScale);
  return () => window.removeEventListener('resize', updateScale);
}, [selectedModel]);
```

### Result
- Full design visible without corner clipping
- Canvas scales to fit mobile viewport completely (no scrolling needed)
- No scroll indicators anywhere on the customize step

