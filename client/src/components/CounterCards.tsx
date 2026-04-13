import { useDailyPlanner } from '@/hooks/useDailyPlanner';
import { useState } from 'react';
import { CounterSparkleAnimation } from './CounterSparkleAnimation';

const BACKGROUND_IMAGES = {
  sober: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/sober-background-bDFkU7TWD7dBBJfyHkpZHT.webp',
  healthyLungs: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/healthy-lungs-background-eKXsr288wJwJ6wEvGSPAir.webp',
};

export function CounterCards() {
  const { counters, updateCounter } = useDailyPlanner();
  const [editingKey, setEditingKey] = useState<'sober' | 'healthyLungs' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [animatingCounter, setAnimatingCounter] = useState<'sober' | 'healthyLungs' | null>(null);

  const handleEdit = (key: 'sober' | 'healthyLungs') => {
    setEditingKey(key);
    setInputValue(String(counters[key]));
  };

  const handleSave = (key: 'sober' | 'healthyLungs') => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value !== counters[key]) {
      updateCounter(key, value);
      setAnimatingCounter(key);
    }
    setEditingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: 'sober' | 'healthyLungs') => {
    if (e.key === 'Enter') {
      handleSave(key);
    } else if (e.key === 'Escape') {
      setEditingKey(null);
    }
  };

  return (
    <>
      <CounterSparkleAnimation
        isActive={animatingCounter === 'sober'}
        counterType="sober"
        onComplete={() => setAnimatingCounter(null)}
      />
      <CounterSparkleAnimation
        isActive={animatingCounter === 'healthyLungs'}
        counterType="healthyLungs"
        onComplete={() => setAnimatingCounter(null)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* SOBER Counter */}
      <div
        onClick={() => handleEdit('sober')}
        className="relative p-3 sm:p-4 rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all duration-200 cursor-pointer group overflow-hidden"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES.sober})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-200" />

        {/* Content */}
        <div className="relative z-10">
          {editingKey === 'sober' ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/90">
                [SOBER]
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'sober')}
                onBlur={() => handleSave('sober')}
                autoFocus
                className="w-full px-2 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white text-center font-bold text-lg"
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium text-white/90 mb-1">
                [SOBER]
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-200 transition-colors">
                {counters.sober}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mt-1">days</p>
            </div>
          )}
        </div>
      </div>

      {/* HEALTHY LUNGS Counter */}
      <div
        onClick={() => handleEdit('healthyLungs')}
        className="relative p-3 sm:p-4 rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all duration-200 cursor-pointer group overflow-hidden"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES.healthyLungs})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-200" />

        {/* Content */}
        <div className="relative z-10">
          {editingKey === 'healthyLungs' ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/90">
                [HEALTHY LUNGS]
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'healthyLungs')}
                onBlur={() => handleSave('healthyLungs')}
                autoFocus
                className="w-full px-2 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white text-center font-bold text-lg"
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium text-white/90 mb-1">
                [HEALTHY LUNGS]
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                {counters.healthyLungs}
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
