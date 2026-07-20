import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandomize: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onPlayPause,
  onStep,
  onClear,
  onRandomize,
  speed,
  onSpeedChange
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <button 
        onClick={onPlayPause}
        style={{
          backgroundColor: '#3A7EAB', // Primary blue
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        {isRunning ? 'Pause' : 'Play'}
      </button>
      <button 
        onClick={onStep} 
        disabled={isRunning}
        style={{
          backgroundColor: '#e5e7eb',
          color: '#374151',
          border: '1px solid #d1d5db',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontWeight: 500
        }}
      >
        Step
      </button>
      <button 
        onClick={onRandomize}
        style={{
          backgroundColor: '#e5e7eb',
          color: '#374151',
          border: '1px solid #d1d5db',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        Random
      </button>
      <button 
        onClick={onClear}
        style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        Clear
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="speed-slider" style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
          Speed: {speed} TPS
        </label>
        <input 
          id="speed-slider"
          type="range" 
          min="1" 
          max="60" 
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: '120px' }}
        />
      </div>
    </div>
  );
};
