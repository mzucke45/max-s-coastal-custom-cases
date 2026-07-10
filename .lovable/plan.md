## Current state

There is **no Printify integration in the code today**. The only thing present is a `PRINTIFY_API_KEY` secret in Lovable Cloud. Nothing is calling Printify, nothing is syncing, and no orders reach your Printify dashboard. This plan adds the integration end-to-end using your chosen scope: manual product pull + admin-triggered order push.

## What we'll build

### 1. New edge function: `printify-api`
A single admin-authenticated function (mirrors the pattern used by `admin-api`, reusing the same HMAC admin-token auth) that talks to Printify's REST API using `PRINTIFY_API_KEY`. Actions:

- `list-shops` — GET `/v1/shops.json`, so you can pick which Printify shop to sync from.
- `import-products` — GET `/v1/shops/{shop_id}/products.json` (paginated), then upsert each into `public.products`. Maps: title → name, description → description, first enabled variant price → price, first mockup → image_url, Printify `id` → new `printify_product_id` column, first enabled variant `id` → new `printify_variant_id` column.
- `send-order` — POST `/v1/shops/{shop_id}/orders.json` for a given order id from `public.orders`. Builds line items from the stored `items` JSON, uses the order's `shipping_address`, and on success stores the returned Printify order id + status back on the row.

All errors from Printify are surfaced with status + body so failures are debuggable (missing scope, invalid variant, etc.).

### 2. Database migration
Add columns (nullable, non-breaking):
- `products.printify_product_id text`, `products.printify_variant_id text` — so re-imports upsert instead of duplicating.
- `orders.printify_order_id text`, `orders.printify_status text`, `orders.printify_last_error text` — so admin can see push status.
- `site_settings` row `printify_shop_id` — stores the selected shop so imports and order pushes know where to go.

### 3. Admin UI additions
- **Products tab:** "Import from Printify" button. First run prompts you to pick a shop (dropdown from `list-shops`); selection saved to `site_settings`. Shows count imported/updated on completion.
- **Orders tab:** each order row gets a "Send to Printify" button. Disabled when already sent (shows Printify order id + status instead). Failed pushes show the error inline with a retry button.

### 4. `adminApi.ts` client helpers
Add `printifyListShops`, `printifyImportProducts`, `printifySendOrder` wrappers, same auth header pattern as existing admin calls.

## Out of scope (per your answers)

- No scheduled/automatic sync — import is manual only.
- No automatic order forwarding — you click "Send to Printify" per order.
- No rebuild of internal checkout — external `buy_url` remains the storefront path. (Heads-up: if a product's `buy_url` points to a non-Lovable storefront, orders placed there won't appear in your `orders` table, so there's nothing to push to Printify for those. Only orders that live in `public.orders` can be sent.)

## Open item

You mentioned the Printify key is already in secrets — confirmed, `PRINTIFY_API_KEY` is present. If it's scoped only to a subset of permissions, the first `list-shops` call will surface the exact Printify error so we can reconnect with a broader token.

## Technical notes

- Printify base URL: `https://api.printify.com/v1`, auth header `Authorization: Bearer ${PRINTIFY_API_KEY}`.
- Pagination handled server-side via `?page=N&limit=100` loop until `last_page`.
- Product upsert keyed on `printify_product_id` to avoid duplicates on re-import.
- Order payload uses `external_id: <lovable order id>` so Printify de-duplicates if you click twice.
- `send-order` uses `send_shipping_notification: false` and does NOT auto-submit to production — it creates the order in Printify as a draft you can review, unless you'd rather have it auto-submit. Say the word and I'll flip that.
