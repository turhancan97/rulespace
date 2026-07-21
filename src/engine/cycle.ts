import { hashGrid } from './hash';
import { Grid } from './types';

export const HISTORY_SIZE = 50;

export type GridHistoryEntry = {
  hash: string;
  grid: Grid;
};

export function createHistoryEntry(grid: Grid): GridHistoryEntry {
  return { hash: hashGrid(grid), grid: new Uint8Array(grid) };
}

export function gridsEqual(first: Grid, second: Grid): boolean {
  if (first.length !== second.length) return false;

  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) return false;
  }

  return true;
}

/**
 * Returns the period of a repeated state, or null when it has not occurred in
 * the bounded history. Matching bytes are checked after the hash to avoid
 * reporting a cycle from a hash collision.
 */
export function findCyclePeriod(history: GridHistoryEntry[], grid: Grid): number | null {
  const hash = hashGrid(grid);

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const candidate = history[index];
    if (candidate.hash === hash && gridsEqual(candidate.grid, grid)) {
      return history.length - index;
    }
  }

  return null;
}

export function appendHistory(
  history: GridHistoryEntry[],
  grid: Grid,
  limit = HISTORY_SIZE,
): GridHistoryEntry[] {
  return [...history, createHistoryEntry(grid)].slice(-limit);
}
