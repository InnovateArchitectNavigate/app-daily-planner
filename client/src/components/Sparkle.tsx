import { useEffect, useRef } from 'react';

interface SparkleProps {
  isActive: boolean;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function Sparkle({ isActive, x, y, onComplete }: SparkleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      rotation: number;
    }> = [];

    // Create sparkle particles radiating from the click point
    const sparkleCount = 12;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    const duration = 800; // 0.8 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw sparkles
      for (const s of sparkles) {
        // Update position
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // Gravity
        s.rotation += 0.1;

        // Fade out
        s.life = 1 - progress;

        // Draw sparkle (star shape)
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle = '#FFD700';

        // Draw star
        const points = 5;
        const outerRadius = s.size;
        const innerRadius = s.size * 0.4;

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, x, y, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
}
