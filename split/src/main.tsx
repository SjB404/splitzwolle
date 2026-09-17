import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// BeerCSS behaviours (Material 3 sliders, fields, waves). The stylesheet itself is
// imported — and layered — from index.css.
import 'beercss/dist/cdn/beer.min.js'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
