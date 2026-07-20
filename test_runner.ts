import { createGrid, setCell, getCell, countNeighbors } from './src/engine/grid.ts';
import { step } from './src/engine/step.ts';
import { parseRule } from './src/engine/ruleParser.ts';

const conwayRule = parseRule('B3/S23');
const width = 10;
const height = 10;

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error('FAILED:', message);
  }
}

function assertEqualGrid(g1: Uint8Array, g2: Uint8Array, name: string) {
  let ok = true;
  for (let i = 0; i < g1.length; i++) {
    if (g1[i] !== g2[i]) {
      ok = false;
      break;
    }
  }
  assert(ok, name);
}

// 1. Block
let grid = createGrid(width, height);
setCell(grid, width, height, 4, 4, 1);
setCell(grid, width, height, 5, 4, 1);
setCell(grid, width, height, 4, 5, 1);
setCell(grid, width, height, 5, 5, 1);
let nextGrid = step(grid, width, height, conwayRule);
assertEqualGrid(nextGrid, grid, 'block is stable');

// 2. Blinker
grid = createGrid(width, height);
setCell(grid, width, height, 4, 5, 1);
setCell(grid, width, height, 5, 5, 1);
setCell(grid, width, height, 6, 5, 1);
const gen1 = step(grid, width, height, conwayRule);
assert(getCell(gen1, width, height, 5, 4) === 1, 'blinker gen1 5,4');
assert(getCell(gen1, width, height, 5, 5) === 1, 'blinker gen1 5,5');
assert(getCell(gen1, width, height, 5, 6) === 1, 'blinker gen1 5,6');
assert(getCell(gen1, width, height, 4, 5) === 0, 'blinker gen1 4,5');
const gen2 = step(gen1, width, height, conwayRule);
assertEqualGrid(gen2, grid, 'blinker gen2 == initial');

// 3. Glider
grid = createGrid(width, height);
setCell(grid, width, height, 1, 0, 1);
setCell(grid, width, height, 2, 1, 1);
setCell(grid, width, height, 0, 2, 1);
setCell(grid, width, height, 1, 2, 1);
setCell(grid, width, height, 2, 2, 1);

let curr = grid;
for(let i=0; i<4; i++) {
  curr = step(curr, width, height, conwayRule);
}
assert(getCell(curr, width, height, 2, 1) === 1, 'glider moved 2,1');
assert(getCell(curr, width, height, 3, 2) === 1, 'glider moved 3,2');
assert(getCell(curr, width, height, 1, 3) === 1, 'glider moved 1,3');
assert(getCell(curr, width, height, 2, 3) === 1, 'glider moved 2,3');
assert(getCell(curr, width, height, 3, 3) === 1, 'glider moved 3,3');
assert(getCell(curr, width, height, 1, 0) === 0, 'glider original empty');

console.log(`Tests: ${passed} passed, ${failed} failed.`);
