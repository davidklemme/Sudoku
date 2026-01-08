# Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├──────────────────────────┬──────────────────────────────────┤
│      Web (Next.js)       │         iOS (SwiftUI)            │
│  - React Components      │   - SwiftUI Views                │
│  - TensorFlow.js Model   │   - Core ML Model                │
│  - Local State (Zustand) │   - Combine State Management     │
└──────────────────────────┴──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Vercel)                      │
├─────────────────────────────────────────────────────────────┤
│  - Serverless Functions (Next.js API Routes)                │
│  - Puzzle Generation                                        │
│  - Analytics Processing                                     │
│  - Teaching Engine                                          │
│  - ML Model Inference (server-side fallback)                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────┬──────────────────────────────────┐
│   Database (PostgreSQL)  │      Cache (Redis/Upstash)       │
├──────────────────────────┼──────────────────────────────────┤
│  - User Profiles         │   - Generated Puzzles            │
│  - Game History          │   - Session Data                 │
│  - Progress Tracking     │   - Leaderboards (future)        │
│  - Strategy Stats        │   - Rate Limiting                │
└──────────────────────────┴──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   ML Training Pipeline                       │
├─────────────────────────────────────────────────────────────┤
│  - Python Training Scripts                                  │
│  - Data Collection & Labeling                               │
│  - Model Versioning                                         │
│  - Conversion Tools (TF.js, Core ML)                        │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Web Application Structure

```
sudoku-web/
├── app/                          # Next.js 14 App Router
│   ├── (game)/                   # Game routes
│   │   ├── play/                 # Main game page
│   │   ├── tutorial/             # Tutorial mode
│   │   └── practice/             # Practice mode
│   ├── (auth)/                   # Authentication routes
│   ├── api/                      # API routes
│   │   ├── puzzle/
│   │   │   ├── generate/         # Puzzle generation
│   │   │   └── validate/         # Solution validation
│   │   ├── analytics/
│   │   │   └── track/            # Move tracking
│   │   ├── ml/
│   │   │   └── analyze/          # Strategy analysis
│   │   └── teaching/
│   │       └── explain/          # Explanation generation
│   └── layout.tsx                # Root layout
├── components/
│   ├── game/
│   │   ├── Board.tsx             # Main game board
│   │   ├── Cell.tsx              # Individual cell
│   │   ├── NumberPad.tsx         # Input interface
│   │   ├── Controls.tsx          # Undo/redo/hints
│   │   └── PencilMarks.tsx       # Candidate numbers
│   ├── teaching/
│   │   ├── HintPanel.tsx         # Hint display
│   │   ├── ExplanationModal.tsx  # Strategy explanations
│   │   ├── ProgressTracker.tsx   # Skill tracking
│   │   └── TutorialOverlay.tsx   # Tutorial UI
│   ├── animations/
│   │   ├── CellAnimation.tsx     # Cell interactions
│   │   ├── Celebration.tsx       # Completion animation
│   │   └── ErrorShake.tsx        # Error feedback
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Card.tsx
├── lib/
│   ├── sudoku/
│   │   ├── generator.ts          # Puzzle generation
│   │   ├── solver.ts             # Solving algorithm
│   │   ├── validator.ts          # Validation logic
│   │   └── strategies.ts         # Strategy detection
│   ├── ml/
│   │   ├── model.ts              # TF.js model wrapper
│   │   ├── inference.ts          # Prediction logic
│   │   ├── preprocessor.ts       # Input preprocessing
│   │   └── ml.worker.ts          # Web Worker for background ML
│   ├── teaching/
│   │   ├── explainer.ts          # Explanation generation
│   │   ├── hints.ts              # Hint system
│   │   └── difficulty.ts         # Adaptive difficulty
│   ├── analytics/
│   │   ├── tracker.ts            # Event tracking
│   │   └── metrics.ts            # Metric calculation
│   └── utils/
│       ├── storage.ts            # Local storage
│       └── animations.ts         # Animation helpers
├── store/
│   ├── gameStore.ts              # Game state (Zustand)
│   ├── userStore.ts              # User state
│   └── teachingStore.ts          # Teaching state
├── styles/
│   └── globals.css               # Tailwind config
├── public/
│   ├── models/                   # TF.js models
│   └── assets/                   # Images, icons
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### iOS Application Structure

```
SudokuTeacher/
├── SudokuTeacherApp.swift        # App entry point
├── Views/
│   ├── Game/
│   │   ├── BoardView.swift       # Main game board
│   │   ├── CellView.swift        # Individual cell
│   │   ├── NumberPadView.swift   # Input interface
│   │   └── ControlsView.swift    # Game controls
│   ├── Teaching/
│   │   ├── HintView.swift        # Hint display
│   │   ├── ExplanationView.swift # Strategy explanations
│   │   └── ProgressView.swift    # Progress tracking
│   └── Settings/
│       └── SettingsView.swift    # App settings
├── Models/
│   ├── Game/
│   │   ├── Puzzle.swift          # Puzzle model
│   │   ├── GameState.swift       # Game state
│   │   └── Move.swift            # Move model
│   └── User/
│       └── UserProfile.swift     # User data
├── ViewModels/
│   ├── GameViewModel.swift       # Game logic
│   └── TeachingViewModel.swift   # Teaching logic
├── Services/
│   ├── PuzzleGenerator.swift     # Puzzle generation
│   ├── MLService.swift           # Core ML integration
│   ├── AnalyticsService.swift    # Analytics tracking
│   └── SyncService.swift         # iCloud sync
├── Utilities/
│   ├── Extensions/
│   ├── Animations/
│   └── Constants.swift
└── Resources/
    ├── Assets.xcassets
    └── SudokuModel.mlmodel       # Core ML model
