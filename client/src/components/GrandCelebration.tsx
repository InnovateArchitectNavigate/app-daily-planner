import { useEffect, useRef } from 'react';

interface GrandCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function GrandCelebration({ isActive, onComplete }: GrandCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle types
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vRotation: number;
      life: number;
      size: number;
      type: 'confetti' | 'star' | 'circle' | 'ribbon';
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['#FF69B4', '#00CED1', '#FF1493', '#32CD32', '#FF6347', '#00BFFF', '#FFB6C1', '#9370DB', '#FF4500'];

    // Create massive confetti burst
    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.3,
        life: 1,
        size: Math.random() * 12 + 6,
        type: 'confetti',
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Create star burst
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const speed = Math.random() * 10 + 5;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.2,
        life: 1,
        size: Math.random() * 6 + 3,
        type: 'star',
        color: '#FF69B4',
      });
    }

    // Create expanding circles
    for (let i = 0; i < 60; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: 0,
        vRotation: 0,
        life: 1,
        size: Math.random() * 8 + 4,
        type: 'circle',
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Create ribbon trails
    for (let i = 0; i < 40; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 6 + 2;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: angle,
        vRotation: (Math.random() - 0.5) * 0.15,
        life: 1,
        size: Math.random() * 4 + 2,
        type: 'ribbon',
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;
    const duration = 3500; // 3.5 seconds
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

    const drawWaterDroplet = (x: number, y: number, size: number, progress: number) => {
      // Draw water droplet outline with rainbow gradient
      const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);

      // Rainbow colors
      gradient.addColorStop(0, `rgba(255, 0, 0, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(0.17, `rgba(255, 127, 0, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(0.33, `rgba(255, 255, 0, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(0.5, `rgba(0, 255, 0, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(0.67, `rgba(0, 0, 255, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(0.83, `rgba(75, 0, 130, ${0.4 * (1 - progress)})`);
      gradient.addColorStop(1, `rgba(148, 0, 211, ${0.4 * (1 - progress)})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();

      // Draw water droplet shape
      ctx.moveTo(x, y - size);
      ctx.bezierCurveTo(x - size * 0.6, y - size * 0.4, x - size * 0.8, y + size * 0.3, x, y + size);
      ctx.bezierCurveTo(x + size * 0.8, y + size * 0.3, x + size * 0.6, y - size * 0.4, x, y - size);
      ctx.stroke();
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas with slight fade trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw expanding rainbow water droplet ring
      const ringRadius = 100 + progress * 300;
      const ringSize = 40 * (1 - progress);
      if (ringSize > 0) {
        drawWaterDroplet(canvas.width / 2, canvas.height / 2 - ringRadius, ringSize, progress);
        drawWaterDroplet(canvas.width / 2 + ringRadius, canvas.height / 2, ringSize, progress);
        drawWaterDroplet(canvas.width / 2, canvas.height / 2 + ringRadius, ringSize, progress);
        drawWaterDroplet(canvas.width / 2 - ringRadius, canvas.height / 2, ringSize, progress);
      }

      // Update and draw particles
      for (const p of particles) {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.rotation += p.vRotation;

        // Fade out
        p.life = 1 - progress;

        // Draw particle based on type
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'confetti') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.type === 'star') {
          ctx.fillStyle = p.color;
          drawStar(0, 0, p.size);
        } else if (p.type === 'circle') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ribbon') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * 3, p.size, p.size * 6);
        }

        ctx.restore();
      }

      // Draw responsive text celebration
      if (progress < 0.8) {
        const textAlpha = Math.max(0, 1 - (progress - 0.2) * 2);
        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = '#FF69B4';

        // Responsive font sizes based on viewport
        const baseSize = Math.max(28, Math.min(Math.min(canvas.width, canvas.height) * 0.08, 72));
        const subtitleSize = Math.max(18, Math.min(baseSize * 0.5, 36));

        ctx.font = `bold ${baseSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add subtle shadow
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
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
}
