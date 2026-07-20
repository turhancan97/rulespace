<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/assets/rulespace-logo-lockup-dark.svg">
    <img src="src/assets/rulespace-logo-lockup.svg" alt="Rulespace Logo" width="400" />
  </picture>
  <p><b>Custom rules. Emergent life.</b></p>
  
  <p>An interactive, high-performance Conway's Game of Life sandbox built with React, TypeScript, and Canvas 2D.</p>
</div>

---

## 🚀 Features

- **Custom Rules**: Edit the rules of life on the fly using standard `B/S` notation (e.g., Conway's `B3/S23`, HighLife `B36/S23`, Day & Night `B3678/S34678`).
- **Pattern Library**: Click-to-place integration of famous patterns like the Gosper Glider Gun, Pulsar, and more.
- **Analytics**: Real-time population tracking, graphing, and infinite cycle detection.
- **URL Sharing**: Share interesting states instantly via encoded Base64 URL parameters.
- **High Performance**: Toroidal array-backed grid simulation optimized for consistent 60fps rendering.

## 🏗️ Architecture

Rulespace strictly separates concerns to maintain high performance and clean code:

1. **Engine (`src/engine/`)**: Pure TypeScript, zero DOM dependencies. Handles the Toroidal Grid operations, B/S rule parsing, and step simulation logic. Unit tested via Vitest.
2. **Renderer (`src/components/Renderer/`)**: React wrapper for HTML Canvas. Uses `requestAnimationFrame` for efficient drawing.
3. **UI (`src/components/`)**: React components for play controls, stats, pattern selection, and rule input.
4. **Codec (`src/codec/`)**: Fast RLE (Run Length Encoding) mechanism that compresses grid state into Base64 strings for URL query parameters.

## 💻 Development

```bash
# Clone the repository
git clone https://github.com/turhancan97/rulespace.git
cd rulespace

# Install dependencies
npm install

# Run the local development server
npm run dev

# Run the vitest test suite
npm run test
```

## 🌐 Deployment

This project is configured to automatically deploy to **GitHub Pages** via GitHub Actions upon any push to the `main` branch.

The Vite configuration includes a `base: '/rulespace/'` path to correctly resolve assets on the GitHub Pages subpath.

---
<div align="center">
  <sub>Built by <a href="https://github.com/turhancan97">Turhan Can Kargin</a></sub>
</div>
