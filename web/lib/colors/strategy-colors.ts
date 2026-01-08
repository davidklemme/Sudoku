/**
 * Color Strategy System for RnS SuDoCoach
 *
 * This is the visual teaching language - colors replace text explanations.
 * A 5-year-old can understand: green = fill me, red = oops!
 */

export const HIGHLIGHT_STYLES = {
  // No highlight - default state
  none: '',

  // User selection - where they're focused
  selected: 'ring-2 ring-blue-500 bg-blue-50',

  // SOLVABLE - "Fill me! Only one number works here"
  // Used for: naked single, hidden single, last remaining
  solvable: 'bg-green-200 ring-2 ring-green-400',

  // FOCUS - "Look at this row/column"
  // Used for: showing related cells during hints
  focus: 'bg-blue-200',

  // FOCUS BOX - "Look at this box"
  // Used for: box-specific strategies
  focusBox: 'bg-purple-200',

  // PAIR - "These cells go together"
  // Used for: naked pairs, hidden pairs, pointing pairs
  pair: 'bg-yellow-200 ring-2 ring-yellow-400',

  // ELIMINATION - "This number can't go here"
  // Used for: showing why certain numbers are eliminated
  elimination: 'bg-orange-100',

  // CONFLICT - "Oops! Something's wrong"
  // Used for: duplicate numbers, invalid moves
  conflict: 'bg-red-200 ring-2 ring-red-400',

  // SUCCESS - Celebrate completed row/col/box
  success: 'bg-green-300',

  // HOVER - Subtle feedback on mouse over
  hover: 'bg-gray-50',
} as const;

export type HighlightStyle = keyof typeof HIGHLIGHT_STYLES;

/**
 * Color legend for the CoachZone
 * Maps highlight types to kid-friendly descriptions
 */
export const COLOR_LEGEND: {
  style: HighlightStyle;
  color: string;
  label: string;
  description: string;
}[] = [
  {
    style: 'solvable',
    color: 'bg-green-200 ring-2 ring-green-400',
    label: 'Fill me!',
    description: 'Only one number fits here',
  },
  {
    style: 'pair',
    color: 'bg-yellow-200 ring-2 ring-yellow-400',
    label: 'Look together',
    description: 'These cells are connected',
  },
  {
    style: 'focus',
    color: 'bg-blue-200',
    label: 'Check this',
    description: 'Look at this row or column',
  },
  {
    style: 'conflict',
    color: 'bg-red-200 ring-2 ring-red-400',
    label: 'Oops!',
    description: 'Same number twice - fix it!',
  },
];

/**
 * Number button colors - rainbow gradient for visual appeal
 */
export const NUMBER_COLORS = [
  'bg-blue-500 hover:bg-blue-600 text-white',
  'bg-emerald-500 hover:bg-emerald-600 text-white',
  'bg-yellow-500 hover:bg-yellow-600 text-white',
  'bg-orange-500 hover:bg-orange-600 text-white',
  'bg-red-500 hover:bg-red-600 text-white',
  'bg-pink-500 hover:bg-pink-600 text-white',
  'bg-purple-500 hover:bg-purple-600 text-white',
  'bg-indigo-500 hover:bg-indigo-600 text-white',
  'bg-cyan-500 hover:bg-cyan-600 text-white',
] as const;

/**
 * Get the color class for a number button
 */
export function getNumberColor(num: number): string {
  return NUMBER_COLORS[(num - 1) % NUMBER_COLORS.length];
}
