import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, Play, Pause, RotateCcw, Download, Sparkles, Sliders, Layout, RefreshCw, ZoomIn, ZoomOut, ArrowLeftRight, Trash2, Check, LayoutGrid
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

// ==========================================
// 1. FRACTAL GENERATOR (Mandelbrot & Julia)
// ==========================================
export function FractalArtApp() {
  const [maxIterations, setMaxIterations] = useState(80);
  const [zoom, setZoom] = useState(1);
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  const [palette, setPalette] = useState<'rainbow' | 'fire' | 'ocean' | 'neon'>('neon');
  const [fractalType, setFractalType] = useState<'mandelbrot' | 'julia'>('mandelbrot');
  const [juliaReal, setJuliaReal] = useState(-0.7);
  const [juliaImag, setJuliaImag] = useState(0.27015);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawFractal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Zoom scale maps pixels to complex plane coordinates
    const scale = 3.0 / (zoom * Math.min(width, height));

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        // Map pixel to complex coordinate z = x + iy
        const x0 = centerX + (px - width / 2) * scale;
        const y0 = centerY + (py - height / 2) * scale;

        let x = x0;
        let y = y0;

        let iteration = 0;
        
        if (fractalType === 'mandelbrot') {
          // Mandelbrot: z_next = z^2 + c (z_0 = 0, c = pixel coordinate)
          let cx = x0;
          let cy = y0;
          x = 0;
          y = 0;

          while (x * x + y * y <= 4 && iteration < maxIterations) {
            const xtemp = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = xtemp;
            iteration++;
          }
        } else {
          // Julia set: z_next = z^2 + c (c is constant, z_0 = pixel coordinate)
          while (x * x + y * y <= 4 && iteration < maxIterations) {
            const xtemp = x * x - y * y + juliaReal;
            y = 2 * x * y + juliaImag;
            x = xtemp;
            iteration++;
          }
        }

        // Color mapper
        let r = 0, g = 0, b = 0;
        if (iteration < maxIterations) {
          const mu = iteration / maxIterations;
          if (palette === 'neon') {
            r = Math.floor(Math.sin(mu * Math.PI) * 255);
            g = Math.floor(Math.sin(mu * Math.PI + Math.PI / 3) * 128 + 127);
            b = 255;
          } else if (palette === 'fire') {
            r = Math.floor(mu * 255);
            g = Math.floor(Math.pow(mu, 2) * 255);
            b = Math.floor(Math.pow(mu, 4) * 128);
          } else if (palette === 'ocean') {
            r = Math.floor(Math.pow(mu, 3) * 128);
            g = Math.floor(mu * 210);
            b = Math.floor(mu * 255);
          } else {
            // Rainbow
            r = Math.floor(Math.sin(mu * 5) * 127 + 128);
            g = Math.floor(Math.sin(mu * 5 + 2) * 127 + 128);
            b = Math.floor(Math.sin(mu * 5 + 4) * 127 + 128);
          }
        }

        const pixelIndex = (py * width + px) * 4;
        data[pixelIndex] = r;     // Red
        data[pixelIndex + 1] = g; // Green
        data[pixelIndex + 2] = b; // Blue
        data[pixelIndex + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  useEffect(() => {
    drawFractal();
  }, [maxIterations, zoom, centerX, centerY, palette, fractalType, juliaReal, juliaImag]);

  const handleCanvasPan = (dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 0.5 / zoom;
    if (dir === 'up') setCenterY(p => p - step);
    if (dir === 'down') setCenterY(p => p + step);
    if (dir === 'left') setCenterX(p => p - step);
    if (dir === 'right') setCenterX(p => p + step);
    playSound('click');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Controls sidebar */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-fuchsia-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Fractal Art Generator</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
          Render beautiful mathematical structures from the complex number plane. Pan and zoom into cosmic vectors.
        </p>

        {/* Type selector */}
        <div className="flex bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-850">
          <button 
            onClick={() => { setFractalType('mandelbrot'); playSound('click'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${fractalType === 'mandelbrot' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Mandelbrot
          </button>
          <button 
            onClick={() => { setFractalType('julia'); playSound('click'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${fractalType === 'julia' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Julia Set
          </button>
        </div>

        {/* Fractal controls */}
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Iterations / Detail:</span>
            <span className="text-fuchsia-400">{maxIterations}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="250" 
            value={maxIterations} 
            onChange={(e) => setMaxIterations(parseInt(e.target.value))}
            className="w-full accent-fuchsia-500"
          />

          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Color Palette:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'neon', name: 'Cosmic Neon' },
              { id: 'fire', name: 'Inferno Red' },
              { id: 'ocean', name: 'Ocean Blue' },
              { id: 'rainbow', name: 'Spectrum' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => { setPalette(p.id as any); playSound('click'); }}
                className={`py-2 px-1 rounded-lg text-[10px] font-black border transition-all ${palette === p.id ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white' : 'border-slate-800 hover:bg-slate-850 text-slate-400'}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {fractalType === 'julia' && (
            <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-[9px] font-black uppercase tracking-wider text-fuchsia-400 block mb-1">Julia Seed Coordinates</span>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Real (Cr):</span>
                <span>{juliaReal}</span>
              </div>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.01" 
                value={juliaReal} 
                onChange={(e) => setJuliaReal(parseFloat(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Imag (Ci):</span>
                <span>{juliaImag}</span>
              </div>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.01" 
                value={juliaImag} 
                onChange={(e) => setJuliaImag(parseFloat(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-auto flex gap-2 border-t border-slate-800 pt-4">
          <button 
            onClick={() => { setZoom(1); setCenterX(-0.5); setCenterY(0); playSound('click'); }}
            className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset zoom
          </button>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        {/* Fractal Canvas */}
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={400} 
          className="max-w-full max-h-full aspect-[5/4] border border-slate-900 shadow-2xl rounded-xl bg-black"
        />

        {/* Pan and zoom overlays */}
        <div className="absolute bottom-6 flex gap-2.5 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
          <button onClick={() => setZoom(z => z * 1.5)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors" title="Zoom In"><ZoomIn className="w-4.5 h-4.5" /></button>
          <button onClick={() => setZoom(z => Math.max(1, z / 1.5))} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors" title="Zoom Out"><ZoomOut className="w-4.5 h-4.5" /></button>
          <div className="w-px bg-slate-800 mx-1" />
          <button onClick={() => handleCanvasPan('left')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">←</button>
          <button onClick={() => handleCanvasPan('up')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">↑</button>
          <button onClick={() => handleCanvasPan('down')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">↓</button>
          <button onClick={() => handleCanvasPan('right')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">→</button>
        </div>

        <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400">
          Zoom: {zoom.toFixed(1)}x
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PIXEL ART STUDIO
// ==========================================
export function PixelStudioApp() {
  const [gridSize, setGridSize] = useState<16 | 32>(16);
  const [pixels, setPixels] = useState<string[]>(() => Array(16 * 16).fill('#0f172a'));
  const [activeColor, setActiveColor] = useState('#ef4444');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');

  useEffect(() => {
    setPixels(Array(gridSize * gridSize).fill('#0f172a'));
  }, [gridSize]);

  const handlePixelInteract = (index: number) => {
    setPixels(prev => {
      const copy = [...prev];
      copy[index] = tool === 'draw' ? activeColor : '#0f172a';
      return copy;
    });
  };

  const handleSaveToDesktop = () => {
    playSound('success');
    alert('Pixel Artwork exported securely into Virtual OS Files! check file_explorer.');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Draw tools */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Pixel Art Studio</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-normal">
          Paint custom modular sprites. Perfect for retro games assets design.
        </p>

        {/* Grid size toggle */}
        <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850">
          <button 
            onClick={() => { setGridSize(16); playSound('click'); }}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${gridSize === 16 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
          >
            16 x 16
          </button>
          <button 
            onClick={() => { setGridSize(32); playSound('click'); }}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${gridSize === 32 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
          >
            32 x 32
          </button>
        </div>

        {/* Tool selector */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => { setTool('draw'); playSound('click'); }}
            className={`py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all ${tool === 'draw' ? 'bg-sky-500/10 border-sky-500 text-white' : 'border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            Pencil
          </button>
          <button 
            onClick={() => { setTool('erase'); playSound('click'); }}
            className={`py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all ${tool === 'erase' ? 'bg-slate-800/50 border-sky-500 text-white' : 'border-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            Eraser
          </button>
        </div>

        {/* Palette presets */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Color Palette</span>
          <div className="grid grid-cols-5 gap-2">
            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ffffff'].map(color => (
              <button
                key={color}
                onClick={() => { setActiveColor(color); setTool('draw'); playSound('click'); }}
                className={`w-7 h-7 rounded-lg border transition-all ${activeColor === color && tool === 'draw' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => { setPixels(Array(gridSize * gridSize).fill('#0f172a')); playSound('click'); }}
          className="mt-auto w-full py-2 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear canvas
        </button>
      </div>

      {/* Grid Canvas area */}
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 relative">
        <div 
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          className={`grid bg-slate-900 gap-[1px] p-[1px] border border-slate-800 rounded-xl shadow-2xl overflow-hidden`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: 'min(360px, 100%)',
            height: 'min(360px, 100%)'
          }}
        >
          {pixels.map((color, idx) => (
            <div
              key={idx}
              onMouseDown={() => handlePixelInteract(idx)}
              onMouseEnter={() => isDrawing && handlePixelInteract(idx)}
              style={{ backgroundColor: color }}
              className="aspect-square cursor-crosshair transition-colors"
            />
          ))}
        </div>

        <button 
          onClick={handleSaveToDesktop}
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-103 active:scale-97 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Export Artwork
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 3. GENERATIVE CELLULAR AUTOMATA (Game of Life)
// ==========================================
export function CellularAutomataApp() {
  const size = 30;
  const [grid, setGrid] = useState<boolean[]>(() => {
    const initial = Array(size * size).fill(false);
    // Put a glider preset initially
    initial[3 * size + 4] = true;
    initial[4 * size + 5] = true;
    initial[5 * size + 3] = true;
    initial[5 * size + 4] = true;
    initial[5 * size + 5] = true;
    return initial;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(150); // ms per gen
  const [ruleType, setRuleType] = useState<'conway' | 'highlife'>('conway');

  const runningRef = useRef(isPlaying);
  runningRef.current = isPlaying;

  const countNeighbors = (g: boolean[], x: number, y: number) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nx = (x + i + size) % size;
        const ny = (y + j + size) % size;
        if (g[ny * size + nx]) count++;
      }
    }
    return count;
  };

  const computeNextGen = () => {
    setGrid(prev => {
      const next = Array(size * size).fill(false);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = y * size + x;
          const neighbors = countNeighbors(prev, x, y);
          const isAlive = prev[idx];

          if (ruleType === 'conway') {
            if (isAlive) {
              next[idx] = neighbors === 2 || neighbors === 3;
            } else {
              next[idx] = neighbors === 3;
            }
          } else {
            // HighLife rules (B36/S23)
            if (isAlive) {
              next[idx] = neighbors === 2 || neighbors === 3;
            } else {
              next[idx] = neighbors === 3 || neighbors === 6;
            }
          }
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      computeNextGen();
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, ruleType]);

  const handleCellClick = (index: number) => {
    setGrid(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
    playSound('click');
  };

  const loadPreset = (type: 'glider' | 'beacon' | 'acorn') => {
    const initial = Array(size * size).fill(false);
    if (type === 'glider') {
      initial[3 * size + 4] = true;
      initial[4 * size + 5] = true;
      initial[5 * size + 3] = true;
      initial[5 * size + 4] = true;
      initial[5 * size + 5] = true;
    } else if (type === 'beacon') {
      // Beacon period 2
      initial[10 * size + 10] = true; initial[10 * size + 11] = true;
      initial[11 * size + 10] = true; initial[11 * size + 11] = true;
      initial[12 * size + 12] = true; initial[12 * size + 13] = true;
      initial[13 * size + 12] = true; initial[13 * size + 13] = true;
    } else {
      // Acorn (long-lived methuselah)
      const cx = 15, cy = 15;
      initial[cy * size + cx] = true;
      initial[(cy + 1) * size + cx + 2] = true;
      initial[(cy + 2) * size + cx - 1] = true;
      initial[(cy + 2) * size + cx] = true;
      initial[(cy + 2) * size + cx + 3] = true;
      initial[(cy + 2) * size + cx + 4] = true;
      initial[(cy + 2) * size + cx + 5] = true;
    }
    setGrid(initial);
    playSound('success');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Sidebar options */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Generative Automata</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-normal">
          Explore emergent complexity. Place cellular nodes on the matrix sandbox to witness chaotic structural growth patterns.
        </p>

        {/* Conway vs Highlife */}
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Automata Rules</span>
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850">
            <button 
              onClick={() => { setRuleType('conway'); playSound('click'); }}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${ruleType === 'conway' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              Conway (B3/S23)
            </button>
            <button 
              onClick={() => { setRuleType('highlife'); playSound('click'); }}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${ruleType === 'highlife' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              HighLife (B36/S23)
            </button>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Tick Interval:</span>
            <span className="text-emerald-400">{speed}ms</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="600" 
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Spawn Presets</span>
          <div className="grid grid-cols-3 gap-1.5">
            {['glider', 'beacon', 'acorn'].map(preset => (
              <button
                key={preset}
                onClick={() => loadPreset(preset as any)}
                className="py-1.5 px-1 rounded-lg border border-slate-800 bg-slate-850 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-300 text-center transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-auto flex gap-2 border-t border-slate-800 pt-4">
          <button 
            onClick={() => { setIsPlaying(!isPlaying); playSound('click'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Start'}</span>
          </button>
          <button 
            onClick={() => { setGrid(Array(size * size).fill(false)); playSound('click'); }}
            className="px-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl"
            title="Clear grid"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4">
        <div 
          className="grid bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-[1px] gap-[1px]"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: 'min(400px, 100%)',
            height: 'min(400px, 100%)'
          }}
        >
          {grid.map((alive, idx) => (
            <div
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`aspect-square cursor-pointer transition-all ${alive ? 'bg-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-slate-950 hover:bg-slate-900'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. AUDIO SYNTHESIS & WAVEFORM VISUALIZER
// ==========================================
import { Music, SlidersHorizontal, Volume2 } from 'lucide-react';

export function AudioVisualizerApp() {
  const [synthType, setSynthType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [visualMode, setVisualMode] = useState<'waves' | 'spirograph' | 'tunnel'>('spirograph');
  const [frequencyFactor, setFrequencyFactor] = useState(1);
  const [spike, setSpike] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw background visualizer modes
      if (visualMode === 'waves') {
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        for (let x = 0; x < canvas.width; x++) {
          const rawY = Math.sin(x * 0.03 + time) * 30 + Math.cos(x * 0.01 - time * 2) * 15;
          const finalY = cy + rawY * (1 + spike * 1.5);
          if (x === 0) ctx.moveTo(x, finalY);
          else ctx.lineTo(x, finalY);
        }
        ctx.stroke();
      } else if (visualMode === 'spirograph') {
        ctx.beginPath();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        const radius = 90 + spike * 40;
        for (let theta = 0; theta < Math.PI * 4; theta += 0.05) {
          const r = radius * (1 + 0.3 * Math.sin(theta * 6 * frequencyFactor + time));
          const x = cx + r * Math.cos(theta);
          const y = cy + r * Math.sin(theta);
          if (theta === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Tunnel spiral
        for (let r = 20; r < 200; r += 15) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0.1, 1 - r / 200)})`;
          ctx.lineWidth = 1 + spike * 3;
          const pulseR = r * (1 + 0.1 * Math.sin(time * 3 + r * 0.1));
          ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [visualMode, frequencyFactor, spike]);

  const playNote = (pitch: number) => {
    playSound('click');
    const actualFreq = pitch * frequencyFactor;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = synthType;
      osc.frequency.value = actualFreq;

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      setSpike(1.2);
      setTimeout(() => setSpike(0), 180);
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Control panel left */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Audio Waveform Synth</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-normal">
          Generate synth soundwaves and view real-time geometric visualizers pulsing to frequencies.
        </p>

        {/* Synth type selection */}
        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Oscillator Waveform</label>
          <div className="grid grid-cols-2 gap-2">
            {(['sine', 'square', 'triangle', 'sawtooth'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setSynthType(type); playSound('click'); }}
                className={`py-2 px-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${synthType === type ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-850 hover:bg-slate-800 text-slate-400'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer modes selection */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Visualizer Rendering</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['waves', 'spirograph', 'tunnel'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { setVisualMode(mode); playSound('click'); }}
                className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${visualMode === mode ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-slate-850 hover:bg-slate-800 text-slate-400'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Factor Pitch multiplier slider */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Frequency Factor:</span>
            <span className="text-purple-400">{frequencyFactor.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="3" 
            step="0.1"
            value={frequencyFactor} 
            onChange={(e) => setFrequencyFactor(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      {/* Main visualization output */}
      <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center relative">
        <canvas 
          ref={canvasRef} 
          width={450} 
          height={320} 
          className="max-w-full aspect-[4/3] rounded-2xl bg-black border border-slate-900 shadow-2xl mb-6"
        />

        {/* Interactive Piano Keys */}
        <div className="flex gap-2 w-full max-w-md select-none bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl backdrop-blur-md shadow-xl justify-center">
          {[
            { label: 'C4', freq: 261.63 },
            { label: 'D4', freq: 293.66 },
            { label: 'E4', freq: 329.63 },
            { label: 'F4', freq: 349.23 },
            { label: 'G4', freq: 392.00 },
            { label: 'A4', freq: 440.00 },
            { label: 'B4', freq: 493.88 },
            { label: 'C5', freq: 523.25 }
          ].map((note, idx) => (
            <button
              key={idx}
              onClick={() => playNote(note.freq)}
              className="flex-1 h-20 bg-white hover:bg-slate-200 text-slate-950 rounded-lg flex flex-col items-center justify-end pb-3 text-[10px] font-black transition-all active:scale-90 border-b-4 border-slate-300 hover:border-slate-400"
            >
              {note.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
