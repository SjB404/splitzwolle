/* the route the reader built out of places: the straight connector is there at once and the api's road-following line replaces it when it answers */
/* nothing is kept across a change — the api's answer carries the signature of what it was asked about, so a line for the previous choice can never be drawn */

import { useEffect, useMemo, useState } from "react";
import { requestDirections } from "./googleMaps.ts";
import { straightRoute } from "../../data/routeGeometry.ts";
import type {
  PointOfInterest,
  RouteGeometry,
  TravelMode,
} from "../../types.ts";

export interface PlannedRoute extends RouteGeometry {
  /* the places in visit order, which is what the route is */
  points: PointOfInterest[];
  mode: TravelMode;
  /* true while the api is still being asked */
  pending: boolean;
}

/** the route through these places, in this way of travelling */
export function usePlannedRoute(
  points: PointOfInterest[],
  mode: TravelMode,
): PlannedRoute {
  const signature = `${mode}:${points.map((point) => point.id).join(">")}`;
  const [answer, setAnswer] = useState<{
    signature: string;
    geometry: RouteGeometry | null;
  } | null>(null);

  const estimate = useMemo(
    () =>
      straightRoute(
        points.map((point) => point.coordinates),
        mode,
      ),
    [points, mode],
  );

  useEffect(() => {
    if (points.length < 2) return;

    let alive = true;

    requestDirections(
      points.map((point) => point.coordinates),
      mode,
    )
      .then((geometry) => {
        if (alive) setAnswer({ signature, geometry });
      })
      .catch(() => {
        if (alive) setAnswer({ signature, geometry: null });
      });

    return () => {
      alive = false;
    };
  }, [signature, points, mode]);

  const settled = answer?.signature === signature;

  return {
    ...((settled ? answer.geometry : null) ?? estimate),
    points,
    mode,
    pending: points.length > 1 && !settled,
  };
}
