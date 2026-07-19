import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { themeStore } from '../themeStore';

export default function Desktop({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(themeStore.get());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.width = window.innerWidth;
        height = canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // MATRIX EFFECT
    let matrixColumns: number[] = [];
    if (theme.wallpaper === 'matrix') {
      const fontSize = 14;
      const columnsCount = Math.floor(width / fontSize) + 1;
      matrixColumns = Array(columnsCount).fill(0).map(() => Math.floor(Math.random() * -100));
    }

    // STARFIELD EFFECT
    interface Star {
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;
    }
    let stars: Star[] = [];
    if (theme.wallpaper === 'starfield') {
      const starsCount = 200;
      stars = Array(starsCount).fill(0).map(() => ({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        px: 0,
        py: 0
      }));
    }

    // NEON SINE WAVES
    interface WaveNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseY: number;
      angle: number;
      speed: number;
    }
    let nodes: WaveNode[] = [];
    if (theme.wallpaper === 'neon_waves') {
      const nodesCount = 45;
      nodes = Array(nodesCount).fill(0).map((_, i) => {
        const x = (width / (nodesCount - 1)) * i;
        const baseY = height / 2 + (Math.random() * 100 - 50);
        return {
          x,
          y: baseY,
          vx: 0,
          vy: 0,
          baseY,
          angle: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.02
        };
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      
      if (theme.wallpaper === 'matrix') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#10b981'; // emerald green
        ctx.font = '14px monospace';
        
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
        
        matrixColumns.forEach((y, xIdx) => {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = xIdx * 14;
          
          // Draw brighter tip character
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(char, x, y * 14);
          
          ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
          ctx.fillText(char, x, (y - 1) * 14);
          
          // Drop down column
          matrixColumns[xIdx]++;
          
          // Reset when it goes off screen randomly
          if (matrixColumns[xIdx] * 14 > height && Math.random() > 0.975) {
            matrixColumns[xIdx] = 0;
          }
        });
      } 
      else if (theme.wallpaper === 'starfield') {
        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        
        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
          s.z -= 4; // speed
          if (s.z <= 0) {
            s.z = width;
            s.x = Math.random() * width - cx;
            s.y = Math.random() * height - cy;
            s.px = 0;
            s.py = 0;
          }

          // Projection
          const k = 128.0 / s.z;
          const sx = s.x * k + cx;
          const sy = s.y * k + cy;

          // Star size based on distance
          const r = (1 - s.z / width) * 3 + 0.5;

          if (s.px !== 0) {
            ctx.strokeStyle = `rgba(168, 85, 247, ${1 - s.z / width})`; // soft purple warp trace
            ctx.lineWidth = r;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(s.px, s.py);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();

          s.px = sx;
          s.py = sy;
        });
      }
      else if (theme.wallpaper === 'neon_waves') {
        ctx.fillStyle = '#050409';
        ctx.fillRect(0, 0, width, height);

        // Slow flowing glowing waves
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.accentColor;
        ctx.strokeStyle = `rgba(${parseInt(theme.accentColor.slice(1,3), 16) || 139}, ${parseInt(theme.accentColor.slice(3,5), 16) || 92}, ${parseInt(theme.accentColor.slice(5,7), 16) || 246}, 0.25)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        nodes.forEach((n, i) => {
          n.angle += n.speed;
          n.y = n.baseY + Math.sin(n.angle) * 80;
          
          if (i === 0) {
            ctx.moveTo(n.x, n.y);
          } else {
            // Draw smooth curve
            const prev = nodes[i - 1];
            const xc = (prev.x + n.x) / 2;
            const yc = (prev.y + n.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, xc, yc);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw interactive nodes connected on hover or float
        ctx.fillStyle = theme.accentColor;
        nodes.forEach((n, i) => {
          if (i % 3 === 0) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.wallpaper, theme.accentColor]);

  // Standard CSS aurora background layout
  const isAurora = theme.wallpaper === 'aurora_glow';

  return (
    <div className="flex-1 relative overflow-hidden bg-[#030206] select-none">
      {/* 1. Canvas Layer for high-performance interactive wallpapers */}
      {['matrix', 'starfield', 'neon_waves'].includes(theme.wallpaper) && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      )}

      {/* 2. CSS Aurora Glow Layer */}
      {isAurora && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
          <div 
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"
            style={{ backgroundColor: theme.accentColor, animationDuration: '8s' }}
          />
          <div 
            className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"
            style={{ backgroundColor: '#06b6d4', animationDuration: '12s' }} // cyan-500
          />
          <div 
            className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"
            style={{ backgroundColor: '#ec4899', animationDuration: '10s' }} // pink-500
          />
        </div>
      )}

      {/* 3. Static theme gradient backdrop as fallback */}
      {!['matrix', 'starfield', 'neon_waves', 'aurora_glow'].includes(theme.wallpaper) && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-300 bg-cover bg-center"
          style={{
            background: theme.wallpaper === 'default' 
              ? 'radial-gradient(circle at 30% 20%, #16161a 0%, transparent 60%), radial-gradient(circle at 80% 70%, #0d0d11 0%, #020202 100%)'
              : (theme.wallpaper.startsWith('http') || theme.wallpaper.startsWith('/') || theme.wallpaper.includes('unsplash.com'))
                ? `url("${theme.wallpaper}")`
                : theme.wallpaper
          }}
        />
      )}
      
      {/* 4. Children Layer */}
      <div className="relative w-full h-full z-10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
