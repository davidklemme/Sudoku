# RnS SuDoCoach - Component Architecture

> Technical implementation guide for the component rebuild

## Directory Structure

```
web/
├── app/
│   ├── layout.tsx                 # Root layout (keep, minimal changes)
│   ├── page.tsx                   # Home page (future landing)
│   ├── play/
│   │   └── page.tsx              # REWRITE: Simplified game page
│   └── globals.css               # UPDATE: Add animations
│
├── components/
│   ├── ui/                       # NEW: shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tooltip.tsx
│   │   └── input.tsx
│   │
│   ├── layout/                   # NEW: App shell
│   │   ├── GameShell.tsx         # Main responsive container
│   │   └── Header.tsx            # Top bar
│   │
│   ├── sudoku/                   # REFACTOR: Game components
│   │   ├── Grid.tsx              # Board with color system
│   │   ├── Cell.tsx              # Enhanced with highlights
│   │   ├── NumberDock.tsx        # Renamed from NumberPad
│   │   └── ActionBar.tsx         # Consolidated controls
│   │
│   ├── coach/                    # NEW: Teaching components
│   │   ├── CoachZone.tsx         # Main teaching panel
│   │   ├── ColorLegend.tsx       # Color meaning guide
│   │   ├── HintVisual.tsx        # Current hint display
│   │   ├── PlayerSelect.tsx      # Who's playing?
│   │   └── Celebration.tsx       # Win animations
│   │
│   └── game/                     # DEPRECATE: Old components
│       └── [move to archive]     # Keep for reference during migration
│
├── lib/
│   ├── sudoku/                   # KEEP: Core game logic
│   │   ├── types.ts
│   │   ├── generator.ts
│   │   ├── solver.ts
│   │   ├── validator.ts
│   │   └── strategies.ts
│   │
│   └── colors/                   # NEW: Color strategy system
│       ├── strategy-colors.ts    # Color constants
│       ├── highlights.ts         # Highlight calculation
│       └── animations.ts         # Animation utilities
│
└── store/
    └── gameStore.ts              # EXTEND: Add highlight/coach state
```

---

## Component Specifications

### 1. GameShell.tsx

**Purpose:** Single source of truth for layout structure

```typescript
'use client';

import { ReactNode } from 'react';

interface GameShellProps {
  header: ReactNode;
  grid: ReactNode;
  coach: ReactNode;
  controls: ReactNode;
}

export function GameShell({ header, grid, coach, controls }: GameShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-4 flex flex-col h-screen">
        {/* Header */}
        <header className="shrink-0">
          {header}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 py-4">
          {/* Grid Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[500px] aspect-square">
              {grid}
            </div>
          </div>

          {/* Coach Zone - sidebar on desktop, below on mobile */}
          <aside className="md:w-80 shrink-0">
            {coach}
          </aside>
        </main>

        {/* Bottom Controls */}
        <footer className="shrink-0">
          {controls}
        </footer>
      </div>
    </div>
  );
}
```

**Key decisions:**
- Uses CSS flexbox for responsive behavior
- `min-h-0` on main prevents overflow issues
- Max-width constraints keep layout readable
- Grid is always square via `aspect-square`

---

### 2. Header.tsx

**Purpose:** Minimal top bar with branding and settings

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import { GridSize, Difficulty } from '@/lib/sudoku/types';

