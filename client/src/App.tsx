import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState } from "react";
import { TodayView } from "./components/TodayView";
import { WeekView } from "./components/WeekView";

function App() {
  const [currentView, setCurrentView] = useState<'today' | 'week'>('today');

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-background">
            {currentView === 'today' ? (
              <TodayView onNavigateToWeek={() => setCurrentView('week')} />
            ) : (
              <WeekView onNavigateToToday={() => setCurrentView('today')} />
            )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onError={() => setHasError(true)}
      onClick={() => {
        // Error boundary for uncaught errors
      }}
    >
      {children}
    </div>
  );
}

export default App;
