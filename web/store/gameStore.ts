/**
 * Game state management with Zustand
 */

import { create } from 'zustand'
import type { SudokuGrid, GridSize, Difficulty, Move } from '@/lib/sudoku/types'
import { generatePuzzle } from '@/lib/sudoku/generator'
import { isValidMove, cloneGrid, getCandidates } from '@/lib/sudoku/validator'
import { detectStrategy, type Strategy, type StrategyResult } from '@/lib/sudoku/strategies'
import { extractFeatures } from '@/lib/ml/features'
import { mockPredict } from '@/lib/ml/mock'

export interface GameState {
  // Puzzle data
  puzzleId: string | null
  initialGrid: SudokuGrid | null
  currentGrid: SudokuGrid | null
  solution: SudokuGrid | null
  gridSize: GridSize
  difficulty: Difficulty

  // Game state
  selectedCell: { row: number; col: number } | null
  moveHistory: Move[]
  historyIndex: number
  hintsUsed: number
  mistakes: number
  isComplete: boolean
  startTime: number | null
  endTime: number | null

  // Pencil marks (candidates)
  pencilMarks: Map<string, Set<number>>
  isPencilMode: boolean

  // UI state
  highlightedCells: Set<string>
  errorCells: Set<string>

  // Highlight preferences
  showRowHighlight: boolean
  showColumnHighlight: boolean
  showBoxHighlight: boolean

  // Error feedback
  showErrorFeedback: boolean

  // Auto-clean pencil marks
  autoCleanPencilMarks: boolean

  // Teaching state
  lastStrategy: StrategyResult | null
  showFeedback: boolean
  strategiesUsed: Map<Strategy, number>

  // Hint state
  hintCell: { row: number; col: number; value: number } | null
  hintStrategy: StrategyResult | null
  showHint: boolean

  // Actions
  startNewGame: (size: GridSize, difficulty: Difficulty, seed?: number) => void
  selectCell: (row: number, col: number) => void
  makeMove: (value: number) => void
  clearCell: () => void
  undo: () => void
  redo: () => void
  togglePencilMode: () => void
  addPencilMark: (value: number) => void
  removePencilMark: (value: number) => void
  clearPencilMarks: () => void
  useHint: () => void
  dismissHint: () => void
  resetGame: () => void
  dismissFeedback: () => void
  toggleRowHighlight: () => void
  toggleColumnHighlight: () => void
  toggleBoxHighlight: () => void
  applyHighlightPreset: (difficulty: Difficulty) => void
  toggleErrorFeedback: () => void
  toggleAutoCleanPencilMarks: () => void
}

const cellKey = (row: number, col: number): string => `${row},${col}`

// Helper functions for hint cell highlighting
function getRelatedCellsForHint(
  gridSize: number,
  row: number,
  col: number
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []

  // Row cells
  for (let c = 0; c < gridSize; c++) {
    if (c !== col) cells.push({ row, col: c })
  }

  // Column cells
  for (let r = 0; r < gridSize; r++) {
    if (r !== row) cells.push({ row: r, col })
  }

  // Box cells
  const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3
  const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3
  const boxStartRow = Math.floor(row / boxHeight) * boxHeight
  const boxStartCol = Math.floor(col / boxWidth) * boxWidth

  for (let r = boxStartRow; r < boxStartRow + boxHeight; r++) {
    for (let c = boxStartCol; c < boxStartCol + boxWidth; c++) {
      if (r !== row || c !== col) {
        // Avoid duplicates (cells already in row/col)
        if (r !== row && c !== col) {
          cells.push({ row: r, col: c })
        }
      }
    }
  }

  return cells
}

function getRowCellsForHint(
  gridSize: number,
  row: number,
  col: number
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []
  for (let c = 0; c < gridSize; c++) {
    if (c !== col) cells.push({ row, col: c })
  }
  return cells
}

function getColCellsForHint(
  gridSize: number,
  row: number,
  col: number
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []
  for (let r = 0; r < gridSize; r++) {
    if (r !== row) cells.push({ row: r, col })
  }
  return cells
}