```

## Data Flow

### Game Play Flow (Async ML Analysis)

```
MAIN THREAD (UI - Never Blocks):
1. User starts game
   ↓
2. Request puzzle from API/cache
   ↓
3. Display board with initial numbers
   ↓
4. User makes move
   ↓
5. Validate move locally (instant)
   ↓
6. Update game state (instant)
   ↓
7. Render move on board (instant)
   ↓
8. User continues playing (NO WAITING)
   ↓
9. Repeat 4-8 until puzzle complete

BACKGROUND THREAD (ML Analysis):
4a. User makes move (triggers background job)
    ↓
4b. Extract features in Web Worker (browser) or async task (iOS)
    ↓
4c. Run ML inference (~30-50ms)
    ↓
4d. Get strategy classification + confidence
    ↓
4e. Post result back to main thread
    ↓
4f. Main thread checks if teaching moment needed
    ↓
4g. IF teaching moment: Show subtle badge/notification
    ↓
4h. Player can click badge when ready (or ignore)
    ↓
4i. Track analytics (async to server)
```

**Key Points**:
- UI thread never waits for ML analysis
- Player can make next move immediately
- Feedback appears progressively as analysis completes
- All ML runs client-side (browser or device)

### ML Inference Flow (Web Worker / Async)

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIN THREAD (UI)                        │
└─────────────────────────────────────────────────────────────┘
                           │
            Player makes move (row, col, value)
                           │
                           ├──> Update UI immediately
                           │
                           └──> Post to Web Worker
                                       │
┌─────────────────────────────────────▼────────────────────────┐
│                    WEB WORKER (Background)                    │
├───────────────────────────────────────────────────────────────┤
│  1. Receive move data                                         │
│     ↓                                                         │
│  2. Extract Features:                                         │
│     - Board state (81 values)                                 │
│     - Cell position (2 values)                                │
│     - Number placed (1 value)                                 │
│     - Available candidates (9 values)                         │
│     - Time taken (1 value)                                    │
│     - Move sequence (last 5 moves)                            │
│     ↓                                                         │
│  3. Preprocess Features (normalize, encode)                   │
│     ↓                                                         │
│  4. Run TensorFlow.js Model Inference                         │
│     ↓                                                         │
│  5. Get Predictions:                                          │
│     - Strategy class probabilities [12 values]                │
│     - Confidence score (0-1)                                  │
│     - Teaching moment flag (boolean)                          │
│     ↓                                                         │
│  6. Post result back to main thread                           │
└───────────────────────────────────▲───────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────┐
│                      MAIN THREAD (UI)                          │
├───────────────────────────────────────────────────────────────┤
│  7. Receive ML results                                         │
│     ↓                                                         │
│  8. Check confidence & teaching moment flag                    │
│     ↓                                                         │
│  9. IF teaching moment:                                        │
│     - Show badge/notification (subtle, non-blocking)           │
│     - Store feedback for when player clicks                    │
│     ↓                                                         │
│ 10. IF player clicks badge:                                   │
│     - Display explanation modal/panel                          │
│     - Show visual highlights on board                          │
│     ↓                                                         │
│ 11. Track analytics (async POST to API)                       │
└───────────────────────────────────────────────────────────────┘
```

