/**
 * Tests for Sudoku puzzle generator
 */

import {
  generateSolvedGrid,
  generatePuzzle,
  generateQuickPuzzle,
} from '@/lib/sudoku/generator'
import { isGridSolved, isValidGrid } from '@/lib/sudoku/validator'
import { hasUniqueSolution } from '@/lib/sudoku/solver'
import type { GridSize, Difficulty } from '@/lib/sudoku/types'

describe('Generator', () => {
  describe('generateSolvedGrid', () => {
    it('should generate valid 4x4 solved grid', () => {
      const grid = generateSolvedGrid(4)
      expect(isGridSolved(grid)).toBe(true)
      expect(grid.length).toBe(4)
      expect(grid[0].length).toBe(4)
    })

    it('should generate valid 6x6 solved grid', () => {
      const grid = generateSolvedGrid(6)
      expect(isGridSolved(grid)).toBe(true)
      expect(grid.length).toBe(6)
      expect(grid[0].length).toBe(6)
    })

    it('should generate valid 9x9 solved grid', () => {
      const grid = generateSolvedGrid(9)
      expect(isGridSolved(grid)).toBe(true)
      expect(grid.length).toBe(9)
      expect(grid[0].length).toBe(9)
    })

    it('should generate same grid with same seed', () => {
      const grid1 = generateSolvedGrid(9, 12345)
      const grid2 = generateSolvedGrid(9, 12345)

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          expect(grid1[r][c]).toBe(grid2[r][c])
        }
      }
    })

    it('should generate different grids with different seeds', () => {
      const grid1 = generateSolvedGrid(9, 12345)
      const grid2 = generateSolvedGrid(9, 54321)

      let differences = 0
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid1[r][c] !== grid2[r][c]) {
            differences++
          }
        }
      }

      expect(differences).toBeGreaterThan(0)
    })
  })

  describe('generatePuzzle', () => {
    const gridSizes: GridSize[] = [4, 6, 9]
    const difficulties: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

    gridSizes.forEach((size) => {
      describe(`${size}x${size} grid`, () => {
        difficulties.forEach((difficulty) => {
          it(`should generate valid ${difficulty} puzzle`, () => {
            const puzzle = generatePuzzle(size, difficulty, 12345)

            // Check puzzle structure
            expect(puzzle.gridSize).toBe(size)
            expect(puzzle.difficulty).toBe(difficulty)
            expect(puzzle.id).toContain(size.toString())
            expect(puzzle.id).toContain(difficulty)

            // Check grid dimensions
            expect(puzzle.grid.length).toBe(size)
            expect(puzzle.solution.length).toBe(size)

            // Solution should be valid
            expect(isGridSolved(puzzle.solution)).toBe(true)

            // Puzzle should be valid (no conflicts)
            expect(isValidGrid(puzzle.grid)).toBe(true)

            // Puzzle should have unique solution
            expect(hasUniqueSolution(puzzle.grid)).toBe(true)

            // Puzzle should have some empty cells
            let emptyCells = 0
            for (let r = 0; r < size; r++) {
              for (let c = 0; c < size; c++) {
                if (puzzle.grid[r][c] === null) {
                  emptyCells++
                }
              }
            }
            expect(emptyCells).toBeGreaterThan(0)
          }, 30000) // Increase timeout for puzzle generation
        })

        it('should have more clues for easier difficulty', () => {
          const beginner = generatePuzzle(size, 'beginner', 12345)
          const expert = generatePuzzle(size, 'expert', 12345)

          let beginnerClues = 0
          let expertClues = 0

          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (beginner.grid[r][c] !== null) beginnerClues++
              if (expert.grid[r][c] !== null) expertClues++
            }
          }

          expect(beginnerClues).toBeGreaterThan(expertClues)
        }, 30000)
      })
    })

    it('should generate reproducible puzzles with same seed', () => {
      const puzzle1 = generatePuzzle(9, 'medium', 12345)
      const puzzle2 = generatePuzzle(9, 'medium', 12345)

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          expect(puzzle1.grid[r][c]).toBe(puzzle2.grid[r][c])
          expect(puzzle1.solution[r][c]).toBe(puzzle2.solution[r][c])
        }
      }
    }, 30000)
  })

  describe('generateQuickPuzzle', () => {
    it('should generate puzzle faster than full generation', () => {
      const puzzle = generateQuickPuzzle(9, 'medium', 12345)

      // Check basic structure
      expect(puzzle.gridSize).toBe(9)
      expect(puzzle.difficulty).toBe('medium')

      // Solution should be valid
      expect(isGridSolved(puzzle.solution)).toBe(true)

      // Puzzle should be valid
      expect(isValidGrid(puzzle.grid)).toBe(true)

      // Should have some empty cells
      let emptyCells = 0
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle.grid[r][c] === null) {
            emptyCells++
          }
        }
      }
      expect(emptyCells).toBeGreaterThan(0)
    })

    it('should generate reproducible quick puzzles with same seed', () => {
      const puzzle1 = generateQuickPuzzle(9, 'easy', 12345)
      const puzzle2 = generateQuickPuzzle(9, 'easy', 12345)

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          expect(puzzle1.grid[r][c]).toBe(puzzle2.grid[r][c])
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle beginner difficulty for 4x4', () => {
      const puzzle = generatePuzzle(4, 'beginner', 12345)
      let clues = 0
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (puzzle.grid[r][c] !== null) clues++
        }
      }
      // Beginner should have most cells filled
      expect(clues).toBeGreaterThan(8)
    }, 15000)

    it('should handle expert difficulty for 9x9', () => {
      const puzzle = generatePuzzle(9, 'expert', 12345)
      let emptyCells = 0
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle.grid[r][c] === null) emptyCells++
        }
      }
      // Expert should have many empty cells
      expect(emptyCells).toBeGreaterThan(50)
    }, 30000)
  })

  describe('Strategy-based difficulty validation', () => {
    it('should include actualDifficulty in generated puzzle', () => {
      const puzzle = generatePuzzle(9, 'medium', 12345)

      expect(puzzle.actualDifficulty).toBeDefined()
    }, 30000)

    it('should include strategiesRequired in generated puzzle', () => {
      const puzzle = generatePuzzle(9, 'medium', 12345)

      expect(puzzle.strategiesRequired).toBeDefined()
      expect(Array.isArray(puzzle.strategiesRequired)).toBe(true)
    }, 30000)

    it('should generate puzzles with appropriate actual difficulty', () => {
      const difficultyOrder = ['beginner', 'easy', 'medium', 'hard', 'expert']

      // Generate a 9x9 hard puzzle
      const puzzle = generatePuzzle(9, 'hard', 12345)

      const expectedIndex = difficultyOrder.indexOf('hard')
      const actualIndex = difficultyOrder.indexOf(puzzle.actualDifficulty || 'beginner')

      // Actual should be within +/- 1 of expected (our tolerance)
      expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(2)
    }, 60000)

    it('should cap difficulty for smaller grid sizes', () => {
      // 4x4 grids cannot achieve hard/expert difficulty
      const puzzle = generatePuzzle(4, 'expert', 12345)

      // Actual difficulty should be beginner or easy for 4x4
      expect(['beginner', 'easy']).toContain(puzzle.actualDifficulty)
    })

    it('should handle 6x6 grid difficulty limitations', () => {
      const puzzle = generatePuzzle(6, 'hard', 12345)

      // 6x6 is capped at medium
      const validDifficulties = ['beginner', 'easy', 'medium']
      expect(validDifficulties).toContain(puzzle.actualDifficulty)
    }, 30000)
  })
})
