import { useState, useEffect } from 'react';

interface CounterSparkleAnimationProps {
  isActive: boolean;
  counterType: 'card1' | 'card2';
  onComplete: () => void;
}

const MOTIVATIONAL_QUOTES = {
  card1: [
    'Every day sober is a victory. You are reclaiming your power and your future.',
    'Sobriety is not about deprivation—it\'s about liberation. You are choosing freedom.',
    'Your commitment to sobriety is a gift to yourself and everyone who loves you.',
    'Each sober day strengthens your mind, body, and spirit. You are becoming unstoppable.',
    'You are brave. You are strong. You are worthy of this beautiful, sober life.',
    'Sobriety is the foundation of your best self. Keep building.',
    'Your future is brighter than your past. Stay the course.',
  ],
  card2: [
    'Every breath you take is a gift to your future self. You are investing in your health.',
    'Your lungs are healing with every smoke-free day. You are choosing vitality.',
    'Clean lungs mean more energy, more life, more moments with those you love.',
    'You are reclaiming your breath, your strength, and your freedom.',
    'Each day without smoking is a victory for your health and your dreams.',
    'Your respiratory system is thanking you. Keep going.',
    'You are stronger than the urge. You are choosing life.',
  ],
};

export function CounterSparkleAnimation({
  isActive,
  counterType,
  onComplete,
}: CounterSparkleAnimationProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [quote, setQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);

  const handleClose = () => {
    setSparkles([]);
    setShowQuote(false);
    setQuote('');
    onComplete();
  };

  useEffect(() => {
    if (!isActive) return;

    // Generate sparkles
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setSparkles(newSparkles);

    // Select random quote
    const quotes = MOTIVATIONAL_QUOTES[counterType];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Show quote after sparkle animation
    const quoteTimer = setTimeout(() => {
      setShowQuote(true);
    }, 300);

    // Complete animation after quote display
    const completeTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(quoteTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, counterType, onComplete]);

  if (!isActive && !showQuote) return null;

  return (
    <>
      {/* Sparkle Animation Canvas */}
      {sparkles.length > 0 && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                animation: `sparkleFloat 0.8s ease-out forwards`,
                animationDelay: `${sparkle.id * 0.04}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Purple Overlay with Quote */}
      {showQuote && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-6 animate-fadeIn"
          onClick={handleClose}
        >
          <div className="max-w-2xl text-center space-y-6">
            <div className="text-4xl mb-8 animate-bounce">✨</div>
            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed animate-slideUp">
              {quote}
            </p>
            <p className="text-sm text-purple-200 mt-8">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sparkleFloat {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out 0.3s both;
        }
      `}</style>
    </>
  );
}
