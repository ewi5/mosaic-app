# Mosaic — V17

Liquid-glass **building** on the right. **Sky** on the left.
- Sky shows **📍 city • temp° • wind • time** (real data via Open‑Meteo).
- Building is a 3×N grid of **windows** (people). Only the **building scrolls**.
- Apple-style **initial circles** (lowercase, deterministic colors).
- **Buttons**: `knock` (black pill), `pol` (glowing circle).
- **Home/Away**: home = bright avatar glow; away = shade overlay.

## Files
- `index.html` — layout (two columns: sky + building)
- `style.css` — dark theme, glass, stars, pills, 3×N grid
- `script.js` — fake contacts, weather & reverse geocode, location cache
- `netlify.toml` — publish config

## Local usage
Open `index.html` directly. Geolocation prompts once; cached 12h.

## Deploy (Netlify)
- **Publish directory**: `.`
- No build command (static site).

## Version
`v17` — 2025‑08‑29 — eli
