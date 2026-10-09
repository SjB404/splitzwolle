/* test.globals is on; nothing here imports the runner */
import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

/* jest-dom's own /vitest entry types the one-parameter Assertion<T> of vitest 4 and older;
   vitest 5 splits it into Assertion<R, T>, whose parameter list an augmentation must repeat exactly */
declare module "vitest" {
  interface Assertion<R, T> extends TestingLibraryMatchers<any, R> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

/* jsdom has no matchMedia; motion and theme code read it */
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/* body class and localStorage outlive cleanup(); reset them */
beforeEach(() => {
  document.body.className = "light";
  document.title = "";
  localStorage.clear();
});

/* jsdom implements neither scrollTo nor scrollIntoView; the shell calls both */
Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
Element.prototype.scrollIntoView = vi.fn() as unknown as () => void;

/* jsdom only implements part of <dialog>; fill in what is missing */
const dialogPrototype = globalThis.HTMLDialogElement?.prototype;

if (dialogPrototype) {
  dialogPrototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  dialogPrototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

afterEach(() => {
  cleanup();
});
