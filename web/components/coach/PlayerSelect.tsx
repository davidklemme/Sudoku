'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerSelectProps {
  onSelect: (name: string) => void;
}

const PRESET_PLAYERS = ['Ruben', 'Sammy'];

/**
 * PlayerSelect - First-time player selection modal
 *
 * The Coach's first greeting! Asks who's playing so we can
 * personalize the experience for Ruben, Sammy, or anyone else.
 */
export function PlayerSelect({ onSelect }: PlayerSelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleCustomSubmit = () => {
    if (customName.trim()) {
      onSelect(customName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="text-5xl mb-3" role="img" aria-label="Coach">
            🤖
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Hi there! I&apos;m your SuDoCoach!
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Who am I helping today?
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {!showCustom ? (
            <>
              {/* Preset player buttons */}
              <div className="flex gap-4 justify-center">
                {PRESET_PLAYERS.map((name) => (
                  <Button
                    key={name}
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
                    onClick={() => onSelect(name)}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              {/* Someone else option */}
              <Button
                variant="outline"
                className="w-full text-muted-foreground"
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
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-center text-lg h-12"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCustom(false);
                    setCustomName('');
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  onClick={handleCustomSubmit}
                  disabled={!customName.trim()}
                >
                  Let&apos;s play!
                </Button>
              </div>
            </div>
          )}

          {/* Skip option */}
          <button
            onClick={() => onSelect('')}
            className="w-full text-center text-sm text-muted-foreground hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
