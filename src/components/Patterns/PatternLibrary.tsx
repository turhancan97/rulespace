import type { FC } from 'react';
import { PATTERNS } from '../../patterns';

interface PatternLibraryProps {
  selectedPattern: string | null;
  onSelectPattern: (patternKey: string | null) => void;
}

export const PatternLibrary: FC<PatternLibraryProps> = ({ selectedPattern, onSelectPattern }) => {
  return (
    <section className="card pattern-library">
      <h2>Pattern Library</h2>
      <p>
        Select a pattern and click on the grid to place it.
      </p>
      
      <div className="pattern-buttons">
        <button
          onClick={() => onSelectPattern(null)}
          className={`button button-small ${selectedPattern === null ? 'button-primary' : ''}`}
        >
          Single Cell
        </button>
        {Object.entries(PATTERNS).map(([key, pattern]) => (
          <button
            key={key}
            onClick={() => onSelectPattern(key)}
            className={`button button-small ${selectedPattern === key ? 'button-primary' : ''}`}
          >
            {pattern.name}
          </button>
        ))}
      </div>
    </section>
  );
};
