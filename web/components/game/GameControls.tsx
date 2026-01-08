'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'

interface GameControlsProps {
  layout?: 'vertical' | 'grid'
}

export default function GameControls({ layout = 'vertical' }: GameControlsProps) {
  const {
    isPencilMode,
    isComplete,
    historyIndex,
    moveHistory,
    clearCell,
    togglePencilMode,
    useHint,
    undo,
    redo,
    resetGame,
  } = useGameStore()

  const btnBase = "flex items-center justify-center rounded-lg font-medium transition-all active:scale-95"
  const btnIcon = `${btnBase} w-10 h-10 text-lg`

  const buttons = [
    { onClick: clearCell, className: `${btnIcon} bg-red-500 text-white`, title: 'Erase', icon: 'X' },
    { onClick: togglePencilMode, className: `${btnIcon} ${isPencilMode ? 'bg-orange-500 text-white' : 'bg-gray-200'}`, title: 'Notes', icon: 'N' },
    { onClick: useHint, disabled: isComplete, className: `${btnIcon} bg-yellow-500 text-white disabled:opacity-50`, title: 'Hint', icon: '?' },
    { onClick: undo, disabled: historyIndex < 0, className: `${btnIcon} bg-purple-500 text-white disabled:opacity-50`, title: 'Undo', icon: '<' },
    { onClick: redo, disabled: historyIndex >= moveHistory.length - 1, className: `${btnIcon} bg-purple-500 text-white disabled:opacity-50`, title: 'Redo', icon: '>' },
    { onClick: resetGame, className: `${btnIcon} bg-gray-300`, title: 'Reset', icon: 'R' },
  ]

  if (layout === 'grid') {
    // Mobile 2x3 grid layout
    return (
      <div className="grid grid-cols-2 gap-1 content-start">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={btn.className}
            title={btn.title}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    )
  }

  // Desktop vertical strip layout
  return (
    <div className="flex flex-col gap-2">
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          disabled={btn.disabled}
          className={btn.className}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  )
}
