import { describe, it, expect } from 'vitest';
import { createGrid, setCell, getCell } from '../grid';
import { step } from '../step';
import { parseRule } from '../ruleParser';

describe('Game of Life Engine', () => {
  const conwayRule = parseRule('B3/S23');
  const width = 10;
  const height = 10;

  it('block (2x2) is stable indefinitely', () => {
    let grid = createGrid(width, height);
    // Create a block at (4,4)
    setCell(grid, width, height, 4, 4, 1);
    setCell(grid, width, height, 5, 4, 1);
    setCell(grid, width, height, 4, 5, 1);
    setCell(grid, width, height, 5, 5, 1);

    const nextGrid = step(grid, width, height, conwayRule);

    // Assert identical state
    expect(nextGrid).toEqual(grid);
  });

  it('blinker oscillates with period 2', () => {
    let grid = createGrid(width, height);
    // Create horizontal blinker at y=5, x=4,5,6
    setCell(grid, width, height, 4, 5, 1);
    setCell(grid, width, height, 5, 5, 1);
    setCell(grid, width, height, 6, 5, 1);

    const gen1 = step(grid, width, height, conwayRule);
    
    // Check it is vertical
    expect(getCell(gen1, width, height, 5, 4)).toBe(1);
    expect(getCell(gen1, width, height, 5, 5)).toBe(1);
    expect(getCell(gen1, width, height, 5, 6)).toBe(1);
    expect(getCell(gen1, width, height, 4, 5)).toBe(0);
    expect(getCell(gen1, width, height, 6, 5)).toBe(0);

    const gen2 = step(gen1, width, height, conwayRule);
    
    // Check it is horizontal again
    expect(gen2).toEqual(grid);
  });

  it('glider translates diagonally after 4 generations', () => {
    let grid = createGrid(width, height);
    // Create glider facing bottom-right at top-left corner
    setCell(grid, width, height, 1, 0, 1);
    setCell(grid, width, height, 2, 1, 1);
    setCell(grid, width, height, 0, 2, 1);
    setCell(grid, width, height, 1, 2, 1);
    setCell(grid, width, height, 2, 2, 1);

    // Step 4 times
    let currentGrid = grid;
    for (let i = 0; i < 4; i++) {
      currentGrid = step(currentGrid, width, height, conwayRule);
    }

    // It should have moved by +1, +1
    expect(getCell(currentGrid, width, height, 2, 1)).toBe(1);
    expect(getCell(currentGrid, width, height, 3, 2)).toBe(1);
    expect(getCell(currentGrid, width, height, 1, 3)).toBe(1);
    expect(getCell(currentGrid, width, height, 2, 3)).toBe(1);
    expect(getCell(currentGrid, width, height, 3, 3)).toBe(1);

    // Original cells should be dead (unless they overlap)
    expect(getCell(currentGrid, width, height, 1, 0)).toBe(0);
    expect(getCell(currentGrid, width, height, 0, 2)).toBe(0);
  });
});