function getBoxCellsForHint(
  gridSize: number,
  row: number,
  col: number
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []
  const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3
  const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3
  const boxStartRow = Math.floor(row / boxHeight) * boxHeight
  const boxStartCol = Math.floor(col / boxWidth) * boxWidth

  for (let r = boxStartRow; r < boxStartRow + boxHeight; r++) {
    for (let c = boxStartCol; c < boxStartCol + boxWidth; c++) {
      if (r !== row || c !== col) {
        cells.push({ row: r, col: c })
      }
    }
  }
  return cells
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  puzzleId: null,
  initialGrid: null,
  currentGrid: null,
  solution: null,
  gridSize: 9,
  difficulty: 'medium',
  selectedCell: null,
  moveHistory: [],
  historyIndex: -1,
  hintsUsed: 0,
  mistakes: 0,
  isComplete: false,
  startTime: null,
  endTime: null,
  pencilMarks: new Map(),
  isPencilMode: false,
  highlightedCells: new Set(),
  errorCells: new Set(),
  showRowHighlight: true,
  showColumnHighlight: false,
  showBoxHighlight: false,
  showErrorFeedback: true,
  autoCleanPencilMarks: true,
  lastStrategy: null,
  showFeedback: false,
  strategiesUsed: new Map(),
  hintCell: null,
  hintStrategy: null,
  showHint: false,

  // Start a new game
  startNewGame: (size: GridSize, difficulty: Difficulty, seed?: number) => {
    const puzzle = generatePuzzle(size, difficulty, seed)

    set({
      puzzleId: puzzle.id,
      initialGrid: puzzle.grid,
      currentGrid: cloneGrid(puzzle.grid),
      solution: puzzle.solution,
      gridSize: size,
      difficulty,
      selectedCell: null,
      moveHistory: [],
      historyIndex: -1,
      hintsUsed: 0,
      mistakes: 0,
      isComplete: false,
      startTime: Date.now(),
      endTime: null,
      pencilMarks: new Map(),
      isPencilMode: false,
      highlightedCells: new Set(),
      errorCells: new Set(),
      lastStrategy: null,
      showFeedback: false,
      strategiesUsed: new Map(),
      hintCell: null,
      hintStrategy: null,
      showHint: false,
    })

    // Apply highlight preset for the difficulty
    get().applyHighlightPreset(difficulty)
  },

  // Select a cell
  selectCell: (row: number, col: number) => {
    const { currentGrid, gridSize, showRowHighlight, showColumnHighlight, showBoxHighlight } = get()

    if (!currentGrid || row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return
    }

    // Allow selecting any cell (including initial cells for navigation)
    set({ selectedCell: { row, col } })

    // Update highlighted cells based on preferences
    const highlighted = new Set<string>()

    // Same row (if enabled)
    if (showRowHighlight) {
      for (let c = 0; c < gridSize; c++) {
        highlighted.add(cellKey(row, c))
      }
    }

    // Same column (if enabled)
    if (showColumnHighlight) {
      for (let r = 0; r < gridSize; r++) {
        highlighted.add(cellKey(r, col))
      }
    }

    // Same box (if enabled)
    if (showBoxHighlight) {
      const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3
      const boxColSize = gridSize === 6 ? 3 : boxSize
      const boxRow = Math.floor(row / boxSize) * boxSize
      const boxCol = Math.floor(col / boxColSize) * boxColSize

      for (let r = boxRow; r < boxRow + boxSize; r++) {
        for (let c = boxCol; c < boxCol + boxColSize; c++) {
          highlighted.add(cellKey(r, c))
        }
      }
    }

    set({ highlightedCells: highlighted })
  },

  // Make a move
  makeMove: (value: number) => {
    const {
      selectedCell,
      currentGrid,
      solution,
      initialGrid,
      moveHistory,
      historyIndex,
      isPencilMode,
      gridSize,
    } = get()

    if (!selectedCell || !currentGrid || !solution || !initialGrid) {
      return
    }

    const { row, col } = selectedCell

    // Can't modify initial cells
    if (initialGrid[row][col] !== null) {
      return
    }

    // Handle pencil mode
    if (isPencilMode) {
      get().addPencilMark(value)
      return
    }

    // Validate move
    if (!isValidMove(currentGrid, row, col, value)) {
      // Invalid move - show error if feedback is enabled
      if (get().showErrorFeedback) {
        const errorCells = new Set<string>()
        errorCells.add(cellKey(row, col))
        set({ errorCells })

        // Clear error after animation
        setTimeout(() => {
          set({ errorCells: new Set() })
        }, 300)
      }

      set((state) => ({ mistakes: state.mistakes + 1 }))
      return
    }

    // Make the move
    const newGrid = cloneGrid(currentGrid)
    const previousValue = newGrid[row][col]
    newGrid[row][col] = value

    // Add to history (remove any future history)
    const moveTimestamp = Date.now()
    const newMove: Move = {
      row,
      col,
      value,
      timestamp: moveTimestamp,
    }

    const newHistory = moveHistory.slice(0, historyIndex + 1)
    newHistory.push(newMove)

    // Clear pencil marks for this cell
    const newPencilMarks = new Map(get().pencilMarks)
    newPencilMarks.delete(cellKey(row, col))

    // Auto-clean pencil marks from related cells if enabled
    if (get().autoCleanPencilMarks) {
      const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3
      const boxColSize = gridSize === 6 ? 3 : boxSize
      const boxRow = Math.floor(row / boxSize) * boxSize
      const boxCol = Math.floor(col / boxColSize) * boxColSize

      // Clean from same row, column, and box
      for (let i = 0; i < gridSize; i++) {
        // Clean from same row
        const rowKey = cellKey(row, i)
        const rowMarks = newPencilMarks.get(rowKey)
        if (rowMarks && rowMarks.has(value)) {
          rowMarks.delete(value)
          if (rowMarks.size === 0) {
            newPencilMarks.delete(rowKey)
          }
        }

        // Clean from same column
        const colKey = cellKey(i, col)
        const colMarks = newPencilMarks.get(colKey)
        if (colMarks && colMarks.has(value)) {
          colMarks.delete(value)
          if (colMarks.size === 0) {
            newPencilMarks.delete(colKey)
          }
        }
      }

      // Clean from same box
      for (let r = boxRow; r < boxRow + boxSize; r++) {
        for (let c = boxCol; c < boxCol + boxColSize; c++) {
          const boxKey = cellKey(r, c)
          const boxMarks = newPencilMarks.get(boxKey)
          if (boxMarks && boxMarks.has(value)) {
            boxMarks.delete(value)
            if (boxMarks.size === 0) {
              newPencilMarks.delete(boxKey)
            }
          }
        }
      }
    }

    // Update state immediately for responsive UI
    // Also dismiss any active hint when a move is made
    set({
      currentGrid: newGrid,
      moveHistory: newHistory,
      historyIndex: newHistory.length - 1,
      pencilMarks: newPencilMarks,
      // Clear hints on move
      hintCell: null,
      hintStrategy: null,
      showHint: false,
      highlightedCells: new Set(),
    })

    // Check if puzzle is complete
    const isComplete = checkCompletion(newGrid, solution)
    if (isComplete) {
      set({
        isComplete: true,
        endTime: Date.now(),
      })
    }

    // Run ML prediction asynchronously in the background
    const predictStrategy = async () => {
      try {
        // Calculate time since last move
        const timeSinceLastMove =
          moveHistory.length > 0 ? moveTimestamp - moveHistory[moveHistory.length - 1].timestamp : 0

        // Extract recent moves (last 5)
        const recentMoves = moveHistory.slice(-5).map((m) => ({ row: m.row, col: m.col }))

        // Get previous strategies (last 5)
        const previousStrategies = Array.from(get().strategiesUsed.keys()).slice(-5)

        // Extract features for ML model
        const features = extractFeatures(currentGrid, row, col, value, {
          timeSinceLastMove,
          recentMoves,
          errorCount: get().mistakes,
          previousStrategies,
        })

        // Run async ML prediction
        const prediction = await mockPredict(features)

        // Convert ML prediction to StrategyResult format
        const strategy: StrategyResult = {
          strategy: prediction.strategy as Strategy,
          confidence: prediction.confidence,
          explanation: `Strategy detected: ${prediction.strategy} (${Math.round(prediction.confidence * 100)}% confidence)`,
        }

        // Update strategies used counter
        const currentStrategiesUsed = get().strategiesUsed
        const newStrategiesUsed = new Map(currentStrategiesUsed)
        const count = newStrategiesUsed.get(strategy.strategy) || 0
        newStrategiesUsed.set(strategy.strategy, count + 1)

        // Update state with ML results
        set({
          lastStrategy: strategy,
          showFeedback: strategy.confidence > 0.7, // Show feedback for confident detections
          strategiesUsed: newStrategiesUsed,
        })
      } catch (error) {
        console.error('ML prediction failed:', error)
        // Fallback to rule-based detection on error
        const strategy = detectStrategy(currentGrid, row, col, value)
        const newStrategiesUsed = new Map(get().strategiesUsed)
        const count = newStrategiesUsed.get(strategy.strategy) || 0
        newStrategiesUsed.set(strategy.strategy, count + 1)

        set({
          lastStrategy: strategy,
          showFeedback: strategy.confidence > 0.7,
          strategiesUsed: newStrategiesUsed,
        })
      }
    }

    // Fire and forget - don't block UI
    predictStrategy()
  },

  // Clear the selected cell
  clearCell: () => {
    const { selectedCell, currentGrid, initialGrid, moveHistory, historyIndex } = get()

    if (!selectedCell || !currentGrid || !initialGrid) {
      return
    }

    const { row, col } = selectedCell

    // Can't clear initial cells
    if (initialGrid[row][col] !== null) {
      return
    }

    const newGrid = cloneGrid(currentGrid)
    newGrid[row][col] = null

    const newMove: Move = {
      row,
      col,
      value: 0, // 0 indicates clearing
      timestamp: Date.now(),
    }

    const newHistory = moveHistory.slice(0, historyIndex + 1)
    newHistory.push(newMove)

    set({
      currentGrid: newGrid,
      moveHistory: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  // Undo last move
  undo: () => {
    const { moveHistory, historyIndex, initialGrid } = get()

    if (historyIndex < 0 || !initialGrid) {
      return
    }

    const newGrid = cloneGrid(initialGrid)

    // Replay moves up to historyIndex - 1
    for (let i = 0; i < historyIndex; i++) {
      const move = moveHistory[i]
      newGrid[move.row][move.col] = move.value === 0 ? null : move.value
    }

    set({
      currentGrid: newGrid,
      historyIndex: historyIndex - 1,
      isComplete: false,
    })
  },

  // Redo next move
  redo: () => {
    const { moveHistory, historyIndex, currentGrid } = get()

    if (historyIndex >= moveHistory.length - 1 || !currentGrid) {
      return
    }

    const nextMove = moveHistory[historyIndex + 1]
    const newGrid = cloneGrid(currentGrid)
    newGrid[nextMove.row][nextMove.col] = nextMove.value === 0 ? null : nextMove.value

    set({
      currentGrid: newGrid,
      historyIndex: historyIndex + 1,
    })
  },

  // Toggle pencil mode
  togglePencilMode: () => {
    set((state) => ({ isPencilMode: !state.isPencilMode }))
  },

  // Add pencil mark to selected cell
  addPencilMark: (value: number) => {
    const { selectedCell, pencilMarks, currentGrid } = get()

    if (!selectedCell || !currentGrid) {
      return
    }

    const { row, col } = selectedCell

    // Can't add pencil marks to filled cells
    if (currentGrid[row][col] !== null) {
      return
    }

    const key = cellKey(row, col)
    const newPencilMarks = new Map(pencilMarks)

    if (!newPencilMarks.has(key)) {
      newPencilMarks.set(key, new Set())
    }

    const marks = newPencilMarks.get(key)!
    if (marks.has(value)) {
      marks.delete(value)
    } else {
      marks.add(value)
    }

    set({ pencilMarks: newPencilMarks })
  },

  // Remove pencil mark
  removePencilMark: (value: number) => {
    const { selectedCell, pencilMarks } = get()

    if (!selectedCell) {
      return
    }

    const key = cellKey(selectedCell.row, selectedCell.col)
    const newPencilMarks = new Map(pencilMarks)

    if (newPencilMarks.has(key)) {
      newPencilMarks.get(key)!.delete(value)
    }

    set({ pencilMarks: newPencilMarks })
  },

  // Clear all pencil marks for selected cell
  clearPencilMarks: () => {
    const { selectedCell, pencilMarks } = get()

    if (!selectedCell) {
      return
    }

    const key = cellKey(selectedCell.row, selectedCell.col)
    const newPencilMarks = new Map(pencilMarks)
    newPencilMarks.delete(key)

    set({ pencilMarks: newPencilMarks })
  },

  // Use a hint - find a truly solvable cell (naked single or hidden single only)
  useHint: () => {
    const { solution, currentGrid, gridSize } = get()

    if (!solution || !currentGrid) {
      return
    }

    let targetCell: { row: number; col: number; value: number } | null = null
    let strategy: StrategyResult | null = null

    // STEP 1: Look for naked singles (cells with exactly 1 candidate)
    for (let row = 0; row < gridSize && !targetCell; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (currentGrid[row][col] !== null) continue

        const candidates = getCandidates(currentGrid, row, col)
        if (candidates.length === 1) {
          const value = candidates[0]
          targetCell = { row, col, value }
          strategy = {
            strategy: 'single_candidate',
            confidence: 1.0,
            explanation: `This cell can only be ${value}. All other numbers are already used in its row, column, or box.`,
            affectedCells: getRelatedCellsForHint(gridSize, row, col),
          }
          break
        }
      }
    }

    // STEP 2: If no naked singles, look for hidden singles
    if (!targetCell) {
      // Check each empty cell for hidden singles
      for (let row = 0; row < gridSize && !targetCell; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (currentGrid[row][col] !== null) continue

          const candidates = getCandidates(currentGrid, row, col)

          for (const value of candidates) {
            // Check if this value can only go in this cell within its row
            let uniqueInRow = true
            for (let c = 0; c < gridSize; c++) {
              if (c !== col && currentGrid[row][c] === null) {
                const otherCandidates = getCandidates(currentGrid, row, c)
                if (otherCandidates.includes(value)) {
                  uniqueInRow = false
                  break
                }
              }
            }
            if (uniqueInRow) {
              targetCell = { row, col, value }
              strategy = {
                strategy: 'hidden_single',
                confidence: 1.0,
                explanation: `${value} can only go in this cell within its row.`,
                affectedCells: getRowCellsForHint(gridSize, row, col),
              }
              break
            }

            // Check if this value can only go in this cell within its column
            let uniqueInCol = true
            for (let r = 0; r < gridSize; r++) {
              if (r !== row && currentGrid[r][col] === null) {
                const otherCandidates = getCandidates(currentGrid, r, col)
                if (otherCandidates.includes(value)) {
                  uniqueInCol = false
                  break
                }
              }
            }
            if (uniqueInCol) {
              targetCell = { row, col, value }
              strategy = {
                strategy: 'hidden_single',
                confidence: 1.0,
                explanation: `${value} can only go in this cell within its column.`,
                affectedCells: getColCellsForHint(gridSize, row, col),
              }
              break
            }

            // Check if this value can only go in this cell within its box
            const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3
            const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3
            const boxStartRow = Math.floor(row / boxHeight) * boxHeight
            const boxStartCol = Math.floor(col / boxWidth) * boxWidth

            let uniqueInBox = true
            for (let r = boxStartRow; r < boxStartRow + boxHeight && uniqueInBox; r++) {
              for (let c = boxStartCol; c < boxStartCol + boxWidth; c++) {
                if ((r !== row || c !== col) && currentGrid[r][c] === null) {
                  const otherCandidates = getCandidates(currentGrid, r, c)
                  if (otherCandidates.includes(value)) {
                    uniqueInBox = false
                    break
                  }
                }
              }
            }
            if (uniqueInBox) {
              targetCell = { row, col, value }
              strategy = {
                strategy: 'hidden_single',
                confidence: 1.0,
                explanation: `${value} can only go in this cell within its box.`,
                affectedCells: getBoxCellsForHint(gridSize, row, col),
              }
              break
            }
          }
          if (targetCell) break
        }
      }
    }

    // STEP 3: Look for naked pairs that lead to singles (for Sammy!)
    if (!targetCell) {
      const boxHeight = gridSize === 6 ? 2 : gridSize === 4 ? 2 : 3
      const boxWidth = gridSize === 6 ? 3 : gridSize === 4 ? 2 : 3

      // Helper to find naked pairs in a unit and check if they create singles
      const findPairLeadingToSingle = (
        unitCells: Array<{ row: number; col: number }>
      ): {
        targetCell: { row: number; col: number; value: number }
        pairCells: Array<{ row: number; col: number }>
        pairValues: [number, number]
      } | null => {
        // Get empty cells with their candidates
        const emptyCells = unitCells
          .filter((c) => currentGrid[c.row][c.col] === null)
          .map((c) => ({
            ...c,
            candidates: getCandidates(currentGrid, c.row, c.col),
          }))

        // Find cells with exactly 2 candidates
        const pairCandidateCells = emptyCells.filter((c) => c.candidates.length === 2)

        // Look for naked pairs (two cells with same two candidates)
        for (let i = 0; i < pairCandidateCells.length; i++) {
          for (let j = i + 1; j < pairCandidateCells.length; j++) {
            const cell1 = pairCandidateCells[i]
            const cell2 = pairCandidateCells[j]

            // Check if they have the same candidates
            if (
              cell1.candidates[0] === cell2.candidates[0] &&
              cell1.candidates[1] === cell2.candidates[1]
            ) {
              const pairValues: [number, number] = [cell1.candidates[0], cell2.candidates[1]]

              // Check if removing these values from other cells creates a single
              for (const otherCell of emptyCells) {
                if (
                  (otherCell.row === cell1.row && otherCell.col === cell1.col) ||
                  (otherCell.row === cell2.row && otherCell.col === cell2.col)
                ) {
                  continue
                }

                // Simulate removing pair values
                const remainingCandidates = otherCell.candidates.filter(
                  (c) => !pairValues.includes(c)
                )

                // If only one candidate remains, we found a solvable cell!
                if (remainingCandidates.length === 1) {
                  return {
                    targetCell: {
                      row: otherCell.row,
                      col: otherCell.col,
                      value: remainingCandidates[0],
                    },
                    pairCells: [
                      { row: cell1.row, col: cell1.col },
                      { row: cell2.row, col: cell2.col },
                    ],
                    pairValues,
                  }
                }
              }
            }
          }
        }
        return null
      }

      // Check rows for pairs
      for (let row = 0; row < gridSize && !targetCell; row++) {
        const rowCells = Array.from({ length: gridSize }, (_, col) => ({ row, col }))
        const result = findPairLeadingToSingle(rowCells)
        if (result) {
          targetCell = result.targetCell
          strategy = {
            strategy: 'naked_pair',
            confidence: 1.0,
            explanation: `The yellow cells can only be ${result.pairValues[0]} or ${result.pairValues[1]}. So the green cell must be ${result.targetCell.value}!`,
            affectedCells: result.pairCells,
          }
        }
      }

      // Check columns for pairs
      for (let col = 0; col < gridSize && !targetCell; col++) {
        const colCells = Array.from({ length: gridSize }, (_, row) => ({ row, col }))
        const result = findPairLeadingToSingle(colCells)
        if (result) {
          targetCell = result.targetCell
          strategy = {
            strategy: 'naked_pair',
            confidence: 1.0,
            explanation: `The yellow cells can only be ${result.pairValues[0]} or ${result.pairValues[1]}. So the green cell must be ${result.targetCell.value}!`,
            affectedCells: result.pairCells,
          }
        }
      }

      // Check boxes for pairs
      for (let boxRow = 0; boxRow < gridSize / boxHeight && !targetCell; boxRow++) {
        for (let boxCol = 0; boxCol < gridSize / boxWidth && !targetCell; boxCol++) {
          const boxCells: Array<{ row: number; col: number }> = []
          for (let r = 0; r < boxHeight; r++) {
            for (let c = 0; c < boxWidth; c++) {
              boxCells.push({
                row: boxRow * boxHeight + r,
                col: boxCol * boxWidth + c,
              })
            }
          }
          const result = findPairLeadingToSingle(boxCells)
          if (result) {
            targetCell = result.targetCell
            strategy = {
              strategy: 'naked_pair',
              confidence: 1.0,
              explanation: `The yellow cells can only be ${result.pairValues[0]} or ${result.pairValues[1]}. So the green cell must be ${result.targetCell.value}!`,
              affectedCells: result.pairCells,
            }
          }
        }
      }
    }

    // STEP 4: If no solvable cell found, inform user
    if (!targetCell || !strategy) {
      // No directly solvable cells - this puzzle needs advanced strategies
      set({
        hintCell: null,
        hintStrategy: {
          strategy: 'advanced',
          confidence: 0,
          explanation: 'This puzzle needs more advanced strategies. Try using pencil marks to track possibilities!',
        },
        showHint: true,
      })
      return
    }

    // Enable all helper lights to assist with the hint (teaching mode)
    set({
      showRowHighlight: true,
      showColumnHighlight: true,
      showBoxHighlight: true,
    })

    // Set the hint to display (don't fill it in automatically - teach, don't solve!)
    // Note: We store the value internally for validation but HintDisplay won't show it
    set({
      hintCell: { row: targetCell.row, col: targetCell.col, value: targetCell.value },
      hintStrategy: strategy,
      showHint: true,
      hintsUsed: get().hintsUsed + 1,
      selectedCell: { row: targetCell.row, col: targetCell.col },
    })

    // Highlight the row, column, and box for the hint cell
    const highlighted = new Set<string>()
    const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3
    const boxColSize = gridSize === 6 ? 3 : boxSize
    const boxRow = Math.floor(targetCell.row / boxSize) * boxSize
    const boxCol = Math.floor(targetCell.col / boxColSize) * boxColSize

    // Add row cells
    for (let c = 0; c < gridSize; c++) {
      highlighted.add(cellKey(targetCell.row, c))
    }

    // Add column cells
    for (let r = 0; r < gridSize; r++) {
      highlighted.add(cellKey(r, targetCell.col))
    }

    // Add box cells
    for (let r = boxRow; r < boxRow + boxSize; r++) {
      for (let c = boxCol; c < boxCol + boxColSize; c++) {
        highlighted.add(cellKey(r, c))
      }
    }

    set({ highlightedCells: highlighted })
  },

  // Dismiss hint
  dismissHint: () => {
    set({
      hintCell: null,
      hintStrategy: null,
      showHint: false,
      highlightedCells: new Set(),
    })
  },

  // Reset to initial state
  resetGame: () => {
    const { initialGrid } = get()

    if (!initialGrid) {
      return
    }

    set({
      currentGrid: cloneGrid(initialGrid),
      selectedCell: null,
      moveHistory: [],
      historyIndex: -1,
      hintsUsed: 0,
      mistakes: 0,
      isComplete: false,
      startTime: Date.now(),
      endTime: null,
      pencilMarks: new Map(),
      isPencilMode: false,
      highlightedCells: new Set(),
      errorCells: new Set(),
      lastStrategy: null,
      showFeedback: false,
      strategiesUsed: new Map(),
      hintCell: null,
      hintStrategy: null,
      showHint: false,
    })
  },

  // Dismiss feedback
  dismissFeedback: () => {
    set({ showFeedback: false })
  },

  // Toggle row highlighting
  toggleRowHighlight: () => {
    set((state) => ({ showRowHighlight: !state.showRowHighlight }))
    // Re-highlight selected cell with new preferences
    const { selectedCell } = get()
    if (selectedCell) {
      get().selectCell(selectedCell.row, selectedCell.col)
    }
  },

  // Toggle column highlighting
  toggleColumnHighlight: () => {
    set((state) => ({ showColumnHighlight: !state.showColumnHighlight }))
    // Re-highlight selected cell with new preferences
    const { selectedCell } = get()
    if (selectedCell) {
      get().selectCell(selectedCell.row, selectedCell.col)
    }
  },

  // Toggle box highlighting
  toggleBoxHighlight: () => {
    set((state) => ({ showBoxHighlight: !state.showBoxHighlight }))
    // Re-highlight selected cell with new preferences
    const { selectedCell } = get()
    if (selectedCell) {
      get().selectCell(selectedCell.row, selectedCell.col)
    }
  },

  // Apply highlight preset based on difficulty
  applyHighlightPreset: (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'beginner':
        set({ showRowHighlight: true, showColumnHighlight: true, showBoxHighlight: true })
        break
      case 'easy':
        set({ showRowHighlight: true, showColumnHighlight: true, showBoxHighlight: false })
        break
      case 'medium':
        set({ showRowHighlight: true, showColumnHighlight: false, showBoxHighlight: false })
        break
      case 'hard':
      case 'expert':
        set({ showRowHighlight: false, showColumnHighlight: false, showBoxHighlight: false })
        break
    }
    // Re-highlight selected cell with new preferences
    const { selectedCell } = get()
    if (selectedCell) {
      get().selectCell(selectedCell.row, selectedCell.col)
    }
  },

  // Toggle error feedback
  toggleErrorFeedback: () => {
    set((state) => ({ showErrorFeedback: !state.showErrorFeedback }))
  },

  // Toggle auto-clean pencil marks
  toggleAutoCleanPencilMarks: () => {
    set((state) => ({ autoCleanPencilMarks: !state.autoCleanPencilMarks }))
  },
}))

// Helper function to check if puzzle is complete
function checkCompletion(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== solution[r][c]) {
        return false
      }
    }
  }
  return true
}
