import React, { useState, useRef, useEffect } from 'react';
import { 
  Network, Flame, Award, BookOpen, ShieldAlert, ArrowRight, Sparkles, Swords, RefreshCw, ShoppingCart, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

// ==========================================
// 1. MIND MAP & BRAINSTORMING GRAPH DESIGNER
// ==========================================
interface MindNode {
  id: string;
  title: string;
  x: number;
  y: number;
  color: string;
}

interface MindEdge {
  from: string;
  to: string;
}

export function MindMapApp() {
  const [nodes, setNodes] = useState<MindNode[]>(() => [
    { id: '1', title: 'Grand Idea', x: 250, y: 150, color: '#6366f1' },
    { id: '2', title: 'Design System', x: 120, y: 250, color: '#ec4899' },
    { id: '3', title: 'Development Core', x: 380, y: 250, color: '#10b981' }
  ]);
  const [edges, setEdges] = useState<MindEdge[]>(() => [
    { from: '1', to: '2' },
    { from: '1', to: '3' }
  ]);
  const [nodeTitle, setNodeTitle] = useState('New Node');
  const [nodeColor, setNodeColor] = useState('#8b5cf6');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingNodeId, setLinkingNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setLinkingNodeId(id);
    } else {
      setDraggingNodeId(id);
    }
  };

  const handleNodeMouseUp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkingNodeId && linkingNodeId !== id) {
      const exists = edges.some(edge => 
        (edge.from === linkingNodeId && edge.to === id) || 
        (edge.from === id && edge.to === linkingNodeId)
      );
      if (!exists) {
        setEdges(prev => [...prev, { from: linkingNodeId, to: id }]);
        playSound('success');
      }
    }
    setDraggingNodeId(null);
    setLinkingNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x, y } : n));
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingNodeId || linkingNodeId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: MindNode = {
      id: `node-${Date.now()}`,
      title: nodeTitle,
      x,
      y,
      color: nodeColor
    };

    setNodes(prev => [...prev, newNode]);
    playSound('click');
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(edge => edge.from !== id && edge.to !== id));
    playSound('click');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      {/* Mind map control left */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black uppercase tracking-wider">Mind Designer</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold leading-normal">
          Click in the canvas block to drop idea nodes. Hold <strong>Shift + click drag</strong> between nodes to link connection lines.
        </p>

        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Spawn Idea Label</label>
          <input 
            type="text" 
            value={nodeTitle} 
            onChange={(e) => setNodeTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3 py-2 text-xs font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Node Accent Color</label>
          <div className="flex gap-2">
            {['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'].map(color => (
              <button 
                key={color} 
                onClick={() => setNodeColor(color)}
                className={`w-6 h-6 rounded-full border transition-all ${nodeColor === color ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => { setNodes([]); setEdges([]); playSound('click'); }}
          className="mt-auto w-full py-2 bg-red-950/25 hover:bg-red-900/20 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Clear Workspace
        </button>
      </div>

      {/* Mind map canvas */}
      <div 
        ref={containerRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="flex-1 relative bg-slate-950/40 cursor-crosshair overflow-hidden"
      >
        {/* SVG connection lines layer */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#4338ca"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>

        {/* Floating node views */}
        {nodes.map(n => (
          <div
            key={n.id}
            onMouseDown={(e) => handleNodeMouseDown(n.id, e)}
            onMouseUp={(e) => handleNodeMouseUp(n.id, e)}
            className="absolute px-4 py-2.5 rounded-2xl border-2 border-white/10 text-xs font-black cursor-grab active:cursor-grabbing hover:scale-105 transition-transform flex items-center gap-2 select-none shadow-xl text-white group"
            style={{ 
              left: n.x - 60, 
              top: n.y - 20, 
              backgroundColor: n.color,
              boxShadow: `0 4px 14px ${n.color}50`
            }}
          >
            <span className="truncate max-w-[100px]">{n.title}</span>
            <button 
              onClick={(e) => deleteNode(n.id, e)}
              className="p-0.5 hover:bg-black/20 rounded-full text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {nodes.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-700 pointer-events-none">
            <Network className="w-12 h-12 mb-2 opacity-20 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest opacity-30">Mind Storming Canvas</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. CODE RACING ARENA
// ==========================================
const CODE_SNIPPETS = [
  { lang: 'React', text: 'export default function Button({ label }) { return <button className="bg-indigo-600 hover:bg-indigo-500">{label}</button>; }' },
  { lang: 'JavaScript', text: 'const calculateFactorial = (n) => { if (n <= 1) return 1; return n * calculateFactorial(n - 1); };' },
  { lang: 'TypeScript', text: 'interface SystemConfig { port: number; host: string; telemetry: boolean; }' }
];

export function TypingRaceApp() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const snippet = CODE_SNIPPETS[snippetIndex];

  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Accuracy calculator
    let errors = 0;
    const checkLength = Math.min(val.length, snippet.text.length);
    for (let i = 0; i < checkLength; i++) {
      if (val[i] !== snippet.text[i]) errors++;
    }
    const acc = Math.max(0, Math.floor(((checkLength - errors) / (checkLength || 1)) * 100));
    setAccuracy(acc);

    setInputVal(val);

    // Calculate real-time speed
    if (startTime) {
      const durationMin = (Date.now() - startTime) / 60000;
      const typedWords = val.length / 5;
      const speed = Math.floor(typedWords / (durationMin || 0.01));
      setWpm(speed);
    }

    if (val === snippet.text) {
      setIsCompleted(true);
      playSound('success');
    }
  };

  const handleRestart = () => {
    setInputVal('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    playSound('click');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col select-none p-6 overflow-y-auto">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          <h2 className="text-sm font-black uppercase tracking-wider">Code Racing Arena</h2>
        </div>
        <div className="flex gap-2">
          {CODE_SNIPPETS.map((c, idx) => (
            <button 
              key={idx}
              onClick={() => { setSnippetIndex(idx); handleRestart(); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${snippetIndex === idx ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              {c.lang}
            </button>
          ))}
        </div>
      </div>

      {/* Racing Track visual */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl h-14 relative overflow-hidden mb-6 flex items-center">
        {/* Race car representation */}
        <div 
          className="absolute text-2xl transition-all duration-300"
          style={{ left: `calc(${Math.min(100, (inputVal.length / snippet.text.length) * 100)}% - 35px)` }}
        >
          🏎️
        </div>
        {/* Flag finish line */}
        <div className="absolute right-3 text-lg">🏁</div>
      </div>

      {/* Snippet Block text */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 mb-5 font-mono text-xs text-slate-400 relative">
        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-2">{snippet.lang} syntax snippet</span>
        <div className="leading-relaxed select-text font-semibold">
          {snippet.text.split('').map((char, index) => {
            let color = 'text-slate-500';
            if (index < inputVal.length) {
              color = inputVal[index] === char ? 'text-emerald-400 font-bold' : 'text-red-400 bg-red-950/40 font-bold underline';
            }
            return <span key={index} className={color}>{char}</span>;
          })}
        </div>
      </div>

      {/* Live Speed telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Live Speed</span>
          <strong className="text-xl font-black text-orange-400">{wpm} WPM</strong>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Accuracy</span>
          <strong className="text-xl font-black text-emerald-400">{accuracy}%</strong>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Progress</span>
          <strong className="text-xl font-black text-sky-400">{Math.floor((inputVal.length / snippet.text.length) * 100)}%</strong>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</span>
          <strong className={`text-xl font-black uppercase ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
            {isCompleted ? 'Winner!' : 'Typing...'}
          </strong>
        </div>
      </div>

      {/* Input bar */}
      <input 
        type="text" 
        value={inputVal}
        onChange={handleInputChange}
        disabled={isCompleted}
        placeholder="Type the coding snippet exactly above to race..."
        className="w-full bg-slate-900 border-2 border-slate-800 focus:border-orange-500 rounded-2xl px-5 py-3 text-xs font-mono outline-none text-slate-200 transition-colors"
      />

      {isCompleted && (
        <button 
          onClick={handleRestart}
          className="mt-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all hover:scale-102 shadow-lg"
        >
          Race Again
        </button>
      )}
    </div>
  );
}

// ==========================================
// 3. RETRO ADVENTURE RPG GAME MASTER
// ==========================================
interface RPGCharacter {
  hp: number;
  maxHp: number;
  level: number;
  gold: number;
  weapon: string;
  attack: number;
  defense: number;
  xp: number;
}

export function RPGQuestApp() {
  const [character, setCharacter] = useState<RPGCharacter>({
    hp: 80,
    maxHp: 80,
    level: 1,
    gold: 50,
    weapon: 'Rusted Iron Blade',
    attack: 8,
    defense: 3,
    xp: 0
  });

  const [questLog, setQuestLog] = useState<string[]>(['You enter the dark procedural ruins of VibeCore...']);
  const [monsterName, setMonsterName] = useState<string | null>(null);
  const [monsterHp, setMonsterHp] = useState<number>(0);

  const startQuest = () => {
    const events = [
      { msg: 'You uncover a hidden treasure chest filled with gold coins!', action: () => setCharacter(c => ({ ...c, gold: c.gold + 25 })) },
      { msg: 'A mysterious wizard cures your battle wounds.', action: () => setCharacter(c => ({ ...c, hp: c.maxHp })) },
      { msg: 'You encounter a Wild Cyber Sentinel blocking the mainframe doorway!', combat: { name: 'Cyber Sentinel', hp: 45 } },
      { msg: 'You run into a rogue Mercenary brandishing laser blades!', combat: { name: 'Rogue Mercenary', hp: 35 } }
    ];

    const ev = events[Math.floor(Math.random() * events.length)];
    setQuestLog(prev => [ev.msg, ...prev]);

    if (ev.combat) {
      setMonsterName(ev.combat.name);
      setMonsterHp(ev.combat.hp);
      playSound('error');
    } else if (ev.action) {
      ev.action();
      playSound('success');
    }
  };

  const executeAttack = () => {
    if (!monsterName) return;
    
    // Player hits monster
    const playerDamage = Math.max(3, character.attack - Math.floor(Math.random() * 3));
    const nextMonsterHp = Math.max(0, monsterHp - playerDamage);
    setMonsterHp(nextMonsterHp);

    let nextLog = [`You strike ${monsterName} dealing ${playerDamage} damage!`];

    if (nextMonsterHp <= 0) {
      // Monster defeated
      setMonsterName(null);
      const earnedGold = Math.floor(Math.random() * 20) + 15;
      const earnedXp = 40;
      
      setCharacter(c => {
        const nextXp = c.xp + earnedXp;
        const levelUp = nextXp >= 100;
        return {
          ...c,
          xp: levelUp ? nextXp - 100 : nextXp,
          level: levelUp ? c.level + 1 : c.level,
          maxHp: levelUp ? c.maxHp + 20 : c.maxHp,
          hp: levelUp ? c.maxHp + 20 : c.hp,
          attack: levelUp ? c.attack + 4 : c.attack,
          gold: c.gold + earnedGold
        };
      });

      nextLog.unshift(`⚔️ Defeated ${monsterName}! Earned +${earnedGold} Gold & +${earnedXp} XP.`);
      playSound('success');
    } else {
      // Monster hits back
      const monsterDamage = Math.max(2, 6 - character.defense);
      setCharacter(c => ({ ...c, hp: Math.max(0, c.hp - monsterDamage) }));
      nextLog.unshift(`${monsterName} retaliates with heavy laser strikes, dealing ${monsterDamage} damage.`);
    }

    setQuestLog(prev => [...nextLog, ...prev]);
  };

  const upgradeWeapon = () => {
    if (character.gold >= 40) {
      setCharacter(c => ({
        ...c,
        gold: c.gold - 40,
        weapon: 'Chrono-Plasma Sabres',
        attack: c.attack + 6
      }));
      setQuestLog(prev => ['You bought Chrono-Plasma Sabres (+6 Attack) from the weapon smith.', ...prev]);
      playSound('success');
    } else {
      setQuestLog(prev => ['You lack sufficient gold coins for this upgrade.', ...prev]);
      playSound('error');
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col md:flex-row select-none overflow-hidden">
      
      {/* Stats side pane */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto shrink-0 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xs font-black uppercase tracking-wider">RPG Status Panel</h2>
        </div>

        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-slate-500">Character Level:</span>
            <span className="text-yellow-400">{character.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">HP Status:</span>
            <span className="text-emerald-400">{character.hp} / {character.maxHp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Attack damage:</span>
            <span className="text-orange-400">{character.attack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Defense core:</span>
            <span className="text-sky-400">{character.defense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Weapon tier:</span>
            <span className="text-white truncate max-w-[110px]">{character.weapon}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Gold coins:</span>
            <span className="text-amber-400">{character.gold} G</span>
          </div>
        </div>

        <button 
          onClick={upgradeWeapon}
          className="py-2.5 mt-auto bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-amber-400"
        >
          <ShoppingCart className="w-4 h-4" /> Upgrade Weapon (40 G)
        </button>
      </div>

      {/* Log Console and Active quest game area */}
      <div className="flex-1 p-5 flex flex-col overflow-hidden">
        
        {/* Active event area */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 mb-5 shrink-0 min-h-[120px] flex flex-col justify-center items-center">
          {monsterName ? (
            <div className="text-center space-y-3">
              <Swords className="w-8 h-8 text-red-500 mx-auto animate-bounce" />
              <div className="text-sm font-black uppercase text-red-400">Combat Encounter: {monsterName}</div>
              <div className="text-xs font-bold font-mono">Monster Health: {monsterHp} HP</div>
              <button
                onClick={executeAttack}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/20"
              >
                Strike Enemy
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto animate-pulse" />
              <div className="text-xs font-bold text-slate-300">RUINS ARE QUIET</div>
              <button
                onClick={startQuest}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Search Next Room
              </button>
            </div>
          )}
        </div>

        {/* Quest logs terminal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2 font-mono">Quest Chronicle Logs</span>
          <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-slate-400 space-y-2 select-text leading-relaxed">
            {questLog.map((log, idx) => (
              <div key={idx} className="border-b border-slate-950 pb-2 last:border-none">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
