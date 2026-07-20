# Rulespace — Agent Instructions

Interactive Conway's Game of Life sandbox with custom rulesets, URL-based
sharing, and live analytics. This is a portfolio project: the priority is
clean, well-tested, clearly-architected code — not just a working demo.

## Stack

- React + TypeScript + Vite
- Canvas 2D for rendering (not DOM nodes per cell — matters for performance
  at scale)
- No backend — fully static, deployable to Vercel/Netlify
- Vitest for unit tests

## Architecture

Keep these layers strictly separated. Do not let simulation logic leak
into React components, and do not let rendering concerns leak into the
engine.

1. **Engine** (pure TS, zero React/DOM dependency)
   - `Uint8Array`-backed grid
   - `step()` function implementing Life rules
   - Rule parser supporting arbitrary B/S notation (e.g. `B3/S23`)
   - Toroidal (wrap-around) edges
2. **Renderer** (React component wrapping `<canvas>`)
   - Draws engine state via `requestAnimationFrame`
   - No simulation logic lives here
3. **UI** (React components)
   - Controls: play/pause/step/random/clear/speed
   - Rule input + presets (Conway `B3/S23`, HighLife `B36/S23`,
     Day & Night `B3678/S34678`, Seeds `B2/S`)
   - Pattern picker (glider, pulsar, glider gun, etc.)
   - Stats panel: live population count + population-over-time chart
   - Share button
4. **Codec**
   - RLE-encode grid + rule → base64 → URL query param
   - Decode/load from URL on page open

## Data Model

```typescript
type Grid = Uint8Array; // flattened, width*height
type Rule = { born: number[]; survive: number[] };
type AppState = {
  grid: Grid;
  width: number;
  height: number;
  rule: Rule;
  generation: number;
  isRunning: boolean;
  speed: number;
  history: string[]; // rolling hash of recent states, for cycle detection
};
```

## Build Order

Work in this sequence — do not jump ahead to UI before the engine is
tested and correct.

1. Scaffold the Vite + React + TS project.
2. Build the engine: grid, `step()`, rule parser.
3. Write unit tests **first** for the engine:
   - a glider translates diagonally after 4 generations
   - a block (2x2) is stable indefinitely
   - a blinker oscillates with period 2
   Do not move to UI until these pass.
4. Build the canvas renderer + basic controls (play/pause/step/random/
   clear/speed).
5. Add custom rule input + presets.
6. Add pattern library with click-to-place.
7. Add RLE codec + URL share/load.
8. Add stats panel + cycle detection (hash last ~50 states, detect
   repeats, report period length).
9. Polish, responsive layout, deploy config, README.

At each step, show the implementation and test results before moving to
the next step.

## Branding

- Name: Rulespace
- Tagline: "Custom rules. Emergent life."
- Colors: primary blue `#3A7EAB`, accent coral `#CF4832`, neutral gray
  `#D1D3D4`
- Logo SVGs live in `/public` and `/src/assets` (icon + horizontal
  lockup, light and dark variants). Use the icon as favicon.

## Deployment — GitHub Pages

This project deploys as a static site to GitHub Pages. No backend, no
secrets, no server-side routing — the URL-sharing feature works via a
query param (`?state=...`), not a path-based route, so there is no SPA
deep-link/404 problem to solve.

Required setup:

1. **Vite base path** — GitHub Pages serves project sites from
   `username.github.io/repo-name/`, not the root. Set this in
   `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/rulespace/', // match the actual repo name exactly
     // ...
   })
   ```
   Skipping this is the most common cause of a blank page after deploy —
   assets get requested from the wrong path.

2. **Deploy workflow** — set up a GitHub Actions workflow
   (`.github/workflows/deploy.yml`) that builds and deploys to the
   `gh-pages` branch (or Pages' native Actions deployment) on every push
   to `main`. Prefer this over a manual `gh-pages` npm script so deploys
   stay automatic and reproducible.

3. **Favicon and asset paths** — make sure `index.html` and any
   asset references (favicon, logo SVGs) use relative paths or respect
   the configured base, so they resolve correctly under the `/rulespace/`
   subpath rather than assuming root.

Verify the deployed build in an actual browser at the real GitHub Pages
URL (not just `vite preview` locally) before considering deployment done
— base-path issues often only show up once served from the real subpath.

## Out of Scope

Accounts, backend/database, mobile app, unbounded (non-wrapping) grid.
Do not add these without explicit request, even if they seem like a
natural extension.
