/*
dutch (nl-NL) value formatting.

content is stored as numbers — kilometres, minutes, a 0-5 rating — so the app can
filter, sort and add it up. the labels the ui shows are made here, in one place, so
the comma decimal and the "1 u 15" notation are the same on every page.

every function takes a number and returns a string. nothing here reads state, and
nothing here decides how a value is stored.
*/

/*
the dutch decimal, written once.

a comma is the separator, and every number the ui prints with a fraction goes through
here: the distance, the rating and the pace the planner calculates with. that is what
stops one of them being printed with a dot.
*/
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
