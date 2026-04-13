import { useDailyPlanner, CounterSettings } from '@/hooks/useDailyPlanner';
import { Button } from '@/components/ui/button';
import { X, Settings, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CelebrationStyleSelector } from './CelebrationStyleSelector';
import { CelebrationStyle } from './CelebrationVariants';
import TaskEditor from './TaskEditor';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const { settings, updateSettings /*, tasks, updateTasks **/ } = useDailyPlanner();
  const [tempTimeout, setTempTimeout] = useState(settings.sleepModeTimeout);
  const [tempCelebrationStyle, setTempCelebrationStyle] = useState<CelebrationStyle>(settings.celebrationStyle);
  const [tempCounterSettings, setTempCounterSettings] = useState<CounterSettings>(settings.counterSettings);
    // const [tempTasks, setTempTasks] = useState<string[]>(tasks);


  // Sync temp state with settings when panel opens or settings change
  useEffect(() => {
    if (isOpen) {
      setTempTimeout(settings.sleepModeTimeout);
      setTempCelebrationStyle(settings.celebrationStyle);
      setTempCounterSettings(settings.counterSettings);
            // setTempTasks(tasks);

    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings('sleepModeTimeout', tempTimeout);
    updateSettings('celebrationStyle', tempCelebrationStyle);
    updateSettings('counterSettings', tempCounterSettings);
    // updateTasks(tempTasks);

    onClose();
  };

  const handleCancel = () => {
    setTempTimeout(settings.sleepModeTimeout);
    setTempCelebrationStyle(settings.celebrationStyle);
    setTempCounterSettings(settings.counterSettings);
    // updateTasks(tempTasks);

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

            {/* SOBER Counter Settings */}
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <label className="text-xs font-medium text-foreground block">
                [SOBER] Label
              </label>
              <input
                type="text"
                value={tempCounterSettings.soberLabel}
                onChange={(e) =>
                  setTempCounterSettings({
                    ...tempCounterSettings,
                    soberLabel: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
              />

              <label className="text-xs font-medium text-foreground block mt-2">
                <input
                  type="checkbox"
                  checked={tempCounterSettings.soberCountdownMode}
                  onChange={(e) =>
                    setTempCounterSettings({
                      ...tempCounterSettings,
                      soberCountdownMode: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Countdown Mode
              </label>

              {tempCounterSettings.soberCountdownMode && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={tempCounterSettings.soberCountdownTarget}
                    onChange={(e) =>
                      setTempCounterSettings({
                        ...tempCounterSettings,
                        soberCountdownTarget: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
              )}

              <div className="border-t border-border pt-3 mt-3">
                <label className="text-sm font-medium text-foreground block mb-2">Background Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                  {[
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
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() =>
                        setTempCounterSettings({
                          ...tempCounterSettings,
                          soberBackgroundImage: bg.url,
                        })
                      }
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${tempCounterSettings.soberBackgroundImage === bg.url
                        ? 'border-accent ring-2 ring-accent'
                        : 'border-border hover:border-accent/50'
                        }`}
                      title={bg.name}
                    >
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      {tempCounterSettings.soberBackgroundImage === bg.url && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>


            </div>

            {/* HEALTHY LUNGS Counter Settings */}
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <label className="text-xs font-medium text-foreground block">
                [HEALTHY LUNGS] Label
              </label>
              <input
                type="text"
                value={tempCounterSettings.healthyLungsLabel}
                onChange={(e) =>
                  setTempCounterSettings({
                    ...tempCounterSettings,
                    healthyLungsLabel: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
              />

              <label className="text-xs font-medium text-foreground block mt-2">
                <input
                  type="checkbox"
                  checked={tempCounterSettings.healthyLungsCountdownMode}
                  onChange={(e) =>
                    setTempCounterSettings({
                      ...tempCounterSettings,
                      healthyLungsCountdownMode: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Countdown Mode
              </label>

              {tempCounterSettings.healthyLungsCountdownMode && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={tempCounterSettings.healthyLungsCountdownTarget}
                    onChange={(e) =>
                      setTempCounterSettings({
                        ...tempCounterSettings,
                        healthyLungsCountdownTarget: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
              )}



              <div className="border-t border-border pt-3 mt-3">
                <label className="text-sm font-medium text-foreground block mb-2">Background Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                  {[
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
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() =>
                        setTempCounterSettings({
                          ...tempCounterSettings,
                          healthyLungsBackgroundImage: bg.url,
                        })
                      }
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${tempCounterSettings.healthyLungsBackgroundImage === bg.url
                        ? 'border-accent ring-2 ring-accent'
                        : 'border-border hover:border-accent/50'
                        }`}
                      title={bg.name}
                    >
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                      {tempCounterSettings.healthyLungsBackgroundImage === bg.url && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>


          {/* <div className="border-t border-border pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Edit Tasks ({tempTasks.length})</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newTask = `New Task ${tempTasks.length + 1}`;
                  setTempTasks([...tempTasks, newTask]);
                }}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Customize your daily habit-forming tasks. Click Add to create new tasks.
            </p>
            <TaskEditor tasks={tempTasks} onTasksChange={setTempTasks} />
          </div> */}

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
