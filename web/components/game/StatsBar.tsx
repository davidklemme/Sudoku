'use client'

import React from 'react'
import { useGameStore } from '@/store/gameStore'

interface StatsBarProps {
  elapsedTime: string
}

export default function StatsBar({ elapsedTime }: StatsBarProps) {
  const { hintsUsed, mistakes } = useGameStore()

  return (
    <div className="flex justify-center gap-6 text-sm bg-white dark:bg-gray-800 rounded-lg py-2 shadow">
      <span>Time: {elapsedTime}</span>
      <span>Hints: {hintsUsed}</span>
      <span>Mistakes: {mistakes}</span>
    </div>
  )
}
