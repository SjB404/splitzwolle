/* the small label that names what a map shows; the dot keeps the artwork's fixed orange because it must match the route line (DESIGN.md §8) */

interface MapChipProps {
  label: string;
  /** placement, not appearance — the chip's own look is settled here */
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
