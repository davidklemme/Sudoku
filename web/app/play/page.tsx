'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import Board from '@/components/game/Board'
import NumberPad from '@/components/game/NumberPad'
import FeedbackBadge from '@/components/teaching/FeedbackBadge'
import HintDisplay from '@/components/teaching/HintDisplay'

export default function Play() {
  const {
    currentGrid,
    gridSize,
    difficulty,
    startNewGame,
    makeMove,
    selectCell,
    selectedCell,
    hintsUsed,
    mistakes,
    isComplete,
    startTime,
    endTime,
    historyIndex,
    moveHistory,
    isPencilMode,
    undo,
    redo,
    clearCell,
    togglePencilMode,
    useHint,
    resetGame,
    showRowHighlight,
    showColumnHighlight,
    showBoxHighlight,
    toggleRowHighlight,
    toggleColumnHighlight,
    toggleBoxHighlight,
    showErrorFeedback,
    toggleErrorFeedback,
    autoCleanPencilMarks,
    toggleAutoCleanPencilMarks
  } = useGameStore()

  // Timer state that updates every second
  const [elapsedTime, setElapsedTime] = useState('0:00')

  // Mobile keyboard input
  const mobileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Start a new game if none exists
    if (!currentGrid) {
      startNewGame(9, 'medium', Date.now())
    }
  }, [currentGrid, startNewGame])

  // Update timer every second
  useEffect(() => {
    if (!startTime || isComplete) return

    const updateTimer = () => {
      const end = endTime || Date.now()
      const elapsed = Math.floor((end - startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime, endTime, isComplete])

  // Focus mobile input when cell is selected (triggers native keyboard)
  useEffect(() => {
    if (selectedCell && mobileInputRef.current && window.innerWidth < 640) {
      mobileInputRef.current.focus()
    }
  }, [selectedCell])

  // Get addPencilMark for direct pencil mark handling
  const addPencilMark = useGameStore((state) => state.addPencilMark)

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-9
      const digitMatch = e.code.match(/^Digit(\d)$/)
      if (digitMatch) {
        const num = parseInt(digitMatch[1])
        if (num >= 1 && num <= gridSize) {
          // Shift+Number = always pencil mark (toggle the mark)
          // Number alone = always normal entry
          if (e.shiftKey) {
            addPencilMark(num)
          } else {
            makeMove(num)
          }
          // Clear mobile input after move
          if (mobileInputRef.current) {
            mobileInputRef.current.value = ''
          }
        }
        return
      }

      // Backspace/Delete to clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        clearCell()
        if (mobileInputRef.current) {
          mobileInputRef.current.value = ''
        }
        return
      }

      // Arrow keys for navigation
      if (!selectedCell || !currentGrid) return

      let newRow = selectedCell.row
      let newCol = selectedCell.col

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          newRow = Math.max(0, selectedCell.row - 1)
          break
        case 'ArrowDown':
          e.preventDefault()
          newRow = Math.min(gridSize - 1, selectedCell.row + 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newCol = Math.max(0, selectedCell.col - 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          newCol = Math.min(gridSize - 1, selectedCell.col + 1)
          break
        default:
          return
      }

      if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
        selectCell(newRow, newCol)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, currentGrid, gridSize, makeMove, selectCell, clearCell, addPencilMark])

  const handleNewGame = (size: typeof gridSize, diff: typeof difficulty) => {
    startNewGame(size, diff, Date.now())
  }

  return (
    <main className="h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sudoku Fun! 🎨
          </h1>
          <div className="flex gap-2">
            <select
              value={gridSize}
              onChange={(e) => handleNewGame(Number(e.target.value) as typeof gridSize, difficulty)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-purple-300 font-medium"
            >
              <option value={4}>4×4</option>
              <option value={6}>6×6</option>
              <option value={9}>9×9</option>
            </select>
            <select
              value={difficulty}
              onChange={(e) => handleNewGame(gridSize, e.target.value as typeof difficulty)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-pink-300 font-medium"
            >
              <option value="beginner">Beginner</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* DESKTOP LAYOUT: Grid 80% left, Controls 20% right */}
        <div className="hidden md:flex flex-1 gap-4 min-h-0 overflow-hidden">
          {/* Left: Board (80%) */}
          <div className="flex-[4] flex items-center justify-center min-w-0">
            <div className="w-full h-full max-w-[600px] max-h-[600px] aspect-square">
              <Board />
            </div>
          </div>

          {/* Right: NumPad + Options (20%) */}
          <div className="flex-1 flex flex-col gap-2 min-w-[180px] max-w-[200px] overflow-y-auto">
            {/* Stats Row */}
            <div className="flex justify-between text-center text-xs bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
              <div><span className="text-sm">⏱️</span> {elapsedTime}</div>
              <div><span className="text-sm">💡</span> {hintsUsed}</div>
              <div><span className="text-sm">❌</span> {mistakes}</div>
            </div>

            {/* Number Pad */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
              <NumberPad />
            </div>

            {/* Controls - under numpad */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow space-y-1">
              <div className="grid grid-cols-3 gap-1">
                <button onClick={clearCell} className="p-1 text-xs rounded bg-red-500 text-white">🗑️</button>
                <button onClick={togglePencilMode} className={`p-1 text-xs rounded ${isPencilMode ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>✏️</button>
                <button onClick={useHint} disabled={isComplete} className="p-1 text-xs rounded bg-yellow-500 text-white disabled:bg-gray-300">💡</button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button onClick={undo} disabled={historyIndex < 0} className="p-1 text-xs rounded bg-purple-500 text-white disabled:bg-gray-300">⏪</button>
                <button onClick={redo} disabled={historyIndex >= moveHistory.length - 1} className="p-1 text-xs rounded bg-purple-500 text-white disabled:bg-gray-300">⏩</button>
              </div>
              <button onClick={resetGame} className="w-full p-1 text-xs rounded bg-gray-200">🔄 Reset</button>
            </div>

            {/* Helper Lights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
              <div className="text-xs font-bold mb-1">Highlights</div>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={toggleRowHighlight} className={`p-1 text-xs rounded ${showRowHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Row</button>
                <button onClick={toggleColumnHighlight} className={`p-1 text-xs rounded ${showColumnHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Col</button>
                <button onClick={toggleBoxHighlight} className={`p-1 text-xs rounded ${showBoxHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Box</button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow space-y-1">
              <button onClick={toggleErrorFeedback} className={`w-full p-1 text-xs rounded ${showErrorFeedback ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
                Errors {showErrorFeedback ? 'ON' : 'OFF'}
              </button>
              <button onClick={toggleAutoCleanPencilMarks} className={`w-full p-1 text-xs rounded ${autoCleanPencilMarks ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                Auto-Clean {autoCleanPencilMarks ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT: Vertical stack */}
        <div className="flex md:hidden flex-col flex-1 gap-3 overflow-y-auto">
          {/* Stats Row */}
          <div className="flex justify-around text-center text-sm bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
            <div><span>⏱️</span> {elapsedTime}</div>
            <div><span>💡</span> {hintsUsed}</div>
            <div><span>❌</span> {mistakes}</div>
          </div>

          {/* Board */}
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <div className="w-full max-w-[400px] aspect-square">
              <Board />
            </div>
          </div>

          {/* Number Pad */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <NumberPad />
          </div>

          {/* Controls Row */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
            <div className="grid grid-cols-6 gap-2">
              <button onClick={clearCell} className="p-2 text-lg rounded bg-red-500 text-white">🗑️</button>
              <button onClick={togglePencilMode} className={`p-2 text-lg rounded ${isPencilMode ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>✏️</button>
              <button onClick={useHint} disabled={isComplete} className="p-2 text-lg rounded bg-yellow-500 text-white disabled:bg-gray-300">💡</button>
              <button onClick={undo} disabled={historyIndex < 0} className="p-2 text-lg rounded bg-purple-500 text-white disabled:bg-gray-300">⏪</button>
              <button onClick={redo} disabled={historyIndex >= moveHistory.length - 1} className="p-2 text-lg rounded bg-purple-500 text-white disabled:bg-gray-300">⏩</button>
              <button onClick={resetGame} className="p-2 text-lg rounded bg-gray-200">🔄</button>
            </div>
          </div>

          {/* Highlight toggles - collapsed row */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
            <div className="grid grid-cols-5 gap-2 text-xs">
              <button onClick={toggleRowHighlight} className={`p-1 rounded ${showRowHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Row</button>
              <button onClick={toggleColumnHighlight} className={`p-1 rounded ${showColumnHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Col</button>
              <button onClick={toggleBoxHighlight} className={`p-1 rounded ${showBoxHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Box</button>
              <button onClick={toggleErrorFeedback} className={`p-1 rounded ${showErrorFeedback ? 'bg-red-400 text-white' : 'bg-gray-200'}`}>Err</button>
              <button onClick={toggleAutoCleanPencilMarks} className={`p-1 rounded ${autoCleanPencilMarks ? 'bg-blue-400 text-white' : 'bg-gray-200'}`}>Auto</button>
            </div>
          </div>
        </div>

        {/* Completion Celebration */}
        {isComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md shadow-2xl text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing Job!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You solved it in {elapsedTime}!
              </p>
              <button
                onClick={() => handleNewGame(gridSize, difficulty)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg transition-all active:scale-95 shadow-lg"
              >
                Play Again! 🎮
              </button>
            </div>
          </div>
        )}

        {/* Feedback Badge (floating) */}
        <FeedbackBadge />

        {/* Hint Display (floating) */}
        <HintDisplay />

        {/* Hidden input for mobile keyboard - only on small screens */}
        <input
          ref={mobileInputRef}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          className="md:hidden fixed opacity-0 pointer-events-none"
          style={{ position: 'fixed', top: '-100px' }}
          aria-label="Number input"
        />
      </div>
    </main>
  )
}
