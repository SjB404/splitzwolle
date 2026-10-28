// route reviews from the api (backend/routes/pages/reviews.ts)

import { apiRequest, isOk } from "./api.ts";
import { ROUTE_REVIEWS } from "./routes.ts";
import type { RouteReview } from "../types.ts";

// what a row in the reviews table looks like, there's no author column
interface ReviewRow {
  id?: number | string;
  rating: number;
  comment: string;
  created_at?: string;
  createdAt?: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// database row to the shape the review cards use
function toReview(row: ReviewRow, index: number): RouteReview {
  const created = row.created_at ?? row.createdAt;

  return {
    id: String(row.id ?? index),
    author: "Wandelaar",
    initials: "W",
    date: created ? DATE_FORMAT.format(new Date(created)) : "",
    rating: Number(row.rating),
    text: row.comment,
  };
}

// the sample reviews are shown when the api isn't running, so the page still has something to show
export async function fetchReviews(
  routeId: string,
): Promise<{ reviews: RouteReview[]; live: boolean }> {
  const result = await apiRequest<ReviewRow[]>(
    `/reviews/view?routeID=${encodeURIComponent(routeId)}`,
  );

  if (!isOk(result) || !Array.isArray(result.data)) {
    return { reviews: ROUTE_REVIEWS, live: false };
  }

  return { reviews: result.data.map(toReview), live: true };
}

export type PostReviewResult = "ok" | "login" | "error";

// "login" means the api said 401, you have to be logged in to post
export async function postReview(
  routeId: string,
  rating: number,
  comment: string,
): Promise<PostReviewResult> {
  const result = await apiRequest("/reviews", {
    method: "POST",
    body: { routeID: routeId, rating, comment },
  });

  if (isOk(result)) return "ok";
  return result.status === 401 ? "login" : "error";
}
