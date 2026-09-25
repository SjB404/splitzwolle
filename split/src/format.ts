/* Dutch (nl-NL) labels, made in one place — content is stored as numbers so it can be filtered and summed, and every function here is number in, string out */

/* the Dutch decimal, written once so no value reaches the ui with a dot */
export function formatDecimal(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits).replace(".", ",");
}

/** 5.2 → "5,2 km" */
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

/** 4.9 → "4,9" */
export function formatRating(rating: number): string {
  return formatDecimal(rating);
}

/** 1204 → "1.204" (a thousands separator, as Dutch expects) */
export function formatCount(count: number): string {
  return count.toLocaleString("nl-NL");
}
