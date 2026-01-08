'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

// New components
import { GameShell } from '@/components/layout/GameShell';
import { Header } from '@/components/layout/Header';
import { Grid } from '@/components/sudoku/Grid';
import { NumberDock } from '@/components/sudoku/NumberDock';
import { ActionBar } from '@/components/sudoku/ActionBar';
import { CoachZone } from '@/components/coach/CoachZone';
import { PlayerSelect } from '@/components/coach/PlayerSelect';

// Keep existing modals for now
import CompletionModal from '@/components/game/CompletionModal';

// Color system
import { CellHighlights, posKey } from '@/lib/colors/highlights';
import { findConflicts, createConflictHighlights, createHighlightsForHint, StrategyHintResult } from '@/lib/colors/strategy-highlights';
import { GridSize, Difficulty } from '@/lib/sudoku/types';

/**
 * RnS SuDoCoach - Main Game Page
 *
 * Single-screen Sudoku learning experience with:
 * - Visual color-coded teaching
 * - Always-visible Coach
 * - Personalized for Ruben, Sammy, and others
 */
export default function Play() {
  // Game state from store
  const {
    currentGrid,
    initialGrid,
    gridSize,
    difficulty,
    startNewGame,
    makeMove,
    selectCell,
    selectedCell,
    isComplete,
    startTime,
    endTime,
    clearCell,
    pencilMarks,
    isPencilMode,
    togglePencilMode,
    addPencilMark,
    undo,
    redo,
    moveHistory,
    historyIndex,
    useHint,
    hintCell,
    hintStrategy,
    dismissHint,
  } = useGameStore();

  // Local UI state
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<CellHighlights>(new Map());

  // Check localStorage for player name on mount
  useEffect(() => {
    const savedName = localStorage.getItem('rns-player-name');
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setShowPlayerSelect(true);
    }
  }, []);

  // Start a new game if none exists
  useEffect(() => {
    if (!currentGrid) {
      startNewGame(4, 'beginner', Date.now()); // Start with 4x4 for kids
    }
  }, [currentGrid, startNewGame]);

  // Update timer every second
  useEffect(() => {
    if (!startTime || isComplete) return;

    const updateTimer = () => {
      const end = endTime || Date.now();
      const elapsed = Math.floor((end - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, isComplete]);

  // Generate hint message based on strategy
  const getHintMessage = useCallback(() => {
    const name = playerName || '';
    const prefix = name ? `${name}, ` : '';

    if (!hintStrategy) {
      return `${prefix}Look at the green cell! Try to figure out what goes there.`;
    }

    switch (hintStrategy.strategy) {
      case 'single_candidate':
        return `${prefix}Look at the green cell! Count the numbers in its row, column, and box - only one is missing!`;
      case 'hidden_single':
        return `${prefix}Check the highlighted area. This number can only go in the green cell!`;
      case 'elimination':
        return `${prefix}Use elimination! Cross out numbers that are already used nearby.`;
      case 'naked_pair':
        return `${prefix}Look at the yellow cells! They share the same two numbers, so the green cell can only be one thing!`;
      case 'pointing_pair':
        return `${prefix}Look at how the boxes connect to the rows and columns!`;
      case 'advanced':
        return `${prefix}This puzzle is tricky! Try using pencil marks to track which numbers could go where.`;
      default:
        return `${prefix}Look at the green cell! Check which numbers are already in its row, column, and box.`;
    }
  }, [playerName, hintStrategy, hintCell]);

  // Update highlights when hint or conflicts change
  useEffect(() => {
    if (!currentGrid) return;

    let newHighlights: CellHighlights = new Map();

    // Add hint highlights if active - use strategy-based highlighting
    if (hintCell && hintStrategy) {
      // Build the hint result for the highlight system
      const hintResult: StrategyHintResult = {
        type: hintStrategy.strategy,
        targetCell: { row: hintCell.row, col: hintCell.col },
        targetValue: hintCell.value,
        relatedCells: hintStrategy.affectedCells,
      };

      // Create strategy-specific highlights (green target + blue/purple related cells)
      newHighlights = createHighlightsForHint(hintResult, gridSize);

      // Update coach message with strategy-based hint
      setCoachMessage(getHintMessage());
    } else if (hintCell) {
      // Fallback: just green highlight if no strategy info
      newHighlights.set(posKey({ row: hintCell.row, col: hintCell.col }), {
        type: 'solvable',
        animate: true,
      });
      setCoachMessage(getHintMessage());
    } else if (hintStrategy && hintStrategy.strategy === 'advanced') {
      // No solvable cell found - show message but no highlights
      setCoachMessage(getHintMessage());
    }

    // Add conflict highlights
    const conflicts = findConflicts(currentGrid, gridSize);
    if (conflicts.length > 0) {
      const conflictHighlights = createConflictHighlights(conflicts);
      conflictHighlights.forEach((highlight, key) => {
        newHighlights.set(key, highlight);
      });

      // Update coach message about conflict
      const conflictMessage = playerName
        ? `Oops ${playerName}, there's a duplicate! Look at the red cells.`
        : 'Oops, there\'s a duplicate! Look at the red cells.';
      setCoachMessage(conflictMessage);
    } else if (!hintCell && (!hintStrategy || hintStrategy.strategy !== 'advanced')) {
      // Clear message if no hints or conflicts (unless advanced strategy message)
      setCoachMessage(null);
    }

    setHighlights(newHighlights);
  }, [currentGrid, hintCell, hintStrategy, gridSize, playerName, getHintMessage]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-9
      const digitMatch = e.code.match(/^Digit(\d)$/);
      if (digitMatch) {
        const num = parseInt(digitMatch[1]);
        if (num >= 1 && num <= gridSize) {
          if (e.shiftKey) {
            addPencilMark(num);
          } else {
            makeMove(num);
          }
        }
        return;
      }

      // Backspace/Delete to clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        clearCell();
        return;
      }

      // Arrow keys for navigation
      if (!selectedCell || !currentGrid) return;

      let newRow = selectedCell.row;
      let newCol = selectedCell.col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, selectedCell.row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(gridSize - 1, selectedCell.row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, selectedCell.col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(gridSize - 1, selectedCell.col + 1);
          break;
        default:
          return;
      }

      if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
        selectCell(newRow, newCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, currentGrid, gridSize, makeMove, selectCell, clearCell, addPencilMark]);

  // Handlers
  const handlePlayerSelect = useCallback((name: string) => {
    if (name) {
      localStorage.setItem('rns-player-name', name);
      setPlayerName(name);
    }
    setShowPlayerSelect(false);
  }, []);

  const handleGridSizeChange = useCallback(
    (size: GridSize) => {
      dismissHint();
      setHighlights(new Map());
      setCoachMessage(null);
      startNewGame(size, difficulty, Date.now());
    },
    [difficulty, startNewGame, dismissHint]
  );

  const handleDifficultyChange = useCallback(
    (diff: Difficulty) => {
      dismissHint();
      setHighlights(new Map());
      setCoachMessage(null);
      startNewGame(gridSize, diff, Date.now());
    },
    [gridSize, startNewGame, dismissHint]
  );

  const handleNumberClick = useCallback(
    (num: number) => {
      if (isPencilMode) {
        addPencilMark(num);
      } else {
        makeMove(num);
      }
    },
    [isPencilMode, addPencilMark, makeMove]
  );

  const handleNewGame = useCallback(() => {
    dismissHint();
    setHighlights(new Map());
    startNewGame(gridSize, difficulty, Date.now());
    setCoachMessage(
      playerName
        ? `New puzzle, ${playerName}! Let's do this!`
        : "New puzzle! Let's do this!"
    );
  }, [gridSize, difficulty, startNewGame, playerName, dismissHint]);

  // Render
  if (!currentGrid || !initialGrid) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <GameShell
        header={
          <Header
            gridSize={gridSize}
            difficulty={difficulty}
            playerName={playerName}
            onGridSizeChange={handleGridSizeChange}
            onDifficultyChange={handleDifficultyChange}
            onPlayerClick={() => setShowPlayerSelect(true)}
            onNewGame={handleNewGame}
          />
        }
        grid={
          <Grid
            grid={currentGrid}
            initialGrid={initialGrid}
            gridSize={gridSize}
            selectedCell={selectedCell}
            highlights={highlights}
            pencilMarks={pencilMarks}
            onCellClick={selectCell}
          />
        }
        coach={
          <CoachZone
            playerName={playerName}
            message={coachMessage}
          />
        }
        controls={
          <div className="space-y-3">
            <NumberDock
              gridSize={gridSize}
              onNumberClick={handleNumberClick}
              isPencilMode={isPencilMode}
            />
            <ActionBar
              canUndo={historyIndex >= 0}
              canRedo={historyIndex < moveHistory.length - 1}
              isPencilMode={isPencilMode}
              onUndo={undo}
              onRedo={redo}
              onTogglePencil={togglePencilMode}
              onHint={useHint}
              onClear={clearCell}
              onNewGame={handleNewGame}
            />
          </div>
        }
      />

      {/* Player selection modal */}
      {showPlayerSelect && <PlayerSelect onSelect={handlePlayerSelect} />}

      {/* Completion modal */}
      <CompletionModal elapsedTime={elapsedTime} />
    </>
  );
}
