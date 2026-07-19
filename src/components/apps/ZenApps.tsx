import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MousePointer2, Settings2, RefreshCw } from 'lucide-react';

export default function ZenPhysicsApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = Math.random() * 3 + 1;
      const hue = Math.random() * 60 + 260; // Blue/Purple range
      this.color = `hsla(${hue}, 80%, 60%, 0.6)`;
    }

    update(width: number, height: number, mouseX: number, mouseY: number) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 150) {
        const force = (150 - dist) / 1500;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update(canvas.width, canvas.height, mousePos.current.x, mousePos.current.y);
      p.draw(ctx);
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const pCount = Math.floor((canvas.width * canvas.height) / 8000);
      const newParticles = Array.from({ length: pCount }, () => new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      setParticles(newParticles);
    };

    resize();
    window.addEventListener('resize', resize);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col select-none overflow-hidden relative group">
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-2xl font-black tracking-tight text-white/90 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" /> ZEN PHYSICS
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Interactive Particle Flow</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 flex items-center gap-2">
          <MousePointer2 className="w-3 h-3" /> HOVER TO ATTRACT
        </div>
      </div>

      <canvas 
        ref={canvasRef}
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }
        }}
        onMouseLeave={() => {
          mousePos.current = { x: -1000, y: -1000 };
        }}
        className="flex-1 w-full h-full cursor-none"
      />
    </div>
  );
}
