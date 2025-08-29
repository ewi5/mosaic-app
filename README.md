# Mosaic — building UI (v16)

**What this build locks:**  
- Left sky column is **10% thinner** (24vw), fixed, and never scrolls.  
- Right side has a **fixed opaque building frame** (pane fill + grid lines).  
- The people area is a **strict 3‑column grid** at all sizes; no horizontal play.  
- Cards are opaque (no liquid glass), with Apple‑style initials + POL circle.  
- Sky bar shows **city • temp° • time** (no wind). Location uses one-time cached permission.

## Files
- `index.html` — markup for fixed sky + scrollable building, plus fixed frame overlay.  
- `style.css` — tokens, fixed left width, `building-frame` outlines, 3‑column grid, cards.  
- `script.js` — demo contacts; rendering; cached geolocation; city/temp/time.  
- `README.md` — this file.

## Notes
- The fixed frame uses CSS gradients to draw vertical thirds and soft horizontal rows.  
- `--left-w` is set to `24vw`. Tweak once and both the frame and content stay aligned.  
- `overflow-x: hidden` is applied globally and the grid uses `overflow-x: clip` to eliminate any sideways scrolling.  
- Replace the temperature/demo reverse geocode with your API of choice when ready.
