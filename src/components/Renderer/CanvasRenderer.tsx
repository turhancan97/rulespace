import { useEffect, useRef, type FC, type MouseEvent } from 'react';
import { Grid } from '../../engine/types';

interface CanvasRendererProps {
  grid: Grid;
  width: number;
  height: number;
  cellSize?: number;
  onCanvasClick?: (x: number, y: number) => void;
}

export const CanvasRenderer: FC<CanvasRendererProps> = ({
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
    let frameId = 0;

    frameId = requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const styles = getComputedStyle(canvas);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = styles.getPropertyValue('--cell-color').trim();

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (grid[y * width + x] === 1) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }

      ctx.strokeStyle = styles.getPropertyValue('--grid-line-color').trim();
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1) {
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height * cellSize);
      }
      for (let y = 0; y <= height; y += 1) {
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width * cellSize, y * cellSize);
      }
      ctx.stroke();
    });

    return () => cancelAnimationFrame(frameId);
  }, [grid, width, height, cellSize]);

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
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
      className="life-canvas"
    />
  );
};
