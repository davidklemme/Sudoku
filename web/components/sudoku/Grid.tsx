'use client';

import { useCallback } from 'react';
import { Cell } from './Cell';
import { SudokuGrid, GridSize, Position } from '@/lib/sudoku/types';
import { CellHighlights, posKey } from '@/lib/colors/highlights';

interface GridProps {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  gridSize: GridSize;
  selectedCell: Position | null;
  highlights: CellHighlights;
  pencilMarks: Map<string, Set<number>>;
  onCellClick: (row: number, col: number) => void;
}

/**
 * Grid - The Sudoku board with integrated color highlighting
 *
 * The hero component! Takes up most of the screen and serves as
 * the teaching surface through color-coded highlights.
 */
export function Grid({
  grid,
  initialGrid,
  gridSize,
  selectedCell,
  highlights,
  pencilMarks,
  onCellClick,
}: GridProps) {
  // Calculate box dimensions based on grid size
  const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3;
  const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3;

  const isSelected = useCallback(
    (row: number, col: number) =>
      selectedCell?.row === row && selectedCell?.col === col,
    [selectedCell]
  );

  const getHighlight = useCallback(
    (row: number, col: number) => highlights.get(posKey({ row, col })),
    [highlights]
  );

  const getPencilMarks = useCallback(
    (row: number, col: number) => pencilMarks.get(`${row},${col}`) ?? new Set<number>(),
    [pencilMarks]
  );

  if (!grid || !initialGrid) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100">
        <p className="text-gray-500">Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-0 bg-gray-800 p-1 rounded-xl shadow-lg w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
      role="grid"
      aria-label="Sudoku puzzle grid"
    >
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={value}
            isGiven={initialGrid[rowIndex][colIndex] !== 0 && initialGrid[rowIndex][colIndex] !== null}
            gridSize={gridSize}
            boxHeight={boxHeight}
            boxWidth={boxWidth}
            isSelected={isSelected(rowIndex, colIndex)}
            highlight={getHighlight(rowIndex, colIndex)}
            pencilMarks={getPencilMarks(rowIndex, colIndex)}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}
