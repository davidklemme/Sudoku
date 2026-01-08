'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Settings, ChevronDown, User, Home, RotateCcw } from 'lucide-react';
import { GridSize, Difficulty } from '@/lib/sudoku/types';

interface HeaderProps {
  gridSize: GridSize;
  difficulty: Difficulty;
  playerName: string | null;
  onGridSizeChange: (size: GridSize) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onPlayerClick: () => void;
  onNewGame: () => void;
}

const GRID_SIZES: { value: GridSize; label: string }[] = [
  { value: 4, label: '4×4' },
  { value: 6, label: '6×6' },
  { value: 9, label: '9×9' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

/**
 * Header - Top bar with branding and game settings
 */
export function Header({
  gridSize,
  difficulty,
  playerName,
  onGridSizeChange,
  onDifficultyChange,
  onPlayerClick,
  onNewGame,
}: HeaderProps) {
  const currentDifficulty = DIFFICULTIES.find((d) => d.value === difficulty);

  return (
    <div className="flex items-center justify-between py-2">
      {/* Logo and Branding */}
      <div className="flex items-center gap-2">
        <span className="text-3xl" role="img" aria-label="Coach">
          🎓
        </span>
        <div>
          <h1 className="font-bold text-lg md:text-xl leading-tight text-gray-800">
            RnS SuDoCoach
          </h1>
          {playerName && (
            <button
              onClick={onPlayerClick}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Playing: {playerName} ✏️
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Grid Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm gap-1 bg-white"
            >
              {gridSize}×{gridSize}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {GRID_SIZES.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onGridSizeChange(value)}
                className={gridSize === value ? 'bg-blue-50 font-medium' : ''}
              >
                {label}
                {value === 4 && (
                  <span className="ml-2 text-xs text-gray-400">Starter</span>
                )}
                {value === 9 && (
                  <span className="ml-2 text-xs text-gray-400">Classic</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Difficulty Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm gap-1 bg-white hidden sm:flex"
            >
              {currentDifficulty?.label || 'Easy'}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {DIFFICULTIES.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onDifficultyChange(value)}
                className={difficulty === value ? 'bg-blue-50 font-medium' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlayerClick}>
              <User className="h-4 w-4 mr-2" />
              Change Player
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewGame}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Puzzle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
