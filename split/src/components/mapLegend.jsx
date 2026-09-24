/*
maplegend — the key that explains the symbols drawn on a map.

the legend describes the artwork, so it uses the artwork's own colours instead of
theme colours. this is the one place fixed palette values are correct.

items is data, not markup, so the three swatch shapes stay one decision: a route
line, a start pin (white centre, orange ring) and an end pin (hollow orange).
those match what RouteOverlay and PlanningOverlay draw.
*/

const LEGEND_SWATCHES = {
  route: (
    <span className="h-1 w-6 rounded-full bg-orange-500" aria-hidden="true" />
  ),
  start: (
    <span
      className="h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500"
      aria-hidden="true"
    />
  ),
  end: (
    <span
      className="h-2.5 w-2.5 rounded-full border-2 border-orange-500"
      aria-hidden="true"
    />
  ),
};

export default function MapLegend({ items }) {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
      {items.map((item) => (
        <li key={item.shape} className="inline-flex items-center gap-2">
          {LEGEND_SWATCHES[item.shape]}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
