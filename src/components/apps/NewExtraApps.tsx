import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, RefreshCw, Volume2, Gamepad2, Award } from 'lucide-react';
import { themeStore } from '../../themeStore';
import { speakText } from '../../lib/sounds';

export function DrumSequencerApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [grid, setGrid] = useState<boolean[][]>(() => Array.from({ length: 4 }, () => Array(16).fill(false)));
  const [currentStep, setCurrentStep] = useState(0);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const stepRef = useRef(0);
  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const gridRef = useRef(grid);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  
  const instruments = ['Kick', 'Snare', 'Hi-Hat', 'Open Hat'];
  
  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, i) => i === row ? r.map((c, j) => j === col ? !c : c) : [...r]);
    setGrid(newGrid);
  };
  
  const playSound = (type: number, time: number) => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 0) { // Kick
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.5);
    } else if (type === 1) { // Snare
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, time);
      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      osc.start(time);
      osc.stop(time + 0.2);
    } else if (type === 2 || type === 3) { // Hats
      osc.type = 'square';
      osc.frequency.setValueAtTime(type === 2 ? 8000 : 5000, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + (type === 2 ? 0.05 : 0.3));
      osc.start(time);
      osc.stop(time + (type === 2 ? 0.05 : 0.3));
    }
  };
  
  const scheduleNote = (step: number, time: number) => {
    for (let i = 0; i < 4; i++) {
      if (gridRef.current[i][step]) {
        playSound(i, time);
      }
    }
    setTimeout(() => {
      setCurrentStep(step);
    }, (time - (audioCtx.current?.currentTime || 0)) * 1000);
  };
  
  const scheduler = () => {
    if (!audioCtx.current) return;
    while (nextNoteTime.current < audioCtx.current.currentTime + 0.1) {
      scheduleNote(stepRef.current, nextNoteTime.current);
      nextNoteTime.current += (60.0 / tempo) / 4; // 16th notes
      stepRef.current = (stepRef.current + 1) % 16;
    }
    timerID.current = window.setTimeout(scheduler, 25);
  };
  
  const togglePlay = () => {
    if (isPlaying) {
      if (timerID.current) clearTimeout(timerID.current);
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
      stepRef.current = 0;
      nextNoteTime.current = audioCtx.current.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  };
  
  useEffect(() => {
    return () => {
      if (timerID.current) clearTimeout(timerID.current);
    };
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 p-6 flex flex-col text-slate-200 select-none overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-fuchsia-400 font-mono tracking-widest">BEAT_MAKER_9000</h2>
        <div className="flex items-center gap-4">
          <input 
            type="range" min="60" max="200" value={tempo} 
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-32 accent-fuchsia-500 bg-slate-900 h-1 rounded-full cursor-pointer"
          />
          <span className="font-mono text-sm">{tempo} BPM</span>
          <button 
            onClick={togglePlay}
            className={`px-4 py-2 rounded font-bold tracking-widest flex items-center gap-2 text-xs transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-fuchsia-600 text-white hover:bg-fuchsia-500'}`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        {instruments.map((inst, row) => (
          <div key={row} className="flex items-center gap-4 flex-1">
            <div className="w-24 font-bold text-xs text-slate-400 uppercase tracking-wider">{inst}</div>
            <div className="flex-1 grid gap-1 h-full py-1.5" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
              {grid[row].map((cell, col) => (
                <div 
                  key={col}
                  onClick={() => toggleCell(row, col)}
                  className={`border border-slate-800 rounded-md cursor-pointer transition-all ${
                    cell 
                      ? (col % 4 === 0 ? 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-lg shadow-fuchsia-500/20' : 'bg-fuchsia-500') 
                      : (col % 4 === 0 ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-slate-900/60 hover:bg-slate-800')
                  } ${currentStep === col && isPlaying ? 'ring-2 ring-white scale-105' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2D particle definition for pong sparks
interface PongParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

export function PongApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [gameMode, setGameMode] = useState<'ai' | 'twoPlayer'>('ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'impossible'>('medium');
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);
  
  const particlesRef = useRef<PongParticle[]>([]);
  const shakeFrameRef = useRef(0);

  const gameState = useRef({
    p1x: 40,
    p2x: 40,
    bx: 50,
    by: 50,
    vx: 0.8,
    vy: 1.2,
    paddleWidth: 22,  // horizontal width
    paddleHeight: 2.5, // vertical thickness
    ballSize: 2.4,
    speedMultiplier: 1.0,
  });

  // Synthesizes retro-style local bleep sounds
  const playPongSound = (type: 'paddle' | 'wall' | 'score' | 'win') => {
    const currentTheme = themeStore.get();
    if (currentTheme.soundPack === 'muted' || isMuted) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      
      if (type === 'paddle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'wall') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'score') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'win') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (err) {
      // Audio context fails safely
    }
  };

  // Spark Generator helper
  const createSparks = (x: number, y: number, color: string, count = 12) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    
    const scaleX = w / 100;
    const scaleY = h / 100;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: x * scaleX,
        y: y * scaleY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keys.current[e.key] = true; 
      // Prevent browser scroll behaviors for keys used in the game
      if (['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Computer AI paddle solver logic
  const runAIPhysics = (s: any) => {
    // Determine AI speed based on difficulty choice
    let aiSpeed = 0.65;
    if (difficulty === 'easy') aiSpeed = 0.45;
    if (difficulty === 'impossible') aiSpeed = 1.6;

    // Predicted position with slight organic error
    const ballTarget = s.bx + (Math.random() - 0.5) * (difficulty === 'easy' ? 8 : 2);
    const paddleCenter = s.p2x + s.paddleWidth / 2;

    if (s.vy < 0) { // Ball moving toward AI (Upwards)
      if (paddleCenter < ballTarget - 2) {
        s.p2x += aiSpeed;
      } else if (paddleCenter > ballTarget + 2) {
        s.p2x -= aiSpeed;
      }
    } else { // Return to center when ball is away
      if (paddleCenter < 48) s.p2x += aiSpeed * 0.5;
      if (paddleCenter > 52) s.p2x -= aiSpeed * 0.5;
    }
  };

  // Main game update physics loop
  const update = () => {
    if (!started || winner) return;
    const s = gameState.current;
    
    // Player 1 Movement (ArrowLeft / ArrowRight)
    if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) s.p1x -= 1.6;
    if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) s.p1x += 1.6;
    
    // Player 2 / AI Movement
    if (gameMode === 'twoPlayer') {
      if (keys.current['w'] || keys.current['W']) s.p2x -= 1.6;
      if (keys.current['s'] || keys.current['S']) s.p2x += 1.6;
    } else {
      runAIPhysics(s);
    }
    
    // Contain paddles on board
    s.p1x = Math.max(0, Math.min(100 - s.paddleWidth, s.p1x));
    s.p2x = Math.max(0, Math.min(100 - s.paddleWidth, s.p2x));
    
    // Ball displacement
    s.bx += s.vx * s.speedMultiplier;
    s.by += s.vy * s.speedMultiplier;
    
    // Left / Right wall bounces (Horizontal boundary limits)
    if (s.bx <= 0) {
      s.bx = 0;
      s.vx = Math.abs(s.vx);
      playPongSound('wall');
      shakeFrameRef.current = 5;
      createSparks(0.5, s.by, '#22d3ee', 4); // cyan sparkles
    }
    if (s.bx >= 100 - s.ballSize) {
      s.bx = 100 - s.ballSize;
      s.vx = -Math.abs(s.vx);
      playPongSound('wall');
      shakeFrameRef.current = 5;
      createSparks(99.5, s.by, '#22d3ee', 4);
    }
    
    // Paddle Collision Solvers (Horizontal paddle bounds)
    // Player 2 / AI (Top Side, computer)
    if (s.by <= 3 + s.paddleHeight && s.by >= 2) {
      if (s.bx + s.ballSize >= s.p2x && s.bx <= s.p2x + s.paddleWidth) {
        const relativeIntersectionX = (s.p2x + (s.paddleWidth / 2)) - (s.bx + s.ballSize / 2);
        const normalizedRelativeIntersectionX = relativeIntersectionX / (s.paddleWidth / 2);
        
        // Deflection angle logic
        const bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 3.5);
        s.vx = -Math.sin(bounceAngle) * 1.3;
        s.vy = Math.abs(Math.cos(bounceAngle)) * 1.3;
        
        // Accelerate velocity slightly
        s.speedMultiplier = Math.min(1.8, s.speedMultiplier * 1.06);
        s.by = 3 + s.paddleHeight;
        
        playPongSound('paddle');
        shakeFrameRef.current = 8;
        createSparks(s.bx, s.by, '#a855f7', 14); // Purple neon sparks
      }
    }
    
    // Player 1 (Bottom Side, user)
    if (s.by + s.ballSize >= 97 - s.paddleHeight && s.by <= 98) {
      if (s.bx + s.ballSize >= s.p1x && s.bx <= s.p1x + s.paddleWidth) {
        const relativeIntersectionX = (s.p1x + (s.paddleWidth / 2)) - (s.bx + s.ballSize / 2);
        const normalizedRelativeIntersectionX = relativeIntersectionX / (s.paddleWidth / 2);
        
        const bounceAngle = normalizedRelativeIntersectionX * (Math.PI / 3.5);
        s.vx = -Math.sin(bounceAngle) * 1.3;
        s.vy = -Math.abs(Math.cos(bounceAngle)) * 1.3;
        
        s.speedMultiplier = Math.min(1.8, s.speedMultiplier * 1.06);
        s.by = 97 - s.paddleHeight - s.ballSize;
        
        playPongSound('paddle');
        shakeFrameRef.current = 8;
        createSparks(s.bx, s.by, '#ec4899', 14); // Pink neon sparks
      }
    }
    
    // Top edge score (Player 1 scores!)
    if (s.by < 0) {
      playPongSound('score');
      createSparks(s.bx, 5, '#22c55e', 25);
      setScore(prev => {
        const next = { ...prev, p1: prev.p1 + 1 };
        if (next.p1 >= 5) {
          setWinner('PLAYER 1');
          playPongSound('win');
          speakText("Congratulations! Player 1 is victorious!");
        } else {
          speakText(`Point Player one. Score is ${next.p1} to ${prev.p2}`);
        }
        return next;
      });
      resetBall(-1);
    }
    
    // Bottom edge score (Computer/P2 scores!)
    if (s.by > 100) {
      playPongSound('score');
      createSparks(s.bx, 95, '#ef4444', 25);
      setScore(prev => {
        const next = { ...prev, p2: prev.p2 + 1 };
        if (next.p2 >= 5) {
          const winnerName = gameMode === 'ai' ? 'CYBER AI' : 'PLAYER 2';
          setWinner(winnerName);
          playPongSound('win');
          speakText(`Game over. ${winnerName} takes the championship!`);
        } else {
          speakText(gameMode === 'ai' ? `Point Computer. Score is ${prev.p1} to ${next.p2}` : `Point Player two. Score is ${prev.p1} to ${next.p2}`);
        }
        return next;
      });
      resetBall(1);
    }
    
    // Update active particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    
    draw();
    requestRef.current = requestAnimationFrame(update);
  };
  
  const resetBall = (dir: number) => {
    const s = gameState.current;
    s.bx = 25 + Math.random() * 50;
    s.by = 50;
    s.vx = (Math.random() - 0.5) * 1.5;
    s.vy = dir * 1.1;
    s.speedMultiplier = 1.0;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const s = gameState.current;
    
    ctx.save();
    
    // Handle Screen Shake Translation
    if (shakeFrameRef.current > 0) {
      const shakeAmt = shakeFrameRef.current * 1.2;
      const dx = (Math.random() - 0.5) * shakeAmt;
      const dy = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(dx, dy);
      shakeFrameRef.current--;
    }
    
    // Clean canvas with deep grid background
    ctx.fillStyle = '#05050c';
    ctx.fillRect(0, 0, w, h);
    
    // Cyberpunk grid backdrop
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Holographic retro divide line (horizontal in the middle)
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
    
    // Glowing visualizers for paddles
    const scaleX = w / 100;
    const scaleY = h / 100;
    
    // Draw Top Paddle (P2 or AI) - Neon Purple
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#a855f7';
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(
      s.p2x * scaleX, 
      2 * scaleY, 
      s.paddleWidth * scaleX, 
      s.paddleHeight * scaleY
    );
    
    // Draw Bottom Paddle (Player 1) - Neon Pink
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(
      s.p1x * scaleX, 
      (98 - s.paddleHeight) * scaleY, 
      s.paddleWidth * scaleX, 
      s.paddleHeight * scaleY
    );
    
    // Draw Ball - Glowing Cyan Sphere
    ctx.shadowColor = '#22d3ee';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const ballRad = (s.ballSize / 2) * scaleX;
    ctx.arc(
      s.bx * scaleX + ballRad, 
      s.by * scaleY + ballRad, 
      ballRad, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw all active neon sparks
    ctx.shadowBlur = 0; // turn off shadow for tiny sparks performance
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0; // reset
    
    ctx.restore();
  };
  
  // Game physics state initializer trigger on started status
  useEffect(() => {
    if (started && !winner) {
      speakText(`Starting Pong match against ${gameMode === 'ai' ? 'cyber intelligence' : 'Player two'}`);
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [started, winner, gameMode]);
  
  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          draw();
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartGame = () => {
    setScore({ p1: 0, p2: 0 });
    setWinner(null);
    resetBall(1);
    setStarted(true);
  };

  const handleMainMenu = () => {
    setStarted(false);
    setWinner(null);
    setScore({ p1: 0, p2: 0 });
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none outline-none font-sans" tabIndex={0}>
      
      {!started ? (
        // STUNNING NEON ARCHADE TITLE SCREEN
        <div className="flex flex-col items-center justify-center text-center p-8 z-10 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-cyan-500 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(236,72,153,0.3)] animate-pulse">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-400 to-cyan-400 mb-1 filter drop-shadow-[0_2px_10px_rgba(236,72,153,0.2)]">
            CYBERPONG
          </h1>
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-8 font-mono">NEON VECTOR ARCADE v2099</p>
          
          {/* Settings Box */}
          <div className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-2xl mb-6 space-y-4">
            
            {/* Game Mode */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-left">Championship Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setGameMode('ai'); speakText("vs smart computer AI"); }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${gameMode === 'ai' ? 'bg-fuchsia-600/15 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300'}`}
                >
                  VS Cyber AI
                </button>
                <button
                  onClick={() => { setGameMode('twoPlayer'); speakText("Local 2-player mode selected"); }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${gameMode === 'twoPlayer' ? 'bg-fuchsia-600/15 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300'}`}
                >
                  Local 2-Player
                </button>
              </div>
            </div>

            {/* AI Difficulty (Only if vs AI) */}
            {gameMode === 'ai' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-left">Neural Net Difficulty</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'impossible'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => { setDifficulty(diff); speakText(`Difficulty ${diff}`); }}
                      className={`py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${difficulty === diff ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.1)]' : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                    >
                      {diff === 'impossible' ? 'Cyber' : diff}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleStartGame}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(236,72,153,0.4)] hover:shadow-[0_4px_22px_rgba(236,72,153,0.5)] active:scale-[0.98]"
          >
            LAUCH MATCH
          </button>
        </div>
      ) : (
        // THE IN-GAME ARENA SCREEN
        <>
          {/* Header Dashboard HUD */}
          <div className="absolute top-4 inset-x-0 flex justify-between items-center px-10 z-10 pointer-events-auto">
            <button
              onClick={handleMainMenu}
              className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors"
            >
              QUIT GAME
            </button>
            
            <div className="flex items-center gap-12 font-mono">
              <div className="text-center">
                <p className="text-[9px] font-bold text-pink-500 tracking-widest uppercase">P1 Score</p>
                <div className="text-4xl font-black text-white filter drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]">{score.p1}</div>
              </div>
              <div className="text-slate-700 text-xl font-bold">VS</div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-purple-500 tracking-widest uppercase">
                  {gameMode === 'ai' ? 'CYBER AI' : 'P2 Score'}
                </p>
                <div className="text-4xl font-black text-white filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">{score.p2}</div>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg border transition-all ${isMuted ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'}`}
              title={isMuted ? "Unmute Game Audio" : "Mute Game Audio"}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ACTIVE CANVAS INTERACTION FIELD */}
          <div className="flex-1 w-full h-full relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            
            {/* MOBILE ON-SCREEN TOUCH CONTROLLERS */}
            {/* Player 1 (Bottom Paddle) Controllers */}
            <div className="absolute left-6 bottom-16 flex gap-4 z-20 md:opacity-60 hover:opacity-100 transition-opacity">
              <button
                onTouchStart={() => { keys.current['ArrowLeft'] = true; }}
                onTouchEnd={() => { keys.current['ArrowLeft'] = false; }}
                onMouseDown={() => { keys.current['ArrowLeft'] = true; }}
                onMouseUp={() => { keys.current['ArrowLeft'] = false; }}
                onMouseLeave={() => { keys.current['ArrowLeft'] = false; }}
                className="w-14 h-14 rounded-xl bg-slate-900/80 active:bg-pink-600/40 border border-slate-700/80 active:border-pink-500 shadow-lg text-pink-400 active:text-white flex flex-col items-center justify-center select-none cursor-pointer"
                style={{ touchAction: 'none' }}
                title="P1 Move Left"
              >
                <span className="text-xl font-black font-mono">◀</span>
                <span className="text-[7px] font-bold text-pink-500 uppercase tracking-widest font-sans">LEFT</span>
              </button>
              <button
                onTouchStart={() => { keys.current['ArrowRight'] = true; }}
                onTouchEnd={() => { keys.current['ArrowRight'] = false; }}
                onMouseDown={() => { keys.current['ArrowRight'] = true; }}
                onMouseUp={() => { keys.current['ArrowRight'] = false; }}
                onMouseLeave={() => { keys.current['ArrowRight'] = false; }}
                className="w-14 h-14 rounded-xl bg-slate-900/80 active:bg-pink-600/40 border border-slate-700/80 active:border-pink-500 shadow-lg text-pink-400 active:text-white flex flex-col items-center justify-center select-none cursor-pointer"
                style={{ touchAction: 'none' }}
                title="P1 Move Right"
              >
                <span className="text-xl font-black font-mono">▶</span>
                <span className="text-[7px] font-bold text-pink-500 uppercase tracking-widest font-sans">RIGHT</span>
              </button>
            </div>

            {/* Player 2 (Top Paddle) Controllers - only in Local 2-Player mode */}
            {gameMode === 'twoPlayer' && (
              <div className="absolute right-6 top-24 flex gap-4 z-20 md:opacity-60 hover:opacity-100 transition-opacity">
                <button
                  onTouchStart={() => { keys.current['w'] = true; }}
                  onTouchEnd={() => { keys.current['w'] = false; }}
                  onMouseDown={() => { keys.current['w'] = true; }}
                  onMouseUp={() => { keys.current['w'] = false; }}
                  onMouseLeave={() => { keys.current['w'] = false; }}
                  className="w-14 h-14 rounded-xl bg-slate-900/80 active:bg-purple-600/40 border border-slate-700/80 active:border-purple-500 shadow-lg text-purple-400 active:text-white flex flex-col items-center justify-center select-none cursor-pointer"
                  style={{ touchAction: 'none' }}
                  title="P2 Move Left"
                >
                  <span className="text-xl font-black font-mono">◀</span>
                  <span className="text-[7px] font-bold text-purple-500 uppercase tracking-widest font-sans">LEFT</span>
                </button>
                <button
                  onTouchStart={() => { keys.current['s'] = true; }}
                  onTouchEnd={() => { keys.current['s'] = false; }}
                  onMouseDown={() => { keys.current['s'] = true; }}
                  onMouseUp={() => { keys.current['s'] = false; }}
                  onMouseLeave={() => { keys.current['s'] = false; }}
                  className="w-14 h-14 rounded-xl bg-slate-900/80 active:bg-purple-600/40 border border-slate-700/80 active:border-purple-500 shadow-lg text-purple-400 active:text-white flex flex-col items-center justify-center select-none cursor-pointer"
                  style={{ touchAction: 'none' }}
                  title="P2 Move Right"
                >
                  <span className="text-xl font-black font-mono">▶</span>
                  <span className="text-[7px] font-bold text-purple-500 uppercase tracking-widest font-sans">RIGHT</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Controls Tip overlays */}
          <div className="absolute bottom-4 text-[10px] text-slate-500/80 font-mono flex gap-8 z-10 pointer-events-none">
            <span>P1: <b className="text-pink-500">◀ / ▶</b> ARROWS</span>
            {gameMode === 'twoPlayer' && <span>P2: <b className="text-purple-500">W / S</b> Keys</span>}
            {gameMode === 'ai' && <span>AI MODE: <b className="text-cyan-400 capitalize">{difficulty}</b> Node</span>}
            <span>TARGET: <b className="text-white">5 POINTS</b></span>
          </div>

          {/* WINNER SCREEN OVERLAY MODAL */}
          {winner && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                <Award className="w-8 h-8 text-yellow-500 animate-bounce" />
              </div>
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">CONGRATULATIONS</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
                {winner} WINS!
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-6">First to score 5 points takes the vector cup!</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-all shadow-lg active:scale-95"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={handleMainMenu}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-all active:scale-95"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function SpaceInvadersApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('space_invaders_hi') || '1000');
  });
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);
  const shakeFrameRef = useRef(0);

  // Entities state
  const playerX = useRef(50); // percentage 0 to 100
  const playerLaser = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const alienLasers = useRef<{ x: number; y: number }[]>([]);
  
  interface Alien {
    x: number; // 0 to 100
    y: number; // 0 to 100
    alive: boolean;
    type: number; // 0, 1, 2 for different shapes / colors
  }
  const aliens = useRef<Alien[]>([]);
  const alienDirection = useRef(1); // 1 for right, -1 for left
  const alienMoveTimer = useRef(0);
  const lastFireTime = useRef(0);

  interface Barrier {
    x: number; // 0 to 100
    y: number; // 0 to 100
    hp: number; // 4 to 0
  }
  const barriers = useRef<Barrier[]>([]);

  // Synthesizer sounds
  const playSfx = (type: 'fire' | 'hit' | 'playerHit' | 'win' | 'over') => {
    if (themeStore.get().soundPack === 'muted' || isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'fire') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'playerHit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'over') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Audio context fail-safe
    }
  };

  const initGame = () => {
    playerX.current = 50;
    playerLaser.current = null;
    alienLasers.current = [];
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);

    // Spawn 5x8 grid of aliens
    const list: Alien[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        list.push({
          x: 15 + c * 9, // starts at 15% across
          y: 15 + r * 8, // row spacing
          alive: true,
          type: r % 3
        });
      }
    }
    aliens.current = list;
    alienDirection.current = 1;
    alienMoveTimer.current = 0;

    // Spawn 3 defensive shields (barriers)
    const bList: Barrier[] = [];
    for (let b = 0; b < 3; b++) {
      const bx = 22 + b * 28; // spaced out
      for (let i = 0; i < 4; i++) {
        bList.push({
          x: bx + (i % 2) * 4,
          y: 75 + Math.floor(i / 2) * 3,
          hp: 4
        });
      }
    }
    barriers.current = bList;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', ' ', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const update = () => {
    if (gameOver || gameWon) return;

    // 1. Player movement
    const moveSpeed = 1.2;
    if (keys.current['ArrowLeft'] || keys.current['a']) {
      playerX.current = Math.max(5, playerX.current - moveSpeed);
    }
    if (keys.current['ArrowRight'] || keys.current['d']) {
      playerX.current = Math.min(95, playerX.current + moveSpeed);
    }

    // 2. Player firing
    if (keys.current[' '] || keys.current['f']) {
      const now = Date.now();
      if (!playerLaser.current && now - lastFireTime.current > 400) {
        playerLaser.current = { x: playerX.current, y: 84, active: true };
        lastFireTime.current = now;
        playSfx('fire');
      }
    }

    // 3. Move player laser
    if (playerLaser.current) {
      playerLaser.current.y -= 2.2;
      if (playerLaser.current.y < 0) {
        playerLaser.current = null;
      }
    }

    // 4. Move aliens side-by-side and downwards
    alienMoveTimer.current += 1;
    const currentSpeed = 0.08 + (score * 0.002); // gets faster as score goes up
    let reachEdge = false;

    // Check if any alive alien reaches borders
    const aliveAliens = aliens.current.filter(a => a.alive);
    if (aliveAliens.length === 0) {
      setGameWon(true);
      playSfx('win');
      return;
    }

    aliveAliens.forEach(a => {
      if (alienDirection.current === 1 && a.x >= 92) reachEdge = true;
      if (alienDirection.current === -1 && a.x <= 8) reachEdge = true;
      // Landing check (alien hits player level)
      if (a.y >= 83) {
        setGameOver(true);
        playSfx('over');
      }
    });

    if (reachEdge) {
      alienDirection.current = -alienDirection.current;
      aliens.current.forEach(a => {
        a.y += 3.5; // push down
      });
    } else {
      aliens.current.forEach(a => {
        if (a.alive) a.x += alienDirection.current * currentSpeed * 10;
      });
    }

    // 5. Alien firing lasers organic logic
    if (Math.random() < 0.015 && alienLasers.current.length < 4) {
      // pick a random active alien to fire
      const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
      if (shooter) {
        alienLasers.current.push({ x: shooter.x, y: shooter.y + 2 });
      }
    }

    // 6. Move alien lasers
    alienLasers.current.forEach((laser, index) => {
      laser.y += 1.2;
      // Collision with player
      if (Math.abs(laser.x - playerX.current) < 4 && laser.y >= 84 && laser.y <= 88) {
        alienLasers.current.splice(index, 1);
        shakeFrameRef.current = 10;
        playSfx('playerHit');
        setLives(prev => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            setGameOver(true);
            playSfx('over');
          }
          return nextLives;
        });
      } else if (laser.y > 100) {
        alienLasers.current.splice(index, 1);
      }
    });

    // 7. Player laser collisions with aliens
    if (playerLaser.current) {
      const pl = playerLaser.current;
      for (let i = 0; i < aliens.current.length; i++) {
        const a = aliens.current[i];
        if (a.alive && Math.abs(a.x - pl.x) < 4.5 && Math.abs(a.y - pl.y) < 3.5) {
          a.alive = false;
          playerLaser.current = null;
          playSfx('hit');
          setScore(prev => {
            const nextScore = prev + 100;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('space_invaders_hi', String(nextScore));
            }
            return nextScore;
          });
          break;
        }
      }
    }

    // 8. Laser collisions with barriers
    barriers.current.forEach((b) => {
      if (b.hp <= 0) return;
      
      // Hit by Player Laser
      if (playerLaser.current) {
        const pl = playerLaser.current;
        if (Math.abs(b.x - pl.x) < 3.5 && Math.abs(b.y - pl.y) < 2.5) {
          b.hp--;
          playerLaser.current = null;
          playSfx('hit');
        }
      }

      // Hit by Alien Lasers
      alienLasers.current.forEach((al, alIdx) => {
        if (Math.abs(b.x - al.x) < 3.5 && Math.abs(b.y - al.y) < 2.5) {
          b.hp--;
          alienLasers.current.splice(alIdx, 1);
          playSfx('hit');
        }
      });
    });

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    ctx.save();
    if (shakeFrameRef.current > 0) {
      const shakeAmt = shakeFrameRef.current * 1.5;
      ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
      shakeFrameRef.current--;
    }

    // Draw deep cosmic space
    ctx.fillStyle = '#020208';
    ctx.fillRect(0, 0, w, h);

    // Draw grid mesh overlay
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const scaleX = w / 100;
    const scaleY = h / 100;

    // Draw defensive shields
    barriers.current.forEach(b => {
      if (b.hp <= 0) return;
      ctx.shadowBlur = b.hp * 2;
      ctx.shadowColor = '#10b981';
      ctx.fillStyle = `rgba(16, 185, 129, ${0.25 * b.hp})`;
      ctx.fillRect(b.x * scaleX, b.y * scaleY, 4 * scaleX, 3 * scaleY);
      
      // Draw HP meter outline
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x * scaleX, b.y * scaleY, 4 * scaleX, 3 * scaleY);
    });

    // Draw player ship
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06b6d4';
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(playerX.current * scaleX, 84 * scaleY);
    ctx.lineTo((playerX.current - 2.5) * scaleX, 88 * scaleY);
    ctx.lineTo((playerX.current + 2.5) * scaleX, 88 * scaleY);
    ctx.closePath();
    ctx.fill();

    // Draw thruster fire
    ctx.fillStyle = Math.random() > 0.5 ? '#f43f5e' : '#fb923c';
    ctx.fillRect((playerX.current - 0.5) * scaleX, 88 * scaleY, 1 * scaleX, 1.5 * scaleY);

    // Draw player laser
    if (playerLaser.current) {
      ctx.shadowColor = '#fb7185';
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(playerLaser.current.x * scaleX - 1.5, playerLaser.current.y * scaleY, 3, 2 * scaleY);
    }

    // Draw alien lasers
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    alienLasers.current.forEach(laser => {
      ctx.fillRect(laser.x * scaleX - 1.5, laser.y * scaleY, 3, 2 * scaleY);
    });

    // Draw alien monsters
    aliens.current.forEach(alien => {
      if (!alien.alive) return;
      
      const colors = ['#a855f7', '#ec4899', '#3b82f6'];
      ctx.shadowColor = colors[alien.type];
      ctx.fillStyle = colors[alien.type];
      
      const ax = alien.x * scaleX;
      const ay = alien.y * scaleY;
      const aw = 3 * scaleX;
      const ah = 2.2 * scaleY;

      // Draw custom procedural alien polygon shapes based on type
      ctx.beginPath();
      if (alien.type === 0) {
        // Crab shape
        ctx.fillRect(ax - aw/2, ay - ah/2, aw, ah);
        ctx.fillRect(ax - aw/1.3, ay + ah/3, aw/4, ah/3);
        ctx.fillRect(ax + aw/2, ay + ah/3, aw/4, ah/3);
      } else if (alien.type === 1) {
        // Squid shape
        ctx.arc(ax, ay, aw/2, Math.PI, 0);
        ctx.lineTo(ax + aw/2, ay + ah/2);
        ctx.lineTo(ax - aw/2, ay + ah/2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Drop shape
        ctx.arc(ax, ay, aw/2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  };

  useEffect(() => {
    if (started && !gameOver && !gameWon) {
      speakText("Engaging space invaders. Move with Arrow keys. Fire with Spacebar.");
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [started, gameOver, gameWon]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          draw();
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const launchGame = () => {
    initGame();
    setStarted(true);
  };

  const quitToMenu = () => {
    setStarted(false);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none outline-none font-sans" tabIndex={0}>
      {!started ? (
        <div className="flex flex-col items-center justify-center text-center p-8 z-10 max-w-sm w-full animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(6,182,212,0.3)] animate-pulse">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 mb-1">
            SPACE INVADERS
          </h1>
          <p className="text-[9px] font-mono font-black text-cyan-400 tracking-widest uppercase mb-8">ARCADE LASER CHRONICLES</p>

          <div className="w-full bg-slate-900/60 border border-slate-800 p-4 rounded-2xl mb-6 space-y-3.5 text-left">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold">HIGH SCORE</span>
              <span className="font-mono text-cyan-400 font-black">{highScore} PTS</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Desktop Shortcuts</span>
              <p className="text-[10px] text-slate-300 font-medium">⬅ / ➡ Keys or A / D to steer ship</p>
              <p className="text-[10px] text-slate-300 font-medium">Spacebar / F to shoot plasma lasers</p>
            </div>
          </div>

          <button
            onClick={launchGame}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] active:scale-95"
          >
            ENGAGE INVASION
          </button>
        </div>
      ) : (
        <>
          {/* Top HUD bar */}
          <div className="absolute top-4 inset-x-0 flex justify-between items-center px-6 z-10">
            <button
              onClick={quitToMenu}
              className="px-2 py-1 bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[9px] font-bold tracking-wider uppercase"
            >
              QUIT
            </button>

            <div className="flex gap-8 items-center">
              <div className="text-center">
                <span className="text-[8px] font-bold text-cyan-500 uppercase block leading-none">SCORE</span>
                <span className="text-lg font-black text-white font-mono">{score}</span>
              </div>
              <div className="text-center flex items-center gap-1">
                <span className="text-[8px] font-bold text-emerald-500 uppercase block leading-none">LIVES</span>
                <span className="text-sm font-black text-white font-mono">{'❤️'.repeat(lives)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-lg border ${isMuted ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active play field */}
          <div className="flex-1 w-full h-full relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* TOUCH OVERLAY NAVIGATION FOR PHONES */}
            <div className="absolute left-4 bottom-4 flex gap-2 z-20">
              <button
                onTouchStart={() => { keys.current['ArrowLeft'] = true; }}
                onTouchEnd={() => { keys.current['ArrowLeft'] = false; }}
                onMouseDown={() => { keys.current['ArrowLeft'] = true; }}
                onMouseUp={() => { keys.current['ArrowLeft'] = false; }}
                onMouseLeave={() => { keys.current['ArrowLeft'] = false; }}
                className="w-12 h-12 rounded-xl bg-slate-900/80 active:bg-cyan-600/40 border border-slate-700 text-cyan-400 active:text-white flex items-center justify-center select-none cursor-pointer"
                style={{ touchAction: 'none' }}
              >
                ◀
              </button>
              <button
                onTouchStart={() => { keys.current['ArrowRight'] = true; }}
                onTouchEnd={() => { keys.current['ArrowRight'] = false; }}
                onMouseDown={() => { keys.current['ArrowRight'] = true; }}
                onMouseUp={() => { keys.current['ArrowRight'] = false; }}
                onMouseLeave={() => { keys.current['ArrowRight'] = false; }}
                className="w-12 h-12 rounded-xl bg-slate-900/80 active:bg-cyan-600/40 border border-slate-700 text-cyan-400 active:text-white flex items-center justify-center select-none cursor-pointer"
                style={{ touchAction: 'none' }}
              >
                ▶
              </button>
            </div>

            {/* Fire Button on right */}
            <div className="absolute right-4 bottom-4 z-20">
              <button
                onTouchStart={() => { keys.current[' '] = true; }}
                onTouchEnd={() => { keys.current[' '] = false; }}
                onMouseDown={() => { keys.current[' '] = true; }}
                onMouseUp={() => { keys.current[' '] = false; }}
                onMouseLeave={() => { keys.current[' '] = false; }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-600 active:from-pink-600 border border-white/20 active:scale-95 shadow-lg shadow-pink-500/20 text-white font-extrabold text-[11px] flex items-center justify-center select-none cursor-pointer"
                style={{ touchAction: 'none' }}
              >
                FIRE
              </button>
            </div>
          </div>

          {/* GAME OVER OR GAME WON MODALS */}
          {(gameOver || gameWon) && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Award className={`w-7 h-7 ${gameWon ? 'text-yellow-400 animate-bounce' : 'text-red-400'}`} />
              </div>
              
              <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">
                {gameWon ? "MISSION SUCCESS" : "MISSION FAILED"}
              </span>
              <h2 className="text-2xl font-black text-white tracking-wider mb-1">
                {gameWon ? "INVASION REPELLED!" : "SYSTEM COMPROMISED"}
              </h2>
              <p className="text-xs text-slate-400 mb-6">You scored <span className="text-cyan-400 font-mono font-bold">{score}</span> points against invaders.</p>

              <div className="flex gap-3">
                <button
                  onClick={launchGame}
                  className="px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold tracking-widest uppercase rounded-lg transition-all shadow-md shadow-cyan-500/15 active:scale-95"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={quitToMenu}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-all active:scale-95"
                >
                  QUIT MENU
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
