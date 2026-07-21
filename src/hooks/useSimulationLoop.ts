import { useEffect, useRef } from 'react';

type SimulationLoopOptions = {
  isRunning: boolean;
  speed: number;
  onTick: () => void;
};

/** Keeps simulation timing outside the UI and canvas rendering components. */
export function useSimulationLoop({ isRunning, speed, onTick }: SimulationLoopOptions): void {
  const tickRef = useRef(onTick);
  const speedRef = useRef(speed);

  useEffect(() => {
    tickRef.current = onTick;
    speedRef.current = speed;
  }, [onTick, speed]);

  useEffect(() => {
    if (!isRunning) return undefined;

    let frameId = 0;
    let lastTickAt: number | null = null;

    const advance = (time: number) => {
      const interval = 1000 / speedRef.current;
      if (lastTickAt === null || time - lastTickAt >= interval) {
        tickRef.current();
        lastTickAt = time;
      }
      frameId = requestAnimationFrame(advance);
    };

    frameId = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);
}