**Performance Targets**:
- Feature extraction: <5ms
- ML inference: <50ms (p95)
- Total background time: <60ms
- Main thread never blocked
- 60 FPS maintained during inference

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id VARCHAR(255) UNIQUE NOT NULL,
  age_range VARCHAR(20),
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  preferences JSONB
);
```

### Games Table
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  puzzle_id VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  grid_size INTEGER NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  total_time INTEGER,
  moves_count INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress'
);
```

### Moves Table
```sql
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  value INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER,
  strategy_detected VARCHAR(50),
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Progress Table
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  strategy_name VARCHAR(50) NOT NULL,
  proficiency FLOAT DEFAULT 0.0,
  times_used INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  UNIQUE(user_id, strategy_name)
);
```

## ML Model Architecture

### Strategy Classification Model

**Input Layer**: (106 features)
- Board state: 81 (9x9 grid)
- Cell position: 2 (row, col)
- Number placed: 1
- Available candidates: 9 (one-hot encoded)
- Time taken: 1 (normalized)
- Move sequence: 5 (last 5 cells)
- Completion percentage: 1
- Error count: 1
- Previous strategies: 5 (one-hot encoded)

**Architecture**:
```
Input (106)
  ↓
Dense(128, ReLU) + Dropout(0.3)
  ↓
Dense(64, ReLU) + Dropout(0.2)
  ↓
Dense(32, ReLU)
  ↓
Output Layer:
  - Strategy Class: Dense(12, Softmax)  # 12 strategy types
  - Confidence: Dense(1, Sigmoid)
```

**Output**:
- Strategy probabilities (12 classes)
- Confidence score (0-1)

**Model Size**: ~2-3 MB
**Inference Time**: <50ms on modern devices

### Strategy Classes
1. Elimination (basic)
2. Single Candidate
3. Hidden Single
4. Naked Pair
5. Naked Triple
6. Hidden Pair
7. Pointing Pair
8. Box/Line Reduction
9. X-Wing
10. Guessing (to be discouraged)
11. Random/Uncertain
12. Advanced (Y-Wing, Swordfish, etc.)

## API Endpoints

### Puzzle Generation
```
POST /api/puzzle/generate
Body: {
  difficulty: "easy" | "medium" | "hard",
  gridSize: 4 | 6 | 9,
  seed?: string
}
Response: {
  puzzleId: string,
  grid: number[][],
  solution: number[][],
  difficulty: string,
  estimatedTime: number
}
```

### Move Analytics
```
POST /api/analytics/track
Body: {
  gameId: string,
  move: {
    row: number,
    col: number,
    value: number,
    timeTaken: number,
    boardState: number[][]
  }
}
Response: {
  success: boolean,
  strategyDetected?: string,
  teachingMoment?: {
    type: string,
    explanation: string
  }
}
```

### Get Explanation
```
POST /api/teaching/explain
Body: {
  boardState: number[][],
  move: { row: number, col: number, value: number },
  strategy: string
}
Response: {
  explanation: string,
  visualHints: {
    highlightCells: [{ row: number, col: number }],
    arrows?: Array<{from: {}, to: {}}>
  },
  difficulty: "simple" | "moderate" | "advanced"
}
```

## Security Considerations

1. **COPPA Compliance**
   - No personal data from users under 13 without parental consent
   - Anonymous user IDs
   - No email collection for children

2. **Data Privacy**
   - All game data encrypted at rest
   - No cross-user data sharing
   - GDPR-compliant data deletion

