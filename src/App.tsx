import { useState, useCallback, useEffect } from 'react';
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
import { Drawer, Modal, Button, useToast } from './components/UI/primitives';

import { AbstractComponent } from './engine/Physics';
import { GameLoopController } from './hooks/useGameLoop';
import { useLevelProgress } from './hooks/useLevelProgress';
import { ToolMode } from './types';
import { getUndoRedoShortcutAction } from './utils/keyboardShortcuts';

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

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
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [, bumpHistory] = useState(0); // Re-render when undo/redo availability changes

  const currentLevel = LEVELS[levelIndex];
  const { notify } = useToast();

  useLevelProgress(levelIndex);

  const requestConfirm = useCallback((opts: ConfirmState) => setConfirmState(opts), []);
  const onHistoryChange = useCallback(() => bumpHistory((n) => n + 1), []);

  // Handlers
  const handleResetProgress = () => {
    requestConfirm({
      title: 'Reset progress?',
      message: 'This clears your saved progress and starts again from Level 1.',
      confirmLabel: 'Reset',
      danger: true,
      onConfirm: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setLevelIndex(0);
        window.location.reload();
      },
    });
  };

  const handleTestCircuit = () => {
    if (!gameController) return;
    const success = currentLevel.check(gameController.getComponents());
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
      gameController?.resetBoard();
      setEditingComponent(null);
      setHintsShown(0);
    } else {
      notify("You've completed every level. Nice work!", 'success');
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
    notify('Circuit exported.', 'success');
  }, [gameController, notify]);

  const handleImport = useCallback(
    (json: string) => {
      if (!gameController) return;
      const success = gameController.importCircuit(json);
      notify(
        success ? 'Circuit imported.' : 'Failed to import circuit — the file may be corrupted or invalid.',
        success ? 'success' : 'error'
      );
    },
    [gameController, notify]
  );

  const handleShowSolution = useCallback(() => {
    if (!gameController) return;
    requestConfirm({
      title: 'Load solution?',
      message: 'This clears your current circuit and loads the correct solution for this level.',
      confirmLabel: 'Load solution',
      onConfirm: () => {
        const solution = LEVEL_SOLUTIONS[levelIndex];
        if (solution) gameController.importCircuit(JSON.stringify(solution));
      },
    });
  }, [gameController, levelIndex, requestConfirm]);

  const handleUndo = useCallback(() => {
    gameController?.undo();
  }, [gameController]);

  const handleRedo = useCallback(() => {
    gameController?.redo();
  }, [gameController]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getUndoRedoShortcutAction(event);
      if (!action) return;

      event.preventDefault();
      if (action === 'undo') {
        handleUndo();
      } else {
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
            onHistoryChange={onHistoryChange}
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

      {/* In-app confirmation dialog (replaces native confirm) */}
      {confirmState && (
        <Modal
          open
          onClose={() => setConfirmState(null)}
          title={confirmState.title}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmState(null)}>
                Cancel
              </Button>
              <Button
                variant={confirmState.danger ? 'danger' : 'primary'}
                onClick={() => {
                  const run = confirmState.onConfirm;
                  setConfirmState(null);
                  run();
                }}
              >
                {confirmState.confirmLabel}
              </Button>
            </>
          }
        >
          {confirmState.message}
        </Modal>
      )}
    </div>
  );
}

export default App;
