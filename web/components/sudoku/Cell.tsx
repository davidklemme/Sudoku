'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GridSize } from '@/lib/sudoku/types';
import { CellHighlight, getHighlightClasses } from '@/lib/colors/highlights';

interface CellProps {
  row: number;
  col: number;
  value: number | null;
  isGiven: boolean;
  gridSize: GridSize;
  boxHeight: number;
  boxWidth: number;
  isSelected: boolean;
  highlight?: CellHighlight;
  pencilMarks: Set<number>;
  onClick: () => void;
}

/**
 * Cell - Individual Sudoku cell with color-coded highlighting
 *
 * Features:
 * - Large, tappable touch targets for kids
 * - Color highlights from the teaching system
 * - Smooth animations for feedback
 * - Pencil marks display
 */
export function Cell({
  row,
  col,
  value,
  isGiven,
  gridSize,
  boxHeight,
  boxWidth,
  isSelected,
  highlight,
  pencilMarks,
  onClick,
}: CellProps) {
  // Border logic for box boundaries
  const isRightBoxBorder = (col + 1) % boxWidth === 0 && col < gridSize - 1;
  const isBottomBoxBorder = (row + 1) % boxHeight === 0 && row < gridSize - 1;

  // Get highlight classes from color system
  const highlightClasses = getHighlightClasses(highlight, isSelected);

  // Font sizes based on grid size (bigger for smaller grids = younger kids)
  const fontSize =
    gridSize === 4 ? 'text-4xl md:text-5xl' : gridSize === 6 ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl';

  const pencilFontSize = gridSize === 4 ? 'text-xs' : 'text-[10px]';
  const pencilCols = gridSize === 4 ? 2 : 3;

  // Animation variants
  const shouldAnimate = highlight?.animate;

  return (
    <motion.button
      className={cn(
        'relative flex items-center justify-center',
        'bg-white transition-colors duration-150',
        'focus:outline-none focus:z-10',
        'hover:bg-gray-50',
        highlightClasses,
        isRightBoxBorder && 'border-r-2 border-r-gray-800',
        isBottomBoxBorder && 'border-b-2 border-b-gray-800'
      )}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={
        shouldAnimate
          ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0)',
                '0 0 12px 4px rgba(34, 197, 94, 0.4)',
                '0 0 0 0 rgba(34, 197, 94, 0)',
              ],
            }
          : {
              scale: 1,
              boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
            }
      }
      transition={
        shouldAnimate
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.15 }
      }
      role="gridcell"
      aria-label={
        value
          ? `Row ${row + 1}, Column ${col + 1}, value ${value}`
          : `Row ${row + 1}, Column ${col + 1}, empty`
      }
      aria-selected={isSelected}
    >
      {value ? (
        <motion.span
          className={cn(
            fontSize,
            'font-bold select-none',
            isGiven ? 'text-gray-800' : 'text-purple-600'
          )}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {value}
        </motion.span>
      ) : pencilMarks.size > 0 ? (
        <div
          className={cn(
            'absolute inset-1 grid gap-0',
            pencilFontSize,
            'text-gray-400'
          )}
          style={{ gridTemplateColumns: `repeat(${pencilCols}, 1fr)` }}
        >
          {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
            <span
              key={num}
              className={cn(
                'flex items-center justify-center',
                pencilMarks.has(num) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {num}
            </span>
          ))}
        </div>
      ) : null}
    </motion.button>
  );
}
