# RnS SuDoCoach - Design Specification

> **Ruben and Sammy's Sudoku Coach** - A visual-learning Sudoku app for kids 5+

## 1. Product Vision

### What We're Building
A single-screen Sudoku learning app that teaches through **color-coded visual hints** rather than text explanations. The Coach is always present, guiding young learners through pattern recognition.

### Target Audience
- **Primary:** Children ages 5-12
- **Named for:** Ruben and Sammy
- **Key insight:** Kids learn visually before they read fluently

### Core Differentiator
**Color-as-language teaching system** - No reading required. Green means "fill me!", yellow means "look at us together!", red means "oops!". The grid itself becomes the teaching surface.

---

## 2. Design Principles

### 2.1 Grid is the Hero
- The Sudoku grid dominates the screen (60-70% of viewport)
- Large, tappable cells (minimum 44px touch targets)
- All teaching happens ON the grid through color

### 2.2 Coach is Always Present
- No popups or modals for hints
- Dedicated CoachZone area - always visible
- Friendly, encouraging tone

### 2.3 No Pressure
- No timer by default (opt-in for older kids)
- No mistake counter
- Conflicts shown visually, self-correctable
- Celebration of progress, not perfection

### 2.4 Progressive Complexity
- 4x4 → 6x6 → 9x9 grid progression
- Color system scales with strategy complexity
- Same visual language across all levels

---

## 3. Color Strategy System

### 3.1 Core Color Language

| Color | Meaning | Use Case |
|-------|---------|----------|
| 🟢 Green glow | "Fill me! Only one number works here" | Naked single, hidden single |
| 🟡 Yellow highlight | "Look at us together" | Pairs, triples |
| 🔵 Blue tint | "Focus on this row/column/box" | Elimination hints |
| 🟣 Purple accent | "These boxes are connected" | Pointing pairs, box-line |
| 🔴 Red shake | "Oops, conflict!" | Invalid move |
| ⚪ White/Default | Normal state | No hint active |

### 3.2 Color Application Rules

```
Priority (highest to lowest):
1. Conflict (red) - always show errors immediately
2. Hint target (green) - the cell to fill
3. Hint support (yellow/blue) - related cells explaining why
4. Selection (light blue ring) - user's current focus
5. Hover (subtle gray) - mouse/touch feedback
```

### 3.3 Animation Guidelines

- **Green solvable cell:** Gentle pulse (1s cycle, infinite while hinted)
- **Red conflict:** Quick shake (0.3s), then settle to red background
- **Yellow pairs:** Synchronized pulse between paired cells
- **Completion:** Ripple effect from completed row/col/box

---

## 4. Layout Specification

### 4.1 Single-Screen Philosophy
One screen. Everything visible. No page navigation during play.

### 4.2 Desktop Layout (≥768px)

```
┌──────────────────────────────────────────────────────────────┐
│  🎓 RnS SuDoCoach                    [4x4 ▼] [Easy ▼]  ⚙️   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────┐  ┌─────────────────────────┐ │
│  │                            │  │  🤖 Coach Zone          │ │
│  │                            │  │                         │ │
│  │                            │  │  [Visual color legend]  │ │
│  │      SUDOKU GRID           │  │                         │ │
│  │      (aspect-square)       │  │  [Current hint visual]  │ │
│  │                            │  │                         │ │
│  │                            │  │  [Encouragement text]   │ │
│  │                            │  │                         │ │
│  └────────────────────────────┘  └─────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│    [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]             │
│                                                              │
│    [↩️ Undo]  [✏️ Notes]  [💡 Hint]  [🗑️ Clear]  [🔄 New]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Proportions:**
- Header: 48-56px fixed
- Main area: Grid 60% / CoachZone 40% (flex)
- Bottom dock: ~120px fixed
- Max content width: 1200px centered

### 4.3 Mobile Layout (<768px)

```
┌────────────────────────────┐
│ 🎓 RnS SuDoCoach     ⚙️   │  48px
├────────────────────────────┤
│                            │
│                            │
│       SUDOKU GRID          │  flex-1 (dominant)
│       (max-w, centered)    │
│                            │
│                            │
├────────────────────────────┤
│ 🤖 Coach Zone (compact)    │  80-100px
│ [color legend] [hint msg]  │
├────────────────────────────┤
│ [1][2][3][4][5][6][7][8][9]│
│ [↩️][✏️][💡][🗑️]    [▼]   │  ~100px
└────────────────────────────┘
```

**Mobile Optimizations:**
- CoachZone collapses to single-line with expandable detail
- Number buttons sized for thumb reach
- Actions condensed with overflow menu

### 4.4 Responsive Breakpoints

```
Mobile:    < 768px   - Stacked layout
Tablet:    768-1024  - Side-by-side, compact coach
Desktop:   > 1024    - Full side-by-side with spacious coach
```

---

## 5. Component Architecture

### 5.1 Directory Structure

```
web/
├── app/
│   ├── layout.tsx              # Root with metadata
│   ├── page.tsx                # Landing/home (future)
│   ├── play/
│   │   └── page.tsx            # Game page (simplified)
│   └── globals.css             # Tailwind + custom props
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/                 # App shell components
│   │   ├── GameShell.tsx       # Main layout container
│   │   └── Header.tsx          # Top bar with controls
│   │
│   ├── sudoku/                 # Core game components
│   │   ├── Grid.tsx            # The Sudoku board
│   │   ├── Cell.tsx            # Individual cell (enhanced)
│   │   ├── NumberDock.tsx      # Number input buttons
│   │   └── ActionBar.tsx       # Game action buttons
│   │
│   └── coach/                  # Teaching components
│       ├── CoachZone.tsx       # Main teaching area
│       ├── ColorLegend.tsx     # What colors mean
│       ├── HintVisual.tsx      # Current hint display
│       └── Celebration.tsx     # Win animations
│
├── lib/
│   ├── sudoku/                 # [KEEP] Existing game logic
│   │   ├── types.ts
│   │   ├── generator.ts
│   │   ├── solver.ts
│   │   ├── validator.ts
│   │   └── strategies.ts
│   │
│   └── colors/                 # [NEW] Color strategy system
│       ├── strategy-colors.ts  # Color mappings
│       ├── highlights.ts       # Cell highlight logic
│       └── animations.ts       # Animation class builders
│
└── store/
    └── gameStore.ts            # [KEEP] Zustand store (extend)
