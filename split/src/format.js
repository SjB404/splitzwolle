/*
dutch (nl-NL) value formatting.

content is stored as numbers — kilometres, minutes, a 0-5 rating — so the app can
filter, sort and add it up. the labels the ui shows are made here, in one place, so
the comma decimal and the "1 u 15" notation are the same on every page.

ratings use a comma, and durations use u/min.
*/

/** 5.2 → "5,2 km" */
export function formatDistance(kilometres) {
  return `${kilometres.toFixed(1).replace(".", ",")} km`;
}

/** 75 → "1 u 15", 45 → "45 min", 120 → "2 u" */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} u`;
  return `${hours} u ${String(rest).padStart(2, "0")}`;
}

/** 4.9 → "4,9" */
export function formatRating(rating) {
  return rating.toFixed(1).replace(".", ",");
}

/** 1204 → "1.204" (a thousands separator, as Dutch expects) */
export function formatCount(count) {
  return count.toLocaleString("nl-NL");
}
