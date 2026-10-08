import type { ReactNode } from "react";

export type LegendShape = "route" | "historic" | "current";

export interface MapLegendItem {
  shape: LegendShape;
  label: string;
}

const LEGEND_SWATCHES: Record<LegendShape, ReactNode> = {
  route: (
    <span className="h-1 w-6 rounded-full bg-orange-500" aria-hidden="true" />
  ),
  historic: (
    <span
      className="h-6 w-6 rounded-full border-2 border-white bg-blue-500"
      aria-hidden="true"
    />
  ),
  current: (
    <span
      className="h-6 w-6 rounded-full border-2 border-white bg-orange-500"
      aria-hidden="true"
    />
  ),
};

interface MapLegendProps {
  items: MapLegendItem[];
}

export default function MapLegend({ items }: MapLegendProps) {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
      {items.map((item) => (
        <li key={item.shape} className="inline-flex items-center gap-2">
          {LEGEND_SWATCHES[item.shape]}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
