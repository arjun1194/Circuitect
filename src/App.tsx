import { useState, useCallback } from 'react';
import { STORAGE_KEY, TYPES, ComponentType } from './config/gameConfig';
import { LEVELS } from './config/levels';
import { LEVEL_SOLUTIONS } from './config/solutions';
import GameCanvas from './components/GameCanvas';
import Header from './components/UI/Header';
import Toolbox from './components/UI/Toolbox';
import PropertyEditor from './components/UI/PropertyEditor';
import FloatingControls from './components/UI/FloatingControls';
import ValidationModal from './components/UI/ValidationModal';
import LevelHUD from './components/UI/LevelHUD';
import HintsPanel from './components/UI/HintsPanel';
import DebugPanel from './components/UI/DebugPanel';
import { Drawer } from './components/UI/primitives';

import { AbstractComponent } from './engine/Physics';
import { GameLoopController } from './hooks/useGameLoop';
import { useLevelProgress } from './hooks/useLevelProgress';
import { ToolMode } from './types';

function App() {
  // Persistent State
  const [levelIndex, setLevelIndex] = useState<number>(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    const n = saved !== null ? parseInt(saved, 10) : NaN;
    return Number.isInteger(n) && n >= 0 ? Math.min(n, LEVELS.length - 1) : 0;
  });

  // Session State
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.BUILD);
  const [selectedTool, setSelectedTool] = useState<ComponentType>(TYPES.WIRE);
  const [editingComponent, setEditingComponent] = useState<AbstractComponent | null>(null);
  const [gameController, setGameController] = useState<GameLoopController | null>(null);
  const [hintsShown, setHintsShown] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [, forceUpdate] = useState(0); // Used to re-render when undo/redo state changes

  const currentLevel = LEVELS[levelIndex];

  useLevelProgress(levelIndex);

  // Handlers
  const handleResetProgress = () => {
    if (confirm('Reset all progress? You will start from Level 1.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setLevelIndex(0);
      window.location.reload();
    }
  };

  const handleTestCircuit = () => {
    if (!gameController) return;

    const components = gameController.getComponents();
    const success = currentLevel.check(components);

    setValidationResult(
      success
        ? { success: true, message: 'Great job! The circuit meets all requirements.' }
        : {
            success: false,
            message: "The circuit doesn't work as expected yet. Check your connections and values.",
          }
    );
  };

  const handleNextLevel = () => {
    setValidationResult(null);
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
      handleClearBoard();
      setHintsShown(0);
    } else {
      alert("Configuration complete! You've beaten the game.");
    }
  };

  const handleClearBoard = useCallback(() => {
    gameController?.clear();
    setEditingComponent(null);
    setHintsShown(0);
    setValidationResult(null);
  }, [gameController]);

  const handleShowHint = useCallback(() => {
    setHintsShown((prev) => Math.min(prev + 1, currentLevel.hints.length));
  }, [currentLevel.hints.length]);

  const handleExport = useCallback(() => {
    if (!gameController) return;
    const json = gameController.exportCircuit();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [gameController]);

  const handleImport = useCallback(
    (json: string) => {
      if (!gameController) return;
      const success = gameController.importCircuit(json);
      if (!success) {
        alert('Failed to import circuit. The file may be corrupted or invalid.');
      }
    },
    [gameController]
  );

  const handleShowSolution = useCallback(() => {
    if (!gameController) return;
    if (!confirm('This will clear your current circuit and load the solution. Continue?')) {
      return;
    }
    const solution = LEVEL_SOLUTIONS[levelIndex];
    if (solution) {
      gameController.importCircuit(JSON.stringify(solution));
    }
  }, [gameController, levelIndex]);

  const handleUndo = useCallback(() => {
    if (!gameController) return;
    gameController.undo();
    forceUpdate((n) => n + 1);
  }, [gameController]);

  const handleRedo = useCallback(() => {
    if (!gameController) return;
    gameController.redo();
    forceUpdate((n) => n + 1);
  }, [gameController]);

  const onMountController = useCallback((ctrl: GameLoopController) => {
    setGameController(ctrl);
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg font-sans text-text select-none">
      <Header
        levelTitle={currentLevel.title}
        levelIndex={levelIndex}
        totalLevels={LEVELS.length}
        onTest={handleTestCircuit}
        onClear={handleClearBoard}
        onShowSolution={handleShowSolution}
        onResetProgress={handleResetProgress}
        onExport={handleExport}
        onImport={handleImport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={gameController?.canUndo() ?? false}
        canRedo={gameController?.canRedo() ?? false}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Component palette — left rail on desktop */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-accent">Components</span>
          </div>
          <div className="cx-scroll flex-1 overflow-y-auto">
            <Toolbox selectedTool={selectedTool} onSelectTool={setSelectedTool} />
          </div>
        </aside>

        {/* Game area */}
        <main className="relative flex-1 overflow-hidden">
          <LevelHUD
            level={currentLevel}
            levelIndex={levelIndex}
            hintsShown={hintsShown}
            onShowHint={handleShowHint}
          >
            <HintsPanel hints={currentLevel.hints} hintsShown={hintsShown} />
          </LevelHUD>

          <GameCanvas
            toolMode={toolMode}
            selectedTool={selectedTool}
            onComponentSelect={setEditingComponent}
            onMountController={onMountController}
          />

          <FloatingControls
            currentMode={toolMode}
            onSetMode={setToolMode}
            showDebug={showDebug}
            onToggleDebug={() => setShowDebug((prev) => !prev)}
          />

          {editingComponent && (
            <PropertyEditor component={editingComponent} onClose={() => setEditingComponent(null)} />
          )}

          {showDebug && gameController && (
            <DebugPanel components={gameController.getComponents()} onClose={() => setShowDebug(false)} />
          )}

          {validationResult && (
            <ValidationModal
              success={validationResult.success}
              message={validationResult.message}
              onNext={handleNextLevel}
              onRetry={() => setValidationResult(null)}
              isLastLevel={levelIndex === LEVELS.length - 1}
            />
          )}
        </main>
      </div>

      {/* Component palette — drawer on mobile */}
      <Drawer open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Components" side="left">
        <Toolbox
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onPick={() => setPaletteOpen(false)}
        />
      </Drawer>
    </div>
  );
}

export default App;
