/**
 * Strategy-Based Sudoku Solver
 *
 * Solves puzzles using human-like strategies and tracks the
 * difficulty level based on which techniques are required.
 *
 * Strategy Hierarchy (easiest to hardest):
 * 1. Naked Singles - cell has only one candidate
 * 2. Hidden Singles - value can only go in one cell in a unit
 * 3. Naked Pairs - two cells in a unit share same two candidates
 * 4. Pointing Pairs - candidates in a box aligned to eliminate in row/col
 * 5. Box/Line Reduction - row/col candidates confined to one box
 *
 * If none work, puzzle requires guessing (expert level)
 */

import type { SudokuGrid, GridSize, Difficulty } from './types'
import { cloneGrid, getCandidates, isValidMove, getBoxDimensions } from './validator'

export type Strategy =
  | 'naked_single'
  | 'hidden_single'
  | 'naked_pair'
  | 'pointing_pair'
  | 'box_line_reduction'
  | 'guessing'

export interface SolveResult {
  solved: boolean
  grid: SudokuGrid
  strategiesUsed: Set<Strategy>
  maxDifficulty: Difficulty
  steps: number
}

/**
 * Map strategies to difficulty levels
 */
const STRATEGY_DIFFICULTY: Record<Strategy, Difficulty> = {
  naked_single: 'beginner',
  hidden_single: 'easy',
  naked_pair: 'medium',
  pointing_pair: 'hard',
  box_line_reduction: 'hard',
  guessing: 'expert',
}

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

function getDifficultyIndex(difficulty: Difficulty): number {
  return DIFFICULTY_ORDER.indexOf(difficulty)
}

function maxDifficulty(a: Difficulty, b: Difficulty): Difficulty {
  return getDifficultyIndex(a) >= getDifficultyIndex(b) ? a : b
}

/**
 * Solve a puzzle using only logical strategies
 * Returns the strategies required and difficulty level
 */
export function solveWithStrategies(grid: SudokuGrid): SolveResult {
  const workingGrid = cloneGrid(grid)
  const gridSize = workingGrid.length as GridSize
  const strategiesUsed = new Set<Strategy>()
  let steps = 0
  let currentDifficulty: Difficulty = 'beginner'

  // Build candidate grid
  const candidates: Set<number>[][] = buildCandidateGrid(workingGrid)

  let madeProgress = true
  while (madeProgress) {
    madeProgress = false
    steps++

    // Try strategies in order of difficulty

    // 1. Naked Singles
    const nakedSingle = findNakedSingle(workingGrid, candidates, gridSize)
    if (nakedSingle) {
      applyMove(workingGrid, candidates, nakedSingle.row, nakedSingle.col, nakedSingle.value, gridSize)
      strategiesUsed.add('naked_single')
      currentDifficulty = maxDifficulty(currentDifficulty, 'beginner')
      madeProgress = true
      continue
    }

    // 2. Hidden Singles
    const hiddenSingle = findHiddenSingle(workingGrid, candidates, gridSize)
    if (hiddenSingle) {
      applyMove(workingGrid, candidates, hiddenSingle.row, hiddenSingle.col, hiddenSingle.value, gridSize)
      strategiesUsed.add('hidden_single')
      currentDifficulty = maxDifficulty(currentDifficulty, 'easy')
      madeProgress = true
      continue
    }

    // 3. Naked Pairs (elimination only, doesn't place numbers directly)
    const nakedPairEliminations = findNakedPairEliminations(candidates, gridSize)
    if (nakedPairEliminations > 0) {
      strategiesUsed.add('naked_pair')
      currentDifficulty = maxDifficulty(currentDifficulty, 'medium')
      madeProgress = true
      continue
    }

    // 4. Pointing Pairs
    const pointingPairEliminations = findPointingPairEliminations(candidates, gridSize)
    if (pointingPairEliminations > 0) {
      strategiesUsed.add('pointing_pair')
      currentDifficulty = maxDifficulty(currentDifficulty, 'hard')
      madeProgress = true
      continue
    }

    // 5. Box/Line Reduction
    const boxLineEliminations = findBoxLineEliminations(candidates, gridSize)
    if (boxLineEliminations > 0) {
      strategiesUsed.add('box_line_reduction')
      currentDifficulty = maxDifficulty(currentDifficulty, 'hard')
      madeProgress = true
      continue
    }
  }

  // Check if solved
  const solved = isComplete(workingGrid)

  if (!solved) {
    // Puzzle requires guessing/bifurcation
    strategiesUsed.add('guessing')
    currentDifficulty = 'expert'
  }

  return {
    solved,
    grid: workingGrid,
    strategiesUsed,
    maxDifficulty: currentDifficulty,
    steps,
  }
}

