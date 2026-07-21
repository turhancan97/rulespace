import { useLayoutEffect, useRef, type FC, type MouseEvent } from 'react';
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

  // Setting canvas dimensions clears its drawing buffer. Keep this separate
  // from grid updates so the previous frame remains visible until rAF draws
  // the next generation.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
  }, [width, height, cellSize]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const context = canvas.getContext('2d');
      if (!context) return;
      const styles = getComputedStyle(canvas);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = styles.getPropertyValue('--cell-color').trim();

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (grid[y * width + x] === 1) {
            context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }

      context.strokeStyle = styles.getPropertyValue('--grid-line-color').trim();
      context.lineWidth = 0.5;
      context.beginPath();
      for (let x = 0; x <= width; x += 1) {
        context.moveTo(x * cellSize, 0);
        context.lineTo(x * cellSize, height * cellSize);
      }
      for (let y = 0; y <= height; y += 1) {
        context.moveTo(0, y * cellSize);
        context.lineTo(width * cellSize, y * cellSize);
      }
      context.stroke();
    };

    draw();
    const frameId = requestAnimationFrame(draw);

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
      className="life-canvas"
    />
  );
};
