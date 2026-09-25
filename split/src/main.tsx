import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* beerCSS runtime only (sliders, fields, waves); its stylesheet is layered in index.css */
import "beercss/dist/cdn/beer.min.js";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