```

### 5.2 Component Specifications

#### GameShell.tsx
```typescript
/**
 * Main layout container - handles responsive behavior
 * Single source of truth for layout structure
 */
interface GameShellProps {
  children?: React.ReactNode;
}

// Responsibilities:
// - Responsive grid/flex layout
// - Background styling
// - Max-width containment
// - Passes layout context to children
```

#### Header.tsx
```typescript
/**
 * Minimal top bar with branding and game settings
 */
interface HeaderProps {
  gridSize: GridSize;
  difficulty: Difficulty;
  onGridSizeChange: (size: GridSize) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onSettingsClick: () => void;
}

// Responsibilities:
// - Logo/branding display
// - Grid size dropdown
// - Difficulty dropdown
// - Settings gear icon
```

#### Grid.tsx
```typescript
/**
 * The Sudoku board - hero component
 * Renders cells with color-coded highlights
 */
interface GridProps {
  grid: SudokuGrid;
  gridSize: GridSize;
  selectedCell: Position | null;
  highlights: CellHighlights; // NEW: color system
  onCellClick: (row: number, col: number) => void;
}

// Responsibilities:
// - CSS Grid layout based on gridSize
// - Box border rendering
// - Passes highlight state to cells
// - Keyboard navigation
```

#### Cell.tsx
```typescript
/**
 * Individual Sudoku cell with color-coded states
 */
interface CellProps {
  value: number | null;
  isGiven: boolean;
  position: Position;
  highlight: CellHighlight; // NEW: unified highlight state
  pencilMarks: Set<number>;
  gridSize: GridSize;
  onClick: () => void;
}

type CellHighlight = {
  type: 'none' | 'selected' | 'solvable' | 'focus' | 'pair' | 'conflict';
  intensity?: 'subtle' | 'strong';
  animate?: boolean;
};

// Responsibilities:
// - Render value or pencil marks
// - Apply highlight colors/animations
// - Handle tap/click interaction
// - Accessible focus states
```

#### CoachZone.tsx
```typescript
/**
 * The teaching area - always visible, never a popup
 */
interface CoachZoneProps {
  currentHint: HintState | null;
  gridSize: GridSize;
  isCompact?: boolean; // For mobile
}

// Responsibilities:
// - Show color legend (what colors mean)
// - Display current hint visualization
// - Encouragement messages
// - Expand/collapse on mobile
```

#### NumberDock.tsx
```typescript
/**
 * Number input buttons - bottom of screen
 */
interface NumberDockProps {
  gridSize: GridSize;
  onNumberClick: (num: number) => void;
  isPencilMode: boolean;
  disabledNumbers?: Set<number>; // Numbers completed in puzzle
}

// Responsibilities:
// - Render 1-N buttons based on gridSize
// - Visual feedback for pencil mode
// - Highlight/dim based on availability
// - Large touch targets
```

#### ActionBar.tsx
```typescript
/**
 * Game action buttons - undo, pencil, hint, etc.
 */
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

// Responsibilities:
// - Consistent button styling
// - Disabled states
// - Tooltips for actions
// - Mobile-friendly sizing
```

### 5.3 State Extensions

```typescript
// Additions to gameStore.ts

interface GameState {
  // ... existing state ...

  // NEW: Color highlight system
  cellHighlights: Map<string, CellHighlight>;
  activeHintType: 'none' | 'nudge' | 'show' | 'solve';

  // NEW: Coach state
  coachMessage: string;
  showColorLegend: boolean;

  // NEW: Celebration
  celebrationTrigger: 'none' | 'row' | 'col' | 'box' | 'complete';
}

interface GameActions {
  // ... existing actions ...

  // NEW: Highlight actions
  setHighlight: (pos: Position, highlight: CellHighlight) => void;
  clearHighlights: () => void;
  applyStrategyHighlights: (strategy: StrategyResult) => void;

