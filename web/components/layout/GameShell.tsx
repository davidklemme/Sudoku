'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GameShellProps {
  header: ReactNode;
  grid: ReactNode;
  coach: ReactNode;
  controls: ReactNode;
  className?: string;
}

/**
 * GameShell - Main layout container for RnS SuDoCoach
 *
 * Single-screen layout with:
 * - Header at top (branding + settings)
 * - Main area with Grid (left/top) and CoachZone (right/bottom)
 * - Controls at bottom (number dock + action bar)
 *
 * Responsive behavior:
 * - Desktop (md+): Side-by-side grid and coach
 * - Mobile: Stacked vertically
 */
export function GameShell({
  header,
  grid,
  coach,
  controls,
  className,
}: GameShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100',
        className
      )}
    >
      <div className="max-w-6xl mx-auto p-4 flex flex-col h-screen">
        {/* Header - Fixed height */}
        <header className="shrink-0 mb-2">{header}</header>

        {/* Main Content - Flexible */}
        <main className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          {/* Grid Area - Takes most space */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-[min(100%,500px)] aspect-square">
              {grid}
            </div>
          </div>

          {/* Coach Zone - Sidebar on desktop, below on mobile */}
          <aside className="md:w-72 lg:w-80 shrink-0 min-h-[120px] md:min-h-0">
            {coach}
          </aside>
        </main>

        {/* Controls - Fixed at bottom */}
        <footer className="shrink-0 mt-4 pb-2">{controls}</footer>
      </div>
    </div>
  );
}
