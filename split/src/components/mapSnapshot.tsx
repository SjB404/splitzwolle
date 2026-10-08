/* static maps api is opt-in (VITE_GOOGLE_MAPS_STATIC_MAPS): otherwise every card logs an error */

import { useState } from "react";
import type { ReactNode } from "react";
import { hasGoogleMapsKey, hasStaticMaps, staticMapUrl } from "../data/googleMaps.ts";
import type { LatLng } from "../types.ts";

interface MapSnapshotProps {
  points: LatLng[];
  alt: string;
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
