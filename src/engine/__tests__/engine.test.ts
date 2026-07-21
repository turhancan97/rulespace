import { describe, it, expect } from 'vitest';
import { createGrid, setCell, getCell } from '../grid';
import { step } from '../step';
import { parseRule } from '../ruleParser';
import { ruleToString } from '../ruleParser';
import { countNeighbors, getIndexToroidal } from '../grid';
import { appendPopulationHistory, countPopulation, resetPopulationHistory } from '../analytics';
import { appendHistory, createHistoryEntry, findCyclePeriod, gridsEqual } from '../cycle';
import { hashGrid } from '../hash';
import { decodeRLE, decodeURLState, encodeRLE, encodeURLState } from '../../codec/rle';

describe('Game of Life Engine', () => {
  const conwayRule = parseRule('B3/S23');
  const width = 10;
  const height = 10;

  it('block (2x2) is stable indefinitely', () => {
    const grid = createGrid(width, height);
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
    const grid = createGrid(width, height);
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
    const grid = createGrid(width, height);
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

describe('grid utilities and rules', () => {
  it('wraps coordinates and counts neighbors across toroidal edges', () => {
    const grid = createGrid(3, 3);
    setCell(grid, 3, 3, 2, 2, 1);
    setCell(grid, 3, 3, 2, 0, 1);

    expect(getIndexToroidal(-1, -1, 3, 3)).toBe(8);
    expect(getCell(grid, 3, 3, -1, -1)).toBe(1);
    expect(countNeighbors(grid, 3, 3, 0, 0)).toBe(2);
  });

  it('parses arbitrary rules and serializes a normalized rule', () => {
    expect(parseRule('B63/S32')).toEqual({ born: [3, 6], survive: [2, 3] });
    expect(parseRule('23/3')).toEqual({ born: [3], survive: [2, 3] });
    expect(ruleToString({ born: [6, 3, 3, 9], survive: [3, 2, 2] })).toBe('B36/S23');
    expect(() => parseRule('B9/S23')).toThrow('Invalid rule string');
  });
});

describe('sharing codec', () => {
  it('round-trips simplified RLE and URL state', () => {
    const grid = createGrid(4, 3);
    setCell(grid, 4, 3, 1, 0, 1);
    setCell(grid, 4, 3, 3, 2, 1);

    const rle = encodeRLE(grid, 4, 3);
    expect(decodeRLE(rle, 4, 3)).toEqual(grid);

    const encoded = encodeURLState(grid, 4, 3, parseRule('B36/S23'));
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeURLState(encoded, 4, 3)).toEqual({ grid, rule: { born: [3, 6], survive: [2, 3] } });
  });

  it('rejects malformed or out-of-bounds simplified RLE and URL states', () => {
    expect(() => decodeRLE('3o!', 2, 2)).toThrow('exceeds grid bounds');
    expect(() => decodeRLE('2x!', 2, 2)).toThrow('Invalid simplified RLE data');
    expect(() => decodeRLE('0b!', 2, 2)).toThrow('run counts must be positive');
    expect(() => decodeRLE('2!', 2, 2)).toThrow('missing a cell state');
    expect(() => decodeRLE('!o!', 2, 2)).toThrow('terminator must be final');
    expect(decodeURLState('not valid!', 2, 2)).toBeNull();
  });
});

describe('analytics and cycle detection', () => {
  it('counts population and bounds its rolling history', () => {
    expect(countPopulation(new Uint8Array([1, 0, 1, 1]))).toBe(3);
    expect(appendPopulationHistory([1, 2, 3], 4, 3)).toEqual([2, 3, 4]);
    expect(resetPopulationHistory(new Uint8Array([1, 0, 1]))).toEqual([2]);
  });

  it('detects real repeated states while rejecting hash-only collisions', () => {
    const initial = new Uint8Array([1, 0, 0, 1]);
    const repeated = new Uint8Array(initial);
    const collision = new Uint8Array([0, 1, 1, 0]);
    const history = [
      { hash: hashGrid(repeated), grid: collision },
      createHistoryEntry(repeated),
    ];

    expect(gridsEqual(initial, repeated)).toBe(true);
    expect(gridsEqual(initial, collision)).toBe(false);
    expect(findCyclePeriod(history, repeated)).toBe(1);
    expect(findCyclePeriod([{ hash: hashGrid(repeated), grid: collision }], repeated)).toBeNull();
    expect(appendHistory(history, repeated, 2)).toHaveLength(2);
  });
});
