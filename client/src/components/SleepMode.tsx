import { useEffect, useState } from 'react';

interface SleepModeProps {
  isActive: boolean;
}

const AFFIRMATION = 'I EXPAND IN ABUNDANCE LOVE AND SUCCESS EVERY DAY, AS I INSPIRE THOSE AROUND ME TO DO THE SAME';

export function SleepMode({ isActive }: SleepModeProps) {
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayText('');
      setCharIndex(0);
      return;
    }

    // Typing animation
    if (charIndex < AFFIRMATION.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + AFFIRMATION[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, charIndex]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-8 animate-fadeIn">
        <div className="space-y-4">
          <div className="text-6xl mb-8 animate-pulse">✨</div>
          <p className="text-3xl sm:text-4xl font-bold text-foreground font-serif leading-relaxed min-h-32 flex items-center justify-center">
            {displayText}
            {charIndex < AFFIRMATION.length && (
              <span className="animate-pulse ml-1">|</span>
            )}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {charIndex === AFFIRMATION.length && (
            <span className="animate-pulse">Move your mouse or tap to return</span>
          )}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}
