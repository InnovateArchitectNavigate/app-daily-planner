import { useDailyPlanner, CounterSettings } from '@/hooks/useDailyPlanner';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CelebrationStyleSelector } from './CelebrationStyleSelector';
import { CelebrationStyle } from './CelebrationVariants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTER_BACKGROUND_OPTIONS = [
  { id: 'original-sober', name: 'Original Sober', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/sober-background-bDFkU7TWD7dBBJfyHkpZHT.webp' },
  { id: 'original-healthy', name: 'Original Healthy', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/healthy-lungs-background-eKXsr288wJwJ6wEvGSPAir.webp' },
  { id: 'mountain-sunrise-1', name: 'Mountain Sunrise 1', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-mountain-sunrise-1_2930b4b1.jpg' },
  { id: 'mountain-sunrise-2', name: 'Mountain Sunrise 2', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-mountain-sunrise-2_208d2bbc.jpg' },
  { id: 'mountain-sunrise-3', name: 'Mountain Sunrise 3', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-mountain-sunrise-3_cb38b70a.jpg' },
  { id: 'sunset-beach-1', name: 'Sunset Beach 1', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-sunset-beach-1_f3234b09.jpg' },
  { id: 'sunset-beach-2', name: 'Sunset Beach 2', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-sunset-beach-2_17fa3b57.jpg' },
  { id: 'sunset-beach-3', name: 'Sunset Beach 3', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-sunset-beach-3_81b2c40c.jpg' },
  { id: 'forest-peaceful-1', name: 'Forest Peaceful 1', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-forest-peaceful-1_a7b41145.jpg' },
  { id: 'forest-peaceful-2', name: 'Forest Peaceful 2', url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/bg-forest-peaceful-2_b1f6d81d.jpg' },
  { id: 'game-dev-neon-desk', name: 'Game Dev Neon Desk', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
  { id: 'game-dev-code-screen', name: 'Game Dev Code Screen', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'retro-arcade-room', name: 'Retro Arcade Room', url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80' },
  { id: 'controller-neon', name: 'Controller Neon', url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80' },
  { id: 'pixel-workstation', name: 'Pixel Workstation', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80' },
  { id: 'indie-studio', name: 'Indie Studio', url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80' },
  { id: 'night-city-rain', name: 'Night City Rain', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80' },
  { id: 'city-sunset-glass', name: 'City Sunset Glass', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80' },
  { id: 'skyline-blue-hour', name: 'Skyline Blue Hour', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80&sat=-20' },
  { id: 'cyberpunk-street', name: 'Cyberpunk Street', url: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=1200&q=80' },
  { id: 'city-lights-tower', name: 'City Lights Tower', url: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80' },
  { id: 'skyline-aerial', name: 'Skyline Aerial', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'dance-floor-lights', name: 'Dance Floor Lights', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { id: 'celebration-balloons', name: 'Celebration Balloons', url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80' },
  // { id: 'festival-fireworks', name: 'Festival Fireworks', url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80' },
  { id: 'neon-party-illustration', name: 'Neon Party Illustration', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80' },
  { id: 'confetti-crowd', name: 'Confetti Crowd', url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80' },
  // { id: 'game-jam-team', name: 'Game Jam Team', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
];

const SLEEP_TIMEOUT_PRESETS = [
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

function getSleepTimeoutDisplay(seconds: number) {
  if (seconds === 30) {
    return { value: 30, unit: 'seconds' };
  }

  const minutes = Math.round(seconds / 60);
  return {
    value: minutes,
    unit: minutes === 1 ? 'minute' : 'minutes',
  };
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { counters, counterLabels, counterSettings, settings, updateCounter, updateSettings } = useDailyPlanner();
  const [tempTimeout, setTempTimeout] = useState(settings.sleepModeTimeout);
  const [tempCelebrationStyle, setTempCelebrationStyle] = useState<CelebrationStyle>(settings.celebrationStyle);
  const [tempCounterSettings, setTempCounterSettings] = useState<CounterSettings>(counterSettings);

  // Sync temp state with settings when panel opens or settings change
  useEffect(() => {
    if (isOpen) {
      setTempTimeout(settings.sleepModeTimeout);
      setTempCelebrationStyle(settings.celebrationStyle);
      setTempCounterSettings({
        ...counterSettings,
        card1Label: counterLabels.card1,
        card2Label: counterLabels.card2,
        card1CountdownTarget: counters.card1,
        card2CountdownTarget: counters.card2,
      });
    }
  }, [counterLabels, counterSettings, counters, isOpen, settings]);

  const handleSave = () => {
    updateSettings('sleepModeTimeout', tempTimeout);
    updateSettings('celebrationStyle', tempCelebrationStyle);
    updateSettings('counterSettings', tempCounterSettings);

    if (tempCounterSettings.card1CountdownMode) {
      updateCounter('card1', tempCounterSettings.card1CountdownTarget);
    }

    if (tempCounterSettings.card2CountdownMode) {
      updateCounter('card2', tempCounterSettings.card2CountdownTarget);
    }

    onClose();
  };

  const handleCancel = () => {
    setTempTimeout(settings.sleepModeTimeout);
    setTempCelebrationStyle(settings.celebrationStyle);
    setTempCounterSettings({
      ...counterSettings,
      card1Label: counterLabels.card1,
      card2Label: counterLabels.card2,
      card1CountdownTarget: counters.card1,
      card2CountdownTarget: counters.card2,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30"
        onClick={handleCancel}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card border-l border-border shadow-lg flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground font-serif">Settings</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            title="Close settings"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sleep Mode Timeout Setting */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-2 block">
                Sleep Mode Timeout
              </span>
              <p className="text-xs text-muted-foreground mb-3">
                The app will enter sleep mode after the selected period of inactivity.
              </p>
            </label>

            <div className="space-y-3">
              <input
                type="range"
                min="5"
                max="600"
                step="5"
                value={tempTimeout}
                onChange={(e) => setTempTimeout(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  value={getSleepTimeoutDisplay(tempTimeout).value}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (Number.isNaN(value)) {
                      return;
                    }

                    if (tempTimeout === 30) {
                      if (value >= 5 && value <= 59) {
                        setTempTimeout(value);
                      }
                      return;
                    }

                    if (value >= 1 && value <= 10) {
                      setTempTimeout(value * 60);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-medium text-center"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {getSleepTimeoutDisplay(tempTimeout).unit}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {SLEEP_TIMEOUT_PRESETS.map((preset) => (
                  <button
                    // type="button"
                    key={preset.value}
                    onClick={() => setTempTimeout(preset.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${tempTimeout === preset.value
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Sleep mode displays your affirmation message when you're not actively using the app. Set this to a shorter duration for more frequent reminders.
              </p>
            </div>
          </div>

          {/* Celebration Style Setting */}
          <div className="border-t border-border pt-6">
            <CelebrationStyleSelector
              currentStyle={tempCelebrationStyle}
              onStyleChange={setTempCelebrationStyle}
            />
          </div>

          {/* Counter Settings */}
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Counter Settings</h3>

            {/* Card 1 Settings */}
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground">Card 1</h4>

              <label className="text-xs font-medium text-foreground block">
                Card 1 Label
              </label>
              <input
                type="text"
                value={tempCounterSettings.card1Label}
                onChange={(e) =>
                  setTempCounterSettings({
                    ...tempCounterSettings,
                    card1Label: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
              />

              <label className="text-xs font-medium text-foreground block mt-2">
                <input
                  type="checkbox"
                  checked={tempCounterSettings.card1CountdownMode}
                  onChange={(e) =>
                    setTempCounterSettings({
                      ...tempCounterSettings,
                      card1CountdownMode: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Countdown Mode
              </label>

              {tempCounterSettings.card1CountdownMode && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={tempCounterSettings.card1CountdownTarget}
                    onChange={(e) =>
                      setTempCounterSettings({
                        ...tempCounterSettings,
                        card1CountdownTarget: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
              )}

              <div className="border-t border-border pt-3 mt-3">
                <label className="text-sm font-medium text-foreground block mb-2">Card 1 Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                  {COUNTER_BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      // type="button"
                      key={bg.id}
                      onClick={() =>
                        setTempCounterSettings({
                          ...tempCounterSettings,
                          card1BackgroundImage: bg.url,
                        })
                      }
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${tempCounterSettings.card1BackgroundImage === bg.url
                        ? 'border-accent ring-2 ring-accent'
                        : 'border-border hover:border-accent/50'
                        }`}
                      title={bg.name}
                    >
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      {tempCounterSettings.card1BackgroundImage === bg.url && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>


            </div>

            {/* Card 2 Settings */}
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground">Card 2</h4>

              <label className="text-xs font-medium text-foreground block">
                Card 2 Label
              </label>
              <input
                type="text"
                value={tempCounterSettings.card2Label}
                onChange={(e) =>
                  setTempCounterSettings({
                    ...tempCounterSettings,
                    card2Label: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
              />

              <label className="text-xs font-medium text-foreground block mt-2">
                <input
                  type="checkbox"
                  checked={tempCounterSettings.card2CountdownMode}
                  onChange={(e) =>
                    setTempCounterSettings({
                      ...tempCounterSettings,
                      card2CountdownMode: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Countdown Mode
              </label>

              {tempCounterSettings.card2CountdownMode && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={tempCounterSettings.card2CountdownTarget}
                    onChange={(e) =>
                      setTempCounterSettings({
                        ...tempCounterSettings,
                        card2CountdownTarget: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
              )}



              <div className="border-t border-border pt-3 mt-3">
                <label className="text-sm font-medium text-foreground block mb-2">Card 2 Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                  {COUNTER_BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      // type="button"
                      key={bg.id}
                      onClick={() =>
                        setTempCounterSettings({
                          ...tempCounterSettings,
                          card2BackgroundImage: bg.url,
                        })
                      }
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${tempCounterSettings.card2BackgroundImage === bg.url
                        ? 'border-accent ring-2 ring-accent'
                        : 'border-border hover:border-accent/50'
                        }`}
                      title={bg.name}
                    >
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      {tempCounterSettings.card2BackgroundImage === bg.url && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-6 space-y-2 bg-background/50">
          <Button
            onClick={handleSave}
            className="w-full"
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
