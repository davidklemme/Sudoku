'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'

interface GameHeaderProps {
  elapsedTime: string
  compact?: boolean
}

export default function GameHeader({ elapsedTime, compact = false }: GameHeaderProps) {
  const {
    gridSize,
    difficulty,
    startNewGame,
    hintsUsed,
    mistakes,
  } = useGameStore()

  const handleNewGame = (size: typeof gridSize, diff: typeof difficulty) => {
    startNewGame(size, diff, Date.now())
  }

  if (compact) {
    // Mobile header
    return (
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Sudoku
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={gridSize}
            onChange={(e) => handleNewGame(Number(e.target.value) as typeof gridSize, difficulty)}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-purple-300 text-xs"
          >
            <option value={4}>4x4</option>
            <option value={6}>6x6</option>
            <option value={9}>9x9</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => handleNewGame(gridSize, e.target.value as typeof difficulty)}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-pink-300 text-xs"
          >
            <option value="beginner">Easy</option>
            <option value="easy">Easy+</option>
            <option value="medium">Med</option>
            <option value="hard">Hard</option>
            <option value="expert">Pro</option>
          </select>
        </div>
      </header>
    )
  }

  // Desktop header
  return (
    <header className="col-span-2 flex items-center justify-between">
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Sudoku Fun!
      </h1>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">Time: {elapsedTime}</span>
        <span className="flex items-center gap-1">Hints: {hintsUsed}</span>
        <span className="flex items-center gap-1">Mistakes: {mistakes}</span>
        <select
          value={gridSize}
          onChange={(e) => handleNewGame(Number(e.target.value) as typeof gridSize, difficulty)}
          className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-purple-300"
        >
          <option value={4}>4x4</option>
          <option value={6}>6x6</option>
          <option value={9}>9x9</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => handleNewGame(gridSize, e.target.value as typeof difficulty)}
          className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-pink-300"
        >
          <option value="beginner">Beginner</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>
    </header>
  )
}