  // NEW: Progressive hint
  requestHint: () => void; // Cycles: nudge → show → solve
}
```

---

## 6. Color System Implementation

### 6.1 Strategy Color Mapping

```typescript
// lib/colors/strategy-colors.ts

export const STRATEGY_COLORS = {
  // Base states
  none: '',
  selected: 'ring-2 ring-blue-400 bg-blue-50',

  // Hint states
  solvable: 'bg-green-200 ring-2 ring-green-400 animate-gentle-pulse',
  focus_row: 'bg-blue-100',
  focus_col: 'bg-blue-100',
  focus_box: 'bg-purple-100',

  // Teaching states
  pair_a: 'bg-yellow-200 ring-2 ring-yellow-400',
  pair_b: 'bg-yellow-200 ring-2 ring-yellow-400',
  elimination: 'bg-orange-100',

  // Feedback states
  conflict: 'bg-red-200 ring-2 ring-red-400 animate-shake',
  success: 'bg-green-300 animate-pop',

} as const;

export type HighlightType = keyof typeof STRATEGY_COLORS;
```

### 6.2 Strategy to Highlight Mapping

```typescript
// lib/colors/highlights.ts

export function getHighlightsForStrategy(
  strategy: StrategyResult,
  grid: SudokuGrid
): Map<string, CellHighlight> {
  const highlights = new Map<string, CellHighlight>();

  switch (strategy.type) {
    case 'single_candidate':
    case 'hidden_single':
      // Green glow on target cell
      highlights.set(posKey(strategy.cell), {
        type: 'solvable',
        animate: true
      });
      // Blue tint on related row/col/box
      getRelatedCells(strategy.cell, grid).forEach(pos => {
        highlights.set(posKey(pos), { type: 'focus', intensity: 'subtle' });
      });
      break;

    case 'naked_pair':
    case 'hidden_pair':
      // Yellow highlight on paired cells
      strategy.cells.forEach(pos => {
        highlights.set(posKey(pos), { type: 'pair', animate: true });
      });
      break;

    // ... more strategies
  }

  return highlights;
}
```

---

## 7. Animation Definitions

### 7.1 Tailwind Custom Animations

```css
/* globals.css additions */

@keyframes gentle-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes ripple {
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
  100% { box-shadow: 0 0 0 20px rgba(74, 222, 128, 0); }
}

/* Utility classes */
.animate-gentle-pulse {
  animation: gentle-pulse 1.5s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

.animate-pop {
  animation: pop 0.3s ease-out;
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation
1. Initialize shadcn/ui
2. Create color system module
3. Build GameShell + Header

### Phase 2: Core Components
4. Build/refactor Grid with highlights
5. Build Cell with color system
6. Build NumberDock
7. Build ActionBar

### Phase 3: Teaching
8. Build CoachZone
9. Build ColorLegend
10. Integrate strategy → highlight mapping

### Phase 4: Polish
11. Add celebrations
12. Mobile optimization
13. Test with 4x4, 6x6, 9x9
14. Performance optimization

---

## 9. Player Personalization

### 9.1 First-Time Experience
On first visit (or when no player selected), the Coach greets:

```
🤖 "Hi there! I'm your SuDoCoach!
    Who am I helping today?"

    [Ruben]  [Sammy]  [Someone else...]
```

### 9.2 Player Selection Component

```typescript
// components/coach/PlayerSelect.tsx

interface PlayerSelectProps {
  onSelect: (name: string) => void;
}

// Preset players (the namesakes!)
const PRESET_PLAYERS = ['Ruben', 'Sammy'];

// Behaviors:
// - Show on first visit
// - Store selection in localStorage
// - "Someone else" opens text input
// - Can change in settings
```

### 9.3 Personalized Coach Messages

```typescript
// Examples of personalized encouragement:

const COACH_MESSAGES = {
  hint_nudge: (name: string) => `${name}, look at the green cell!`,
  row_complete: (name: string) => `Nice one, ${name}! Row done!`,
  puzzle_complete: (name: string) => `Amazing work, ${name}! 🎉`,
  stuck_encouragement: (name: string) => `You've got this, ${name}! Try the hint.`,
};
```

### 9.4 State Addition

```typescript
// In gameStore.ts

interface GameState {
  // ... existing ...
  playerName: string | null; // null = not yet selected
  showPlayerSelect: boolean;
}

interface GameActions {
  // ... existing ...
  setPlayerName: (name: string) => void;
  clearPlayerName: () => void; // Reset to ask again
}
```

### 9.5 Settings Integration

In settings menu:
```
👤 Player: [Ruben ▼]
   └─ Options: Ruben, Sammy, Custom...
```

---

## 10. Success Metrics

### For Ruben & Sammy
- Can solve 4x4 puzzle without reading instructions
- Understand what green/yellow/red mean intuitively
- Feel encouraged, not frustrated
- Ask to play again

### Technical
- Single-screen, no layout shifts
- <100ms response to tap
- Smooth 60fps animations
- Works on iPad and phones

---

*Design specification by the RnS SuDoCoach team: Maya, Dr. Quinn, Carson, Victor, Sophia, and BMad Master*
