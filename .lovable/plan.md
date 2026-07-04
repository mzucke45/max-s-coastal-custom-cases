# Rebrand to MAXIMAL + Simplify to Redirect-Based Storefront

## 1. Rebrand: Max's Customs → MAXIMAL

- Replace text in: `index.html` (title, meta, OG), `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/pages/Index.tsx`, and the Stripe `create-payment` edge function's `ALLOWED_ORIGINS` comment/branding strings.
- Install the uploaded logo at `src/assets/logo-maximal.png` (from `user-uploads://Maximals_Logo_2.png`) and swap `src/assets/logo.png` usage in Navbar + Footer.
- **Logo styling:** keep the existing **fully circular** crop/mask in header and footer (already a project rule). Update `alt` text to "MAXIMAL".
- **Favicon:** generate a square rounded favicon from the new logo, place at `public/favicon.png`, update `index.html`, delete `public/favicon.ico`.

## 2. Remove the Customizer

- Delete `src/pages/Designer.tsx` and `src/components/designer/` directory.
- Remove the `/designer` route from `src/App.tsx`.
- Remove the "Customize" nav link from `Navbar.tsx` (desktop + mobile).
- Remove any "Customize" CTA on `Index.tsx`, `Shop.tsx`, `ProductDetail.tsx`.
- Keep the `DesignCapture`/canvas types file untouched only if still referenced by orders admin; otherwise remove imports.

## 3. Remove the Cart + Checkout Flow

- Delete `src/components/CartDrawer.tsx`, `src/components/CheckoutDialog.tsx`, `src/context/CartContext.tsx`.
- Delete `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentCanceled.tsx`.
- Remove `CartProvider` wrapper and cart/payment routes from `src/App.tsx`.
- Remove the cart icon/button and `useCart` usage from `Navbar.tsx`.
- Delete Stripe edge functions no longer used: `supabase/functions/create-payment` and `supabase/functions/verify-payment` (keep the migrations as-is; DB schema stays).
- Leave the `orders` table in place (admin may still reference historical data). Admin order-management UI stays functional for existing orders but no new orders will be created via the site.

## 4. Per-Product External Buy URL

- **DB migration:** add `buy_url text` column to `public.products` (nullable). No new GRANTs needed (column added to existing table).
- **Admin panel** (`src/pages/Admin.tsx` + `src/components/admin/`): add a "Buy Link (Checkout URL)" input to the product create/edit form, persisted to `products.buy_url`.
- **Product pages** (`ProductDetail.tsx`, `Shop.tsx` cards): replace "Add to Cart" with a **"Buy Now"** button that:
  - If `buy_url` is set → opens that URL in a **new tab** (`target="_blank" rel="noopener noreferrer"`).
  - If not set → button is disabled with tooltip "Coming soon".
- Regenerate Supabase types after migration.

## 5. Printify Secret

- Use the `add_secret` tool to register `PRINTIFY_API_KEY` (opens secure form for the user to paste the key later). Server-side only — no frontend exposure. No code will consume it yet; slot is ready for future edge function.

## 6. Visual Refresh (Polish, Not Rewrite)

Stay within the coastal-chic identity already in `mem://style/visual-identity`. Tighten execution:

- **Typography:** slightly larger display headings, tighter tracking on `font-display`, more generous line-height on body copy.
- **Spacing:** increase section vertical padding (`py-16 md:py-24`), widen container gutters on desktop.
- **Buttons:** unified pill radius, subtle shadow on hover, active-state squish (already have framer-motion).
- **Cards:** softer shadow, larger radius, hover lift only (no rotation).
- **Nav:** thinner glass bar, refined active-link pill.
- **Color:** keep soft blues + sand; deepen the primary sky one notch for stronger CTA contrast.
- All via `index.css` tokens + Tailwind config — no hardcoded colors in components.
- Verify mobile responsiveness on iPhone widths.

## Technical Details

**Files created:**
- `src/assets/logo-maximal.png`
- `public/favicon.png`
- `supabase/migrations/<timestamp>_add_buy_url.sql`

**Files deleted:**
- `src/pages/Designer.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentCanceled.tsx`
- `src/components/designer/*`, `src/components/CartDrawer.tsx`, `src/components/CheckoutDialog.tsx`
- `src/context/CartContext.tsx`
- `supabase/functions/create-payment/`, `supabase/functions/verify-payment/`
- `public/favicon.ico`

**Files edited:**
- `index.html`, `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`
- `src/pages/Index.tsx`, `src/pages/Shop.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/Admin.tsx`
- `src/components/admin/*` (product form)
- `src/index.css`, `tailwind.config.ts`

## Open Questions (defaults chosen — say the word to change)

1. **Logo shape:** keeping the existing **fully circular** crop (matches current header/footer rule). Say "rounded square" if you'd rather.
2. **Buy link target:** opens in **new tab**. Say "same tab" if you'd rather.
3. **Existing customizer orders in admin:** admin view stays read-only for those; no new custom-design orders possible. OK?

Reply "go" (or with tweaks) and I'll execute end-to-end.
