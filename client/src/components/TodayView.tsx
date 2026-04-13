import { useDailyPlanner, TASKS } from '@/hooks/useDailyPlanner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CounterCards } from './CounterCards';
import { SleepMode } from './SleepMode';
import { ThemeToggle } from './ThemeToggle';
import { SettingsPanel } from './SettingsPanel';
import { Confetti } from './Confetti';
import { Sparkle } from './Sparkle';
import { CelebrationVariants } from './CelebrationVariants';
import { Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TodayViewProps {
  onNavigateToWeek: () => void;
}

// Sleep mode timeout will be read from settings

export function TodayView({ onNavigateToWeek }: TodayViewProps) {
  const { selectedDate, setSelectedDate, getDayData, toggleTask, toggleFreeDay, getDateKey, settings } = useDailyPlanner();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);
  const isCurrentDay = selectedDateNormalized.getTime() === today.getTime();
  const dayData = getDayData(selectedDate);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [sparklePos, setSparklePos] = useState({ x: 0, y: 0 });
  const [showSparkle, setShowSparkle] = useState(false);
  const [showGrandCelebration, setShowGrandCelebration] = useState(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const completed = dayData.completed.filter(Boolean).length;
  const total = TASKS.length;
  const progressPercent = Math.round((completed / total) * 100);

  // Sleep mode inactivity detection
  useEffect(() => {
    const startSleepTimer = () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }

      const timeoutMs = settings.sleepModeTimeout * 1000;
      sleepTimerRef.current = setTimeout(() => {
        setIsSleepMode(true);
      }, timeoutMs);
    };

    const resetSleepTimer = () => {
      setIsSleepMode(false);
      startSleepTimer();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, resetSleepTimer);
    });

    // Initial timer
    startSleepTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetSleepTimer);
      });
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, [settings.sleepModeTimeout]);

  const handleTaskToggle = (index: number, event?: React.MouseEvent) => {
    const wasCompleted = dayData.completed[index];
    toggleTask(selectedDate, index);

    // Trigger celebration if task is being completed (not uncompleted)
    if (!wasCompleted) {
      setCelebrationActive(true);
      if (event) {
        setSparklePos({ x: event.clientX, y: event.clientY });
        setShowSparkle(true);
      }

      // Check if all tasks will be completed after this toggle
      const newCompleted = dayData.completed.map((c, i) => i === index ? true : c);
      const newCompletedCount = newCompleted.filter(Boolean).length;
      if (newCompletedCount === TASKS.length) {
        // Trigger grand celebration after a short delay
        setTimeout(() => setShowGrandCelebration(true), 300);
      }
    }
  };

  const handleFreeDayToggle = () => {
    setIsAnimating(true);
    toggleFreeDay(selectedDate);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Apply different color scheme for non-current days
  const viewingNonCurrentDay = !isCurrentDay;
  const bgColorClass = viewingNonCurrentDay ? 'bg-slate-100 dark:bg-slate-900' : 'bg-background';

  return (
    <>
      <SleepMode isActive={isSleepMode} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <Confetti isActive={celebrationActive} onComplete={() => setCelebrationActive(false)} />
      <Sparkle isActive={showSparkle} x={sparklePos.x} y={sparklePos.y} onComplete={() => setShowSparkle(false)} />
      <CelebrationVariants isActive={showGrandCelebration} style={settings.celebrationStyle} onComplete={() => setShowGrandCelebration(false)} />
      <div className={`min-h-screen ${bgColorClass} flex flex-col transition-colors duration-300`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 ${viewingNonCurrentDay ? 'bg-slate-200/95 dark:bg-slate-800/95' : 'bg-background/95'} backdrop-blur supports-[backdrop-filter]:${viewingNonCurrentDay ? 'bg-slate-200/60 dark:bg-slate-800/60' : 'bg-background/60'} border-b border-border transition-colors duration-300`}>
          <div className="container py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif">
                {isCurrentDay ? 'Today' : (selectedDateNormalized < today ? 'Past Day' : 'Future Day')}
              </h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Open settings"
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToWeek}
                  className="text-xs"
                >
                  Week View
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatDate(selectedDate)}
                  </p>
                  {!isCurrentDay && (
                    <p className="text-xs sm:text-sm text-accent font-medium mt-1">
                      {selectedDateNormalized < today ? '📅 Past Day' : '🔮 Future Day'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="text-xs"
                  >
                    ← Prev
                  </Button>
                  {!isCurrentDay && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      className="text-xs"
                    >
                      Today
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="text-xs"
                  >
                    Next →
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  {completed} of {total} completed
                </p>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container py-6">
          {/* Counter Cards */}
          <CounterCards />

          {dayData.isFreeDay ? (
            <div
              className={`flex flex-col items-center justify-center py-16 px-4 transition-all duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="text-6xl mb-4">🌿</div>
              <h2 className="text-2xl font-bold text-foreground font-serif mb-2">
                Free Day
              </h2>
              <p className="text-muted-foreground text-center mb-8 max-w-sm">
                You've marked today as a free day. Enjoy your well-deserved rest and relaxation.
              </p>
              <Button
                variant="outline"
                onClick={handleFreeDayToggle}
                className="transition-all duration-200"
              >
                Return to Tasks
              </Button>
            </div>
          ) : (
            <div
              className={`space-y-3 transition-all duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {TASKS.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-200 group cursor-pointer"
                  onClick={(e) => handleTaskToggle(index, e)}
                >
                  <Checkbox
                    id={`task-${index}`}
                    checked={dayData.completed[index]}
                    onCheckedChange={() => {}}
                    className="mt-1 h-6 w-6 rounded-lg border-2 border-accent/50 group-hover:border-accent transition-all duration-200"
                  />
                  <label
                    htmlFor={`task-${index}`}
                    className={`flex-1 text-sm sm:text-base leading-relaxed cursor-pointer transition-all duration-200 ${
                      dayData.completed[index]
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {task}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free Day Toggle Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
          <div className="container py-4">
            <Button
              variant={dayData.isFreeDay ? 'default' : 'outline'}
              onClick={handleFreeDayToggle}
              className="w-full transition-all duration-200"
            >
              {dayData.isFreeDay ? '✓ Free Day Enabled' : 'Mark as Free Day'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
