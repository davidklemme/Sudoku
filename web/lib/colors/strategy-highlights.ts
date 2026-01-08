/**
 * Strategy to Highlight Mapping for RnS SuDoCoach
 *
 * Converts strategy detection results into visual color highlights.
 * This is where the teaching magic happens!
 */

import { CellHighlight, CellHighlights, posKey } from './highlights';
import { Position, GridSize, SudokuGrid } from '@/lib/sudoku/types';
import { Strategy } from '@/lib/sudoku/strategies';

/**
 * Result from strategy detection, used to generate highlights
 */
export interface StrategyHintResult {
  type: Strategy;
  targetCell: Position;
  targetValue: number;
  relatedCells?: Position[];
  explanation?: string;
}

/**
 * Get all cells in the same row as the given position
 */
function getRowCells(pos: Position, gridSize: GridSize): Position[] {
  return Array.from({ length: gridSize }, (_, col) => ({
    row: pos.row,
    col,
  })).filter((p) => p.col !== pos.col);
}

/**
 * Get all cells in the same column as the given position
 */
function getColCells(pos: Position, gridSize: GridSize): Position[] {
  return Array.from({ length: gridSize }, (_, row) => ({
    row,
    col: pos.col,
  })).filter((p) => p.row !== pos.row);
}

/**
 * Get all cells in the same box as the given position
 */
function getBoxCells(pos: Position, gridSize: GridSize): Position[] {
  const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3;
  const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3;

  const boxStartRow = Math.floor(pos.row / boxHeight) * boxHeight;
  const boxStartCol = Math.floor(pos.col / boxWidth) * boxWidth;

  const cells: Position[] = [];
  for (let r = boxStartRow; r < boxStartRow + boxHeight; r++) {
    for (let c = boxStartCol; c < boxStartCol + boxWidth; c++) {
      if (r !== pos.row || c !== pos.col) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

/**
 * Create highlights for a hint based on strategy type
 */
export function createHighlightsForHint(
  hint: StrategyHintResult,
  gridSize: GridSize
): CellHighlights {
  const highlights: CellHighlights = new Map();

  // Target cell always gets the solvable highlight with animation
  highlights.set(posKey(hint.targetCell), {
    type: 'solvable',
    animate: true,
  });

  // Add related cells based on strategy type
  switch (hint.type) {
    case 'single_candidate':
    case 'hidden_single':
    case 'elimination':
      // Show the row/col/box that makes this the only option
      const rowCells = getRowCells(hint.targetCell, gridSize);
      const colCells = getColCells(hint.targetCell, gridSize);
      const boxCells = getBoxCells(hint.targetCell, gridSize);

      // Light blue for row/col
      [...rowCells, ...colCells].forEach((cell) => {
        if (!highlights.has(posKey(cell))) {
          highlights.set(posKey(cell), { type: 'focus', intensity: 'subtle' });
        }
      });

      // Purple for box
      boxCells.forEach((cell) => {
        if (!highlights.has(posKey(cell))) {
          highlights.set(posKey(cell), { type: 'focusBox', intensity: 'subtle' });
        }
      });
      break;

    case 'naked_pair':
    case 'hidden_pair':
      // Highlight the paired cells
      if (hint.relatedCells) {
        hint.relatedCells.forEach((cell) => {
          highlights.set(posKey(cell), { type: 'pair', animate: true });
        });
      }
      break;

    case 'naked_triple':
      // Highlight the triple cells
      if (hint.relatedCells) {
        hint.relatedCells.forEach((cell) => {
          highlights.set(posKey(cell), { type: 'pair', animate: true });
        });
      }
      break;

    case 'pointing_pair':
    case 'box_line_reduction':
      // Show the interaction between box and line
      if (hint.relatedCells) {
        hint.relatedCells.forEach((cell) => {
          highlights.set(posKey(cell), { type: 'elimination' });
        });
      }
      break;

    case 'x_wing':
      // Complex pattern - highlight all involved cells
      if (hint.relatedCells) {
        hint.relatedCells.forEach((cell) => {
          highlights.set(posKey(cell), { type: 'pair', animate: true });
        });
      }
      break;

    default:
      // For unknown strategies, just highlight the target
      break;
  }

  return highlights;
}

/**
 * Create conflict highlights for duplicate numbers
 */
export function createConflictHighlights(
  conflicts: Position[]
): CellHighlights {
  const highlights: CellHighlights = new Map();
  conflicts.forEach((pos) => {
    highlights.set(posKey(pos), { type: 'conflict', animate: false });
  });
  return highlights;
}

/**
 * Create success highlights for completed row/col/box
 */
export function createSuccessHighlights(cells: Position[]): CellHighlights {
  const highlights: CellHighlights = new Map();
  cells.forEach((pos) => {
    highlights.set(posKey(pos), { type: 'success', animate: false });
  });
  return highlights;
}

/**
 * Find cells with duplicate values (conflicts)
 */
export function findConflicts(
  grid: SudokuGrid,
  gridSize: GridSize
): Position[] {
  const conflicts: Position[] = [];
  const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3;
  const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3;

  // Check rows
  for (let row = 0; row < gridSize; row++) {
    const seen = new Map<number, Position>();
    for (let col = 0; col < gridSize; col++) {
      const val = grid[row][col];
      if (val !== 0 && val !== null) {
        if (seen.has(val)) {
          conflicts.push({ row, col });
          conflicts.push(seen.get(val)!);
        } else {
          seen.set(val, { row, col });
        }
      }
    }
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    const seen = new Map<number, Position>();
    for (let row = 0; row < gridSize; row++) {
      const val = grid[row][col];
      if (val !== 0 && val !== null) {
        if (seen.has(val)) {
          conflicts.push({ row, col });
          conflicts.push(seen.get(val)!);
        } else {
          seen.set(val, { row, col });
        }
      }
    }
  }

  // Check boxes
  for (let boxRow = 0; boxRow < gridSize / boxHeight; boxRow++) {
    for (let boxCol = 0; boxCol < gridSize / boxWidth; boxCol++) {
      const seen = new Map<number, Position>();
      for (let r = 0; r < boxHeight; r++) {
        for (let c = 0; c < boxWidth; c++) {
          const row = boxRow * boxHeight + r;
          const col = boxCol * boxWidth + c;
          const val = grid[row][col];
          if (val !== 0 && val !== null) {
            if (seen.has(val)) {
              conflicts.push({ row, col });
              conflicts.push(seen.get(val)!);
            } else {
              seen.set(val, { row, col });
            }
          }
        }
      }
    }
  }

  // Remove duplicates
  const uniqueConflicts = Array.from(
    new Set(conflicts.map((p) => posKey(p)))
  ).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });

  return uniqueConflicts;
}
