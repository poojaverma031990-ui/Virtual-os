import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Search, Info, FlaskConical, Target, Wind, Zap, Menu, X as CloseIcon } from 'lucide-react';
import { playSound } from '../../lib/sounds';

interface Specimen {
  id: string;
  name: string;
  scientific: string;
  description: string;
  color: string;
  particles: number;
  speed: number;
  complexity: number;
}

const SPECIMENS: Specimen[] = [
  { id: 'paramecium', name: 'Paramecium', scientific: 'P. caudatum', description: 'Ciliates characterized by their slipper shape and hair-like cilia.', color: '#93c5fd', particles: 40, speed: 1.2, complexity: 3 },
  { id: 'amoeba', name: 'Amoeba', scientific: 'A. proteus', description: 'Single-celled organism that moves by extending pseudopods.', color: '#86efac', particles: 20, speed: 0.4, complexity: 5 },
  { id: 'hydra', name: 'Hydra', scientific: 'H. vulgaris', description: 'Freshwater organism with tentacles that can regenerate.', color: '#fca5a5', particles: 15, speed: 0.2, complexity: 4 },
  { id: 'yeast', name: 'Fungi (Yeast)', scientific: 'S. cerevisiae', description: 'Microscopic fungus used in baking and brewing.', color: '#fcd34d', particles: 100, speed: 0.1, complexity: 2 },
  { id: 'tardigrade', name: 'Tardigrade', scientific: 'Water Bear', description: 'Micro-animal capable of surviving extreme conditions.', color: '#d1d5db', particles: 8, speed: 0.6, complexity: 6 },
  { id: 'volvox', name: 'Volvox', scientific: 'V. aureus', description: 'Green algae that forms spherical colonies.', color: '#4ade80', particles: 30, speed: 0.3, complexity: 4 },
  { id: 'stentor', name: 'Stentor', scientific: 'S. roeseli', description: 'Trumpet-shaped ciliate, one of the largest single cells.', color: '#c4b5fd', particles: 12, speed: 0.5, complexity: 5 },
  { id: 'diatom', name: 'Diatom', scientific: 'B. silia', description: 'Single-celled algae with a transparent cell wall made of silica.', color: '#fbbf24', particles: 50, speed: 0, complexity: 3 },
  { id: 'blood', name: 'Blood Cells', scientific: 'Erythrocytes', description: 'Red blood cells that transport oxygen throughout the body.', color: '#ef4444', particles: 150, speed: 0.8, complexity: 1 },
  { id: 'bacillus', name: 'Bacteria', scientific: 'B. subtilis', description: 'Rod-shaped bacteria commonly found in soil.', color: '#67e8f9', particles: 200, speed: 1.5, complexity: 1 },
  { id: 'onion', name: 'Onion Skin', scientific: 'A. cepa', description: 'Plant cell structure showing distinct cell walls.', color: '#f9a8d4', particles: 0, speed: 0, complexity: 2 },
  { id: 'euglena', name: 'Euglena', scientific: 'E. gracilis', description: 'Single-celled flagellate with both plant and animal features.', color: '#bef264', particles: 60, speed: 1.8, complexity: 3 },
  { id: 'rotifer', name: 'Rotifer', scientific: 'Wheeled animal', description: 'Microscopic animals with a rotating wheel of cilia.', color: '#fdba74', particles: 25, speed: 0.9, complexity: 5 },
  { id: 'daphnia', name: 'Daphnia', scientific: 'Water Flea', description: 'Small planktonic crustaceans often found in ponds.', color: '#a5b4fc', particles: 10, speed: 1.1, complexity: 6 },
  { id: 'chloroplast', name: 'Chloroplasts', scientific: 'Leaf Cells', description: 'Organelles in plant cells that conduct photosynthesis.', color: '#22c55e', particles: 80, speed: 0.2, complexity: 2 },
];

