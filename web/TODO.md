# Sudoku App TODO List

## PWA Setup (In Progress)
- [x] Create PWA manifest.json file
- [ ] Add app icons for iOS (192x192 and 512x512)
- [ ] Configure Next.js for PWA support
- [ ] Add iOS meta tags for home screen in layout.tsx
- [ ] Test iOS Safari compatibility

## Next Steps
1. **Generate app icons** - Create colorful sudoku-themed icons
2. **Update layout.tsx** - Add manifest link and iOS meta tags
3. **Test on iOS** - Verify "Add to Home Screen" works
4. **Implement actual help system** - Visual hints and teaching for kids

## Completed Features
- ✅ Kid-friendly UI with rainbow number buttons
- ✅ Responsive layout (board + controls)
- ✅ Keyboard navigation (arrows + numbers)
- ✅ Shift+Number for pencil marks
- ✅ Auto-clean invalid pencil marks (toggle)
- ✅ Helper lights (row/column/box highlighting with presets)
- ✅ Error feedback toggle
- ✅ Pencil mode for notes
- ✅ Undo/Redo functionality
- ✅ Grid sizes: 4x4, 6x6, 9x9
- ✅ Difficulty levels with preset highlighting

## Known Issues
- Tailwind responsive classes not working reliably (using inline styles as workaround)
- Layout not switching to 2-column on laptop (might be Tailwind v4 issue)
