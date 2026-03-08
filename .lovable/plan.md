

## Bug Fix: Base Design Image Not Loading in Customizer

### Root Cause Analysis

After tracing the full data flow, the wiring is mostly correct but has a few gaps:

1. **The `BgImage` component silently fails** -- `useImage` returns `null` on CORS/load errors, and the component just renders nothing with no feedback.
2. **No debug logging** anywhere in the chain, making it impossible to tell where the break happens.
3. **The Konva stage background rect with white color has `opacity: 0`**, which is fine, but if the base design image fails to load, the user sees nothing -- no error, no feedback.

The database and admin upload side are working correctly (confirmed via network responses showing valid `design_image_url` values in the products API).

### Plan

#### 1. Add loading state and error handling to `BgImage` in `DesignerCanvas.tsx`

- Use the second return value from `useImage` (`status`) to detect `"failed"` state
- Add `console.log` for the design image URL and load status for debugging
- Show a subtle loading indicator while the image is loading

#### 2. Add console logging in `Designer.tsx` for the design image URL

- Log `selectedDesign?.design_image_url` when the customizer step activates, so it's easy to verify the URL is being passed

#### 3. Ensure empty string `design_image_url` is treated as no image

- Currently `selectedDesign?.design_image_url || undefined` handles this, but add an explicit trim/check to be safe against whitespace-only values

### Technical Details

**File: `src/components/designer/DesignerCanvas.tsx`**
- Update `BgImage` to use `const [img, status] = useImage(url, "anonymous")` and log status
- Add a console warning when status is `"failed"`

**File: `src/pages/Designer.tsx`**
- Add a `console.log("Base design URL:", selectedDesign?.design_image_url)` in the customize step render path
- Clean the URL value: `const designUrl = selectedDesign?.design_image_url?.trim() || undefined`

These are minimal, targeted changes that will either fix the issue (if it's a silent failure) or expose the exact failure point via console logs.

