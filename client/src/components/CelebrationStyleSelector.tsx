import { CelebrationStyle } from './CelebrationVariants';
import { Button } from '@/components/ui/button';

interface CelebrationStyleSelectorProps {
  currentStyle: CelebrationStyle;
  onStyleChange: (style: CelebrationStyle) => void;
}

const CELEBRATION_STYLES: { id: CelebrationStyle; label: string; description: string; emoji: string }[] = [
  {
    id: 'rainbow-droplets',
    label: 'Rainbow Droplets',
    description: 'Elegant water droplet ring with rainbow colors',
    emoji: '💧',
  },
  {
    id: 'fireworks',
    label: 'Fireworks',
    description: 'Explosive bursts from multiple points',
    emoji: '🎆',
  },
  {
    id: 'particles',
    label: 'Particles',
    description: 'Dense cloud of colorful particles',
    emoji: '✨',
  },
  {
    id: 'waves',
    label: 'Waves',
    description: 'Expanding concentric rings',
    emoji: '〰️',
  },
  {
    id: 'sparkles',
    label: 'Sparkles',
    description: 'Gentle twinkling star effect',
    emoji: '⭐',
  },
];

export function CelebrationStyleSelector({
  currentStyle,
  onStyleChange,
}: CelebrationStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Celebration Style</h3>
      <div className="grid grid-cols-1 gap-2">
        {CELEBRATION_STYLES.map((style) => (
          <Button
            key={style.id}
            variant={currentStyle === style.id ? 'default' : 'outline'}
            onClick={() => onStyleChange(style.id)}
            className="h-auto py-3 px-4 flex flex-col items-start justify-start text-left transition-all duration-200"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{style.emoji}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{style.label}</p>
                <p className="text-xs opacity-75">{style.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Your celebration style will play when you complete all 12 tasks.
      </p>
    </div>
  );
}
