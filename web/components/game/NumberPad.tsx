'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { motion } from 'framer-motion'

export default function NumberPad() {
  const { gridSize, makeMove, isPencilMode } = useGameStore()

  const handleNumberClick = (num: number) => {
    makeMove(num)
  }

  // Rainbow colors for buttons
  const buttonColors = [
    { normal: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)', hover: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' }, // blue
    { normal: 'linear-gradient(to bottom right, #4ade80, #22c55e)', hover: 'linear-gradient(to bottom right, #22c55e, #16a34a)' }, // green
    { normal: 'linear-gradient(to bottom right, #facc15, #eab308)', hover: 'linear-gradient(to bottom right, #eab308, #ca8a04)' }, // yellow
    { normal: 'linear-gradient(to bottom right, #fb923c, #f97316)', hover: 'linear-gradient(to bottom right, #f97316, #ea580c)' }, // orange
    { normal: 'linear-gradient(to bottom right, #f87171, #ef4444)', hover: 'linear-gradient(to bottom right, #ef4444, #dc2626)' }, // red
    { normal: 'linear-gradient(to bottom right, #f472b6, #ec4899)', hover: 'linear-gradient(to bottom right, #ec4899, #db2777)' }, // pink
    { normal: 'linear-gradient(to bottom right, #a78bfa, #8b5cf6)', hover: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)' }, // purple
    { normal: 'linear-gradient(to bottom right, #818cf8, #6366f1)', hover: 'linear-gradient(to bottom right, #6366f1, #4f46e5)' }, // indigo
    { normal: 'linear-gradient(to bottom right, #22d3ee, #06b6d4)', hover: 'linear-gradient(to bottom right, #06b6d4, #0891b2)' }, // cyan
  ]

  const [hoveredButton, setHoveredButton] = React.useState<number | null>(null)

  const getButtonGradient = (num: number) => {
    if (isPencilMode) {
      return hoveredButton === num
        ? 'linear-gradient(to bottom right, #f97316, #ea580c)'
        : 'linear-gradient(to bottom right, #fb923c, #f97316)'
    }
    const colorSet = buttonColors[(num - 1) % buttonColors.length]
    return hoveredButton === num ? colorSet.hover : colorSet.normal
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridSize === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '6px',
          width: '100%',
        }}
      >
        {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
          <motion.button
            key={num}
            onClick={() => handleNumberClick(num)}
            onMouseEnter={() => setHoveredButton(num)}
            onMouseLeave={() => setHoveredButton(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{
              aspectRatio: '1',
              width: '100%',
              borderRadius: '8px',
              background: getButtonGradient(num),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              transition: 'all 0.15s',
              boxShadow: hoveredButton === num ? '0 6px 10px -3px rgba(0, 0, 0, 0.2)' : '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderBottom: isPencilMode ? '2px solid #ea580c' : '2px solid rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
            }}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {isPencilMode && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '10px',
            color: '#ea580c',
            fontWeight: 'bold',
            backgroundColor: '#fed7aa',
            padding: '2px 6px',
            borderRadius: '9999px',
          }}
        >
          ✏️ Notes Mode
        </motion.div>
      )}
    </div>
  )
}
