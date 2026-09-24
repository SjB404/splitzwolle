/*
the two things typescript has to be told about beerCSS.

beerCSS is a stylesheet plus a small runtime and it ships no types of its own, so the
import of its cdn bundle is declared here. the runtime hangs its public api on
globalThis, and the only piece this app uses is the slider's repaint: the hero
re-mounts its range instead of writing to it, and afterwards asks beerCSS to redraw
the filled track itself.

writing the surface down this small is deliberate. a beerCSS upgrade can only break
what is named here.
*/

declare module "beercss/dist/cdn/beer.min.js";

declare var __BeerCssGlobals__:
  | {
      slider?: {
        updateAllSliders?: () => void;
      };
    }
  | undefined;
