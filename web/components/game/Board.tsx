'use client'

import { useGameStore } from '@/store/gameStore'
import Cell from './Cell'

export default function Board() {
  const {
    currentGrid,
    initialGrid,
    selectedCell,
    highlightedCells,
    errorCells,
    pencilMarks,
    gridSize,
  } = useGameStore()

  if (!currentGrid || !initialGrid) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No game loaded</p>
      </div>
    )
  }

  const cellKey = (row: number, col: number): string => `${row},${col}`

  return (
    <div className="flex items-center justify-center p-4">
      <table
        className={`
          border-collapse
          ${gridSize === 4 ? 'w-64 h-64' : ''}
          ${gridSize === 6 ? 'w-80 h-80' : ''}
          ${gridSize === 9 ? 'w-96 h-96 max-w-full' : ''}
        `}
      >
        <tbody>
          {currentGrid.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="h-0">
              {row.map((cell, colIndex) => {
                const key = cellKey(rowIndex, colIndex)
                const isInitial = initialGrid[rowIndex][colIndex] !== null
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                const isHighlighted = highlightedCells.has(key) && !isSelected
                const isError = errorCells.has(key)
                const marks = pencilMarks.get(key)

                return (
                  <td key={key} className="p-0">
                    <Cell
                      row={rowIndex}
                      col={colIndex}
                      value={cell}
                      isInitial={isInitial}
                      isSelected={isSelected}
                      isHighlighted={isHighlighted}
                      isError={isError}
                      pencilMarks={marks}
                      gridSize={gridSize}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
