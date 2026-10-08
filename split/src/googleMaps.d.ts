/* handwritten slice of the google maps api; it loads from a cdn, no types package needed */

declare namespace google.maps {
  /* google's name for a coordinate; structurally the app's LatLng, so routes pass straight in */
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  /* const object, not an enum: erasableSyntaxOnly forbids enums; numbers are the api's own */
  const ControlPosition: {
    TOP_LEFT: 1;
    TOP_CENTER: 2;
    TOP_RIGHT: 3;
    LEFT_CENTER: 4;
    LEFT_TOP: 5;
    LEFT_BOTTOM: 6;
    RIGHT_TOP: 7;
    RIGHT_CENTER: 8;
    RIGHT_BOTTOM: 9;
    BOTTOM_LEFT: 10;
    BOTTOM_CENTER: 11;
    BOTTOM_RIGHT: 12;
  };

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
    toJSON(): LatLngLiteral;
  }

  interface MapsEventListener {
    remove(): void;
  }

  class LatLngBounds {
    constructor(southWest?: LatLngLiteral, northEast?: LatLngLiteral);
    extend(point: LatLngLiteral): void;
    isEmpty(): boolean;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    /* advanced markers need some map id; DEMO_MAP_ID is the api's own dev id */
    mapId?: string;
    restriction?: { latLngBounds: LatLngBounds; strictBounds?: boolean };
    /* tiles can't read css; theme is pushed in from the <body> class */
    colorScheme?: "LIGHT" | "DARK";
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: {
      position: (typeof ControlPosition)[keyof typeof ControlPosition];
    };
    clickableIcons?: boolean;
    /* cooperative: zooms on ctrl/cmd+scroll or pinch, never on a plain wheel */
    gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
    minZoom?: number;
    maxZoom?: number;
  }

  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    addListener(event: string, handler: () => void): MapsEventListener;
    fitBounds(bounds: LatLngBounds, padding?: number): void;
    getZoom(): number | undefined;
    setOptions(options: MapOptions): void;
  }

  interface PolylineOptions {
    path?: LatLngLiteral[];
    map?: Map | null;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    clickable?: boolean;
    zIndex?: number;
  }

  class Polyline {
    constructor(options?: PolylineOptions);
    addListener(event: string, handler: () => void): MapsEventListener;
    setOptions(options: PolylineOptions): void;
    setMap(map: Map | null): void;
  }

  namespace marker {
    interface AdvancedMarkerElementOptions {
      map?: Map | null;
      position?: LatLngLiteral;
      content?: Node;
      title?: string;
      gmpClickable?: boolean;
      zIndex?: number;
    }

    class AdvancedMarkerElement {
      constructor(options?: AdvancedMarkerElementOptions);
      /* marker's own event is "gmp-click"; addListener is the deprecated spelling */
      addEventListener(event: "gmp-click", handler: () => void): void;
      content: Node | null;
      setMap(map: Map | null): void;
    }
  }

  /* a separate service that can be refused on its own (billing, enablement), hence null not throw */
  interface RouteWaypoint {
    location: LatLngLiteral;
  }

  interface ComputeRoutesRequest {
    origin: LatLngLiteral;
    destination: LatLngLiteral;
    intermediates?: RouteWaypoint[];
    travelMode: "DRIVE" | "BICYCLING" | "WALKING" | "TWO_WHEELER";
    fields?: string[];
  }

  interface ComputedRoute {
    path?: LatLng[];
    distanceMeters?: number;
    durationMillis?: number;
  }

  namespace routes {
    class Route {
      static computeRoutes(
        request: ComputeRoutesRequest,
      ): Promise<{ routes?: ComputedRoute[] }>;
    }
  }

  /* with loading=async the api puts importLibrary on the namespace */
  function importLibrary(library: "maps"): Promise<{ Map: typeof Map }>;
  function importLibrary(library: "marker"): Promise<{
    AdvancedMarkerElement: typeof marker.AdvancedMarkerElement;
  }>;
  function importLibrary(
    library: "routes",
  ): Promise<{ Route: typeof routes.Route }>;
}

interface Window {
  /* called when the api rejects the key; the script still loaded, so onerror never fires */
  gm_authFailure?: () => void;
}
