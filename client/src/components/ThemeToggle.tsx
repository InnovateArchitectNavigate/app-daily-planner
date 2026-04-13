import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Light</span>
        </>
      )}
    </Button>
  );
}
