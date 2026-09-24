/*
mapchip — the small label that sits on a map and names what is drawn on it.

two maps need exactly this: the framed MapPanel, and the hero's stacked layers. the
dot wears the artwork's own route colour, which is the one place a fixed palette value
is correct (DESIGN.md §8) — it has to match the line the overlay draws, not the page's
ink.

it is a plain span, so the caller decides where it goes: absolutely positioned inside a
map frame, or inside the hero's pointer-events-none wrapper.
*/

interface MapChipProps {
  label: string;
  /**
   * placement, not appearance. the chip's own look is settled here, because two maps
   * that labelled the same kind of thing differently would read as two components.
   */
  className?: string;
}

export default function MapChip({ label, className = "" }: MapChipProps) {
  return (
    <span
      className={`chip surface-container-lowest border border-line text-xs font-semibold ${className}`}
    >
      <span
        className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
