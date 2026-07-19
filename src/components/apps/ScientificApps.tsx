import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Orbit, Compass, Play, Pause, RotateCcw, Plus, Trash2, Info, Sparkles, CheckCircle
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

// ==========================================
// 1. SKY EXPLORER & GRAVITY ORBIT SIMULATOR
// ==========================================
interface CelestialBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  isFixed: boolean;
  trail: { x: number; y: number }[];
}

export function SkyExplorerApp() {
  const [bodies, setBodies] = useState<CelestialBody[]>(() => [
    { id: 'sun', x: 400, y: 250, vx: 0, vy: 0, mass: 20000, radius: 18, color: '#f59e0b', isFixed: true, trail: [] },
    { id: 'earth', x: 400, y: 110, vx: 12, vy: 0, mass: 10, radius: 6, color: '#3b82f6', isFixed: false, trail: [] },
    { id: 'mars', x: 400, y: 50, vx: 9.5, vy: 0, mass: 2, radius: 4.5, color: '#ef4444', isFixed: false, trail: [] }
  ]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [spawnMass, setSpawnMass] = useState(10);
  const [spawnColor, setSpawnColor] = useState('#10b981');
  const [gConstant, setGConstant] = useState(0.1);
  const [stats, setStats] = useState({ speed: 1, count: 3 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const bodiesRef = useRef<CelestialBody[]>(bodies);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const step = () => {
      let currentBodies = [...bodiesRef.current];
      if (isPlaying) {
        const len = currentBodies.length;
        const newBodies = currentBodies.map(b => ({
          ...b,
          trail: [...b.trail, { x: b.x, y: b.y }].slice(-60)
        }));

        // Compute gravitational attractions
        for (let i = 0; i < len; i++) {
          const b1 = newBodies[i];
          if (b1.isFixed) continue;

          let ax = 0;
          let ay = 0;

          for (let j = 0; j < len; j++) {
            if (i === j) continue;
            const b2 = newBodies[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distSq = dx * dx + dy * dy + 0.1; // soft factor
            const dist = Math.sqrt(distSq);

            if (dist < b1.radius + b2.radius && !b1.isFixed && !b2.isFixed) {
              // Simple soft collision bounces
              continue;
            }

            // Force F = G * m1 * m2 / r^2
            // Accel a = F / m1 = G * m2 / r^2
            const forceMag = (gConstant * b2.mass) / distSq;
            ax += forceMag * (dx / dist);
            ay += forceMag * (dy / dist);
          }

          b1.vx += ax;
          b1.vy += ay;
        }

        // Apply velocities
        for (let i = 0; i < len; i++) {
          const b = newBodies[i];
          if (!b.isFixed) {
            b.x += b.vx;
            b.y += b.vy;
          }
        }

        bodiesRef.current = newBodies;
        currentBodies = newBodies;
        setBodies(newBodies);
      }

      // Draw loop
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 456) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Draw trails
      currentBodies.forEach(b => {
        if (b.trail.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = b.color + '40';
        ctx.lineWidth = 1.5;
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.stroke();
      });

      // Draw bodies
      currentBodies.forEach(b => {
        // Draw glow ring
        ctx.beginPath();
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, b.radius * 2);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw solid core
        ctx.beginPath();
        ctx.fillStyle = b.color;
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      requestRef.current = requestAnimationFrame(step);
    };

    requestRef.current = requestAnimationFrame(step);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gConstant]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate orbiting velocity relative to center star
    const star = bodiesRef.current.find(b => b.isFixed) || bodiesRef.current[0];
    const dx = x - star.x;
    const dy = y - star.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // v = sqrt(G*M/r)
    const orbitalSpeed = Math.sqrt((gConstant * star.mass) / dist) || 5;

    // Perpendicular vector for tangent orbit
    const vx = (-dy / dist) * orbitalSpeed;
    const vy = (dx / dist) * orbitalSpeed;

    const newBody: CelestialBody = {
      id: `body-${Date.now()}`,
      x,
      y,
      vx,
      vy,
      mass: spawnMass,
      radius: Math.max(3, Math.log10(spawnMass) * 4),
      color: spawnColor,
      isFixed: false,
      trail: []
    };

    const updated = [...bodiesRef.current, newBody];
    bodiesRef.current = updated;
    setBodies(updated);
    playSound('click');
  };

  const handleReset = () => {
    const updated = [
      { id: 'sun', x: 400, y: 250, vx: 0, vy: 0, mass: 20000, radius: 18, color: '#f59e0b', isFixed: true, trail: [] },
      { id: 'earth', x: 400, y: 110, vx: 12, vy: 0, mass: 10, radius: 6, color: '#3b82f6', isFixed: false, trail: [] },
      { id: 'mars', x: 400, y: 50, vx: 9.5, vy: 0, mass: 2, radius: 4.5, color: '#ef4444', isFixed: false, trail: [] }
    ];
    bodiesRef.current = updated;
    setBodies(updated);
    playSound('success');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Control panel left */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Gravity Orbit Simulator</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
          Create celestial systems. Click on the space canvas to launch orbiting satellites with gravity calculations.
        </p>

        {/* Orbit configuration */}
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">G-Constant:</span>
            <span className="text-blue-400">{gConstant.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="0.01" 
            max="1" 
            step="0.01" 
            value={gConstant} 
            onChange={(e) => setGConstant(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />

          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Launch Mass:</span>
            <span className="text-emerald-400">{spawnMass} units</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="1000" 
            value={spawnMass} 
            onChange={(e) => setSpawnMass(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />

          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Satellite Color:</span>
          </div>
          <div className="flex gap-2">
            {['#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4'].map(color => (
              <button 
                key={color} 
                onClick={() => setSpawnColor(color)}
                className={`w-6 h-6 rounded-full border transition-all ${spawnColor === color ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Actions buttons */}
        <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
          <div className="flex gap-2">
            <button 
              onClick={() => { setIsPlaying(!isPlaying); playSound('click'); }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5 text-yellow-400" /> : <Play className="w-4.5 h-4.5 text-emerald-400" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button 
              onClick={handleReset}
              className="px-3.5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
              title="Reset Orbit"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
          <button 
            onClick={() => {
              const updated = [bodiesRef.current[0]];
              bodiesRef.current = updated;
              setBodies(updated);
              playSound('click');
            }}
            className="w-full py-2 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Satellites
          </button>
        </div>
      </div>

      {/* Interactive canvas view */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          onClick={handleCanvasClick}
          className="max-w-full max-h-full aspect-[16/10] bg-slate-950 cursor-crosshair border border-slate-900"
        />
        <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-mono text-slate-400 flex flex-col gap-0.5 pointer-events-none">
          <span className="font-bold text-white uppercase tracking-wider text-[9px] text-indigo-400 mb-0.5">Gravity Stats</span>
          <span>Constant: G={gConstant.toFixed(2)}</span>
          <span>Total Bodies: {bodies.length}</span>
          <span>Center star mass: 20K</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PERIODIC TABLE & CHEMISTRY MOLECULE BUILDER
// ==========================================
const CHEMICAL_ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, group: 1, period: 1, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Lightest element, highly flammable gas, makes up water.', state: 'Gas' },
  { symbol: 'He', name: 'Helium', number: 2, mass: 4.0026, group: 18, period: 1, color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', desc: 'Noble gas, non-reactive, used in balloons and lasers.', state: 'Gas' },
  { symbol: 'Li', name: 'Lithium', number: 3, mass: 6.94, group: 1, period: 2, color: 'bg-red-500/20 border-red-500/40 text-red-300', desc: 'Alkali metal, extremely reactive, used in high energy batteries.', state: 'Solid' },
  { symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.0122, group: 2, period: 2, color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', desc: 'Alkaline earth metal, light but highly durable and heat-resistant.', state: 'Solid' },
  { symbol: 'B', name: 'Boron', number: 5, mass: 10.81, group: 13, period: 2, color: 'bg-teal-500/20 border-teal-500/40 text-teal-300', desc: 'Metalloid, vital in glass production and structural plastics.', state: 'Solid' },
  { symbol: 'C', name: 'Carbon', number: 6, mass: 12.011, group: 14, period: 2, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Basis of all organic life, forms graphite and pure diamond.', state: 'Solid' },
  { symbol: 'N', name: 'Nitrogen', number: 7, mass: 14.007, group: 15, period: 2, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Makes up 78% of Earth Atmosphere, critical nutrient.', state: 'Gas' },
  { symbol: 'O', name: 'Oxygen', number: 8, mass: 15.999, group: 16, period: 2, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Crucial gas for cellular respiration, fuel of fires.', state: 'Gas' },
  { symbol: 'F', name: 'Fluorine', number: 9, mass: 18.998, group: 17, period: 2, color: 'bg-pink-500/20 border-pink-500/40 text-pink-300', desc: 'Extremely reactive pale yellow toxic halogen gas.', state: 'Gas' },
  { symbol: 'Ne', name: 'Neon', number: 10, mass: 20.180, group: 18, period: 2, color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', desc: 'Glows bright orange in discharge tubes, noble gas.', state: 'Gas' },
  { symbol: 'Na', name: 'Sodium', number: 11, mass: 22.990, group: 1, period: 3, color: 'bg-red-500/20 border-red-500/40 text-red-300', desc: 'Soft metallic alkali element, reacts violently with water.', state: 'Solid' },
  { symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.305, group: 2, period: 3, color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', desc: 'Burns with brilliant white light, essential for enzymes.', state: 'Solid' },
  { symbol: 'Al', name: 'Aluminum', number: 13, mass: 26.982, group: 13, period: 3, color: 'bg-sky-500/20 border-sky-500/40 text-sky-300', desc: 'Lightweight, recyclable metal used in aerospace and foil.', state: 'Solid' },
  { symbol: 'Si', name: 'Silicon', number: 14, mass: 28.085, group: 14, period: 3, color: 'bg-teal-500/20 border-teal-500/40 text-teal-300', desc: 'Metalloid semiconductor, key component of CPU microchips.', state: 'Solid' },
  { symbol: 'P', name: 'Phosphorus', number: 15, mass: 30.974, group: 15, period: 3, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Essential part of cell membranes, DNA structures and matches.', state: 'Solid' },
  { symbol: 'S', name: 'Sulfur', number: 16, mass: 32.06, group: 16, period: 3, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', desc: 'Yellow volcanic solid, component of proteins, strong odor.', state: 'Solid' },
  { symbol: 'Cl', name: 'Chlorine', number: 17, mass: 35.45, group: 17, period: 3, color: 'bg-pink-500/20 border-pink-500/40 text-pink-300', desc: 'Green toxic gas, used to sanitize swimming pools.', state: 'Gas' },
  { symbol: 'Ar', name: 'Argon', number: 18, mass: 39.948, group: 18, period: 3, color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', desc: 'Inert noble gas used in incandescent light bulbs.', state: 'Gas' }
];

interface MoleculeAtom {
  id: string;
  symbol: string;
  x: number;
  y: number;
  color: string;
}

interface MoleculeBond {
  from: string;
  to: string;
}

export function PeriodicTableApp() {
  const [activeTab, setActiveTab] = useState<'periodic' | 'builder'>('periodic');
  const [selectedElement, setSelectedElement] = useState<any>(CHEMICAL_ELEMENTS[0]);

  // Molecule Builder Canvas States
  const [atoms, setAtoms] = useState<MoleculeAtom[]>([]);
  const [bonds, setBonds] = useState<MoleculeBond[]>([]);
  const [selectedAtomSymbol, setSelectedAtomSymbol] = useState('H');
  const [draggingAtomId, setDraggingAtomId] = useState<string | null>(null);
  const [bondingAtomId, setBondingAtomId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto detect compound names
  const detectedCompound = useMemo(() => {
    const counts: { [key: string]: number } = {};
    atoms.forEach(a => {
      counts[a.symbol] = (counts[a.symbol] || 0) + 1;
    });

    const h = counts['H'] || 0;
    const o = counts['O'] || 0;
    const c = counts['C'] || 0;
    const n = counts['N'] || 0;

    if (h === 2 && o === 1 && c === 0) return { formula: 'H₂O', name: 'Water molecule (Liquid Life)' };
    if (c === 1 && o === 2 && h === 0) return { formula: 'CO₂', name: 'Carbon Dioxide (Greenhouse Gas)' };
    if (c === 1 && h === 4 && o === 0) return { formula: 'CH₄', name: 'Methane (Natural Gas Fuel)' };
    if (h === 3 && n === 1) return { formula: 'NH₃', name: 'Ammonia (Critical Fertilizer)' };
    if (h === 2 && c === 0 && o === 0) return { formula: 'H₂', name: 'Hydrogen Gas (Fuel source)' };
    if (o === 2 && c === 0 && h === 0) return { formula: 'O₂', name: 'Oxygen Molecule (Respiration)' };

    // Standard formula assembly
    const parts = Object.entries(counts).map(([sym, count]) => {
      const sub = count > 1 ? count.toString().replace(/./g, char => String.fromCharCode(char.charCodeAt(0) + 8272)) : '';
      return `${sym}${sub}`;
    });
    return parts.length ? { formula: parts.join(''), name: 'Complex molecular compound' } : { formula: 'None', name: 'Empty molecule workspace' };
  }, [atoms]);

  // Canvas interaction
  const handleWorkspaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAtomId || bondingAtomId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const symbolColors: { [key: string]: string } = {
      'H': '#10b981', 'He': '#6366f1', 'Li': '#ef4444', 'Be': '#f59e0b',
      'B': '#14b8a6', 'C': '#6b7280', 'N': '#3b82f6', 'O': '#ec4899'
    };

    const newAtom: MoleculeAtom = {
      id: `atom-${Date.now()}`,
      symbol: selectedAtomSymbol,
      x,
      y,
      color: symbolColors[selectedAtomSymbol] || '#8b5cf6'
    };

    setAtoms(prev => [...prev, newAtom]);
    playSound('click');
  };

  const handleAtomMouseDown = (atomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      // Begin creating chemical bond link
      setBondingAtomId(atomId);
    } else {
      setDraggingAtomId(atomId);
    }
  };

  const handleAtomMouseUp = (atomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bondingAtomId && bondingAtomId !== atomId) {
      // Check duplicate bond
      const exists = bonds.some(b => 
        (b.from === bondingAtomId && b.to === atomId) || 
        (b.from === atomId && b.to === bondingAtomId)
      );

      if (!exists) {
        setBonds(prev => [...prev, { from: bondingAtomId, to: atomId }]);
        playSound('success');
      }
    }
    setDraggingAtomId(null);
    setBondingAtomId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAtomId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setAtoms(prev => prev.map(a => a.id === draggingAtomId ? { ...a, x, y } : a));
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col select-none overflow-hidden">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 bg-slate-900 shrink-0">
        <button 
          onClick={() => { setActiveTab('periodic'); playSound('click'); }}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'periodic' ? 'border-blue-500 text-blue-400 bg-slate-950' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Periodic Table
        </button>
        <button 
          onClick={() => { setActiveTab('builder'); playSound('click'); }}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'builder' ? 'border-blue-500 text-blue-400 bg-slate-950' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Chemical Molecule Builder
        </button>
      </div>

      {activeTab === 'periodic' ? (
        /* TAB 1: PERIODIC TABLE */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Elements grid */}
          <div className="flex-1 p-6 overflow-auto custom-scrollbar flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Interactive Element Matrix (Group 1 - 18)</h3>
            
            <div className="grid grid-cols-18 gap-1.5 min-w-[700px] w-full">
              {/* Build first 3 periods */}
              {Array.from({ length: 3 }).map((_, pIdx) => {
                const period = pIdx + 1;
                return Array.from({ length: 18 }).map((_, gIdx) => {
                  const group = gIdx + 1;
                  const el = CHEMICAL_ELEMENTS.find(e => e.period === period && e.group === group);
                  
                  if (!el) {
                    return <div key={`empty-${period}-${group}`} className="aspect-square" />;
                  }

                  return (
                    <button
                      key={el.symbol}
                      onClick={() => { setSelectedElement(el); playSound('click'); }}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all active:scale-90 hover:scale-105 shadow-md ${el.color} ${selectedElement?.symbol === el.symbol ? 'ring-2 ring-white border-white scale-105' : ''}`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 self-start leading-none mb-0.5">{el.number}</span>
                      <span className="text-sm font-black tracking-tight">{el.symbol}</span>
                      <span className="text-[7px] text-slate-400 font-medium truncate max-w-full hidden sm:inline">{el.name}</span>
                    </button>
                  );
                });
              })}
            </div>

            {/* Hint Box */}
            <div className="mt-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3 items-center">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                Click elements inside the matrix to discover atomic numbers, scientific descriptions, masses, and biological details.
              </p>
            </div>
          </div>

          {/* Details Column */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto">
            {selectedElement ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border text-center ${selectedElement.color}`}>
                  <span className="text-xs font-mono font-black tracking-widest block opacity-70 mb-1">ATOMIC NO. {selectedElement.number}</span>
                  <h2 className="text-5xl font-black mb-1">{selectedElement.symbol}</h2>
                  <h3 className="text-base font-bold text-white mb-2">{selectedElement.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full">{selectedElement.state}</span>
                </div>

                <div className="space-y-3 font-mono text-xs border-t border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Atomic Mass:</span>
                    <span className="text-slate-200 font-bold">{selectedElement.mass} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Group:</span>
                    <span className="text-slate-200 font-bold">{selectedElement.group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Period:</span>
                    <span className="text-slate-200 font-bold">{selectedElement.period}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scientific Description</h4>
                  <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{selectedElement.desc}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Compass className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">No Element Selected</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: MOLECULE BUILDER */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Element select sidebar */}
          <div className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Spawn Elements</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-normal">
              Select an atom tool below, then click in the canvas block to drop. <strong>Shift + Click & Drag</strong> between atoms to form covalent chemical bonds!
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O'].map(sym => (
                <button
                  key={sym}
                  onClick={() => { setSelectedAtomSymbol(sym); playSound('click'); }}
                  className={`py-3 px-2 rounded-xl text-xs font-black border transition-all ${selectedAtomSymbol === sym ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'}`}
                >
                  Atom: {sym}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setAtoms([]); setBonds([]); playSound('click'); }}
              className="mt-auto w-full py-2 bg-red-950/25 hover:bg-red-900/20 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Clear Molecule
            </button>
          </div>

          {/* Canvas block */}
          <div 
            ref={canvasRef}
            onClick={handleWorkspaceClick}
            onMouseMove={handleMouseMove}
            className="flex-1 relative bg-[#040815] cursor-crosshair overflow-hidden"
          >
            {/* Compound Output banner */}
            <div className="absolute top-4 left-4 bg-slate-900/95 border border-indigo-500/30 backdrop-blur-md px-4 py-3 rounded-2xl max-w-sm pointer-events-none shadow-xl flex gap-3 items-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-0.5">Molecular Analyzer</span>
                <strong className="text-sm font-black text-white block">{detectedCompound.formula}</strong>
                <span className="text-[10px] text-slate-400 font-bold">{detectedCompound.name}</span>
              </div>
            </div>

            {/* Instruction indicator */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-500 font-bold pointer-events-none">
              Shift + Click Atom to link bonds
            </div>

            {/* SVG Bonds Layer */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full">
              {bonds.map((bond, idx) => {
                const fromAtom = atoms.find(a => a.id === bond.from);
                const toAtom = atoms.find(a => a.id === bond.to);
                if (!fromAtom || !toAtom) return null;
                return (
                  <line
                    key={idx}
                    x1={fromAtom.x}
                    y1={fromAtom.y}
                    x2={toAtom.x}
                    y2={toAtom.y}
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="1 1"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>

            {/* Interactive Atoms overlay */}
            {atoms.map(a => (
              <div
                key={a.id}
                onMouseDown={(e) => handleAtomMouseDown(a.id, e)}
                onMouseUp={(e) => handleAtomMouseUp(a.id, e)}
                className={`absolute w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-xs font-black cursor-grab active:cursor-grabbing hover:scale-115 transition-transform shadow-lg ${bondingAtomId === a.id ? 'ring-4 ring-indigo-500 animate-ping' : ''}`}
                style={{ 
                  left: a.x - 24, 
                  top: a.y - 24, 
                  backgroundColor: a.color,
                  boxShadow: `0 0 16px ${a.color}50`
                }}
              >
                {a.symbol}
              </div>
            ))}

            {atoms.length === 0 && (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-700 pointer-events-none">
                <Orbit className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest opacity-30">Atom Builder Sandbox</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
