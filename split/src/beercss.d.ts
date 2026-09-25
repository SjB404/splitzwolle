/* beerCSS ships no types; only the slider repaint the hero needs is declared, so an upgrade can only break this much */

declare module "beercss/dist/cdn/beer.min.js";

declare var __BeerCssGlobals__:
  | {
      slider?: {
        updateAllSliders?: () => void;
      };
    }
  | undefined;
