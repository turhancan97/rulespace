import React, { useRef, useEffect } from 'react';
import { Grid } from '../../engine/types';

interface CanvasRendererProps {
  grid: Grid;
  width: number;
  height: number;
  cellSize?: number;
  onCanvasClick?: (x: number, y: number) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  grid, 
  width, 
  height, 
  cellSize = 10,
  onCanvasClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#CF4832'; // Coral accent color from PRD for live cells

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y * width + x] === 1) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'; // light gray
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x++) {
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
    }
    for (let y = 0; y <= height; y++) {
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
    }
    ctx.stroke();

  }, [grid, width, height, cellSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      width={width * cellSize}
      height={height * cellSize}
      style={{ 
        display: 'block',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}
    />
  );
};
