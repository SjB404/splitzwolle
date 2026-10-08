export function formatDecimal(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits).replace(".", ",");
}

export function formatDistance(kilometres: number): string {
  return `${formatDecimal(kilometres)} km`;
}

/** 75 → "1 u 15", 45 → "45 min", 120 → "2 u" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} u`;
  return `${hours} u ${String(rest).padStart(2, "0")}`;
}

export function formatRating(rating: number): string {
  return formatDecimal(rating);
}
