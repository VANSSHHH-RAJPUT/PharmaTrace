import React, { useEffect, useRef } from 'react';

const COLORS = [
  { r: 0,   g: 212, b: 255 }, // cyan
  { r: 124, g: 58,  b: 237 }, // purple
  { r: 0,   g: 255, b: 136 }, // green
  { r: 245, g: 158, b: 11  }, // amber
  { r: 236, g: 72,  b: 153 }, // pink
];

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = 90;
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
      const color = COLORS[i % COLORS.length];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        r: color.r, g: color.g, b: color.b,
      };
    });

    const MAX_DIST = 160;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Lines with gradient between two node colors
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.4;

            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${opacity})`);
            grad.addColorStop(1, `rgba(${b.r},${b.g},${b.b},${opacity})`);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes with glow
      nodes.forEach(n => {
        const glow = 0.6 + 0.4 * Math.sin(n.pulse);

        // Outer glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 5);
        gradient.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${0.3 * glow})`);
        gradient.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.r},${n.g},${n.b},${0.85 * glow})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${n.r},${n.g},${n.b},0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    />
  );
};

export default AnimatedBackground;