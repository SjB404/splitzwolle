/* a picture of a place or a route, drawn by the static maps api — a card wants a picture, not a second map instance */
/* the api is switched on with VITE_GOOGLE_MAPS_STATIC_MAPS, because it is a second service on the key and starts off: a card that asks for a picture the key cannot give logs a console error per card (measured: nine per page) */
/* with it off, or when the request fails, the caller's own drawing is used instead, so a preview is never a hole */

import { useState } from "react";
import type { ReactNode } from "react";
import { hasGoogleMapsKey, hasStaticMaps, staticMapUrl } from "../data/googleMaps.ts";
import type { LatLng } from "../types.ts";

interface MapSnapshotProps {
  /* the places the picture is of: one for a place, all of a route's stops in order */
  points: LatLng[];
  /* what the picture shows, for readers who cannot see it */
  alt: string;
  /* the caller's own drawing, for when the api does not answer */
  fallback: ReactNode;
  className?: string;
}

export default function MapSnapshot({
  points,
  alt,
  fallback,
  className = "",
}: MapSnapshotProps) {
  const [failed, setFailed] = useState(false);
  const src =
    hasGoogleMapsKey && hasStaticMaps && !failed ? staticMapUrl(points) : null;

  if (!src) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      width={640}
      height={400}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`block ${className}`}
    />
  );
}
