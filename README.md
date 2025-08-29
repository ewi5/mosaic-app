# mosaic — building UI (opaque, stable)

- Left **sky** panel is **fixed** (never scrolls). Shows: `📍 city • temp° • time`.
- Right **building** panel scrolls and renders a **3×N** grid of people windows.
- Opaque design. No glass/blur. Minimal motion.
- `pol` sets `days since pol` to `0` (demo).
- Location and temperature cached (24h for position, 60m for temp).

## Files
- `index.html` – layout (fixed `aside.sky` + scrolling `main.building`).
- `style.css` – opaque theme; fixed left pane; **3 columns enforced**.
- `script.js` – rendering, initials color, caching, geolocation, weather.

## Deploy
Drag-drop to Netlify as a static site. No build step required.
