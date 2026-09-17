/* ---------------------------------------------------------------------------
 * Map artwork — the hand-drawn "toen en nu" illustrations.
 *
 * These are inline SVG rather than images because the two layers have to stay
 * addressable: the React layer fades the historic layer out as the slider moves
 * towards "Actueel".
 *
 * Painting conventions (docs/DESIGN.md §8) — Tailwind paint utilities only, so
 * no hex value ever appears in JSX. Every colour is a shade of the two Deltion
 * brand colours (§3): the historic layer is paper (orange at low strength over
 * white), the present-day layer is water (blue at low strength), and the route is
 * the pure accent.
 *
 *   paper              fill-sand-100      historic blocks   fill-sand-200
 *   historic streets   stroke-sand-300    historic label    fill-blue-700
 *   present-day water  fill-haze-100/200  present streets   stroke-haze-300
 *   route line         stroke-orange-500  stops             fill-orange-500
 *
 * Both pieces are decorative artwork, so they are marked `aria-hidden` or given
 * an accessible name by the caller.
 * ------------------------------------------------------------------------- */

import { memo } from "react";

/* A route point in 0–100 space, scaled onto the artwork's viewBox. */
const ARTWORK_SCALE = { x: 6, y: 4.2 };

/* Stops are drawn as a glow, a dot with a white halo, and (on the hero) a
   label on the first stop. */
function RouteStop({ cx, cy, glow, radius, haloWidth, label }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={glow} className="fill-orange-500" opacity="0.22" />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        className="fill-orange-500 stroke-white"
        strokeWidth={haloWidth}
      />
      {label && (
        <text
          x={cx + 16}
          y={cy + 5}
          className="fill-blue-700 font-sans"
          fontSize="13"
          fontWeight="600"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Hero illustration (viewBox 610 × 390): the street grid of the historic map on
 * top of the present-day water, with the route drawn over both.
 *
 * The historic layer's opacity is **not a prop**: it reads the inherited
 * `--historic-opacity` custom property, which the caller sets on a wrapping
 * element. Together with `memo` that means dragging the "Historisch ⇄ Actueel"
 * slider patches one style declaration instead of re-rendering the ~90 SVG nodes
 * — the difference between a smooth slider and a visibly stuttering one.
 *
 * @param stops  route points already in viewBox coordinates (a stable array)
 */
export const HeroMapArtwork = memo(function HeroMapArtwork({ stops }) {
  const routePoints = stops.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg
      viewBox="0 0 610 390"
      className="block h-auto w-full"
      role="img"
      aria-label="Kaart van Zwolle met een uitgestippelde route"
    >
      {/* Paper base, then the present-day layer across the lower part */}
      <rect width="610" height="390" className="fill-sand-100" />
      <rect y="230" width="610" height="160" className="fill-haze-100" />

      {/* Historic layer: fades out as the slider moves to "Actueel" — the opacity
          comes from the inherited --historic-opacity custom property. */}
      <g className="historic-layer">
        <g className="stroke-sand-300" strokeWidth="1.5">
          <path d="M0 78h610M0 156h610M0 234h610M0 312h610" />
          <path d="M122 0v390M244 0v390M366 0v390M488 0v390" />
        </g>
        <path d="M60 130h150v70H60z" className="fill-sand-200" />
        <path d="M330 52h190v96H330z" className="fill-sand-200" />
        <path d="M410 262h140v80H410z" className="fill-haze-200" />
        <circle cx="150" cy="300" r="46" className="fill-sand-200" />
      </g>

      {/* Street hints that belong to the present-day layer */}
      <g className="stroke-haze-300" strokeWidth="2">
        <path d="M0 300h610M300 230v160" />
      </g>

      <polyline
        points={routePoints}
        fill="none"
        className="stroke-orange-500"
        strokeWidth="3.5"
        strokeDasharray="9 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {stops.map(([x, y], index) => (
        <RouteStop
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          glow={9}
          radius={5.5}
          haloWidth={2.5}
          label={index === 0 ? "Start" : null}
        />
      ))}
    </svg>
  );
});

/**
 * Route card thumbnail (viewBox 600 × 420). The route points arrive in 0–100
 * space and are scaled onto the viewBox; `slice` keeps the artwork filling the
 * card's fixed-height frame.
 *
 * @param path  route points in 0–100 space (a stable array)
 */
export const RouteArtwork = memo(function RouteArtwork({ path }) {
  const routePoints = path
    .map(([x, y]) => `${x * ARTWORK_SCALE.x},${y * ARTWORK_SCALE.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 600 420"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect width="600" height="420" className="fill-sand-100" />
      <rect y="250" width="600" height="170" className="fill-haze-100" />

      <g className="stroke-sand-300" strokeWidth="2">
        <path d="M0 84h600M0 168h600M0 252h600M0 336h600" />
        <path d="M120 0v420M240 0v420M360 0v420M480 0v420" />
      </g>
      <circle cx="120" cy="330" r="58" className="fill-sand-200" />
      <path d="M340 40h180v92H340z" className="fill-sand-200" />

      <polyline
        points={routePoints}
        fill="none"
        className="stroke-orange-500"
        strokeWidth="4"
        strokeDasharray="11 11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {path.map(([x, y]) => (
        <RouteStop
          key={`${x}-${y}`}
          cx={x * ARTWORK_SCALE.x}
          cy={y * ARTWORK_SCALE.y}
          glow={11}
          radius={6}
          haloWidth={3}
        />
      ))}
    </svg>
  );
});
