import { Grid, Rule } from './types';
import { countNeighbors, createGrid } from './grid';

/**
 * Computes the next generation of the grid based on the given rule.
 * Returns a new Grid object.
 */
export function step(currentGrid: Grid, width: number, height: number, rule: Rule): Grid {
  const nextGrid = createGrid(width, height);
  
  // To avoid frequent `.includes()` calls in the hot loop, convert rule arrays to boolean maps
  const bornMap = new Array(9).fill(false);
  const surviveMap = new Array(9).fill(false);
  
  for (const b of rule.born) {
    if (b >= 0 && b <= 8) bornMap[b] = true;
  }
  for (const s of rule.survive) {
    if (s >= 0 && s <= 8) surviveMap[s] = true;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const currentState = currentGrid[idx];
      const neighbors = countNeighbors(currentGrid, width, height, x, y);
      
      if (currentState === 1) {
        if (surviveMap[neighbors]) {
          nextGrid[idx] = 1;
        }
      } else {
        if (bornMap[neighbors]) {
          nextGrid[idx] = 1;
        }
      }
    }
  }

  return nextGrid;
}