/**
 * Get the actual difficulty of a puzzle based on required strategies
 */
export function analyzeDifficulty(grid: SudokuGrid): Difficulty {
  const result = solveWithStrategies(grid)
  return result.maxDifficulty
}

/**
 * Get the maximum achievable difficulty for a grid size
 * Smaller grids can't support advanced strategies due to topology
 */
function getMaxDifficultyForGridSize(gridSize: number): Difficulty {
  switch (gridSize) {
    case 4:
      return 'easy' // 4x4 can only do naked singles effectively
    case 6:
      return 'medium' // 6x6 can sometimes achieve hidden singles
    case 9:
    default:
      return 'expert' // 9x9 can support all strategies
  }
}

/**
 * Check if a puzzle matches the expected difficulty
 * Accounts for grid size limitations on achievable difficulty
 */
export function validateDifficulty(
  grid: SudokuGrid,
  expectedDifficulty: Difficulty
): { valid: boolean; actualDifficulty: Difficulty; strategiesUsed: Strategy[] } {
  const gridSize = grid.length
  const result = solveWithStrategies(grid)
  const actualIndex = getDifficultyIndex(result.maxDifficulty)
  const expectedIndex = getDifficultyIndex(expectedDifficulty)

  // Get the max achievable difficulty for this grid size
  const maxAchievable = getMaxDifficultyForGridSize(gridSize)
  const maxIndex = getDifficultyIndex(maxAchievable)

  // Cap expected difficulty to what's achievable for this grid size
  const adjustedExpectedIndex = Math.min(expectedIndex, maxIndex)

  // Valid if:
  // 1. Actual difficulty is within +/- 1 level of adjusted expected, OR
  // 2. Puzzle requires higher strategy than expected (harder is OK for hard/expert)
  const withinRange = Math.abs(actualIndex - adjustedExpectedIndex) <= 1
  const harderThanExpected = actualIndex > adjustedExpectedIndex && expectedIndex >= 3 // hard or expert

  const valid = withinRange || harderThanExpected

  return {
    valid,
    actualDifficulty: result.maxDifficulty,
    strategiesUsed: Array.from(result.strategiesUsed),
  }
}

// Helper functions

function buildCandidateGrid(grid: SudokuGrid): Set<number>[][] {
  const gridSize = grid.length as GridSize
  const candidates: Set<number>[][] = []

  for (let row = 0; row < gridSize; row++) {
    candidates[row] = []
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === null) {
        candidates[row][col] = new Set(getCandidates(grid, row, col))
      } else {
        candidates[row][col] = new Set()
      }
    }
  }

  return candidates
}

function findNakedSingle(
  grid: SudokuGrid,
  candidates: Set<number>[][],
  gridSize: GridSize
): { row: number; col: number; value: number } | null {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === null && candidates[row][col].size === 1) {
        const value = Array.from(candidates[row][col])[0]
        return { row, col, value }
      }
    }
  }
  return null
}

