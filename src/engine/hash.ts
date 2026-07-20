import { Grid } from './types';

/**
 * Computes a simple fast hash of the Grid (Uint8Array).
 * We use DJB2 algorithm adapted for byte arrays.
 * Returns a string representation of the 32-bit hash.
 */
export function hashGrid(grid: Grid): string {
  let hash = 5381;
  for (let i = 0; i < grid.length; i++) {
    hash = (hash * 33) ^ grid[i];
  }
  return (hash >>> 0).toString(16);
}
