import { useCallback, useState } from 'react';
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
import { parseRule, ruleToString } from './engine/ruleParser';
import { AppState } from './engine/types';
import { PATTERNS } from './patterns';
import { decodeURLState } from './codec/rle';
import { appendHistory, createHistoryEntry, findCyclePeriod, HISTORY_SIZE } from './engine/cycle';
import { appendPopulationHistory, countPopulation, resetPopulationHistory } from './engine/analytics';
import { useSimulationLoop } from './hooks/useSimulationLoop';

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
          history: [createHistoryEntry(decoded.grid)],
          popHistory: resetPopulationHistory(decoded.grid),
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
      history: [createHistoryEntry(initGrid)],
      popHistory: resetPopulationHistory(initGrid),
      cyclePeriod: null
    };
  });

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const performStep = useCallback(() => {
    setAppState(prev => {
      const nextGrid = step(prev.grid, prev.width, prev.height, prev.rule);
      const pop = countPopulation(nextGrid);
      const cyclePeriod = findCyclePeriod(prev.history, nextGrid);
      const newHistory = appendHistory(prev.history, nextGrid);
      const newPopHistory = appendPopulationHistory(prev.popHistory, pop, HISTORY_SIZE);

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

  useSimulationLoop({ isRunning: appState.isRunning, speed: appState.speed, onTick: performStep });

  const handlePlayPause = () => setAppState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  const handleStep = () => performStep();
  const handleClear = () => setAppState(prev => {
    const grid = createGrid(prev.width, prev.height);
    return {
      ...prev,
      grid,
      generation: 0,
      isRunning: false,
      history: [createHistoryEntry(grid)],
      popHistory: resetPopulationHistory(grid),
      cyclePeriod: null,
    };
  });
  const handleRandomize = () => {
    const newGrid = createGrid(width, height);
    for (let i = 0; i < newGrid.length; i++) {
      newGrid[i] = Math.random() > 0.8 ? 1 : 0;
    }
    setAppState(prev => ({ 
      ...prev, 
      grid: newGrid,
      generation: 0,
      history: [createHistoryEntry(newGrid)],
      popHistory: resetPopulationHistory(newGrid),
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
        history: [createHistoryEntry(newGrid)],
        cyclePeriod: null,
        popHistory: appendPopulationHistory(prev.popHistory, countPopulation(newGrid), HISTORY_SIZE)
      };
    });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <picture className="logo">
            <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
            <img src={logoLight} alt="Rulespace Logo" />
          </picture>
          <p className="tagline">Custom rules. Emergent life.</p>
        </div>
        <ShareButton grid={appState.grid} width={appState.width} height={appState.height} rule={appState.rule} />
      </header>

      <div className="generation">
        <span>Generation: {appState.generation}</span>
      </div>

      <RuleInput 
        key={ruleToString(appState.rule)}
        currentRule={appState.rule} 
        onRuleChange={(rule) => setAppState(prev => ({ ...prev, rule, history: [createHistoryEntry(prev.grid)], cyclePeriod: null }))}
      />

      <div className="workspace">
        <div className="canvas-scroll">
          <CanvasRenderer
            grid={appState.grid}
            width={appState.width}
            height={appState.height}
            cellSize={12}
            onCanvasClick={handleCanvasClick}
          />
        </div>
        <div className="sidebar">
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
    </main>
  );
}

export default App;
