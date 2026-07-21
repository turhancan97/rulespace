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
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Grid dimensions must be positive integers');
  }
  if (!rle.endsWith('!') || !/^[0-9bo$!]+$/.test(rle)) {
    throw new Error('Invalid simplified RLE data');
  }
  if (rle.indexOf('!') !== rle.length - 1) {
    throw new Error('RLE terminator must be final');
  }

  const grid = new Uint8Array(width * height);
  let x = 0;
  let y = 0;
  let runCount = 0;
  
  for (let i = 0; i < rle.length; i++) {
    const char = rle[i];
    
    if (char >= '0' && char <= '9') {
      if (char === '0' && runCount === 0) throw new Error('RLE run counts must be positive');
      runCount = runCount * 10 + parseInt(char, 10);
      continue;
    }
    
    const hasRunCount = runCount > 0;
    const count = runCount || 1;
    runCount = 0;

    if (char === 'b') {
      if (y >= height || x + count > width) throw new Error('RLE data exceeds grid bounds');
      x += count;
    } else if (char === 'o') {
      if (y >= height || x + count > width) throw new Error('RLE data exceeds grid bounds');
      for (let c = 0; c < count; c++) {
        grid[y * width + x] = 1;
        x++;
      }
    } else if (char === '$') {
      if (y + count >= height) throw new Error('RLE data exceeds grid bounds');
      y += count;
      x = 0;
    } else if (char === '!') {
      if (hasRunCount) throw new Error('RLE run count is missing a cell state');
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
  return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeURLState(base64: string, width: number, height: number): { grid: Grid, rule: Rule } | null {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(base64)) return null;
    const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const parsed: unknown = JSON.parse(atob(standardBase64));
    if (!parsed || typeof parsed !== 'object') return null;

    const { r, g } = parsed as { r?: unknown; g?: unknown };
    if (typeof r !== 'string' || typeof g !== 'string') return null;

    return {
      rule: parseRule(r),
      grid: decodeRLE(g, width, height),
    };
  } catch {
    return null;
  }
}
