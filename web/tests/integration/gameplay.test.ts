/**
 * Integration Tests for Sudoku Gameplay
 * Tests the complete game flow from puzzle generation to completion
 */

import { generatePuzzle } from '@/lib/sudoku/generator'
import { solve, getSolution } from '@/lib/sudoku/solver'
import { isValidMove, isGridSolved, cloneGrid, getCandidates } from '@/lib/sudoku/validator'
import { solveWithStrategies, analyzeDifficulty } from '@/lib/sudoku/strategy-solver'
import type { SudokuGrid, GridSize, Difficulty } from '@/lib/sudoku/types'

describe('Gameplay Integration', () => {
  describe('Complete Game Flow', () => {
    it('should generate puzzle, allow valid moves, and detect completion', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)

      // Find an empty cell
      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 4 && emptyRow < 0; r++) {
        for (let c = 0; c < 4; c++) {
          if (puzzle.grid[r][c] === null) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
      }

      // Get the correct value from solution
      const correctValue = puzzle.solution[emptyRow][emptyCol]

      // Verify move is valid
      expect(isValidMove(puzzle.grid, emptyRow, emptyCol, correctValue!)).toBe(true)

      // Make the move
      const workingGrid = cloneGrid(puzzle.grid)
      workingGrid[emptyRow][emptyCol] = correctValue

      // Grid should still be valid
      expect(isValidMove(workingGrid, emptyRow, emptyCol, correctValue!)).toBe(true)
    })

    it('should complete puzzle when all correct moves are made', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      const workingGrid = cloneGrid(puzzle.grid)

      // Fill in all empty cells with solution values
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (workingGrid[r][c] === null) {
            workingGrid[r][c] = puzzle.solution[r][c]
          }
        }
      }

      // Grid should be solved
      expect(isGridSolved(workingGrid)).toBe(true)
    })

    it('should detect invalid moves', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)

      // Find an empty cell
      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 4 && emptyRow < 0; r++) {
        for (let c = 0; c < 4; c++) {
          if (puzzle.grid[r][c] === null) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
      }

      // Find a value that's already in the same row
      let invalidValue = -1
      for (let c = 0; c < 4; c++) {
        if (puzzle.grid[emptyRow][c] !== null) {
          invalidValue = puzzle.grid[emptyRow][c]!
          break
        }
      }

      if (invalidValue > 0) {
        // This move should be invalid (duplicate in row)
        expect(isValidMove(puzzle.grid, emptyRow, emptyCol, invalidValue)).toBe(false)
      }
    })
  })

  describe('Hint System Integration', () => {
    it('should provide solvable hints for beginner puzzles', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)

      // Use strategy solver to find a solvable cell
      const result = solveWithStrategies(puzzle.grid)

      // Beginner should be fully solvable without guessing
      expect(result.solved).toBe(true)
      expect(result.strategiesUsed.has('guessing')).toBe(false)
    })

    it('should find naked singles for hints', () => {
      // Create a grid with an obvious naked single
      const grid: SudokuGrid = [
        [1, 2, 3, null],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1],
      ]

      // Cell (0,3) can only be 4
      const candidates = getCandidates(grid, 0, 3)
      expect(candidates).toEqual([4])
    })

    it('should find hidden singles for hints', () => {
      // Create a grid where hidden single applies
      const grid: SudokuGrid = createEmptyGrid(9)
      // Fill row 8 except last cell
      grid[8][0] = 1
      grid[8][1] = 2
      grid[8][2] = 3
      grid[8][3] = 4
      grid[8][4] = 5
      grid[8][5] = 6
      grid[8][6] = 7
      grid[8][7] = 8
      // [8][8] can only be 9

      const result = solveWithStrategies(grid)
      expect(result.grid[8][8]).toBe(9)
    })
  })

  describe('Difficulty Progression', () => {
    const difficulties: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

    it('should increase challenge with difficulty level for 9x9', () => {
      const results: Array<{ difficulty: Difficulty; strategies: number; clues: number }> = []

      for (const diff of difficulties) {
        const puzzle = generatePuzzle(9, diff, 12345)

        // Count clues
        let clues = 0
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (puzzle.grid[r][c] !== null) clues++
          }
        }

        const analysis = solveWithStrategies(puzzle.grid)

        results.push({
          difficulty: diff,
          strategies: analysis.strategiesUsed.size,
          clues,
        })
      }

      // Easier difficulties should have more clues
      expect(results[0].clues).toBeGreaterThan(results[4].clues)

      // Harder difficulties may use more strategies
      // (though this can vary based on puzzle generation)
    }, 120000)

    it('should handle grid size appropriate difficulties', () => {
      // 4x4 should work well with beginner/easy
      const small = generatePuzzle(4, 'beginner', 12345)
      const smallAnalysis = analyzeDifficulty(small.grid)
      expect(['beginner', 'easy']).toContain(smallAnalysis)

      // 9x9 expert should be significantly harder
      const large = generatePuzzle(9, 'expert', 12345)
      const largeAnalysis = analyzeDifficulty(large.grid)
      expect(['medium', 'hard', 'expert']).toContain(largeAnalysis)
    }, 60000)
  })

  describe('Undo/Redo Simulation', () => {
    it('should allow reversing and reapplying moves', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      const moveHistory: Array<{
        row: number
        col: number
        oldValue: number | null
        newValue: number
      }> = []

      // Find an empty cell and make a move
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (puzzle.grid[r][c] === null) {
            const correctValue = puzzle.solution[r][c]!
            moveHistory.push({
              row: r,
              col: c,
              oldValue: null,
              newValue: correctValue,
            })
            puzzle.grid[r][c] = correctValue
            break
          }
        }
        if (moveHistory.length > 0) break
      }

      // Verify move was made
      const move = moveHistory[0]
      expect(puzzle.grid[move.row][move.col]).toBe(move.newValue)

      // Undo the move
      puzzle.grid[move.row][move.col] = move.oldValue

      // Verify undo worked
      expect(puzzle.grid[move.row][move.col]).toBe(null)

      // Redo the move
      puzzle.grid[move.row][move.col] = move.newValue

      // Verify redo worked
      expect(puzzle.grid[move.row][move.col]).toBe(move.newValue)
    })
  })

  describe('Pencil Marks Integration', () => {
    it('should correctly identify candidates for pencil marks', () => {
      const puzzle = generatePuzzle(9, 'medium', 12345)

      // For each empty cell, candidates should be correct
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle.grid[r][c] === null) {
            const candidates = getCandidates(puzzle.grid, r, c)

            // The solution value should be in candidates
            const solutionValue = puzzle.solution[r][c]
            expect(candidates).toContain(solutionValue)

            // All candidates should be valid moves
            for (const candidate of candidates) {
              expect(isValidMove(puzzle.grid, r, c, candidate)).toBe(true)
            }
          }
        }
      }
    }, 30000)

    it('should update candidates when move is made', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      const grid = cloneGrid(puzzle.grid)

      // Find an empty cell
      let targetRow = -1
      let targetCol = -1
      for (let r = 0; r < 4 && targetRow < 0; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === null) {
            targetRow = r
            targetCol = c
            break
          }
        }
      }

      // Get candidates before move
      const candidatesBefore = getCandidates(grid, targetRow, targetCol)

      // Make a move in the same row
      let moveCol = -1
      for (let c = 0; c < 4; c++) {
        if (c !== targetCol && grid[targetRow][c] === null) {
          moveCol = c
          break
        }
      }

      if (moveCol >= 0) {
        const valueToPlace = candidatesBefore[0]
        grid[targetRow][moveCol] = valueToPlace

        // Candidates should update (value should be removed)
        const candidatesAfter = getCandidates(grid, targetRow, targetCol)
        expect(candidatesAfter).not.toContain(valueToPlace)
      }
    })
  })

  describe('Complete Solve Verification', () => {
    it('should verify solution matches solved grid', () => {
      const puzzle = generatePuzzle(9, 'medium', 12345)

      // Solve using our solver
      const solvedGrid = cloneGrid(puzzle.grid)
      const solved = solve(solvedGrid)

      expect(solved).toBe(true)

      // Compare with stored solution
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          expect(solvedGrid[r][c]).toBe(puzzle.solution[r][c])
        }
      }
    }, 30000)

    it('should verify strategy solver reaches same solution', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)

      const result = solveWithStrategies(puzzle.grid)

      if (result.solved) {
        // Compare with stored solution
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            expect(result.grid[r][c]).toBe(puzzle.solution[r][c])
          }
        }
      }
    })
  })
})

// Helper function
function createEmptyGrid(size: GridSize): SudokuGrid {
  return Array.from({ length: size }, () => Array(size).fill(null))
}
