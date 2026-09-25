/* the key that explains a map's symbols — it describes the artwork, so it uses the artwork's own fixed colours (the one place those are correct) */

import type { ReactNode } from "react";

/* the shapes an overlay can draw; a union, so an entry cannot name a symbol no overlay knows */
export type LegendShape = "route" | "start" | "end";

export interface MapLegendItem {
  shape: LegendShape;
  label: string;
}

const LEGEND_SWATCHES: Record<LegendShape, ReactNode> = {
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

interface MapLegendProps {
  /* what the map this legend belongs to actually draws */
  items: MapLegendItem[];
}

export default function MapLegend({ items }: MapLegendProps) {
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
