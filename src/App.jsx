import React, { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY, TYPES, DEFAULT_BATTERY_VOLTAGE } from './config/gameConfig';
import { LEVELS } from './config/levels';
import { theme } from './config/theme';
import GameCanvas from './components/GameCanvas';
import Header from './components/UI/Header';
import Toolbox from './components/UI/Toolbox';
import PropertyEditor from './components/UI/PropertyEditor';

import FloatingControls from './components/UI/FloatingControls';

import ValidationModal from './components/UI/ValidationModal';

function App() {
  // Persistent State
  const [levelIndex, setLevelIndex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(parseInt(saved), LEVELS.length - 1) : 0;
  });

  // Session State
  const [toolMode, setToolMode] = useState('build'); // 'build' | 'measure'
  const [selectedTool, setSelectedTool] = useState(TYPES.WIRE);
  const [editingComponent, setEditingComponent] = useState(null);
  const [gameController, setGameController] = useState(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [validationResult, setValidationResult] = useState(null); // { success: boolean, message: string }

  const currentLevel = LEVELS[levelIndex];

  // Persist level progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const maxLevel = saved ? parseInt(saved) : 0;
    if (levelIndex > maxLevel) {
      localStorage.setItem(STORAGE_KEY, levelIndex.toString());
    }
  }, [levelIndex]);

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
      // Game Finished logic (maybe just a toast or stay on last level)
      alert("Configuration complete! You've beaten the game.");
    }
  };

  const handleClearBoard = useCallback(() => {
    gameController?.clear();
    setEditingComponent(null);
    setHintsShown(0);
    setValidationResult(null);
  }, [gameController]);

  // Mount Controller (from GameCanvas)
  const onMountController = useCallback((ctrl) => {
    setGameController(ctrl);
  }, []);

  // Theme Injection for CSS Variables
  useEffect(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}-color`, value);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen text-[#c0caf5] bg-[#1a1c23] select-none font-sans overflow-hidden">
      <Header
        levelTitle={currentLevel.title}
        onReset={handleClearBoard}
        onClear={handleClearBoard}
        onNextLevel={handleTestCircuit}
        onShowHints={() => setHintsShown(prev => Math.min(prev + 1, currentLevel.hints.length))}
        onResetProgress={handleResetProgress}
        isLastLevel={levelIndex === LEVELS.length - 1}
        actionLabel="Test Circuit"
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* GAME AREA - Now first in flex order, taking remaining space */}
        <div className="flex-1 flex flex-col relative order-1">

          {/* HUD: Level Info */}
          <div className="absolute top-5 left-5 pointer-events-none z-10 max-w-md">
            <div className="bg-[#24283b]/95 border border-[#7aa2f7] p-5 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-auto">
              <h2 className="text-[#7aa2f7] font-bold text-lg mb-2">{currentLevel.title}</h2>
              <p className="text-sm leading-relaxed mb-3 text-white">{currentLevel.desc}</p>

              <div className="border-t border-[#414868] pt-3 mt-3">
                <p className="text-xs text-[#9aa5ce] italic">{currentLevel.theory}</p>
              </div>

              {/* Hints */}
              {hintsShown > 0 && (
                <div className="mt-3 bg-[#7aa2f7]/10 border-l-4 border-[#7aa2f7] p-3 rounded text-xs text-[#7aa2f7]">
                  <strong>💡 Hints:</strong>
                  <ul className="mt-1 list-inside space-y-1">
                    {currentLevel.hints.slice(0, hintsShown).map((h, i) => (
                      <li key={i}>{i + 1}. {h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <GameCanvas
            toolMode={toolMode}
            selectedTool={selectedTool}
            onComponentSelect={setEditingComponent}
            onMountController={onMountController}
          />

          {/* Floating Controls */}
          <FloatingControls currentMode={toolMode} onSetMode={setToolMode} />

          {/* PROPERTY EDITOR OVERLAY */}
          {editingComponent && (
            <PropertyEditor
              component={editingComponent}
              onClose={() => setEditingComponent(null)}
            />
          )}

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

        {/* TOOLBOX - Now second in flex order (Right Side) */}
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
