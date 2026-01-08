'use client';

import { cn } from '@/lib/utils';
import { COLOR_LEGEND } from '@/lib/colors/strategy-colors';

interface ColorLegendProps {
  isCompact?: boolean;
}

/**
 * ColorLegend - Visual guide to what colors mean
 *
 * The core of our visual teaching system!
 * Shows kids what each color means without reading complex text.
 */
export function ColorLegend({ isCompact }: ColorLegendProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        isCompact ? 'grid-cols-4 gap-1' : 'grid-cols-2 gap-2'
      )}
    >
      {COLOR_LEGEND.map(({ color, label }) => (
        <div
          key={label}
          className={cn(
            'flex items-center gap-2',
            isCompact && 'flex-col gap-0.5'
          )}
        >
          <div
            className={cn(
              'rounded shrink-0',
              color,
              isCompact ? 'w-5 h-5' : 'w-7 h-7'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'text-gray-600 font-medium',
              isCompact ? 'text-[10px]' : 'text-sm'
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
