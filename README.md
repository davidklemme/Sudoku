# Sudoku Fun! 🎨

A beautiful, kid-friendly Sudoku app designed for learning and fun. Built with love for my 5-year-old (and for learning ML along the way!).

## ✨ What Makes This Special

- **Kid-First Design**: Colorful, playful UI that appeals to children
- **Rainbow Number Buttons**: Each number has its own color for easy recognition
- **Thick, Readable Grid**: Clear 3x3 box boundaries (no squinting!)
- **Three Sizes**: 4×4 (Tiny), 6×6 (Medium), 9×9 (Big)
- **Fun Animations**: Bouncy, springy interactions that feel alive
- **Works Without ML**: Fully playable right now
- **ML-Ready**: Infrastructure in place for strategy detection experiments

## 🚀 Quick Start

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 and start playing!

## 🎮 How to Play

1. Click a cell to select it (it lights up pretty!)
2. Click a colorful number button to fill it in
3. Use ✏️ Pencil Mode to add small candidate numbers
4. Made a mistake? Use Undo! ↶
5. Stuck? Hit the 💡 Hint button
6. Complete the puzzle and celebrate! 🎉

## 🎯 Perfect For

- **Kids (5+)**: Large buttons, fun colors, encouraging feedback
- **Parents**: Safe, educational, no ads, works offline
- **ML Learners**: Real codebase to experiment with TensorFlow.js
- **Developers**: Clean TypeScript, good test coverage, modern stack

## 📱 Deploy Your Own

See [DEPLOY.md](./DEPLOY.md) for step-by-step Vercel deployment (takes 5 minutes).

**TL;DR**:
```bash
npm i -g vercel
cd web
vercel
```

## 🧪 For ML Experiments

The app works perfectly without ML, but has full infrastructure ready:

- **Feature Extraction**: 106-dimensional feature vectors from game state
- **Web Worker**: Async inference that never blocks gameplay
- **Mock Mode**: Placeholder for testing UI before training real models
- **Strategy Detection**: Rule-based fallback always works

Want to train a real model? Check out the feature extraction in `web/lib/ml/features.ts`.

## 🏗️ Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** + Framer Motion (animations)
- **Zustand** (state management)
- **Jest** (93 tests, 95%+ coverage)
- **Vercel** (deployment)

## 📂 Project Structure

```
web/
├── app/              # Next.js pages
├── components/       # React components
│   ├── game/        # Board, Cell, NumberPad, Controls
│   └── teaching/    # FeedbackBadge, StrategyStats
├── lib/
│   ├── sudoku/      # Game logic (generator, solver, validator)
│   └── ml/          # ML infrastructure (ready for experiments)
└── tests/           # Unit & integration tests
```

## 🎨 Design Philosophy

**Minimalist but Playful**
- Soft gradient backgrounds (pink → purple → blue)
- Rounded corners everywhere (friendly, not corporate)
- Big, tactile buttons (easy for small fingers)
- Emojis used tastefully (not overdone)
- Smooth animations (spring physics, not linear)

**Kid-Tested Principles**
- ✅ Instant feedback (no waiting)
- ✅ Forgiving (undo anything)
- ✅ Encouraging (celebrate wins, gentle on mistakes)
- ✅ Clear visual hierarchy (board dominates, controls support)
- ✅ No frustration (hints always available)

## 📊 Game Stats

The app tracks:
- ⏱️ Time (updates every second)
- 💡 Hints used
- ❌ Mistakes made
- 📈 Strategies detected (when ML is enabled)

## 🔮 Future Ideas

- [ ] Confetti explosion on puzzle complete (more dramatic!)
- [ ] Sound effects (optional, toggle-able)
- [ ] Daily puzzle challenge
- [ ] Train actual ML model with your gameplay data
- [ ] Parent dashboard (track progress over time)
- [ ] Custom difficulty (auto-adjust based on skill)
- [ ] Share puzzles with friends

## 🤝 Contributing

This is a personal learning project, but ideas welcome! Open an issue if you find bugs or have suggestions.

## 📝 License

MIT - Use it, learn from it, build your own!

---

**Built with ❤️ for family fun and ML learning**

*If your 5-year-old solves a 9×9 Expert puzzle, please open an issue to share the victory!* 🏆

