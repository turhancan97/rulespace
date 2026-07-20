import React from 'react';
import { PATTERNS } from '../../patterns';

interface PatternLibraryProps {
  selectedPattern: string | null;
  onSelectPattern: (patternKey: string | null) => void;
}

export const PatternLibrary: React.FC<PatternLibraryProps> = ({ selectedPattern, onSelectPattern }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', color: '#374151' }}>Pattern Library</h3>
      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
        Select a pattern and click on the grid to place it.
      </p>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
        <button
          onClick={() => onSelectPattern(null)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: selectedPattern === null ? '#3A7EAB' : '#f3f4f6',
            color: selectedPattern === null ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Single Cell
        </button>
        {Object.entries(PATTERNS).map(([key, pattern]) => (
          <button
            key={key}
            onClick={() => onSelectPattern(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: selectedPattern === key ? '#3A7EAB' : '#f3f4f6',
              color: selectedPattern === key ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {pattern.name}
          </button>
        ))}
      </div>
    </div>
  );
};