function findHiddenSingle(
  grid: SudokuGrid,
  candidates: Set<number>[][],
  gridSize: GridSize
): { row: number; col: number; value: number } | null {
  const boxDims = getBoxDimensions(gridSize)

  // Check rows
  for (let row = 0; row < gridSize; row++) {
    for (let num = 1; num <= gridSize; num++) {
      const positions: number[] = []
      for (let col = 0; col < gridSize; col++) {
        if (candidates[row][col].has(num)) {
          positions.push(col)
        }
      }
      if (positions.length === 1) {
        return { row, col: positions[0], value: num }
      }
    }
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    for (let num = 1; num <= gridSize; num++) {
      const positions: number[] = []
      for (let row = 0; row < gridSize; row++) {
        if (candidates[row][col].has(num)) {
          positions.push(row)
        }
      }
      if (positions.length === 1) {
        return { row: positions[0], col, value: num }
      }
    }
  }

  // Check boxes
  for (let boxRow = 0; boxRow < gridSize; boxRow += boxDims.rows) {
    for (let boxCol = 0; boxCol < gridSize; boxCol += boxDims.cols) {
      for (let num = 1; num <= gridSize; num++) {
        const positions: Array<{ row: number; col: number }> = []
        for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
          for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
            if (candidates[r][c].has(num)) {
              positions.push({ row: r, col: c })
            }
          }
        }
        if (positions.length === 1) {
          return { row: positions[0].row, col: positions[0].col, value: num }
        }
      }
    }
  }

  return null
}

function findNakedPairEliminations(
  candidates: Set<number>[][],
  gridSize: GridSize
): number {
  const boxDims = getBoxDimensions(gridSize)
  let eliminations = 0

  // Check rows for naked pairs
  for (let row = 0; row < gridSize; row++) {
    eliminations += findNakedPairInUnit(
      candidates,
      Array.from({ length: gridSize }, (_, col) => ({ row, col }))
    )
  }

  // Check columns for naked pairs
  for (let col = 0; col < gridSize; col++) {
    eliminations += findNakedPairInUnit(
      candidates,
      Array.from({ length: gridSize }, (_, row) => ({ row, col }))
    )
  }

  // Check boxes for naked pairs
  for (let boxRow = 0; boxRow < gridSize; boxRow += boxDims.rows) {
    for (let boxCol = 0; boxCol < gridSize; boxCol += boxDims.cols) {
      const cells: Array<{ row: number; col: number }> = []
      for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
        for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
          cells.push({ row: r, col: c })
        }
      }
      eliminations += findNakedPairInUnit(candidates, cells)
    }
  }

  return eliminations
}

function findNakedPairInUnit(
  candidates: Set<number>[][],
  cells: Array<{ row: number; col: number }>
): number {
  let eliminations = 0

  // Find cells with exactly 2 candidates
  const pairCells = cells.filter(
    ({ row, col }) => candidates[row][col].size === 2
  )

  // Look for two cells with the same pair
  for (let i = 0; i < pairCells.length; i++) {
    for (let j = i + 1; j < pairCells.length; j++) {
      const cell1 = pairCells[i]
      const cell2 = pairCells[j]
      const cands1 = candidates[cell1.row][cell1.col]
      const cands2 = candidates[cell2.row][cell2.col]

      // Check if same pair
      if (cands1.size === 2 && setsEqual(cands1, cands2)) {
        const pairValues = Array.from(cands1)

        // Eliminate these values from other cells in the unit
        for (const { row, col } of cells) {
          if ((row !== cell1.row || col !== cell1.col) &&
              (row !== cell2.row || col !== cell2.col)) {
            for (const val of pairValues) {
              if (candidates[row][col].has(val)) {
                candidates[row][col].delete(val)
                eliminations++
              }
            }
          }
        }
      }
    }
  }

  return eliminations
}

