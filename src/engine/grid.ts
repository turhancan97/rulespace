import { Grid } from './types';

/**
 * Creates an empty grid of the given dimensions.
 */
export function createGrid(width: number, height: number): Grid {
  return new Uint8Array(width * height);
}

/**
 * Gets the 1D array index for a 2D (x, y) coordinate, using toroidal (wrap-around) rules.
 */
export function getIndexToroidal(x: number, y: number, width: number, height: number): number {
  // Add width/height before modulo to handle negative coordinates correctly in JS
  const wrappedX = (x % width + width) % width;
  const wrappedY = (y % height + height) % height;
  return wrappedY * width + wrappedX;
}

/**
 * Sets a cell state in a grid.
 */
export function setCell(grid: Grid, width: number, height: number, x: number, y: number, state: 0 | 1): void {
  const index = getIndexToroidal(x, y, width, height);
  grid[index] = state;
}

/**
 * Gets a cell state from a grid.
 */
export function getCell(grid: Grid, width: number, height: number, x: number, y: number): 0 | 1 {
  const index = getIndexToroidal(x, y, width, height);
  return grid[index] as 0 | 1;
}

/**
 * Counts the number of alive neighbors for a given cell, assuming a Moore neighborhood and toroidal grid.
 */
export function countNeighbors(grid: Grid, width: number, height: number, x: number, y: number): number {
  let count = 0;
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const nx = x + dx;
      const ny = y + dy;
      
      const idx = getIndexToroidal(nx, ny, width, height);
      count += grid[idx];
    }
  }
  
  return count;
}
