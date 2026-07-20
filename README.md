# Rulespace

Custom rules. Emergent life.

Rulespace is an interactive Conway's Game of Life sandbox built with React, TypeScript, and Vite. It features a high-performance Canvas 2D renderer, custom rulesets (B/S notation), a pattern library, and URL-based sharing with an RLE codec.

## Features

- **Custom Rules**: Edit the rules of life on the fly using standard B/S notation (e.g., Conway's `B3/S23`, HighLife `B36/S23`, Day & Night `B3678/S34678`).
- **Pattern Library**: Click-to-place integration of famous patterns like the Gosper Glider Gun, Pulsar, and more.
- **Analytics**: Real-time population tracking and cycle detection.
- **URL Sharing**: Share interesting states instantly via encoded URL parameters.
- **High Performance**: Toroidal array-backed grid simulation optimized for 60 ticks per second rendering.

## Architecture

Rulespace strictly separates concerns to maintain high performance and clean code:

1. **Engine** (`src/engine/`): Pure TypeScript, zero DOM dependencies. Handles the Toroidal Grid operations, B/S rule parsing, and step simulation logic. Unit tested via Vitest.
2. **Renderer** (`src/components/Renderer/`): React wrapper for HTML Canvas. Uses `requestAnimationFrame` for efficient 60fps drawing.
3. **UI** (`src/components/`): React components for play controls, stats, pattern selection, and rule input.
4. **Codec** (`src/codec/`): Fast RLE (Run Length Encoding) mechanism that compresses grid state into Base64 for URL query parameters.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test
```

## Deployment

This project is configured to automatically deploy to GitHub Pages via GitHub Actions upon any push to the `main` branch. 
The Vite configuration includes a `base: '/rulespace/'` path to correctly resolve assets on GitHub Pages.
