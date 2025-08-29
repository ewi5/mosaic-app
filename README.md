# Mosaic — Building UI (v12)

Stable demo: fixed left sky, opaque building on right with a strict 3-column grid.

## What’s in here
- **Static left sky (never scrolls):** shows `city • temp° • time`. No coords, no wind. Location persists in `localStorage` to avoid repeated prompts.
- **Opaque building outline (fixed):** subtle column guides, does not move. Only the **grid** scrolls vertically.
- **3-column grid always:** fixed `--card-w` so there are *always* three columns on any screen wide enough for the layout.
- **Apple‑style avatar circles:** deterministic colors from name hash; initials are lowercase first+last (or doubled first letter for single names).
- **POL** is the round button, **knock** is the black pill.
- **Joystick**: opaque, simple; positioned up 5% vs earlier.

## Files
- `index.html` — layout
- `style.css` — theme + fixed layout rules
- `script.js` — data + city/temp/time + grid builder
- `assets/` — (empty placeholder for future art)

## Deploy
Drop the folder contents to Netlify (or any static host). No build step.

## Version
mosaic-building-ui-v12-20250829-eli
