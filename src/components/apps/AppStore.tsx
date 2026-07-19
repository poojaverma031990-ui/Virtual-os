import React, { useState, useMemo } from 'react';
import { 
  Package, CheckCircle, Image as ImageIcon, Terminal, Gamepad2, Bitcoin, 
  Music, PenTool, Video, Mic, Box, LineChart, FileEdit, TerminalSquare, 
  Compass, MessageCircle, Radio, Crown, SlidersHorizontal, Code2, Gamepad, 
  Palette, Sparkles, X, Search, Filter, ShieldCheck, Heart, Cpu 
} from 'lucide-react';
import { AppId } from '../../types';
import { playSound } from '../../lib/sounds';

export interface StoreApp {
  id: AppId;
  title: string;
  desc: string;
  category: 'fun' | 'creative' | 'tech' | 'system';
  icon: React.ComponentType<any>;
  rating: number;
  size: string;
}

export const STORE_INVENTORY: StoreApp[] = [
  { id: 'theme_store', title: 'Theme Store', desc: 'Customize OS appearance, wallpapers, & widgets.', category: 'system', icon: Palette, rating: 4.9, size: '2.4 MB' },
  { id: 'u_labs', title: 'U-labs 3D Engine', desc: 'Browse so many, too much and very rich interactive 3D mathematical simulations.', category: 'fun', icon: Cpu, rating: 5.0, size: '4.8 MB' },
  { id: 'cyber_paint', title: 'Cyber-Paint', desc: 'Advanced neon vector drawing and canvas tools.', category: 'creative', icon: PenTool, rating: 4.8, size: '3.1 MB' },
  { id: 'space_invaders', title: 'Retro Space Invaders', desc: 'Classic arcade shooter action with sound waves.', category: 'fun', icon: Gamepad2, rating: 4.7, size: '1.8 MB' },
  { id: 'memory_game', title: 'Emoji Match', desc: 'Fully playable memory game with interactive 3D flips.', category: 'fun', icon: Gamepad2, rating: 4.6, size: '0.9 MB' },
  { id: 'hacker_typer', title: 'Hacker Typer', desc: 'Mash your keyboard to simulate writing elite virus code.', category: 'system', icon: TerminalSquare, rating: 4.9, size: '0.4 MB' },
  { id: 'metronome', title: 'Metronome Pro', desc: 'Functional professional audio metronome with customizable tempo.', category: 'creative', icon: Music, rating: 4.5, size: '1.1 MB' },
  { id: 'breathing', title: 'Mindful Breathing', desc: 'Guided interactive diaphragmatic breathing loop.', category: 'system', icon: ImageIcon, rating: 4.8, size: '1.5 MB' },
  { id: 'pong', title: 'Retro Pong', desc: 'Fully playable 2-player local arcade paddle game.', category: 'fun', icon: Gamepad2, rating: 4.4, size: '0.8 MB' },
  { id: 'drum_sequencer', title: 'Beat Maker 9000', desc: 'Sequence and loop vintage custom drum patterns.', category: 'creative', icon: Radio, rating: 4.9, size: '2.7 MB' },
  { id: 'crypto_tracker', title: 'Crypto Wallet Tracker', desc: 'Track and simulate buying crypto assets.', category: 'tech', icon: Bitcoin, rating: 4.6, size: '2.1 MB' },
  { id: 'ai_gen', title: 'AI Image Generator', desc: 'Generate next-gen visuals using simulated prompts.', category: 'tech', icon: ImageIcon, rating: 4.7, size: '4.2 MB' },
  { id: 'terminal_pro', title: 'Hacker Terminal Pro', desc: 'Elite cyber hacking shell workspace.', category: 'system', icon: Terminal, rating: 4.9, size: '1.3 MB' },
  { id: 'drum_kit', title: 'Virtual Drum Kit', desc: 'Synthesized play pads with raw acoustic beats.', category: 'creative', icon: Music, rating: 4.8, size: '2.3 MB' },
  { id: 'video_player', title: 'Video Player', desc: 'High definition desktop video system.', category: 'tech', icon: Video, rating: 4.5, size: '3.6 MB' },
  { id: 'voice_recorder', title: 'Voice Recorder', desc: 'Record and visualize waveforms live.', category: 'creative', icon: Mic, rating: 4.4, size: '1.7 MB' },
  { id: 'cube_3d', title: '3D Cube Viewer', desc: 'Interactive spinning geometric matrix cube.', category: 'system', icon: Box, rating: 4.6, size: '1.2 MB' },
  { id: 'stock_market', title: 'Virtual Stock Market', desc: 'Day-trade simulated tickers with real-time graphs.', category: 'tech', icon: LineChart, rating: 4.7, size: '2.0 MB' },
  { id: 'markdown_editor', title: 'Markdown Editor', desc: 'Write detailed documents with side-by-side view.', category: 'tech', icon: FileEdit, rating: 4.8, size: '1.9 MB' },
  { id: 'system_info', title: 'System Diagnostics', desc: 'Detailed statistics of your virtual container computer.', category: 'system', icon: TerminalSquare, rating: 4.7, size: '0.7 MB' },
  { id: 'piano', title: 'Virtual Piano', desc: 'Fully polyphonic visual piano keyboard synthesizer.', category: 'creative', icon: Music, rating: 4.9, size: '2.8 MB' },
  { id: 'compass', title: 'Digital Compass', desc: 'Accurate compass showing orientation angles.', category: 'system', icon: Compass, rating: 4.3, size: '0.6 MB' },
  { id: 'chat', title: 'Virtual Chat', desc: 'Interactive chatroom sandbox.', category: 'tech', icon: MessageCircle, rating: 4.8, size: '1.5 MB' },
  { id: 'synth', title: 'Synthesizer Pro', desc: 'Advanced frequency oscillator sound synthesizer.', category: 'creative', icon: Radio, rating: 4.9, size: '3.2 MB' },
  { id: 'chess', title: 'Virtual Chess', desc: 'Full-rule board chess with elegant piece sets.', category: 'fun', icon: Crown, rating: 4.8, size: '2.9 MB' },
  { id: 'dj_mixer', title: 'DJ Deck Mixer', desc: 'Twin turntables with real vinyl scratching sounds.', category: 'creative', icon: SlidersHorizontal, rating: 4.9, size: '4.1 MB' },
  { id: 'code_editor', title: 'Code Editor Pro', desc: 'Professional development workspace.', category: 'tech', icon: Code2, rating: 5.0, size: '5.2 MB' },
  { id: 'scope', title: 'MicroScope Pro', desc: 'Highly immersive virtual microscope with 15+ specimens and deep zoom movement.', category: 'tech', icon: Search, rating: 4.9, size: '3.4 MB' },
  { id: 'solitaire', title: 'Solitaire', desc: 'Nostalgic desktop Klondike card game.', category: 'fun', icon: Gamepad, rating: 4.7, size: '2.2 MB' },
  { id: 'sky_explorer', title: 'SkyExplorer Orbital Engine', desc: 'An interactive gravity & space orbit simulator canvas.', category: 'fun', icon: Sparkles, rating: 5.0, size: '2.1 MB' },
  { id: 'periodic_table', title: 'Interactive Chemical Table', desc: 'A rich periodic table of elements with molecule builder.', category: 'tech', icon: Box, rating: 4.9, size: '1.9 MB' },
  { id: 'fractal_art', title: 'Cosmic Fractal Art', desc: 'Render complex mathematical Mandelbrot and Julia set patterns.', category: 'creative', icon: Palette, rating: 4.8, size: '2.5 MB' },
  { id: 'pixel_studio', title: 'Retro Pixel Studio', desc: 'Draw modular retro style sprites on canvas with local exporting.', category: 'creative', icon: PenTool, rating: 4.7, size: '1.4 MB' },
  { id: 'cellular_automata', title: 'Procedural Life Automata', desc: 'Run cellular Game of Life with custom configurations.', category: 'fun', icon: Sparkles, rating: 4.8, size: '1.1 MB' },
  { id: 'stego_crypto', title: 'Stego Crypto Workspace', desc: 'Inject secret text into carrier streams and translate advanced ciphers.', category: 'tech', icon: ShieldCheck, rating: 4.9, size: '2.0 MB' },
  { id: 'js_sandbox', title: 'JS Sandbox & Benchmarks', desc: 'Run isolated JavaScript routines and compile live code.', category: 'system', icon: Terminal, rating: 4.9, size: '1.8 MB' },
  { id: 'mind_map', title: 'Mind Graph Designer', desc: 'Brainstorm with interactive connected node graphs.', category: 'creative', icon: PenTool, rating: 4.6, size: '1.2 MB' },
  { id: 'typing_race', title: 'Code Speed Typist', desc: 'Typing race against computer script templates with progress tracker.', category: 'fun', icon: Gamepad2, rating: 4.7, size: '1.5 MB' },
  { id: 'rpg_quest', title: 'Retro Text RPG Master', desc: 'An interactive fantasy text RPG with procedural events.', category: 'fun', icon: Gamepad2, rating: 4.9, size: '2.4 MB' },
  { id: 'audio_visualizer', title: 'Synth Wave Visualizer', desc: 'An interactive pitch frequency synth generator and spirograph wave visualizer.', category: 'creative', icon: Music, rating: 5.0, size: '3.0 MB' },
];

