# Conway's Game of Life — Interactive Sandbox

## Product & Technical Spec

---

## 1. One-Sentence Concept

An interactive, shareable Game of Life sandbox with custom rulesets and live analytics — built as a portfolio piece demonstrating clean separation between simulation logic, rendering, and state.

## 2. Goal & Outcome Type

**Primary outcome:** Portfolio project.

**Success criteria:**

- Deployed, working demo (not just a repo)
- Codebase with a clear engine/renderer/UI split, unit tests on the core logic
- A blog post that uses this project to demonstrate technical judgment, not just "I made a thing"

**Non-goals:** user accounts, multiplayer, mobile app, monetization. This is a demonstration artifact, not a product with a growth plan.

## 3. Target Audience

Two audiences, both matter:

- **Visitors to the demo** — casual, want to click around, place patterns, and see it run without instructions.
- **Readers of the code / blog post** — recruiters, engineers, hiring managers. They care about architecture decisions and *why*, not just working output.

## 4. Opportunity & Competitive Framing

Game of Life demos are extremely common — this alone won't stand out. Differentiation comes from:

1. **Depth of the engineering story** (performance, encoding, algorithms), not the simulation itself
2. **Custom rulesets** — most demos hardcode B3/S23; supporting arbitrary rules is a genuine feature, not a gimmick
3. **RLE-based sharing** — reuses the actual file format the Life community has used for decades, which is a nice real-world-standards touchpoint for the blog

**Risk to flag:** if the blog post reads as a tutorial recap ("here's how I built Conway's Game of Life"), it will blend into hundreds of similar posts. The differentiator has to be foregrounded in the writing, not buried at the end.

## 5. Feature List

### MVP (Week 1)

| Feature | Notes |
|---|---|
| Grid engine (pure logic) | `Uint8Array`-backed grid, step function, no UI dependency |
| Canvas rendering | `<canvas>` + `requestAnimationFrame`, not DOM nodes per cell |
| Play / Pause / Step / Random / Clear | Core controls |
| Speed control | Adjustable simulation tick rate |
| Unit tests | Glider translation, block stability, blinker oscillation |

### Deep Scope (Weeks 2–3)

| Feature | Notes |
|---|---|
| Custom rulestrings | B/S notation input, validated parser, presets (HighLife, Day & Night, Seeds) |
| Pattern library | Click-to-place: glider, pulsar, glider gun, etc. |
| URL save/share | RLE-encode grid + rule → base64 → URL param; loads on page open |
| Stats panel | Live population count, population-over-time chart |
| Cycle detection | Hash recent N grid states to detect still lifes / oscillators / periodic cycles |

### Explicitly Out of Scope

- Backend/database (URL-based sharing only)
- Accounts, saved galleries server-side
- Mobile-native app
- Infinite/unbounded grid (fixed or toroidal-wrap grid only, for v1)

## 6. Technical Architecture

**Stack:** React + TypeScript + Vite, Canvas 2D rendering. Static site, no backend — deployable to GitHub Pages.

**Layers (this separation is the core portfolio signal):**

```
┌─────────────────────────────────────┐
│  UI Layer (React components)         │
│  controls, rule input, pattern picker│
│  share button, stats display         │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│  Renderer (Canvas component)          │
│  draws engine state via rAF loop      │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│  Engine (pure TS, no React/DOM)       │
│  Uint8Array grid, step(), rule parser │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│  Codec                                │
│  RLE encode/decode, base64 → URL param│
└─────────────────────────────────────────┘
```

**Key technical decisions:**

- **Canvas over DOM:** rendering thousands of cells as DOM nodes causes real performance issues past small grid sizes; canvas draw calls scale far better. Worth benchmarking both for the blog post.
- **Engine has zero UI dependencies:** enables unit testing the simulation logic in isolation, and could be reused (e.g., CLI version, different renderer) without touching business logic.
- **Toroidal grid (wraps at edges)** for v1 — simpler than unbounded grid, avoids edge-of-grid special-casing, and is the classic Life convention.
- **Cycle detection approach:** maintain a rolling hash of the last N (e.g. 50) grid states; if a hash repeats, report period length and cycle type (static if period 1, oscillator otherwise).

## 7. Data Model

```typescript
type Cell = 0 | 1;
type Grid = Uint8Array; // flattened, width*height
type Rule = { born: number[]; survive: number[] }; // e.g. B3/S23 → {born:[3], survive:[2,3]}

type AppState = {
  grid: Grid;
  width: number;
  height: number;
  rule: Rule;
  generation: number;
  isRunning: boolean;
  speed: number; // ticks per second
  history: string[]; // recent state hashes, for cycle detection
};
```

## 8. Implementation Plan & Milestones

| Milestone | Scope | Est. time |
|---|---|---|
| M1 — Engine core | Grid, step(), rule parser, unit tests | 1–2 days |
| M2 — Canvas renderer + basic controls | Play/pause/step/random/clear, speed | 2 days |
| M3 — Custom rules + presets | Rule input UI, validation, preset dropdown | 1–2 days |
| M4 — Pattern library | Click-to-place UI, common pattern data | 1–2 days |
| M5 — RLE codec + URL sharing | Encode/decode, share button, load-from-URL | 2 days |
| M6 — Stats panel + cycle detection | Population chart, hash-based cycle detection | 2 days |
| M7 — Polish + deploy | Responsive layout, deploy, README | 1–2 days |
| M8 — Blog post | Write, focusing on architecture + algorithm story | 1–2 days |

**Total estimate:** ~2–3 weeks part-time.

## 9. Risks & Weak Assumptions to Watch

- **"Go deep" scope creep:** cycle detection and custom rules are genuinely valuable, but resist adding more (e.g. 3D Life, multiplayer) — diminishing portfolio return past this point.
- **Canvas performance assumption:** worth actually benchmarking DOM vs canvas at a few grid sizes before claiming a performance win in the blog — don't assert it without a number.
- **RLE parser edge cases:** the real RLE spec has header lines and comments; decide early whether to support the full spec or a simplified subset, and say so explicitly in the code/docs.

## 10. Next Action

Scaffold the Vite + React + TS project and implement the engine's `step()` function with the three unit tests (glider, block, blinker) before touching any UI. Get the algorithmic core correct first.
