import React from 'react';

interface StatsPanelProps {
  population: number;
  history: number[]; // recent population history for the sparkline
  cyclePeriod: number | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ population, history, cyclePeriod }) => {
  // Simple SVG sparkline
  const maxPop = Math.max(...history, 10); // avoid div by zero, baseline 10
  const points = history.map((pop, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 100;
    const y = 100 - (pop / maxPop) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      width: '250px'
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', color: '#374151' }}>Analytics</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Population</span>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#3A7EAB' }}>{population}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Cycle</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: cyclePeriod ? '#CF4832' : '#9ca3af' }}>
          {cyclePeriod === 1 ? 'Static' : cyclePeriod ? `Period ${cyclePeriod}` : 'None'}
        </span>
      </div>

      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Pop. History (Last 50)</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '40px', marginTop: '4px', borderBottom: '1px solid #e5e7eb' }}>
          <polyline
            fill="none"
            stroke="#3A7EAB"
            strokeWidth="2"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
};