export default function AppStore({ 
  installedApps, 
  onInstall 
}: { 
  installedApps: AppId[]; 
  onInstall: (appId: AppId) => void;
}) {
  const [installing, setInstalling] = useState<AppId | null>(null);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  
  // Store navigation & filtering states
  const [activeCategory, setActiveCategory] = useState<'all' | 'fun' | 'creative' | 'tech' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleInstall = (appId: AppId, title: string) => {
    playSound('click');
    setInstalling(appId);
    setProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 6; // quick dynamic installs
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          onInstall(appId);
          setInstalling(null);
          setProgress(0);
          playSound('success');
          setToast({
            title: 'Successfully Installed!',
            desc: `${title} has been added to your system desktop.`
          });
          setTimeout(() => setToast(null), 4000);
        }, 250);
      }
      setProgress(current);
    }, 100);
  };

  // Categories metadata
  const categories = [
    { id: 'all', label: 'All Software', icon: Package },
    { id: 'fun', label: 'Fun & Visuals', icon: Gamepad2 },
    { id: 'creative', label: 'Creative & Audio', icon: Music },
    { id: 'tech', label: 'Smart Tech & AI', icon: MessageCircle },
    { id: 'system', label: 'System Utility', icon: Compass }
  ] as const;

  // Filtered store apps
  const filteredApps = useMemo(() => {
    return STORE_INVENTORY.filter(app => {
      const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col rounded-b-lg overflow-y-auto text-slate-200 select-none relative">
      
      {/* HERO PROMOTIONS HEADER */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-fuchsia-950/30 border-b border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Vibe App Market <span className="bg-fuchsia-500/20 text-fuchsia-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-fuchsia-500/30">v2.5 PRO</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Get verified secure virtual tools, games, and rich 3D mathematical modules.</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search software store..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 hover:bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* FILTER BUTTONS / NAV */}
      <div className="px-6 py-4 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { playSound('click'); setActiveCategory(cat.id); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20' : 'bg-slate-900/40 text-slate-400 border-white/5 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* RENDER APPS LISTING */}
      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* CATEGORY SECTION HEADER */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Showing {filteredApps.length} catalog apps
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sandbox Verified
          </span>
        </div>

        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-28">
            {filteredApps.map((app) => {
              const isInstalled = installedApps.includes(app.id as AppId);
              const isInstalling = installing === app.id;
              
              return (
                <div 
                  key={app.id} 
                  className={`bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between transition-all group relative overflow-hidden ${isInstalled ? 'opacity-90' : ''}`}
                >
                  {/* Subtle decorative radial light */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />

                  {/* Top Details */}
                  <div>
                    <div className="flex gap-4 items-start">
                      <div className="bg-slate-950 border border-white/10 p-3 rounded-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                        <app.icon className="w-7 h-7 text-indigo-400 group-hover:text-fuchsia-400 transition-colors" strokeWidth={1.5} />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-100 truncate flex items-center gap-1">
                          {app.title}
                          {app.id === 'u_labs' && (
                            <span className="bg-fuchsia-600/20 text-fuchsia-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-fuchsia-500/20 animate-pulse">HOT</span>
                          )}
                        </h3>
                        
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                          <span className="uppercase text-indigo-400 font-bold">{app.category}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">★ {app.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{app.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 mt-3.5 leading-relaxed min-h-[38px]">{app.desc}</p>
                  </div>

                  {/* Install Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-950/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold">VIRTUAL OS APP</span>
                    
                    <div className="w-28 flex justify-end shrink-0">
                      {isInstalled ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-black tracking-wide bg-emerald-500/10 border border-emerald-500/20 py-1 px-3.5 rounded-full shadow-inner">
                          <CheckCircle className="w-3.5 h-3.5" /> INSTALLED
                        </div>
                      ) : isInstalling ? (
                        <div className="w-full flex flex-col items-center gap-1.5">
                          <div className="w-full bg-slate-950 border border-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-fuchsia-500 h-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(217,70,239,0.8)]" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[8px] text-fuchsia-400 font-mono font-bold animate-pulse">INSTALLING {progress}%</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleInstall(app.id as AppId, app.title)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black tracking-wider py-1.5 px-4 rounded-xl transition-all border border-indigo-500/30 hover:scale-102 hover:shadow-lg hover:shadow-indigo-600/15 active:scale-98 cursor-pointer"
                        >
                          INSTALL
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-10 max-w-md mx-auto mt-10">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-extrabold text-sm text-slate-300">No Apps Found</h3>
            <p className="text-xs text-slate-500 mt-1">We couldn't find any application matching "{searchQuery}" under this category filter.</p>
            <button 
              onClick={() => { playSound('click'); setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-4 px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="absolute bottom-4 right-4 bg-slate-900 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-3 shadow-2xl z-50 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-emerald-500/15 p-1.5 rounded-lg border border-emerald-500/25">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white leading-tight">{toast.title}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{toast.desc}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
