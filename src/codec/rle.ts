import { Grid, Rule } from '../engine/types';
import { ruleToString, parseRule } from '../engine/ruleParser';

/**
 * Simplified RLE Encoder/Decoder for Rulespace.
 * Note: This does not support the full standard RLE spec (headers, comments, etc.).
 * It only encodes/decodes the raw cell data using 'b' (dead), 'o' (live), and '$' (end of line).
 * Run counts are supported (e.g. '3b' = 3 dead cells).
 */

export function encodeRLE(grid: Grid, width: number, height: number): string {
  let rle = '';
  
  for (let y = 0; y < height; y++) {
    let currentRun = 0;
    let currentState: number | null = null;
    
    for (let x = 0; x < width; x++) {
      const state = grid[y * width + x];
      
      if (currentState === null) {
        currentState = state;
        currentRun = 1;
      } else if (currentState === state) {
        currentRun++;
      } else {
        rle += (currentRun > 1 ? currentRun : '') + (currentState === 1 ? 'o' : 'b');
        currentState = state;
        currentRun = 1;
      }
    }
    
    if (currentRun > 0 && currentState === 1) { // We only need to encode live cells at end of line
      rle += (currentRun > 1 ? currentRun : '') + 'o';
    }
    
    if (y < height - 1) {
      rle += '$';
    }
  }
  
  // Clean up empty lines at the end
  rle = rle.replace(/(\$)+$/, '');
  
  return rle + '!';
}

export function decodeRLE(rle: string, width: number, height: number): Grid {
  const grid = new Uint8Array(width * height);
  let x = 0;
  let y = 0;
  let runCount = 0;
  
  for (let i = 0; i < rle.length; i++) {
    const char = rle[i];
    
    if (char >= '0' && char <= '9') {
      runCount = runCount * 10 + parseInt(char, 10);
      continue;
    }
    
    const count = runCount || 1;
    runCount = 0;
    
    if (char === 'b') {
      x += count;
    } else if (char === 'o') {
      for (let c = 0; c < count; c++) {
        if (x < width && y < height) {
          grid[y * width + x] = 1;
        }
        x++;
      }
    } else if (char === '$') {
      y += count;
      x = 0;
    } else if (char === '!') {
      break;
    }
  }
  
  return grid;
}

export function encodeURLState(grid: Grid, width: number, height: number, rule: Rule): string {
  const rle = encodeRLE(grid, width, height);
  const ruleStr = ruleToString(rule);
  // combine and base64
  const payload = JSON.stringify({ r: ruleStr, g: rle });
  return btoa(payload);
}

export function decodeURLState(base64: string, width: number, height: number): { grid: Grid, rule: Rule } | null {
  try {
    const payload = atob(base64);
    const parsed = JSON.parse(payload);
    if (parsed.r && parsed.g) {
      return {
        rule: parseRule(parsed.r),
        grid: decodeRLE(parsed.g, width, height)
      };
    }
  } catch (e) {
    console.error('Failed to decode URL state');
  }
  return null;
}