export function ScopeApp() {
  const [selected, setSelected] = useState<Specimen | null>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [focus, setFocus] = useState(100);
  const [zDepth, setZDepth] = useState(50);
  const [showDust, setShowDust] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureSlide = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setSnapshots(prev => [dataUrl, ...prev].slice(0, 4));
      playSound('capture');
    }
  };

  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const particles: any[] = [];

    // Initialize particles based on specimen
    for (let i = 0; i < selected.particles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * selected.speed,
        vy: (Math.random() - 0.5) * selected.speed,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 5 + 2,
        layer: Math.random() * 100, // Z-depth layer
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply Focus (blur) + Light
      ctx.filter = `blur(${Math.abs(100 - focus) / 8}px) brightness(${brightness}%)`;

      particles.forEach(p => {
        // Movement Logic
        if (selected.id === 'paramecium') {
          // Path-based oscillation for Paramecium
          p.phase += 0.05;
          p.angle += 0.01;
          const speed = selected.speed * zoom;
          p.vx = Math.cos(p.angle) * speed + Math.sin(p.phase) * 0.5;
          p.vy = Math.sin(p.angle) * speed + Math.cos(p.phase) * 0.5;
        }

        p.x += p.vx * zoom;
        p.y += p.vy * zoom;
        p.pulse += 0.02;

        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        // Z-Depth Layer Scale Effect
        const depthDiff = Math.abs(p.layer - zDepth);
        const layerScale = Math.max(0.1, 1 - depthDiff / 40);
        const depthBlur = depthDiff / 5;
        
        ctx.save();
        ctx.filter = `blur(${depthBlur}px)`;
        ctx.beginPath();
        
        const currentSize = p.size * (1 + Math.sin(p.pulse) * 0.2) * zoom * layerScale;
        
        if (selected.id === 'amoeba') {
          ctx.arc(p.x, p.y, currentSize * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${selected.color}33`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(p.pulse) * 5, p.y + Math.sin(p.pulse) * 5, currentSize * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `${selected.color}66`;
        } else if (selected.id === 'bacillus') {
          ctx.ellipse(p.x, p.y, currentSize * 3, currentSize, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
          ctx.fillStyle = `${selected.color}55`;
        } else if (selected.id === 'paramecium') {
          ctx.ellipse(p.x, p.y, currentSize * 2.5, currentSize, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
          ctx.fillStyle = `${selected.color}88`;
        } else {
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `${selected.color}aa`;
        }
        
        ctx.fill();
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [selected, zoom, brightness, focus, zDepth]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col overflow-hidden text-white font-sans select-none">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-8 overflow-y-auto"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight leading-none">MicroScope Pro</h2>
                <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Digital Specimen Library</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {SPECIMENS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelected(s); setZoom(1); setFocus(100); setZDepth(50); setShowControls(true); }}
                  className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] hover:bg-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                  <div 
                    className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${s.color}22` }}
                  >
                    <FlaskConical className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="font-black text-lg mb-1">{s.name}</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{s.scientific}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="viewer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex relative"
          >
            {/* Control Sidebar */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  className="absolute left-0 top-0 bottom-0 w-80 border-r border-white/5 p-8 flex flex-col gap-6 bg-slate-900/90 backdrop-blur-2xl shrink-0 overflow-y-auto z-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => setSelected(null)}
                      className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Target className="w-3 h-3" /> Back to Library
                    </button>
                    <button onClick={() => setShowControls(false)} className="text-slate-500 hover:text-white">
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black mb-1">{selected.name}</h3>
                    <p className="text-blue-400 font-bold italic text-sm mb-4">{selected.scientific}</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Optical Zoom</span>
                        <span className="text-blue-400">{(zoom * 20).toFixed(0)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="15" step="0.1" value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Z-Axis Depth</span>
                        <span className="text-fuchsia-400">{zDepth}nm</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={zDepth}
                        onChange={(e) => setZDepth(parseInt(e.target.value))}
                        className="w-full accent-fuchsia-500 h-1 bg-white/10 rounded-full appearance-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Fine Focus</span>
                        <span className="text-green-400">{focus}%</span>
                      </div>
                      <input 
                        type="range" min="80" max="120" value={focus}
                        onChange={(e) => setFocus(parseInt(e.target.value))}
                        className="w-full accent-green-500 h-1 bg-white/10 rounded-full appearance-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lens Dust</span>
                      <button 
                        onClick={() => setShowDust(!showDust)}
                        className={`w-10 h-5 rounded-full transition-all relative ${showDust ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showDust ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      onClick={captureSlide}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                    >
                      <Wind className="w-4 h-4" /> Capture Slide
                    </button>

                    {snapshots.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Snapshots</span>
                        <div className="grid grid-cols-2 gap-2">
                          {snapshots.map((src, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="aspect-square rounded-xl bg-black border border-white/10 overflow-hidden group relative"
                            >
                              <img src={src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                              <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              {/* Outer Lens Housing */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_90%)] z-20 pointer-events-none" />
              
              <motion.div 
                animate={{ scale: 1 + (zoom * 0.02) }}
                className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border-[10px] md:border-[15px] border-slate-900 shadow-[0_0_150px_rgba(0,0,0,1)] relative overflow-hidden bg-slate-950"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-30" />
                <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,1)] z-20 pointer-events-none" />
                
                {showDust && (
                  <div className="absolute inset-0 z-40 pointer-events-none opacity-30 mix-blend-multiply">
                    <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-black rounded-full blur-[1px]" />
                    <div className="absolute top-2/3 right-1/4 w-1.5 h-1 bg-black rounded-full blur-[2px]" />
                    <div className="absolute bottom-1/3 left-1/2 w-1 h-1.5 bg-black rounded-full blur-[1px]" />
                  </div>
                )}

                <canvas 
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full h-full"
                />

                <div className="absolute inset-0 z-30 pointer-events-none rounded-full backdrop-blur-[2px] [mask-image:radial-gradient(circle_at_center,transparent_75%,black_100%)]" />
              </motion.div>

              {/* Viewport HUD */}
              <div className="absolute top-6 left-6 z-50 flex flex-col gap-3">
                <button 
                  onClick={() => setShowControls(!showControls)}
                  className={`w-12 h-12 ${showControls ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-black/60'} backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center hover:bg-blue-500 transition-all`}
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all"
                  title="Library"
                >
                  <FlaskConical className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 items-end">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Spectral Scan Active</span>
                </div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">CyberOS Optics v4.0</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
