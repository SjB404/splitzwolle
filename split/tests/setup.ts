/* globals (describe/it/expect/vi/beforeEach) come from `test.globals`, so nothing here imports the runner */
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

/* jsdom has no matchMedia, and motion (plus anything theme aware) reads it */
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

/* the theme toggle writes to <body> and localStorage, both of which outlive a cleanup(); reset them */
beforeEach(() => {
  document.body.className = "light";
  document.title = "";
  localStorage.clear();
});

/* jsdom implements neither, and the shell calls both: a route change scrolls to the top, and a hash scrolls to a band */
Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
Element.prototype.scrollIntoView = vi.fn() as unknown as () => void;

/* jsdom implements only part of <dialog>; the modal api is filled in where it is missing */
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
