'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'

interface CompletionModalProps {
  elapsedTime: string
}

export default function CompletionModal({ elapsedTime }: CompletionModalProps) {
  const { isComplete, gridSize, difficulty, startNewGame } = useGameStore()

  if (!isComplete) {
    return null
  }

  const handlePlayAgain = () => {
    startNewGame(gridSize, difficulty, Date.now())
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md shadow-2xl text-center">
        <div className="text-6xl mb-4">*</div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Amazing Job!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You solved it in {elapsedTime}!
        </p>
        <button
          onClick={handlePlayAgain}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg transition-all active:scale-95 shadow-lg"
        >
          Play Again!
        </button>
      </div>
    </div>
  )
}