interface HeaderProps {
  gridSize: GridSize;
  difficulty: Difficulty;
  playerName: string | null;
  onGridSizeChange: (size: GridSize) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onSettingsClick: () => void;
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

export function Header({
  gridSize,
  difficulty,
  playerName,
  onGridSizeChange,
  onDifficultyChange,
  onSettingsClick,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎓</span>
        <div>
          <h1 className="font-bold text-lg leading-tight">RnS SuDoCoach</h1>
          {playerName && (
            <p className="text-xs text-muted-foreground">
              Playing: {playerName}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Grid Size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {gridSize}×{gridSize}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {GRID_SIZES.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onGridSizeChange(value)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Difficulty */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {DIFFICULTIES.find(d => d.value === difficulty)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DIFFICULTIES.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onDifficultyChange(value)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
```

---

### 3. Grid.tsx

**Purpose:** The Sudoku board with integrated color highlighting

```typescript
'use client';

import { useCallback } from 'react';
import { Cell } from './Cell';
import { SudokuGrid, GridSize, Position } from '@/lib/sudoku/types';
import { CellHighlights } from '@/lib/colors/highlights';

interface GridProps {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  gridSize: GridSize;
  selectedCell: Position | null;
  highlights: CellHighlights;
  pencilMarks: Map<string, Set<number>>;
  onCellClick: (row: number, col: number) => void;
}

export function Grid({
  grid,
  initialGrid,
  gridSize,
  selectedCell,
  highlights,
  pencilMarks,
  onCellClick,
}: GridProps) {
  const boxSize = gridSize === 4 ? 2 : gridSize === 6 ? 2 : 3;
  const boxWidth = gridSize === 6 ? 3 : boxSize;

  const isSelected = useCallback(
    (row: number, col: number) =>
      selectedCell?.row === row && selectedCell?.col === col,
    [selectedCell]
  );

  const getHighlight = useCallback(
    (row: number, col: number) =>
      highlights.get(`${row}-${col}`) ?? { type: 'none' },
    [highlights]
  );

  return (
    <div
      className="grid gap-0 bg-gray-800 p-1 rounded-lg shadow-lg w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={value}
            isGiven={initialGrid[rowIndex][colIndex] !== 0}
            position={{ row: rowIndex, col: colIndex }}
            gridSize={gridSize}
            boxSize={boxSize}
            boxWidth={boxWidth}
            isSelected={isSelected(rowIndex, colIndex)}
            highlight={getHighlight(rowIndex, colIndex)}
            pencilMarks={pencilMarks.get(`${rowIndex}-${colIndex}`) ?? new Set()}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}
```

---

### 4. Cell.tsx

**Purpose:** Individual cell with color-coded highlighting

```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Position, GridSize } from '@/lib/sudoku/types';
import { CellHighlight, getHighlightClasses } from '@/lib/colors/highlights';

interface CellProps {
  value: number | null;
  isGiven: boolean;
  position: Position;
  gridSize: GridSize;
  boxSize: number;
  boxWidth: number;
  isSelected: boolean;
  highlight: CellHighlight;
  pencilMarks: Set<number>;
  onClick: () => void;
}

export function Cell({
  value,
  isGiven,
  position,
  gridSize,
  boxSize,
  boxWidth,
  isSelected,
  highlight,
  pencilMarks,
  onClick,
}: CellProps) {
  const { row, col } = position;

  // Border logic for box boundaries
  const isRightBoxBorder = (col + 1) % boxWidth === 0 && col < gridSize - 1;
  const isBottomBoxBorder = (row + 1) % boxSize === 0 && row < gridSize - 1;

  // Get highlight classes from color system
  const highlightClasses = getHighlightClasses(highlight, isSelected);

  // Font size based on grid size
  const fontSize = gridSize === 4 ? 'text-4xl' : gridSize === 6 ? 'text-3xl' : 'text-2xl';
  const pencilSize = gridSize === 4 ? 'text-sm' : 'text-xs';

  return (
    <motion.button
      className={cn(
        'relative flex items-center justify-center',
        'bg-white transition-colors duration-150',
        'focus:outline-none focus:z-10',
        highlightClasses,
        isRightBoxBorder && 'border-r-2 border-r-gray-800',
        isBottomBoxBorder && 'border-b-2 border-b-gray-800',
      )}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={highlight.animate ? { scale: [1, 1.02, 1] } : {}}
      transition={highlight.animate ? { repeat: Infinity, duration: 1.5 } : {}}
    >
      {value ? (
        <motion.span
          className={cn(
            fontSize,
            'font-bold',
            isGiven ? 'text-gray-800' : 'text-blue-600'
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {value}
        </motion.span>
      ) : pencilMarks.size > 0 ? (
        <PencilMarks marks={pencilMarks} gridSize={gridSize} className={pencilSize} />
      ) : null}
    </motion.button>
  );
}

// Pencil marks sub-component
function PencilMarks({
  marks,
  gridSize,
  className,
}: {
  marks: Set<number>;
  gridSize: GridSize;
  className?: string;
}) {
  const cols = gridSize === 4 ? 2 : 3;

  return (
    <div
      className={cn('grid gap-0 w-full h-full p-1', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
        <span
          key={num}
          className={cn(
            'flex items-center justify-center text-gray-400',
            marks.has(num) ? 'opacity-100' : 'opacity-0'
          )}
        >
          {num}
        </span>
      ))}
    </div>
  );
}
```

---

### 5. CoachZone.tsx

**Purpose:** Always-visible teaching panel

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorLegend } from './ColorLegend';
import { HintVisual } from './HintVisual';
import { HintState } from '@/lib/sudoku/types';
import { cn } from '@/lib/utils';

interface CoachZoneProps {
  currentHint: HintState | null;
  playerName: string | null;
  isCompact?: boolean;
}

export function CoachZone({ currentHint, playerName, isCompact }: CoachZoneProps) {
  const greeting = playerName ? `${playerName}'s` : 'Your';

  return (
    <Card className={cn('h-full', isCompact && 'p-2')}>
      <CardHeader className={cn(isCompact && 'py-2')}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">🤖</span>
          {greeting} Coach
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('space-y-4', isCompact && 'space-y-2')}>
        {/* Color Legend - always visible */}
        <ColorLegend isCompact={isCompact} />

        {/* Current Hint */}
        {currentHint ? (
          <HintVisual hint={currentHint} playerName={playerName} />
        ) : (
          <p className="text-muted-foreground text-sm">
            {playerName
              ? `Looking good, ${playerName}! Tap 💡 if you need help.`
              : 'Tap 💡 if you need help!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 6. ColorLegend.tsx

**Purpose:** Visual guide to what colors mean

```typescript
'use client';

import { cn } from '@/lib/utils';

interface ColorLegendProps {
  isCompact?: boolean;
}

const LEGEND_ITEMS = [
  { color: 'bg-green-200 ring-2 ring-green-400', label: 'Fill me!' },
  { color: 'bg-yellow-200', label: 'Look together' },
  { color: 'bg-blue-100', label: 'Check this' },
  { color: 'bg-red-200', label: 'Oops!' },
];

export function ColorLegend({ isCompact }: ColorLegendProps) {
  return (
    <div className={cn(
      'grid gap-2',
      isCompact ? 'grid-cols-4' : 'grid-cols-2'
    )}>
      {LEGEND_ITEMS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded', color)} />
          <span className={cn('text-sm', isCompact && 'text-xs')}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

### 7. NumberDock.tsx

**Purpose:** Number input buttons at bottom

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GridSize } from '@/lib/sudoku/types';

interface NumberDockProps {
  gridSize: GridSize;
  onNumberClick: (num: number) => void;
  isPencilMode: boolean;
  completedNumbers: Set<number>;
}

const NUMBER_COLORS = [
  'bg-blue-500 hover:bg-blue-600',
  'bg-green-500 hover:bg-green-600',
  'bg-yellow-500 hover:bg-yellow-600',
  'bg-orange-500 hover:bg-orange-600',
  'bg-red-500 hover:bg-red-600',
  'bg-pink-500 hover:bg-pink-600',
  'bg-purple-500 hover:bg-purple-600',
  'bg-indigo-500 hover:bg-indigo-600',
  'bg-cyan-500 hover:bg-cyan-600',
];

export function NumberDock({
  gridSize,
  onNumberClick,
  isPencilMode,
  completedNumbers,
}: NumberDockProps) {
  const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);

  return (
    <div className={cn(
      'flex justify-center gap-2',
      isPencilMode && 'ring-2 ring-orange-400 rounded-lg p-2'
    )}>
      {numbers.map((num) => {
        const isCompleted = completedNumbers.has(num);

        return (
          <Button
            key={num}
            variant="default"
            size="lg"
            className={cn(
              'w-12 h-12 text-xl font-bold text-white',
              NUMBER_COLORS[num - 1],
              isCompleted && 'opacity-50'
            )}
            onClick={() => onNumberClick(num)}
          >
            {num}
          </Button>
        );
      })}
    </div>
  );
}
```

---

### 8. ActionBar.tsx

**Purpose:** Game action buttons

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Undo2, Redo2, Pencil, Lightbulb, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  canUndo: boolean;
  canRedo: boolean;
  isPencilMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePencil: () => void;
  onHint: () => void;
  onClear: () => void;
  onNewGame: () => void;
}

export function ActionBar({
  canUndo,
  canRedo,
  isPencilMode,
  onUndo,
  onRedo,
  onTogglePencil,
  onHint,
  onClear,
  onNewGame,
}: ActionBarProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <ActionButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
      <ActionButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
      <ActionButton
        icon={Pencil}
        label="Notes"
        onClick={onTogglePencil}
        active={isPencilMode}
      />
      <ActionButton icon={Lightbulb} label="Hint" onClick={onHint} variant="warning" />
      <ActionButton icon={Trash2} label="Clear" onClick={onClear} />
      <ActionButton icon={RefreshCw} label="New" onClick={onNewGame} />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'warning';
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'default' : 'outline'}
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'w-12 h-12',
            active && 'bg-orange-500 hover:bg-orange-600',
            variant === 'warning' && 'text-yellow-600 hover:text-yellow-700'
          )}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

---

### 9. PlayerSelect.tsx

**Purpose:** First-time player selection

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerSelectProps {
  onSelect: (name: string) => void;
}

const PRESET_PLAYERS = ['Ruben', 'Sammy'];

export function PlayerSelect({ onSelect }: PlayerSelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleCustomSubmit = () => {
    if (customName.trim()) {
      onSelect(customName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <CardTitle className="text-xl">Hi there! I'm your SuDoCoach!</CardTitle>
          <p className="text-muted-foreground">Who am I helping today?</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showCustom ? (
            <>
              <div className="flex gap-4 justify-center">
                {PRESET_PLAYERS.map((name) => (
                  <Button
                    key={name}
                    size="lg"
                    className="text-lg px-8"
                    onClick={() => onSelect(name)}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCustom(true)}
              >
                Someone else...
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCustom(false)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCustomSubmit}
                  disabled={!customName.trim()}
                >
                  Let's play!
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Color System Implementation

### lib/colors/strategy-colors.ts

```typescript
export const HIGHLIGHT_STYLES = {
  // No highlight
  none: '',

  // Selection
  selected: 'ring-2 ring-blue-500 bg-blue-50',

  // Solvable cell (only one number fits)
  solvable: 'bg-green-200 ring-2 ring-green-400',

  // Focus areas
  focus: 'bg-blue-100',
  focusBox: 'bg-purple-100',

  // Pairs/groups
  pair: 'bg-yellow-200 ring-2 ring-yellow-400',

  // Elimination targets
  elimination: 'bg-orange-100',

  // Conflict
  conflict: 'bg-red-200 ring-2 ring-red-400',

  // Success feedback
  success: 'bg-green-300',
} as const;

export type HighlightStyle = keyof typeof HIGHLIGHT_STYLES;
```

### lib/colors/highlights.ts

```typescript
import { HIGHLIGHT_STYLES, HighlightStyle } from './strategy-colors';
import { Position } from '@/lib/sudoku/types';
import { StrategyResult } from '@/lib/sudoku/strategies';

export interface CellHighlight {
  type: HighlightStyle;
  animate?: boolean;
}

export type CellHighlights = Map<string, CellHighlight>;

export function posKey(pos: Position): string {
  return `${pos.row}-${pos.col}`;
}

export function getHighlightClasses(
  highlight: CellHighlight,
  isSelected: boolean
): string {
  if (isSelected && highlight.type === 'none') {
    return HIGHLIGHT_STYLES.selected;
  }

  const baseClasses = HIGHLIGHT_STYLES[highlight.type];
  const animationClass = highlight.animate ? 'animate-gentle-pulse' : '';

  return `${baseClasses} ${animationClass}`.trim();
}

export function createHighlightsForStrategy(
  strategy: StrategyResult
): CellHighlights {
  const highlights: CellHighlights = new Map();

  // Target cell gets solvable highlight
  if (strategy.cell) {
    highlights.set(posKey(strategy.cell), {
      type: 'solvable',
      animate: true,
    });
  }

  // Related cells get focus highlight
  strategy.relatedCells?.forEach((pos) => {
    if (!highlights.has(posKey(pos))) {
      highlights.set(posKey(pos), { type: 'focus' });
    }
  });

  return highlights;
}
```

---

## Store Extensions

Add to `gameStore.ts`:

```typescript
// Additional state
playerName: string | null;
showPlayerSelect: boolean;
cellHighlights: Map<string, CellHighlight>;
coachMessage: string | null;

// Additional actions
setPlayerName: (name: string) => void;
showPlayerSelector: () => void;
applyHighlights: (highlights: CellHighlights) => void;
clearHighlights: () => void;
setCoachMessage: (message: string | null) => void;

// Implementation
setPlayerName: (name) => {
  localStorage.setItem('rns-player-name', name);
  set({ playerName: name, showPlayerSelect: false });
},

showPlayerSelector: () => set({ showPlayerSelect: true }),

applyHighlights: (highlights) => set({ cellHighlights: highlights }),

clearHighlights: () => set({ cellHighlights: new Map() }),

setCoachMessage: (message) => set({ coachMessage: message }),

// On store init, check localStorage
playerName: typeof window !== 'undefined'
  ? localStorage.getItem('rns-player-name')
  : null,
showPlayerSelect: typeof window !== 'undefined'
  ? !localStorage.getItem('rns-player-name')
  : false,
```

---

## Implementation Order

1. **shadcn/ui setup** - Initialize and add needed components
2. **Color system** - `lib/colors/*` files
3. **GameShell + Header** - Layout foundation
4. **Grid + Cell** - Core game with highlights
5. **NumberDock + ActionBar** - Controls
6. **CoachZone + ColorLegend** - Teaching UI
7. **PlayerSelect** - Personalization
8. **Integration** - Wire up play/page.tsx
9. **Polish** - Animations, celebrations
