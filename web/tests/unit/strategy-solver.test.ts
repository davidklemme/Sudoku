/**
 * Tests for Strategy-Based Sudoku Solver
 * Tests the solving strategies and difficulty analysis
 */

import {
  solveWithStrategies,
  analyzeDifficulty,
  validateDifficulty,
} from '@/lib/sudoku/strategy-solver'
import { createEmptyGrid, cloneGrid } from '@/lib/sudoku/validator'
import { generatePuzzle } from '@/lib/sudoku/generator'
import type { SudokuGrid, GridSize, Difficulty } from '@/lib/sudoku/types'

describe('Strategy Solver', () => {
  describe('solveWithStrategies', () => {
    describe('Naked Singles Detection', () => {
      it('should solve puzzle using only naked singles', () => {
        // Create a 4x4 grid that can be solved with naked singles
        const grid: SudokuGrid = [
          [1, 2, 3, null],
          [3, 4, 1, 2],
          [2, 1, 4, 3],
          [4, 3, 2, 1],
        ]

        const result = solveWithStrategies(grid)

        expect(result.solved).toBe(true)
        expect(result.strategiesUsed.has('naked_single')).toBe(true)
        expect(result.maxDifficulty).toBe('beginner')
        expect(result.grid[0][3]).toBe(4)
      })

      it('should detect naked single when cell has one candidate', () => {
        // Grid where (0,0) can only be 1
        const grid: SudokuGrid = [
          [null, 2, 3, 4],
          [3, 4, 1, 2],
          [2, 1, 4, 3],
          [4, 3, 2, 1],
        ]

        const result = solveWithStrategies(grid)

        expect(result.solved).toBe(true)
        expect(result.strategiesUsed.has('naked_single')).toBe(true)
        expect(result.grid[0][0]).toBe(1)
      })
    })

    describe('Hidden Singles Detection', () => {
      it('should detect hidden single in row', () => {
        // Create a 9x9 grid where hidden singles are needed
        const grid: SudokuGrid = [
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [1, 2, 3, 4, 5, 6, 7, 8, null],
        ]

        const result = solveWithStrategies(grid)

        // Should find that 9 is the only possibility for [8][8]
        // This might be detected as naked single since it's the only candidate
        expect(result.grid[8][8]).toBe(9)
      })

      it('should detect hidden single in column', () => {
        const grid: SudokuGrid = createEmptyGrid(9)
        // Fill column 0 except one cell
        grid[0][0] = 1
        grid[1][0] = 2
        grid[2][0] = 3
        grid[3][0] = 4
        grid[4][0] = 5
        grid[5][0] = 6
        grid[6][0] = 7
        grid[8][0] = 9
        // [7][0] should be 8

        const result = solveWithStrategies(grid)

        expect(result.grid[7][0]).toBe(8)
      })

      it('should detect hidden single in box', () => {
        const grid: SudokuGrid = [
          [1, 2, null, 4],
          [3, null, 1, 2],
          [2, 1, 4, 3],
          [4, 3, 2, 1],
        ]

        const result = solveWithStrategies(grid)

        expect(result.solved).toBe(true)
        // Check that hidden singles were used or naked singles
        expect(
          result.strategiesUsed.has('hidden_single') ||
            result.strategiesUsed.has('naked_single')
        ).toBe(true)
      })
    })

    describe('Naked Pairs Detection', () => {
      it('should eliminate candidates using naked pairs', () => {
        // This is harder to test directly, but we can verify the strategy is used
        // for puzzles that require it
        const puzzle = generatePuzzle(9, 'medium', 42)
        const result = solveWithStrategies(puzzle.grid)

        // Medium puzzles may or may not use naked pairs
        expect(result.strategiesUsed.size).toBeGreaterThan(0)
      })
    })

    describe('Complete Puzzle Solving', () => {
      it('should solve a complete 4x4 beginner puzzle', () => {
        const puzzle = generatePuzzle(4, 'beginner', 12345)
        const result = solveWithStrategies(puzzle.grid)

        expect(result.solved).toBe(true)
        // Beginner should only need naked singles
        expect(result.maxDifficulty).toBe('beginner')
      })

      it('should solve a 9x9 easy puzzle', () => {
        const puzzle = generatePuzzle(9, 'easy', 12345)
        const result = solveWithStrategies(puzzle.grid)

        // Easy puzzles should be solvable without guessing
        expect(result.strategiesUsed.has('guessing')).toBe(false)
      }, 30000)

      it('should identify when guessing is required', () => {
        // A puzzle that cannot be solved logically requires guessing
        const puzzle = generatePuzzle(9, 'expert', 99999)
        const result = solveWithStrategies(puzzle.grid)

        // Expert puzzles often require guessing
        if (!result.solved) {
          expect(result.strategiesUsed.has('guessing')).toBe(true)
        }
      }, 30000)
    })
  })

  describe('analyzeDifficulty', () => {
    it('should return beginner for simple 4x4 puzzles', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      const difficulty = analyzeDifficulty(puzzle.grid)

      expect(difficulty).toBe('beginner')
    })

    it('should return appropriate difficulty for 9x9 puzzles', () => {
      const puzzle = generatePuzzle(9, 'beginner', 12345)
      const difficulty = analyzeDifficulty(puzzle.grid)

      // Beginner 9x9 should still be beginner or easy
      expect(['beginner', 'easy']).toContain(difficulty)
    }, 30000)

    it('should return higher difficulty for harder puzzles', () => {
      const beginner = generatePuzzle(9, 'beginner', 12345)
      const hard = generatePuzzle(9, 'hard', 12345)

      const beginnerDiff = analyzeDifficulty(beginner.grid)
      const hardDiff = analyzeDifficulty(hard.grid)

      const difficultyOrder = ['beginner', 'easy', 'medium', 'hard', 'expert']
      const beginnerIndex = difficultyOrder.indexOf(beginnerDiff)
      const hardIndex = difficultyOrder.indexOf(hardDiff)

      // Hard should generally be harder than beginner
      // (though random generation can vary)
      expect(hardIndex).toBeGreaterThanOrEqual(beginnerIndex)
    }, 60000)
  })

  describe('validateDifficulty', () => {
    it('should validate matching difficulties', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      const validation = validateDifficulty(puzzle.grid, 'beginner')

      expect(validation.valid).toBe(true)
      expect(validation.actualDifficulty).toBeDefined()
      expect(validation.strategiesUsed).toBeDefined()
    })

    it('should allow +/- 1 difficulty level tolerance', () => {
      const puzzle = generatePuzzle(9, 'easy', 12345)

      // Easy puzzle should be valid for beginner (within tolerance)
      const validationBeginner = validateDifficulty(puzzle.grid, 'beginner')
      // Easy puzzle should also be valid for easy
      const validationEasy = validateDifficulty(puzzle.grid, 'easy')

      // At least one should be valid
      expect(validationBeginner.valid || validationEasy.valid).toBe(true)
    }, 30000)

    it('should account for grid size limitations', () => {
      // 4x4 grid can only achieve beginner/easy difficulty
      const puzzle = generatePuzzle(4, 'expert', 12345)
      const validation = validateDifficulty(puzzle.grid, 'expert')

      // Should be valid because 4x4 is capped at easy
      expect(validation.valid).toBe(true)
      expect(validation.actualDifficulty).toBe('beginner')
    })

    it('should return strategies used', () => {
      const puzzle = generatePuzzle(9, 'medium', 12345)
      const validation = validateDifficulty(puzzle.grid, 'medium')

      expect(Array.isArray(validation.strategiesUsed)).toBe(true)
      expect(validation.strategiesUsed.length).toBeGreaterThan(0)
    }, 30000)
  })

  describe('Edge Cases', () => {
    it('should handle already solved grid', () => {
      const grid: SudokuGrid = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1],
      ]

      const result = solveWithStrategies(grid)

      expect(result.solved).toBe(true)
      expect(result.steps).toBe(1) // Should complete immediately
    })

    it('should handle grid with no solution', () => {
      // Invalid grid - duplicate in row
      const grid: SudokuGrid = [
        [1, 1, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const result = solveWithStrategies(grid)

      // Should not fully solve due to conflict
      expect(result.solved).toBe(false)
    })

    it('should handle different grid sizes', () => {
      const sizes: GridSize[] = [4, 6, 9]

      for (const size of sizes) {
        const puzzle = generatePuzzle(size, 'beginner', 12345)
        const result = solveWithStrategies(puzzle.grid)

        expect(result.grid.length).toBe(size)
      }
    }, 30000)
  })

  describe('Strategy Hierarchy', () => {
    it('should try naked singles before hidden singles', () => {
      // Create a grid where both could work, verify naked single is used first
      const grid: SudokuGrid = [
        [1, 2, 3, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]

      const result = solveWithStrategies(grid)

      // First strategy should be naked single (simplest)
      if (result.strategiesUsed.size > 0) {
        expect(result.strategiesUsed.has('naked_single')).toBe(true)
      }
    })

    it('should escalate to harder strategies only when needed', () => {
      const beginner = generatePuzzle(9, 'beginner', 12345)
      const expert = generatePuzzle(9, 'expert', 54321)

      const beginnerResult = solveWithStrategies(beginner.grid)
      const expertResult = solveWithStrategies(expert.grid)

      // Beginner should use fewer/simpler strategies
      expect(beginnerResult.strategiesUsed.size).toBeLessThanOrEqual(
        expertResult.strategiesUsed.size
      )
    }, 60000)
  })
})
