import { useState, useEffect, useRef, useCallback } from 'react';
import logoLight from './assets/rulespace-logo-lockup.svg';
import logoDark from './assets/rulespace-logo-lockup-dark.svg';
import { CanvasRenderer } from './components/Renderer/CanvasRenderer';
import { Controls } from './components/Controls/Controls';
import { RuleInput } from './components/Rules/RuleInput';
import { PatternLibrary } from './components/Patterns/PatternLibrary';
import { ShareButton } from './components/Share/ShareButton';
import { StatsPanel } from './components/Stats/StatsPanel';
import { createGrid } from './engine/grid';
import { step } from './engine/step';
import { parseRule } from './engine/ruleParser';
import { AppState, Grid } from './engine/types';
import { PATTERNS } from './patterns';
import { decodeURLState } from './codec/rle';
import { hashGrid } from './engine/hash';

function countPopulation(grid: Grid) {
  let p = 0;
  for(let i=0; i<grid.length; i++) p += grid[i];
  return p;
}

const HISTORY_SIZE = 50;

function App() {
  const width = 60;
  const height = 40;
  
  const [appState, setAppState] = useState<AppState & { popHistory: number[], cyclePeriod: number | null }>(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    if (stateParam) {
      const decoded = decodeURLState(stateParam, width, height);
      if (decoded) {
        return {
          grid: decoded.grid,
          width,
          height,
          rule: decoded.rule,
          generation: 0,
          isRunning: false,
          speed: 15,
          history: [],
          popHistory: [countPopulation(decoded.grid)],
          cyclePeriod: null
        };
      }
    }
    
    const initGrid = createGrid(width, height);
    return {
      grid: initGrid,
      width,
      height,
      rule: parseRule('B3/S23'),
      generation: 0,
      isRunning: false,
      speed: 15,
      history: [],
      popHistory: [0],
      cyclePeriod: null
    };
  });

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  const stateRef = useRef(appState);
  stateRef.current = appState;

  const performStep = useCallback(() => {
    setAppState(prev => {
      const nextGrid = step(prev.grid, prev.width, prev.height, prev.rule);
      const nextHash = hashGrid(nextGrid);
      const pop = countPopulation(nextGrid);
      
      // Cycle detection
      let cyclePeriod = null;
      const idx = prev.history.indexOf(nextHash);
      if (idx !== -1) {
        cyclePeriod = prev.history.length - idx;
      }
      
      const newHistory = [...prev.history, nextHash].slice(-HISTORY_SIZE);
      const newPopHistory = [...prev.popHistory, pop].slice(-HISTORY_SIZE);

      return {
        ...prev,
        grid: nextGrid,
        generation: prev.generation + 1,
        history: newHistory,
        popHistory: newPopHistory,
        cyclePeriod
      };
    });
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (!stateRef.current.isRunning) return;

    const timeSinceLastUpdate = time - lastUpdateRef.current;
    const updateInterval = 1000 / stateRef.current.speed;

    if (timeSinceLastUpdate >= updateInterval) {
      performStep();
      lastUpdateRef.current = time;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [performStep]);

  useEffect(() => {
    if (appState.isRunning) {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [appState.isRunning, gameLoop]);

  const handlePlayPause = () => setAppState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  const handleStep = () => performStep();
  const handleClear = () => setAppState(prev => ({ 
    ...prev, 
    grid: createGrid(prev.width, prev.height), 
    generation: 0, 
    isRunning: false,
    history: [],
    popHistory: [0],
    cyclePeriod: null
  }));
  const handleRandomize = () => {
    const newGrid = createGrid(width, height);
    for (let i = 0; i < newGrid.length; i++) {
      newGrid[i] = Math.random() > 0.8 ? 1 : 0;
    }
    setAppState(prev => ({ 
      ...prev, 
      grid: newGrid, 
      generation: 0,
      history: [],
      popHistory: [countPopulation(newGrid)],
      cyclePeriod: null
    }));
  };
  const handleSpeedChange = (speed: number) => setAppState(prev => ({ ...prev, speed }));

  const handleCanvasClick = (x: number, y: number) => {
    setAppState(prev => {
      const newGrid = new Uint8Array(prev.grid);
      
      const setToroidal = (cx: number, cy: number, state: 0 | 1) => {
        const wx = (cx % prev.width + prev.width) % prev.width;
        const wy = (cy % prev.height + prev.height) % prev.height;
        newGrid[wy * prev.width + wx] = state;
      };

      if (selectedPattern && PATTERNS[selectedPattern]) {
        const pattern = PATTERNS[selectedPattern];
        for (const [dx, dy] of pattern.cells) {
          setToroidal(x + dx, y + dy, 1);
        }
      } else {
        const wx = (x % prev.width + prev.width) % prev.width;
        const wy = (y % prev.height + prev.height) % prev.height;
        const idx = wy * prev.width + wx;
        newGrid[idx] = newGrid[idx] ? 0 : 1;
      }
      return { 
        ...prev, 
        grid: newGrid,
        history: [], // reset cycle detection on edit
        cyclePeriod: null,
        popHistory: [...prev.popHistory, countPopulation(newGrid)].slice(-HISTORY_SIZE)
      };
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <picture>
            <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
            <img src={logoLight} alt="Rulespace Logo" style={{ height: '48px', marginBottom: '8px' }} />
          </picture>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, paddingLeft: '4px' }}>Custom rules. Emergent life.</p>
        </div>
        <ShareButton grid={appState.grid} width={appState.width} height={appState.height} rule={appState.rule} />
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, paddingLeft: '4px' }}>
        <span>Generation: {appState.generation}</span>
      </div>

      <RuleInput 
        currentRule={appState.rule} 
        onRuleChange={(rule) => setAppState(prev => ({ ...prev, rule, history: [], cyclePeriod: null }))} 
      />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <CanvasRenderer 
          grid={appState.grid} 
          width={appState.width} 
          height={appState.height} 
          cellSize={12} 
          onCanvasClick={handleCanvasClick}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '250px' }}>
          <StatsPanel 
            population={appState.popHistory[appState.popHistory.length - 1] || 0}
            history={appState.popHistory}
            cyclePeriod={appState.cyclePeriod}
          />
          <PatternLibrary 
            selectedPattern={selectedPattern} 
            onSelectPattern={setSelectedPattern} 
          />
        </div>
      </div>

      <Controls
        isRunning={appState.isRunning}
        onPlayPause={handlePlayPause}
        onStep={handleStep}
        onClear={handleClear}
        onRandomize={handleRandomize}
        speed={appState.speed}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
}

export default App;
