# What the maps key costs

One Google Cloud project, a few services switched on (the wiring is in `docs/DESIGN.md` §15). Each
service has its **own free monthly quota**, counted per SKU, and everything above it is billed per
1,000 events. The numbers below were read from Google's own price list on **2026-10-02**; when they
matter, check the source links at the bottom before trusting them.

## What this site actually uses

| Where it fires                                                | Service / SKU                             | One billable event | Free each month | Then, per 1,000 |
| ------------------------------------------------------------- | ----------------------------------------- | ------------------ | --------------- | --------------- |
| Every Google map on `/routes*` and `/points-of-interest`      | Maps JavaScript API — **Dynamic Maps**    | one map load       | **10,000**      | **$7.00**       |
| The line the builder draws between the picked places          | Routes API — **Compute Routes Essentials** | one request        | **10,000**      | **$5.00**       |
| Resolving a place while adding one (development only, §8)     | Places API (New) — **Text Search Enterprise** | one request    | **1,000**       | **$35.00**      |
| The pictures on the route cards, only with `VITE_GOOGLE_MAPS_STATIC_MAPS=true` | Maps Static API — **Static Maps** | one picture | **10,000** | **$2.00** |

- **The route request stays in the cheapest Routes SKU** because it asks for nothing advanced: no
  `TRAFFIC_AWARE`, a handful of places (the Essentials line is 10 intermediate waypoints), no
  waypoint optimisation. Asking for live traffic would move it to Pro — $10 per 1,000, with a
  5,000-event free cap — for a walking route that does not need it.
- **The place search is the expensive one.** Asking for `rating` and `userRatingCount` puts the
  whole request in the Enterprise SKU: 1,000 free, then **$35 per 1,000**. Ask for only
  id/name/address/location and it is Pro (5,000 free, $32); ask for **IDs only and it is
  unlimited and free**. So a bulk re-resolve should drop the rating fields, and the ratings this
  site shows stay the placeholder content they already are.
- **Places are resolved once** and stored in `src/data/pointsOfInterest.ts`: a page view costs no
  place lookup at all — the cheapest option available.
- **A route is asked for at most once per reader per session** (`directionsCache` in
  `src/data/googleMaps.ts`), so clicking around costs one request per distinct route.
- No traffic-aware routing, no Street View, no photos, no elevation, no Places lookups at runtime.

## The free caps: 10k / 5k / 1k, per SKU, every month

The size of a free cap depends on the SKU's **category** — **Essentials 10,000**, **Pro 5,000**,
**Enterprise 1,000** billable events per month. Caps do not pool across SKUs, they reset on the
1st of each month at midnight Pacific time, and usage is counted across **all projects on the
billing account**. Volume discounts above 100,000 events/month apply automatically.

In practice: 10,000 free map loads and 10,000 free route requests a month is a few hundred page
views a day, which is comfortably more than this site will ever see. Everything that must not run
away is in the console — set budget alerts and per-API quotas at
<https://console.cloud.google.com/google/maps-apis>.

## The corners to never touch

Nothing in the app asks for these — they are here so a future field, method or library that does is
recognised as expensive before it is written:

| SKU                                                                 | Free each month | Then, per 1,000 |
| ------------------------------------------------------------------- | --------------- | --------------- |
| Dynamic Street View                                                 | 5,000           | $14.00          |
| Aerial View                                                         | 5,000           | $16.00          |
| Places API Text Search Enterprise + Atmosphere (reviews, summaries) | 1,000           | $40.00          |
| Places API Nearby Search Enterprise                                 | 1,000           | $35.00          |
| Places API Place Details Photos                                     | 1,000           | $7.00           |
| RouteOptimization — FleetRouting                                    | 1,000           | $30.00          |
| Solar API data layers                                               | 1,000           | $75.00          |
| Places / Directions / Distance Matrix API (legacy services)         | —               | $5–40           |

## Subscription plans, if this ever scales

Google also sells fixed monthly plans instead of per-event billing: **Starter** $100/month for
50,000 calls (Dynamic Maps and Geocoding only), **Essentials** $275/month for 100,000 calls (20
SKUs, including Dynamic Maps, Static Maps and Compute Routes Essentials) and **Pro** $1,200/month
for 250,000 calls (36 SKUs, adding Text Search Pro, Dynamic Street View, Elevation …). Included
calls are pooled across the plan's SKUs, everything beyond that — or outside the plan — is billed
at pay-as-you-go prices, and **Enterprise SKUs are in no plan**. At this site's volumes the free
caps beat any plan; a plan only starts to pay off from tens of thousands of events a month.

## Sources (all read 2026-10-02)

- Price list per SKU — <https://developers.google.com/maps/billing-and-pricing/pricing> (updated 2026-09-28)
- What exactly triggers a SKU — <https://developers.google.com/maps/billing-and-pricing/sku-details> (updated 2026-09-30)
- Free caps, categories and how they reset — <https://developers.google.com/maps/billing-and-pricing/overview>
- Places (New) field mask → SKU mapping — <https://developers.google.com/maps/documentation/places/web-service/text-search>
- Plans — <https://developers.google.com/maps/billing-and-pricing/subscriptions>
