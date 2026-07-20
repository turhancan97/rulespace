export type Cell = 0 | 1;
export type Grid = Uint8Array; // flattened, width * height

export type Rule = {
  born: number[];
  survive: number[];
};

export type AppState = {
  grid: Grid;
  width: number;
  height: number;
  rule: Rule;
  generation: number;
  isRunning: boolean;
  speed: number;
  history: string[];
};
