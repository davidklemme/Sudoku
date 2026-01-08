'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
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

/**
 * ActionBar - Game action buttons
 *
 * Clean, accessible buttons for game controls.
 * Undo, Redo, Pencil mode, Hint, Clear, New Game
 */
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
    <TooltipProvider delayDuration={300}>
      <div className="flex justify-center gap-2 md:gap-3">
        <ActionButton
          icon={Undo2}
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ActionButton
          icon={Redo2}
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        />
        <ActionButton
          icon={Pencil}
          label="Notes"
          onClick={onTogglePencil}
          active={isPencilMode}
          activeColor="bg-orange-500 hover:bg-orange-600 text-white"
        />
        <ActionButton
          icon={Lightbulb}
          label="Hint"
          onClick={onHint}
          highlight
        />
        <ActionButton icon={Trash2} label="Clear" onClick={onClear} />
        <ActionButton icon={RefreshCw} label="New" onClick={onNewGame} />
      </div>
    </TooltipProvider>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
  highlight?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  activeColor,
  highlight,
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={active ? 'default' : 'outline'}
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              'w-11 h-11 md:w-12 md:h-12',
              active && activeColor,
              highlight && 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
              disabled && 'opacity-50'
            )}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
            <span className="sr-only">{label}</span>
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
