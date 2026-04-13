import { useDailyPlanner, TASKS } from '@/hooks/useDailyPlanner';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

interface WeekViewProps {
  onNavigateToToday: () => void;
}

export function WeekView({ onNavigateToToday }: WeekViewProps) {
  const { selectedDate, setSelectedDate, getWeekData, getWeekStart } = useDailyPlanner();
  const weekStart = getWeekStart(selectedDate);
  const weekData = getWeekData(weekStart);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDayClick = (date: Date) => {
    setIsAnimating(true);
    setSelectedDate(new Date(date));
    setTimeout(() => {
      onNavigateToToday();
      setIsAnimating(false);
    }, 150);
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground font-serif">
              Week
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToToday}
                className="text-xs"
              >
                Today View
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {formatDateShort(weekStart)} — {formatDateShort(
              new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
            )}
          </p>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 container py-6">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 transition-all duration-300 ${
            isAnimating ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {weekData.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                isToday(day.date)
                  ? 'bg-accent border-accent/50 shadow-md'
                  : 'bg-card border-border hover:border-accent/30'
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  isToday(day.date)
                    ? 'text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {formatWeekday(day.date)}
              </p>
              <p
                className={`text-lg font-bold mb-3 ${
                  isToday(day.date)
                    ? 'text-accent-foreground'
                    : 'text-foreground'
                }`}
              >
                {day.date.getDate()}
              </p>

              {day.isFreeDay ? (
                <div className="text-2xl mb-2">🌿</div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isToday(day.date)
                          ? 'bg-accent-foreground'
                          : 'bg-accent'
                      }`}
                      style={{
                        width: `${Math.round((day.completed / day.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      isToday(day.date)
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {day.completed}/{day.total}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
        <div className="container py-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const prevWeek = new Date(weekStart);
              prevWeek.setDate(prevWeek.getDate() - 7);
              setSelectedDate(prevWeek);
            }}
          >
            ← Previous Week
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedDate(new Date());
            }}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const nextWeek = new Date(weekStart);
              nextWeek.setDate(nextWeek.getDate() + 7);
              setSelectedDate(nextWeek);
            }}
          >
            Next Week →
          </Button>
        </div>
      </div>
    </div>
  );
}