function findPointingPairEliminations(
  candidates: Set<number>[][],
  gridSize: GridSize
): number {
  const boxDims = getBoxDimensions(gridSize)
  let eliminations = 0

  // For each box
  for (let boxRow = 0; boxRow < gridSize; boxRow += boxDims.rows) {
    for (let boxCol = 0; boxCol < gridSize; boxCol += boxDims.cols) {
      // For each number
      for (let num = 1; num <= gridSize; num++) {
        // Find all cells in box that can have this number
        const positions: Array<{ row: number; col: number }> = []
        for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
          for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
            if (candidates[r][c].has(num)) {
              positions.push({ row: r, col: c })
            }
          }
        }

        if (positions.length < 2 || positions.length > boxDims.cols) continue

        // Check if all positions are in the same row
        const rows = new Set(positions.map(p => p.row))
        if (rows.size === 1) {
          const row = positions[0].row
          // Eliminate from rest of row
          for (let col = 0; col < gridSize; col++) {
            if (col < boxCol || col >= boxCol + boxDims.cols) {
              if (candidates[row][col].has(num)) {
                candidates[row][col].delete(num)
                eliminations++
              }
            }
          }
        }

        // Check if all positions are in the same column
        const cols = new Set(positions.map(p => p.col))
        if (cols.size === 1) {
          const col = positions[0].col
          // Eliminate from rest of column
          for (let row = 0; row < gridSize; row++) {
            if (row < boxRow || row >= boxRow + boxDims.rows) {
              if (candidates[row][col].has(num)) {
                candidates[row][col].delete(num)
                eliminations++
              }
            }
          }
        }
      }
    }
  }

  return eliminations
}

function findBoxLineEliminations(
  candidates: Set<number>[][],
  gridSize: GridSize
): number {
  const boxDims = getBoxDimensions(gridSize)
  let eliminations = 0

  // For each row
  for (let row = 0; row < gridSize; row++) {
    for (let num = 1; num <= gridSize; num++) {
      // Find columns where this number can go
      const cols: number[] = []
      for (let col = 0; col < gridSize; col++) {
        if (candidates[row][col].has(num)) {
          cols.push(col)
        }
      }

      if (cols.length < 2 || cols.length > boxDims.cols) continue

      // Check if all in same box
      const boxCol = Math.floor(cols[0] / boxDims.cols) * boxDims.cols
      if (cols.every(c => c >= boxCol && c < boxCol + boxDims.cols)) {
        // Eliminate from rest of box
        const boxRow = Math.floor(row / boxDims.rows) * boxDims.rows
        for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
          if (r !== row) {
            for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
              if (candidates[r][c].has(num)) {
                candidates[r][c].delete(num)
                eliminations++
              }
            }
          }
        }
      }
    }
  }

  // For each column
  for (let col = 0; col < gridSize; col++) {
    for (let num = 1; num <= gridSize; num++) {
      // Find rows where this number can go
      const rows: number[] = []
      for (let row = 0; row < gridSize; row++) {
        if (candidates[row][col].has(num)) {
          rows.push(row)
        }
      }

      if (rows.length < 2 || rows.length > boxDims.rows) continue

      // Check if all in same box
      const boxRow = Math.floor(rows[0] / boxDims.rows) * boxDims.rows
      if (rows.every(r => r >= boxRow && r < boxRow + boxDims.rows)) {
        // Eliminate from rest of box
        const boxCol = Math.floor(col / boxDims.cols) * boxDims.cols
        for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
          for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
            if (c !== col && candidates[r][c].has(num)) {
              candidates[r][c].delete(num)
              eliminations++
            }
          }
        }
      }
    }
  }

  return eliminations
}

function applyMove(
  grid: SudokuGrid,
  candidates: Set<number>[][],
  row: number,
  col: number,
  value: number,
  gridSize: GridSize
): void {
  grid[row][col] = value
  candidates[row][col] = new Set()

  const boxDims = getBoxDimensions(gridSize)
  const boxRow = Math.floor(row / boxDims.rows) * boxDims.rows
  const boxCol = Math.floor(col / boxDims.cols) * boxDims.cols

  // Remove this value from all peers
  // Row
  for (let c = 0; c < gridSize; c++) {
    candidates[row][c].delete(value)
  }
  // Column
  for (let r = 0; r < gridSize; r++) {
    candidates[r][col].delete(value)
  }
  // Box
  for (let r = boxRow; r < boxRow + boxDims.rows; r++) {
    for (let c = boxCol; c < boxCol + boxDims.cols; c++) {
      candidates[r][c].delete(value)
    }
  }
}

function isComplete(grid: SudokuGrid): boolean {
  return grid.every(row => row.every(cell => cell !== null))
}

function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) return false
  }
  return true
}
