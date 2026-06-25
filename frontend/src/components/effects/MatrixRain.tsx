'use client';

import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: 'gold' | 'red' | 'green';
  opacity?: number;
}

export default function MatrixRain({ color = 'gold', opacity }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A collection of coding symbols and fragments for a developer vibe
    const codingChars = [
      '0', '1', '{', '}', '[', ']', '(', ')', ';', '=>', '&&', '||', '===', '!=', '?', ':',
      'const', 'let', 'func', 'sudo', 'init', 'root', 'api', 'db', 'nil', 'true', 'false',
      'import', 'export', 'class', 'await', 'async', 'git', 'npm', 'push', 'pull', 'clone',
      'dev', 'hub', 'code', 'web', 'data', 'user', 'post', 'get', 'void', 'main', 'null'
    ];

    const fontSize = 14;
    let columns: number;
    let drops: number[];
    let speeds: number[];
    let currentWords: string[][]; // to store word sequences falling down

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -30); // start above screen
      speeds = Array.from({ length: columns }, () => Math.random() * 0.12 + 0.08);
      // Generate some word sequences for each column
      currentWords = Array.from({ length: columns }, () => {
        const wordList: string[] = [];
        while (wordList.length < 50) {
          const item = codingChars[Math.floor(Math.random() * codingChars.length)];
          // If it's a multi-character word, split it into characters so they stack vertically
          if (item.length > 1) {
            wordList.push(...item.split(''));
          } else {
            wordList.push(item);
          }
        }
        return wordList;
      });
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const trailLength = 16;

    const draw = () => {
      // Clear canvas to keep it fully transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const headY = drops[i];

        // Speed calculation with mouse proximity
        const dist = Math.abs(x - mx);
        let speedMultiplier = 1.0;
        let isNearMouse = false;

        if (dist < 120 && mx > 0) {
          // Closer columns move faster
          speedMultiplier = 1.8 - (dist / 120) * 0.8;
          isNearMouse = true;
        }

        // Draw the trail of characters from head backwards
        for (let j = 0; j < trailLength; j++) {
          const yPos = headY - j;
          if (yPos < 0) continue;

          const y = yPos * fontSize;
          if (y > canvas.height + fontSize) continue;

          // Get character from our pre-generated word stack for this column
          const charStack = currentWords[i];
          const charIdx = Math.floor(yPos) % charStack.length;
          const char = charStack[charIdx];

          const fadeRatio = 1 - j / trailLength;
          
          ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

          if (j === 0) {
            // Glowing Head: bright white/cyan or neon yellow/red
            ctx.shadowBlur = isNearMouse ? 12 : 8;
            if (color === 'red') {
              ctx.fillStyle = '#ffcccc';
              ctx.shadowColor = 'rgb(239, 68, 68)';
            } else if (color === 'green') {
              ctx.fillStyle = '#ccffcc';
              ctx.shadowColor = 'rgb(34, 197, 94)';
            } else {
              // gold
              ctx.fillStyle = '#fffae6';
              ctx.shadowColor = 'rgb(201, 168, 76)';
            }
          } else {
            // Trail characters
            ctx.shadowBlur = 0;
            const alpha = fadeRatio * (isNearMouse ? 0.65 : 0.4);
            if (color === 'red') {
              ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
            } else if (color === 'green') {
              ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
            } else {
              // gold
              ctx.fillStyle = `rgba(201, 168, 76, ${alpha})`;
            }
          }

          ctx.fillText(char, x, y);
        }

        // Move the drop head down
        drops[i] += speeds[i] * speedMultiplier;

        // Reset if offscreen
        if ((drops[i] - trailLength) * fontSize > canvas.height) {
          drops[i] = Math.random() * -10 - 2;
          speeds[i] = Math.random() * 0.12 + 0.08;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: opacity !== undefined ? opacity : 1 }}
      aria-hidden="true"
    />
  );
}
