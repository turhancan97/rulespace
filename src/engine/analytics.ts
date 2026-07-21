import { Grid } from './types';

export function countPopulation(grid: Grid): number {
  let population = 0;

  for (let index = 0; index < grid.length; index += 1) {
    population += grid[index];
  }

  return population;
}

export function appendPopulationHistory(history: number[], population: number, limit = 50): number[] {
  return [...history, population].slice(-limit);
}

export function resetPopulationHistory(grid: Grid): number[] {
  return [countPopulation(grid)];
}
