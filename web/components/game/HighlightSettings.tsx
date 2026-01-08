'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'

interface HighlightSettingsProps {
  showAll?: boolean
}

export default function HighlightSettings({ showAll = false }: HighlightSettingsProps) {
  const {
    showRowHighlight,
    showColumnHighlight,
    showBoxHighlight,
    showErrorFeedback,
    autoCleanPencilMarks,
    toggleRowHighlight,
    toggleColumnHighlight,
    toggleBoxHighlight,
    toggleErrorFeedback,
    toggleAutoCleanPencilMarks,
  } = useGameStore()

  const btnBase = "flex items-center justify-center rounded-lg font-medium transition-all active:scale-95"
  const btnIcon = `${btnBase} w-10 h-10 text-xs`
  const btnSmall = `${btnBase} px-3 py-1.5 text-xs`

  // Desktop vertical layout (in sidebar)
  if (!showAll) {
    return (
      <>
        <div className="h-px bg-gray-300 my-1" />
        <button
          onClick={toggleRowHighlight}
          className={`${btnIcon} ${showRowHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          title="Row Highlight"
        >
          R
        </button>
        <button
          onClick={toggleColumnHighlight}
          className={`${btnIcon} ${showColumnHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          title="Column Highlight"
        >
          C
        </button>
        <button
          onClick={toggleBoxHighlight}
          className={`${btnIcon} ${showBoxHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          title="Box Highlight"
        >
          B
        </button>
      </>
    )
  }

  // Mobile horizontal row with all settings
  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={toggleRowHighlight}
        className={`${btnSmall} ${showRowHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Row
      </button>
      <button
        onClick={toggleColumnHighlight}
        className={`${btnSmall} ${showColumnHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Col
      </button>
      <button
        onClick={toggleBoxHighlight}
        className={`${btnSmall} ${showBoxHighlight ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Box
      </button>
      <button
        onClick={toggleErrorFeedback}
        className={`${btnSmall} ${showErrorFeedback ? 'bg-red-400 text-white' : 'bg-gray-200'}`}
      >
        Err
      </button>
      <button
        onClick={toggleAutoCleanPencilMarks}
        className={`${btnSmall} ${autoCleanPencilMarks ? 'bg-blue-400 text-white' : 'bg-gray-200'}`}
      >
        Auto
      </button>
    </div>
  )
}
