import { useEffect, useRef } from 'react';

export type CelebrationStyle = 'rainbow-droplets' | 'fireworks' | 'particles' | 'waves' | 'sparkles';

interface CelebrationVariantsProps {
  isActive: boolean;
  style: CelebrationStyle;
  onComplete?: () => void;
}

export function CelebrationVariants({ isActive, style, onComplete }: CelebrationVariantsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vRotation: number;
      life: number;
      size: number;
      color: string;
      shape: 'square' | 'circle' | 'star';
    }

    const particles: Particle[] = [];
    const colors = ['#FF69B4', '#00CED1', '#FF1493', '#32CD32', '#FF6347', '#00BFFF', '#FFB6C1', '#9370DB', '#FF4500'];

    let animationId: number;
    const duration = 3500;
    const startTime = Date.now();

    const drawStar = (x: number, y: number, size: number) => {
      const points = 5;
      const outerRadius = size;
      const innerRadius = size * 0.4;

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
    };

    const drawWaterDroplet = (x: number, y: number, size: number, alpha: number) => {
      const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
      gradient.addColorStop(0, `rgba(255, 0, 102, ${alpha})`);
      gradient.addColorStop(0.25, `rgba(255, 170, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(0, 220, 140, ${alpha})`);
      gradient.addColorStop(0.75, `rgba(0, 170, 255, ${alpha})`);
      gradient.addColorStop(1, `rgba(170, 0, 255, ${alpha})`);

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(2, size * 0.12);
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.bezierCurveTo(x - size * 0.7, y - size * 0.35, x - size * 0.9, y + size * 0.3, x, y + size);
      ctx.bezierCurveTo(x + size * 0.9, y + size * 0.3, x + size * 0.7, y - size * 0.35, x, y - size);
      ctx.stroke();
      ctx.restore();
    };

    const createFireworks = () => {
      // Create firework bursts from multiple points
      const burstPoints = [
        { x: canvas.width / 2, y: canvas.height / 2 },
        { x: canvas.width / 3, y: canvas.height / 3 },
        { x: (canvas.width * 2) / 3, y: canvas.height / 3 },
        { x: canvas.width / 3, y: (canvas.height * 2) / 3 },
        { x: (canvas.width * 2) / 3, y: (canvas.height * 2) / 3 },
      ];

      burstPoints.forEach((point) => {
        for (let i = 0; i < 60; i++) {
          const angle = (Math.random() * Math.PI * 2);
          const speed = Math.random() * 15 + 5;
          particles.push({
            x: point.x,
            y: point.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * Math.PI * 2,
            vRotation: (Math.random() - 0.5) * 0.3,
            life: 1,
            size: Math.random() * 10 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: 'square',
          });
        }
      });
    };

    const createParticles = () => {
      // Dense particle cloud
      for (let i = 0; i < 300; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.2,
          life: 1,
          size: Math.random() * 6 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: 'square',
        });
      }
    };

    const createWaves = () => {
      for (let ring = 0; ring < 4; ring++) {
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2;
          const speed = 1.8 + ring * 1.1;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: angle,
            vRotation: 0,
            life: 1,
            size: 6 - ring * 0.7,
            color: colors[ring % colors.length],
            shape: 'circle',
          });
        }
      }
    };

    const createSparkles = () => {
      // Gentle sparkle effect
      for (let i = 0; i < 200; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = Math.random() * 4 + 1;
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.1,
          life: 1,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: 'star',
        });
      }
    };

    const createRainbowDroplets = () => {
      for (let ring = 0; ring < 3; ring++) {
        for (let i = 0; i < 18; i++) {
          const angle = (i / 18) * Math.PI * 2;
          const speed = 2.5 + ring * 1.2;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: angle,
            vRotation: 0.02,
            life: 1,
            size: 10 - ring * 2,
            color: colors[(i + ring) % colors.length],
            shape: 'circle',
          });
        }
      }
    };

    // Initialize particles based on style
    if (style === 'fireworks') {
      createFireworks();
    } else if (style === 'particles') {
      createParticles();
    } else if (style === 'waves') {
      createWaves();
    } else if (style === 'sparkles') {
      createSparkles();
    } else {
      createRainbowDroplets();
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (style === 'waves') {
        const ringCount = 4;
        for (let ring = 0; ring < ringCount; ring++) {
          const ringProgress = Math.max(0, progress - ring * 0.08) / (1 - ring * 0.08);
          if (ringProgress <= 0 || ringProgress >= 1) continue;

          ctx.save();
          ctx.globalAlpha = (1 - ringProgress) * 0.55;
          ctx.strokeStyle = colors[(ring * 2) % colors.length];
          ctx.lineWidth = 8 - ring;
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            60 + ringProgress * (140 + ring * 30),
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      if (style === 'rainbow-droplets') {
        const dropletCount = 10;
        const radius = 70 + progress * 180;
        const dropletSize = Math.max(10, 24 - progress * 14);
        for (let i = 0; i < dropletCount; i++) {
          const angle = (i / dropletCount) * Math.PI * 2 + progress * 0.8;
          drawWaterDroplet(
            canvas.width / 2 + Math.cos(angle) * radius,
            canvas.height / 2 + Math.sin(angle) * radius,
            dropletSize,
            0.8 * (1 - progress)
          );
        }
      }

      // Update and draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (style === 'fireworks' || style === 'particles') {
          p.vy += 0.2;
        } else if (style === 'sparkles') {
          p.vy += 0.05;
        }
        p.rotation += p.vRotation;
        p.life = 1 - progress;

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(0, 0, p.size);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      // Draw responsive text
      if (progress < 0.8) {
        const textAlpha = Math.max(0, 1 - (progress - 0.2) * 2);
        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = '#FF69B4';

        const baseSize = Math.max(22, Math.min(Math.min(canvas.width, canvas.height) * 0.05, 80));
        const subtitleSize = Math.max(30, Math.min(baseSize * 0.8, 36));

        ctx.font = `bold ${baseSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText('🎉 ALL TASKS COMPLETE! 🎉', canvas.width / 2, canvas.height / 2 - baseSize * 0.8);

        ctx.font = `bold ${subtitleSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillText('You are AMAZING!', canvas.width / 2, canvas.height / 2 + baseSize * 0.5);
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
  }, [isActive, style, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
}
