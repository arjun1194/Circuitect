import { useState, useCallback } from 'react';
import { STORAGE_KEY, TYPES, ComponentType } from './config/gameConfig';
import { LEVELS } from './config/levels';
import GameCanvas from './components/GameCanvas';
import Header from './components/UI/Header';
import Toolbox from './components/UI/Toolbox';
import PropertyEditor from './components/UI/PropertyEditor';
import FloatingControls from './components/UI/FloatingControls';
import ValidationModal from './components/UI/ValidationModal';
import LevelHUD from './components/UI/LevelHUD';
import HintsPanel from './components/UI/HintsPanel';

import { AbstractComponent } from './engine/Physics';
import { GameLoopController } from './hooks/useGameLoop';
import { useLevelProgress } from './hooks/useLevelProgress';
import { useThemeInjection } from './hooks/useThemeInjection';
import { ToolMode } from './types';

function App() {
  // Persistent State
  const [levelIndex, setLevelIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(parseInt(saved), LEVELS.length - 1) : 0;
  });

  // Session State
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.BUILD);
  const [selectedTool, setSelectedTool] = useState<ComponentType>(TYPES.WIRE);
  const [editingComponent, setEditingComponent] = useState<AbstractComponent | null>(null);
  const [gameController, setGameController] = useState<GameLoopController | null>(null);
  const [hintsShown, setHintsShown] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  const currentLevel = LEVELS[levelIndex];

  // Custom Hooks
  useLevelProgress(levelIndex, levelIndex);
  useThemeInjection();

  // Handlers
  const handleResetProgress = () => {
    if (confirm('Reset all progress? You will start from Level 1.')) {
      localStorage.removeItem(STORAGE_KEY);
      setLevelIndex(0);
      window.location.reload();
    }
  };

  const handleTestCircuit = () => {
    if (!gameController) return;

    const components = gameController.getComponents();
    const success = currentLevel.check(components);

    if (success) {
      setValidationResult({
        success: true,
        message: "Great job! The circuit meets all requirements."
      });
    } else {
      setValidationResult({
        success: false,
        message: "The circuit doesn't work as expected yet. Check your connections and values."
      });
    }
  };

  const handleNextLevel = () => {
    setValidationResult(null);
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
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
    setHintsShown(prev => Math.min(prev + 1, currentLevel.hints.length));
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

  const handleImport = useCallback((json: string) => {
    if (!gameController) return;
    const success = gameController.importCircuit(json);
    if (!success) {
      alert('Failed to import circuit. The file may be corrupted or invalid.');
    }
  }, [gameController]);

  const onMountController = useCallback((ctrl: GameLoopController) => {
    setGameController(ctrl);
  }, []);

  return (
    <div className="flex flex-col h-screen text-[#c0caf5] bg-[#1a1c23] select-none font-sans overflow-hidden">
      <Header
        levelTitle={currentLevel.title}
        onReset={handleClearBoard}
        onClear={handleClearBoard}
        onNextLevel={handleTestCircuit}
        onShowHints={handleShowHint}
        onResetProgress={handleResetProgress}
        onExport={handleExport}
        onImport={handleImport}
        isLastLevel={levelIndex === LEVELS.length - 1}
        actionLabel="Test Circuit"
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* GAME AREA */}
        <div className="flex-1 flex flex-col relative order-1">

          {/* Level HUD with Hints */}
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

          {/* Floating Controls */}
          <FloatingControls currentMode={toolMode} onSetMode={setToolMode} />

          {/* PROPERTY EDITOR OVERLAY */}
          {editingComponent && (() => {
            const comp = editingComponent as AbstractComponent;
            return (
              <PropertyEditor
                component={comp}
                onClose={() => setEditingComponent(null)}
              />
            );
          })()}

          {/* VALIDATION MODAL */}
          {validationResult && (
            <ValidationModal
              success={validationResult.success}
              message={validationResult.message}
              onNext={handleNextLevel}
              onRetry={() => setValidationResult(null)}
              isLastLevel={levelIndex === LEVELS.length - 1}
            />
          )}
        </div>

        {/* TOOLBOX */}
        <div className="order-2 border-l border-[#333] shadow-lg z-20 h-full bg-[#24283b]">
          <Toolbox
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            currentMode={toolMode}
            onSetMode={setToolMode}
          />
        </div>

      </div>
    </div>
  );
}

export default App;

