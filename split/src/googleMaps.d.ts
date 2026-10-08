/* the slice of the google maps javascript api this app uses, handwritten like beercss.d.ts: the api arrives as a cdn script, and a types package for it would be a dependency the stack does not take (docs/DESIGN.md §15) */

declare namespace google.maps {
  /* google's own name for a coordinate, structurally the app's LatLng (src/types.ts), which is what lets a route be passed straight in */
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  /* the corners a control can be pinned to. the api's own enum cannot be declared here — tsconfig's `erasableSyntaxOnly` refuses enums — so it is the api's const object, named member for named member; the numbers are the api's own */
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
    /* what the api hands back, as a plain object the app can keep */
    toJSON(): LatLngLiteral;
  }

  interface MapsEventListener {
    remove(): void;
  }

  /* built from the routes themselves, so an empty filter set simply draws nothing; two corners are the map restriction's shape */
  class LatLngBounds {
    constructor(southWest?: LatLngLiteral, northEast?: LatLngLiteral);
    extend(point: LatLngLiteral): void;
    isEmpty(): boolean;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    /* DEMO_MAP_ID is the api's own development id, and it is what advanced markers need before a cloud-configured map exists */
    mapId?: string;
    /* the site covers the binnenstad and the noorder eiland: strictBounds is what makes the map refuse to leave it */
    restriction?: { latLngBounds: LatLngBounds; strictBounds?: boolean };
    /* the tiles cannot read our css, so the theme is pushed in from the <body> class instead */
    colorScheme?: "LIGHT" | "DARK";
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    /* the api's own control corners; the site moves the zoom control out of the bottom-right, which is the share button's (§7, §8) */
    zoomControlOptions?: {
      position: (typeof ControlPosition)[keyof typeof ControlPosition];
    };
    clickableIcons?: boolean;
    /* cooperative keeps the page scrollable: the map zooms on ctrl/cmd + scroll or a pinch, never on a plain wheel */
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
      /* any node, which is how the start dot wears the app's own classes instead of google's default red pin */
      content?: Node;
      title?: string;
      gmpClickable?: boolean;
      zIndex?: number;
    }

    class AdvancedMarkerElement {
      constructor(options?: AdvancedMarkerElementOptions);
      /* the marker is a dom element, so its own event is "gmp-click" and addListener is the deprecated spelling of it */
      addEventListener(event: "gmp-click", handler: () => void): void;
      /* swapping the content is how a dot grows a number when it joins the route */
      content: Node | null;
      setMap(map: Map | null): void;
    }
  }

  /* the routes api is a second service on the same key and can be refused on its own (not enabled, no billing, a legacy key), which is why the answer is null rather than an exception */
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
    /* the road-following line, asked for by name in `fields` */
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

  /* the library loader, which is what loading=async puts on the namespace */
  function importLibrary(library: "maps"): Promise<{ Map: typeof Map }>;
  function importLibrary(library: "marker"): Promise<{
    AdvancedMarkerElement: typeof marker.AdvancedMarkerElement;
  }>;
  function importLibrary(
    library: "routes",
  ): Promise<{ Route: typeof routes.Route }>;
}

interface Window {
  /* the api calls this global when it rejects the key — the script itself loaded, so script.onerror never fires */
  gm_authFailure?: () => void;
}
