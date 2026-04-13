import { useDailyPlanner } from '@/hooks/useDailyPlanner';
import { useState } from 'react';
import { CounterSparkleAnimation } from './CounterSparkleAnimation';

export function CounterCards() {
  const { counters, settings, updateCounter } = useDailyPlanner();
  const [editingKey, setEditingKey] = useState<'card1' | 'card2' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [animatingCounter, setAnimatingCounter] = useState<'card1' | 'card2' | null>(null);

  const handleEdit = (key: 'card1' | 'card2') => {
    setEditingKey(key);
    setInputValue(String(counters[key]));
  };

  const handleSave = (key: 'card1' | 'card2') => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value !== counters[key]) {
      updateCounter(key, value);
      setAnimatingCounter(key);
    }
    setEditingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: 'card1' | 'card2') => {
    if (e.key === 'Enter') {
      handleSave(key);
    } else if (e.key === 'Escape') {
      setEditingKey(null);
    }
  };

  return (
    <>
      <CounterSparkleAnimation
        isActive={animatingCounter === 'card1'}
        counterType="card1"
        onComplete={() => setAnimatingCounter(null)}
      />
      <CounterSparkleAnimation
        isActive={animatingCounter === 'card2'}
        counterType="card2"
        onComplete={() => setAnimatingCounter(null)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* Card 1 */}
      <div
        onClick={() => handleEdit('card1')}
        className="relative p-3 sm:p-4 rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all duration-200 cursor-pointer group overflow-hidden"
        style={{
          backgroundImage: `url(${settings.counterSettings.card1BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-200" />

        {/* Content */}
        <div className="relative z-10">
          {editingKey === 'card1' ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/90">
                {settings.counterSettings.card1Label}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'card1')}
                onBlur={() => handleSave('card1')}
                autoFocus
                className="w-full px-2 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white text-center font-bold text-lg"
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium text-white/90 mb-1">
                {settings.counterSettings.card1Label}
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-200 transition-colors">
                {counters.card1}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mt-1">days</p>
            </div>
          )}
        </div>
      </div>

      {/* Card 2 */}
      <div
        onClick={() => handleEdit('card2')}
        className="relative p-3 sm:p-4 rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all duration-200 cursor-pointer group overflow-hidden"
        style={{
          backgroundImage: `url(${settings.counterSettings.card2BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-200" />

        {/* Content */}
        <div className="relative z-10">
          {editingKey === 'card2' ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/90">
                {settings.counterSettings.card2Label}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'card2')}
                onBlur={() => handleSave('card2')}
                autoFocus
                className="w-full px-2 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white text-center font-bold text-lg"
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium text-white/90 mb-1">
                {settings.counterSettings.card2Label}
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                {counters.card2}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mt-1">days</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
