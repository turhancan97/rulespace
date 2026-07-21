import type { FC } from 'react';

interface ControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandomize: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const Controls: FC<ControlsProps> = ({
  isRunning,
  onPlayPause,
  onStep,
  onClear,
  onRandomize,
  speed,
  onSpeedChange
}) => {
  return (
    <section className="card controls" aria-label="Simulation controls">
      <button
        onClick={onPlayPause}
        className="button button-primary"
      >
        {isRunning ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onStep}
        disabled={isRunning}
        className="button"
      >
        Step
      </button>
      <button
        onClick={onRandomize}
        className="button"
      >
        Random
      </button>
      <button
        onClick={onClear}
        className="button button-danger"
      >
        Clear
      </button>

      <div className="speed-control">
        <label htmlFor="speed-slider">
          Speed: {speed} TPS
        </label>
        <input 
          id="speed-slider"
          type="range" 
          min="1" 
          max="60" 
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </div>
    </section>
  );
};
