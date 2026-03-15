# DWATCH

A 3D mechanical watch viewer in the browser. Rotate the watch with the mouse, switch to real time or demo time, and toggle a skeleton view to see the movement—gears, balance wheel, and bridges—inspired by luxury pilot watches (e.g. IWC Mark XVIII / Big Pilot).

![DWATCH](https://img.shields.io/badge/Three.js-3D%20watch-000?style=flat&logo=javascript)

## Features

- **3D watch face** — Round case, polished bezel, fluted crown, and metal bracelet (multi-row links).
- **Pilot-style dial** — Black dial with triangle index at 12, flanking dots, Arabic numerals (1, 2, 4–11), date at 3 o’clock, and “DWATCH” / AUTOMATIC / SWISS MADE text.
- **Real or demo time** — Toggle between live time and a running demo for hands and movement.
- **Skeleton view** — “Show Movement” reveals the caliber: main plate (perlage), curved bridges (Geneva-style finish), gear train, balance wheel with hairspring, ruby jewels, and blue screws. Gears and balance animate in sync with the selected time.

## Tech

- **Three.js** (r160) for 3D scene, camera, and lighting.
- **OrbitControls** for drag-to-rotate.
- Vanilla HTML/CSS/JS; no build step. Fonts: [Cinzel](https://fonts.google.com/specimen/Cinzel) (Google Fonts).

## Run locally

Serve the project root over HTTP (e.g. port 8080):

```bash
cd dwatch
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. The watch runs at real time by default; use the checkboxes to show the movement or switch to demo time.

## Project layout

| File | Role |
|------|------|
| `index.html` | Page structure, canvas, controls, movement legend. |
| `watch3d.js` | Three.js scene: case, bracelet, dial texture, hands, crystal, and movement (plate, curved bridges, gears, balance, hairspring, jewels, screws). |
| `styles.css` | Layout and styling for the page and controls. |
| `MOVEMENT_REVIEW.md` | Notes on movement parts and luxury-level details (in Korean). |
| `watch.js` | Legacy 2D canvas watch (optional). |

## Movement (skeleton view)

When “Show Movement” is on, the dial becomes semi-transparent and the following are visible:

- **Main plate** — Circular base with perlage-style texture.
- **Bridges** — Curved, extruded shapes (barrel, train, balance cock) with a Geneva-stripe style finish.
- **Gear train** — Center wheel (minute), third and fourth wheels, escape wheel; all rotate at appropriate rates.
- **Balance wheel** — Ring with spokes, oscillating back and forth; hairspring is a 3D spiral.
- **Jewels** — Red ruby-style bearings at pivot points.
- **Screws** — Blue-tinted screws on the bridges.

Hands (hour, minute, second) stay on top and keep indicating the chosen time (real or demo).

## License

Use and adapt as you like; no formal license file in repo.
