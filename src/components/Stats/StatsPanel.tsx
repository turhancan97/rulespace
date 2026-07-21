import type { FC } from 'react';

interface StatsPanelProps {
  population: number;
  history: number[]; // recent population history for the sparkline
  cyclePeriod: number | null;
}

export const StatsPanel: FC<StatsPanelProps> = ({ population, history, cyclePeriod }) => {
  // Simple SVG sparkline
  const maxPop = Math.max(...history, 10); // avoid div by zero, baseline 10
  const points = history.map((pop, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 100;
    const y = 100 - (pop / maxPop) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="card stats-panel">
      <h2>Analytics</h2>
      
      <div className="stat-row">
        <span>Population</span>
        <strong className="population-value">{population}</strong>
      </div>

      <div className="stat-row">
        <span>Cycle</span>
        <strong className={cyclePeriod ? 'cycle-active' : 'cycle-none'}>
          {cyclePeriod === 1 ? 'Static' : cyclePeriod ? `Period ${cyclePeriod}` : 'None'}
        </strong>
      </div>

      <div className="population-history">
        <span>Pop. History (Last 50)</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="2"
            points={points}
          />
        </svg>
      </div>
    </section>
  );
};
