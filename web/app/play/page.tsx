'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import Board from '@/components/game/Board'
import NumberPad from '@/components/game/NumberPad'
import GameHeader from '@/components/game/GameHeader'
import GameControls from '@/components/game/GameControls'
import HighlightSettings from '@/components/game/HighlightSettings'
import StatsBar from '@/components/game/StatsBar'
import CompletionModal from '@/components/game/CompletionModal'
import FeedbackBadge from '@/components/teaching/FeedbackBadge'
import HintDisplay from '@/components/teaching/HintDisplay'

export default function Play() {
  const {
    currentGrid,
    gridSize,
    startNewGame,
    makeMove,
    selectCell,
    selectedCell,
    isComplete,
    startTime,
    endTime,
    clearCell,
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

  return (
    <main className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* ===== DESKTOP LAYOUT (lg+) - CSS Grid ===== */}
      <div className="hidden lg:grid h-full gap-4" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr' }}>
        <GameHeader elapsedTime={elapsedTime} />

        {/* Left Column: Board */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[500px] aspect-square">
            <Board />
          </div>
        </div>

        {/* Right Column: NumPad + Options */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 50px', alignContent: 'center' }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <NumberPad />
          </div>

          <div className="flex flex-col gap-2">
            <GameControls layout="vertical" />
            <HighlightSettings />
          </div>
        </div>
      </div>

      {/* ===== MOBILE/TABLET LAYOUT (<lg) - Vertical Stack ===== */}
      <div className="lg:hidden flex flex-col h-full gap-3">
        <GameHeader elapsedTime={elapsedTime} compact />
        <StatsBar elapsedTime={elapsedTime} />

        {/* Board - flexible height */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="w-full max-w-[400px] aspect-square">
            <Board />
          </div>
        </div>

        {/* NumPad + Controls side by side */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr auto' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow">
            <NumberPad />
          </div>
          <GameControls layout="grid" />
        </div>

        <HighlightSettings showAll />
      </div>

      {/* Floating Overlays */}
      <CompletionModal elapsedTime={elapsedTime} />
      <FeedbackBadge />
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
    </main>
  )
}