3. **Rate Limiting**
   - API endpoints rate-limited via Redis
   - Prevent puzzle generation abuse
   - Anti-cheating measures

4. **Input Validation**
   - Strict validation on all API inputs
   - Sanitize user-generated content
   - Prevent XSS and injection attacks

## Performance Optimizations

1. **Client-Side**
   - ML inference on device (no server round-trip)
   - Puzzle caching in local storage
   - Optimistic UI updates
   - Code splitting for faster initial load

2. **Server-Side**
   - Redis caching for generated puzzles
   - Edge functions for low latency
   - CDN for static assets
   - Database query optimization

3. **Animations**
   - GPU-accelerated transforms
   - RequestAnimationFrame for smooth 60 FPS
   - Respect reduced motion preferences
   - Throttle/debounce events

## Deployment Strategy

### Web (Vercel)
```
main branch → Production
develop branch → Preview
feature/* → Preview deployments
```

### iOS (App Store)
```
TestFlight Beta → Internal Testing
TestFlight Public → External Testing
App Store → Production
```

### ML Models
```
Training → Validation → Conversion → Testing → Deployment
Version control in separate repo
A/B testing for new models
```

## Monitoring & Analytics

1. **Performance Monitoring**
   - Vercel Analytics for web vitals
   - Sentry for error tracking
   - Custom metrics dashboard

2. **User Analytics**
   - Game completion rates
   - Strategy usage patterns
   - Learning progression
   - Difficulty distribution

3. **ML Model Monitoring**
   - Inference latency
   - Prediction confidence scores
   - Model accuracy over time
   - False positive/negative rates

## Key Learnings & Technical Insights

### Strategy-Based Difficulty Validation (2026-01)

**Problem**: Puzzle difficulty was originally based solely on clue count. A "hard" puzzle might actually be solvable with just naked singles - the simplest strategy.

**Solution**: Implemented a strategy-based solver (`lib/sudoku/strategy-solver.ts`) that:
1. Attempts to solve puzzles using only logical strategies (no backtracking guessing)
2. Tracks which strategies are required
3. Returns the actual difficulty based on strategy requirements

**Strategy Hierarchy** (easiest to hardest):
1. **Naked Single** (beginner) - Cell has only one candidate
2. **Hidden Single** (easy) - Value can only go in one cell within a unit
3. **Naked Pair** (medium) - Two cells in unit share same two candidates
4. **Pointing Pair** (hard) - Candidates in box aligned to eliminate in row/col
5. **Box/Line Reduction** (hard) - Row/col candidates confined to one box
6. **Guessing** (expert) - No logical strategy works

**Grid Size Limitations Discovered**:
- **4x4 grids**: Can only achieve beginner/easy difficulty (too small for complex patterns)
- **6x6 grids**: Can reach up to medium difficulty
- **9x9 grids**: Full difficulty range achievable

**Interesting Finding**: Most randomly-generated puzzles with simple clue removal are either too easy (solvable with naked singles) or too hard (require guessing). True "medium" and "hard" puzzles that require specific strategies are relatively rare without specialized generation techniques.

### Hint System Architecture (2026-01)

**Problem**: Original hints just revealed the answer - not educational.

**Solution**: Three-tier hint system:
1. **Naked Singles First**: Find cells with exactly one candidate
2. **Hidden Singles Second**: Find values that can only go in one cell
3. **Naked Pairs Leading to Singles**: For advanced users (Sammy), show pairs that create solvable cells

**Color Coding Philosophy**:
- **Green** = "Fill me!" (solvable cell)
- **Blue/Purple** = "Look at this area" (related cells)
- **Yellow** = "These cells work together" (pairs)
- **Red** = "Oops!" (conflict)

The key insight: Kids learn better from visual patterns than text explanations.

### Performance Considerations

**Puzzle Generation**:
- Strategy validation adds ~10-20ms per attempt
- May require multiple attempts to find valid difficulty match
- Trade-off: Slower generation for accurate difficulty labels

**Strategy Solver Performance**:
- 4x4 beginner: ~1-3ms
- 9x9 medium: ~20-40ms
- 9x9 expert (unsolvable logically): ~100-200ms

---

*Document Version: 1.1*
*Last Updated: 2026-01-08*
