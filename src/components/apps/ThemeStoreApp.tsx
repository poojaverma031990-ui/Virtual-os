import React, { useState } from 'react';
import { themeStore } from '../../themeStore';
import { 
  RefreshCcw, Palette, Image as ImageIcon, Layout, Box, Monitor, CheckCircle, 
  Volume2, Sparkles, Timer, MousePointer, Paintbrush, Play, Layers, Compass, Laptop,
  Cloud, TrendingUp, Calendar, Battery, Music
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

type TabType = 'presets' | 'wallpapers' | 'ui' | 'sound_cursor' | 'studio' | 'widgets';

export function ThemeStoreApp() {
  const [theme, setTheme] = useState(themeStore.get());
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [showPreview, setShowPreview] = useState(true);

  const availableWidgets = [
    { id: 'clock', name: 'Ultra Clock', icon: Timer, w: 4, h: 2, desc: 'Large digital clock with date' },
    { id: 'weather', name: 'Weather Flow', icon: Cloud, w: 4, h: 2, desc: 'Real-time local weather' },
    { id: 'stocks', name: 'Market Pulse', icon: TrendingUp, iconColor: 'text-emerald-400', w: 3, h: 3, desc: 'Live stock & crypto ticker' },
    { id: 'calendar', name: 'Smart Calendar', icon: Calendar, iconColor: 'text-orange-400', w: 4, h: 3, desc: 'Month view & upcoming events' },
    { id: 'battery', name: 'Battery Pro', icon: Battery, iconColor: 'text-blue-400', w: 2, h: 3, desc: 'Detailed power analytics' },
    { id: 'music', name: 'Vinyl Player', icon: Music, iconColor: 'text-fuchsia-400', w: 4, h: 2, desc: 'Now playing visualizer' },
  ];

  const addWidgetToDesktop = (widget: any) => {
    // We'll use window dispatch to communicate with App.tsx
    window.dispatchEvent(new CustomEvent('add_desktop_widget', { 
      detail: { ...widget, type: widget.id, id: `w_${Date.now()}` } 
    }));
    playSound('success');
  };
  
  // Custom abstract gradient creator state
  const [gradColor1, setGradColor1] = useState('#8b5cf6'); // violet
  const [gradColor2, setGradColor2] = useState('#ec4899'); // pink
  const [gradColor3, setGradColor3] = useState('#000000'); // dark base
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStyle, setGradStyle] = useState<'linear' | 'radial'>('linear');

  React.useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  const updateTheme = (updates: any) => {
    themeStore.set(updates);
    setTheme(themeStore.get());
    playSound('click');
  };

  const handleReset = () => {
    themeStore.reset();
    setTheme(themeStore.get());
    playSound('success');
  };

  const toggleWidget = (widget: string) => {
    const current = [...theme.widgets];
    const index = current.indexOf(widget);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(widget);
    }
    updateTheme({ widgets: current });
  };

  const testSoundPack = (packId: string) => {
    // Override current soundpack briefly or just play appropriate sound
    if (packId === 'muted') return;
    playSound('success');
  };

  // Preset theme bundles
  const presets = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon Glow',
      desc: 'High-contrast synthetic future vibes with pink-purple gradients & neon borders.',
      accent: '#ec4899',
      wallpaper: 'neon_waves',
      windowStyle: 'neon',
      taskbarStyle: 'mac',
      fontFamily: 'mono',
      iconTheme: 'neon',
      soundPack: 'synth',
      animationSpeed: 'snappy',
      cursorStyle: 'crosshair',
    },
    {
      id: 'hacker',
      name: 'Terminal Matrix Rain',
      desc: 'Solid pitch black console optimized for hardcore terminal vibe-coding with real falling matrix green code drops.',
      accent: '#10b981',
      wallpaper: 'matrix',
      windowStyle: 'flat',
      taskbarStyle: 'transparent',
      fontFamily: 'mono',
      iconTheme: 'minimal',
      soundPack: 'muted',
      animationSpeed: 'snappy',
      cursorStyle: 'terminal',
    },
    {
      id: 'starfield_warp',
      name: 'Hyper-drive Starfield',
      desc: 'Step into lightspeed warp with a live interactive flying star field backdrop.',
      accent: '#a855f7',
      wallpaper: 'starfield',
      windowStyle: 'glass',
      taskbarStyle: 'mac',
      fontFamily: 'mono',
      iconTheme: 'glass',
      soundPack: 'synth',
      animationSpeed: 'smooth',
      cursorStyle: 'crosshair',
    },
    {
      id: 'aurora_glow',
      name: 'Cosmic Aurora Glow',
      desc: 'Flowing colorful magnetic light waves with shifting neon accents.',
      accent: '#06b6d4',
      wallpaper: 'aurora_glow',
      windowStyle: 'neon',
      taskbarStyle: 'transparent',
      fontFamily: 'sans',
      iconTheme: 'neon',
      soundPack: 'bubble',
      animationSpeed: 'smooth',
      cursorStyle: 'default',
    },
    {
      id: 'cupertino',
      name: 'Aero Glass Cupertino',
      desc: 'Sleek, fluid gradients with beautiful frosted acrylic sheets and fluid response.',
      accent: '#3b82f6',
      wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80',
      windowStyle: 'glass',
      taskbarStyle: 'mac',
      fontFamily: 'sans',
      iconTheme: 'glass',
      soundPack: 'bubble',
      animationSpeed: 'smooth',
      cursorStyle: 'default',
    },
    {
      id: 'retro95',
      name: 'Windows 95 Classic',
      desc: 'Traditional teal solid desktop with flat industrial gray windows & 8-bit sound tones.',
      accent: '#555555',
      wallpaper: '#008080', // retro teal
      windowStyle: 'retro',
      taskbarStyle: 'default',
      fontFamily: 'sans',
      iconTheme: 'default',
      soundPack: 'retro',
      animationSpeed: 'instant',
      cursorStyle: 'default',
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    updateTheme({
      wallpaper: preset.wallpaper,
      accentColor: preset.accent,
      windowStyle: preset.windowStyle as any,
      taskbarStyle: preset.taskbarStyle as any,
      fontFamily: preset.fontFamily as any,
      iconTheme: preset.iconTheme as any,
      soundPack: preset.soundPack as any,
      animationSpeed: preset.animationSpeed as any,
      cursorStyle: preset.cursorStyle as any,
    });
    setTimeout(() => playSound('success'), 100);
  };

  const applyCustomGradient = () => {
    let styleStr = '';
    if (gradStyle === 'linear') {
      styleStr = `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${gradColor2} 50%, ${gradColor3} 100%)`;
    } else {
      styleStr = `radial-gradient(circle, ${gradColor1} 0%, ${gradColor2} 60%, ${gradColor3} 100%)`;
    }
    updateTheme({ wallpaper: styleStr });
    setTimeout(() => playSound('success'), 50);
  };

  const wallpapers = [
    { id: 'default', label: 'Dark Void (Default)', value: 'default', isLive: false },
    { id: 'matrix', label: 'Matrix Code Rain', value: 'matrix', isLive: true },
    { id: 'starfield', label: 'Starfield Warp', value: 'starfield', isLive: true },
    { id: 'neon_waves', label: 'Neon Cyber Mesh', value: 'neon_waves', isLive: true },
    { id: 'aurora_glow', label: 'Cosmic Aurora Glow', value: 'aurora_glow', isLive: true },
    { id: 'neon_city', label: 'Neon City', value: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1600&q=80', isLive: false },
    { id: 'abstract_fluid', label: 'Abstract Fluid', value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80', isLive: false },
    { id: 'space', label: 'Deep Space', value: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80', isLive: false },
    { id: 'forest', label: 'Misty Forest', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80', isLive: false },
    { id: 'sunset', label: 'Retro Wave Sunset', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80', isLive: false },
    { id: 'vaporwave_grid', label: 'Retro Wave Grid', value: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1600&q=80', isLive: false },
    { id: 'cosmic_dust', label: 'Cosmic Dust', value: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1600&q=80', isLive: false },
    { id: 'cyber_matrix', label: 'Cyber Matrix', value: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80', isLive: false },
    { id: 'cozy_lofi', label: 'Cozy Lofi', value: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&q=80', isLive: false },
    { id: 'cherry_sakura', label: 'Cherry Sakura', value: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=1600&q=80', isLive: false },
    { id: 'tokyo_alley', label: 'Tokyo Alleyway', value: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=80', isLive: false }
  ];

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row font-sans text-slate-200 select-none">
      {/* LEFT SIDEBAR - CATEGORIES */}
      <div className="w-full md:w-56 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col shrink-0 gap-1.5 overflow-y-auto">
        <div className="flex items-center gap-2.5 mb-5 px-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <Palette className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider uppercase text-white">Vibe Theme Store</h2>
            <p className="text-[9px] text-slate-400">Desktop Personalization Pro</p>
          </div>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 mt-1 mb-2">Customization</div>
        
        <div className="grid grid-cols-5 gap-1">
          {[
            { id: 'presets', label: 'Presets', icon: Sparkles },
            { id: 'wallpapers', label: 'Wallpapers', icon: ImageIcon },
            { id: 'ui', label: 'UI & Fonts', icon: Layout },
            { id: 'sound_cursor', label: 'Audio', icon: Volume2 },
            { id: 'studio', label: 'Studio', icon: Paintbrush },
            { id: 'widgets', label: 'Widgets', icon: Box },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { playSound('click'); setActiveTab(tab.id as TabType); }}
              className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg text-[8px] font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <tab.icon className={`w-3 h-3 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          ))}
        </div>




      </div>

      {/* RIGHT MAIN PANEL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP LIVE PREVIEW WRAPPER */}
        <div className="bg-slate-900/40 border-b border-slate-800/60 transition-all duration-300">
          <div className="px-4 py-2 bg-slate-900/60 flex items-center justify-between border-b border-slate-800/40">
            <button 
              onClick={() => { playSound('click'); setShowPreview(!showPreview); }}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <Laptop className="w-4 h-4 text-indigo-400" /> 
              <span>Live Desktop Simulator</span>
              <span className={`px-2 py-0.5 rounded ml-2 font-mono text-[9px] uppercase font-bold transition-all ${showPreview ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {showPreview ? "Collapse Preview ✕" : "Expand Preview 👁"}
              </span>
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3 h-3" /> RESET
            </button>
          </div>
          
          {showPreview && (
            <div className="p-4 flex flex-col lg:flex-row items-center gap-5 justify-between animate-in fade-in duration-200">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-indigo-400" /> Dynamic Live Desktop Simulator
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">See your customizations applied instantly in a scale miniature of your operating workspace below.</p>
              </div>
              
              {/* THE PREVIEW FRAME */}
              <div className="w-full lg:w-72 h-36 rounded-xl border border-slate-800 relative overflow-hidden bg-slate-950 shadow-2xl flex flex-col shrink-0">
                {/* Background simulated wallpaper */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300" 
                  style={{ 
                    background: theme.wallpaper === 'default' 
                      ? '#070b19' 
                      : (theme.wallpaper.startsWith('http') || theme.wallpaper.startsWith('/') || theme.wallpaper.includes('unsplash.com'))
                        ? `url("${theme.wallpaper}")`
                        : theme.wallpaper 
                  }} 
                />
                
                {/* Simulated Desktop icons */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center ${theme.iconTheme === 'neon' ? 'bg-fuchsia-500/20 border border-fuchsia-400 shadow-[0_0_4px_#ec4899]' : theme.iconTheme === 'minimal' ? 'bg-slate-400/20 border border-slate-400/40' : theme.iconTheme === 'glass' ? 'bg-white/10 backdrop-blur-xs border border-white/20' : 'bg-blue-500'}`} />
                      <div className="w-8 h-1 bg-white/40 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Simulated Active Window mockup */}
                <div className="absolute top-6 right-6 left-12 bottom-10 flex flex-col rounded-lg shadow-2xl overflow-hidden transition-all duration-300 transform scale-95" style={{ zIndex: 10 }}>
                  {/* Window Header */}
                  <div 
                    className={`h-4 px-2 flex items-center justify-between text-[7px] font-bold ${theme.windowStyle === 'retro' ? 'bg-gray-400 text-black border-b border-gray-300' : 'bg-slate-900/80 text-white border-b border-white/5'}`}
                    style={{ borderLeftColor: theme.accentColor, borderLeftWidth: '2px' }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                      <span className={theme.fontFamily === 'mono' ? 'font-mono' : theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}>Vibe Window</span>
                    </div>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 bg-red-500 rounded-full" />
                    </div>
                  </div>
                  {/* Window Content */}
                  <div className={`flex-1 p-2 text-[7px] flex flex-col justify-between ${theme.windowStyle === 'glass' ? 'bg-slate-950/40 backdrop-blur-md' : theme.windowStyle === 'retro' ? 'bg-gray-300 text-black font-sans' : 'bg-slate-950 text-slate-300'}`}>
                    <div className="opacity-60">System text style</div>
                    <button className="px-1.5 py-0.5 rounded text-[5px] text-white self-end" style={{ backgroundColor: theme.accentColor }}>Button</button>
                  </div>
                </div>

                {/* Simulated Taskbar bottom/top/mac */}
                <div className={`absolute left-0 right-0 h-6 px-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 flex items-center justify-between ${theme.taskbarStyle === 'top' ? 'top-0 border-b border-t-0' : 'bottom-0'} ${theme.taskbarStyle === 'transparent' ? 'bg-transparent border-none' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                    <div className="flex gap-1">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-2.5 h-2.5 rounded bg-white/20" />
                      ))}
                    </div>
                  </div>
                  <div className="w-6 h-1.5 bg-white/30 rounded-full" />
                </div>

                {/* Micro Widget indicators */}
                {theme.widgets.includes('clock') && (
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded text-[6px] font-mono text-yellow-400">12:00 PM</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="p-6 pb-20">
          
          {/* TAB 1: PRESET BUNDLES */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <div>
                  <h4 className="text-base font-bold text-slate-100">One-Click Designer Presets</h4>
                  <p className="text-xs text-slate-400">Instantly transform the entire theme package to professional templates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map(p => (
                  <div 
                    key={p.id} 
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between gap-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-100 group-hover:text-indigo-400 transition-colors">{p.name}</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug truncate">{p.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <div className="flex gap-1">
                        <span className="px-1 py-0.5 rounded bg-slate-800 text-[8px] font-mono uppercase text-slate-300">{p.fontFamily}</span>
                        <span className="px-1 py-0.5 rounded bg-slate-800 text-[8px] font-mono uppercase text-slate-300">{p.windowStyle}</span>
                      </div>
                      
                      <button
                        onClick={() => applyPreset(p)}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[10px] font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95 flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5" /> APPLY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM WALLPAPERS */}
          {activeTab === 'wallpapers' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-base font-bold text-slate-100">Aesthetic Wallpapers</h4>
                  <p className="text-xs text-slate-400">Select standard high definition wallpaper backdrops.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {wallpapers.map(wp => (
                  <div 
                    key={wp.id} 
                    className={`relative h-20 rounded-lg border cursor-pointer overflow-hidden group hover:scale-102 transition-all ${theme.wallpaper === wp.value ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-800'}`}
                    onClick={() => updateTheme({ wallpaper: wp.value })}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ 
                        background: wp.value === 'default' ? '#070b19' : 
                                    wp.value === 'matrix' ? 'linear-gradient(180deg, #022c22 0%, #020617 100%)' :
                                    wp.value === 'starfield' ? 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)' :
                                    wp.value === 'neon_waves' ? 'linear-gradient(135deg, #0f172a 0%, #050510 100%)' :
                                    wp.value === 'aurora_glow' ? 'linear-gradient(135deg, #4c1d95 0%, #020617 100%)' : 
                                    (wp.value.startsWith('http') || wp.value.startsWith('/') || wp.value.includes('unsplash.com'))
                                      ? `url("${wp.value}")`
                                      : wp.value 
                      }} 
                    />
                    {wp.isLive && (
                      <span className="absolute top-1 left-1 px-1 py-0.5 bg-cyan-400 text-black text-[7px] font-black tracking-widest uppercase rounded shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-pulse z-10">
                        LIVE
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-end p-2">
                      <span className="text-[9px] font-bold text-white drop-shadow-md truncate">{wp.label}</span>
                    </div>
                    {theme.wallpaper === wp.value && (
                      <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5 shadow-lg">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UI LAYOUT, FONTS & WIDGETS */}
          {activeTab === 'ui' && (
            <div className="space-y-8">
              
              {/* ACCENT COLORS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <h4 className="text-sm font-bold text-slate-100">Accent Colors</h4>
                </div>
                <div className="flex flex-wrap gap-3 p-4 bg-slate-900/20 border border-slate-800 rounded-2xl">
                  {[
                    { id: '#8b5cf6', name: 'Violet' },
                    { id: '#3b82f6', name: 'Blue' },
                    { id: '#ef4444', name: 'Red' },
                    { id: '#10b981', name: 'Emerald' },
                    { id: '#f59e0b', name: 'Amber' },
                    { id: '#ec4899', name: 'Pink' },
                  ].map(color => (
                    <button 
                      key={color.id}
                      onClick={() => updateTheme({ accentColor: color.id })}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform flex items-center justify-center ${theme.accentColor === color.id ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color.id }}
                      title={color.name}
                    >
                      {theme.accentColor === color.id && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* WINDOW STYLES */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-bold text-slate-100">Window Styles</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { id: 'default', label: 'Default', desc: 'Dark/blurred' },
                    { id: 'glass', label: 'Aero Glass', desc: 'Acrylic blur' },
                    { id: 'flat', label: 'Flat Solid', desc: 'Matte color' },
                    { id: 'neon', label: 'Neon Glow', desc: 'Accent borders' },
                    { id: 'retro', label: 'Win 95 Retro', desc: 'Classic gray' }
                  ].map(style => (
                    <button 
                      key={style.id}
                      onClick={() => updateTheme({ windowStyle: style.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${theme.windowStyle === style.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between w-full">
                        {style.label}
                        {theme.windowStyle === style.id && <CheckCircle className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 leading-none">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TASKBAR DESIGNS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-slate-100">Taskbar Configurations</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { id: 'default', label: 'Windows (Bottom)', desc: 'Standard task list' },
                    { id: 'mac', label: 'Cupertino Dock', desc: 'Floating rounded bar' },
                    { id: 'top', label: 'Linux (Top Bar)', desc: 'Header panel layout' },
                    { id: 'transparent', label: 'Hacker Clean', desc: 'Completely invisible' }
                  ].map(style => (
                    <button 
                      key={style.id}
                      onClick={() => updateTheme({ taskbarStyle: style.id })}
                      className={`p-3 text-left rounded-xl border transition-all ${theme.taskbarStyle === style.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between w-full">
                        {style.label}
                        {theme.taskbarStyle === style.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DESKTOP APP ICONS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">Icon Theme Packs</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'default', label: 'Standard Solid', desc: 'Detailed colorful flat symbols' },
                    { id: 'neon', label: 'Cyberpunk Neon', desc: 'High brightness light-wire outlines' },
                    { id: 'minimal', label: 'Monochrome', desc: 'Pure gray simple glyph styles' },
                    { id: 'glass', label: 'Frosted Glass', desc: 'Lucent sheets and smooth gloss' }
                  ].map(style => (
                    <button 
                      key={style.id}
                      onClick={() => updateTheme({ iconTheme: style.id })}
                      className={`p-3 text-left rounded-xl border transition-all ${theme.iconTheme === style.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        {style.label}
                        {theme.iconTheme === style.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 leading-snug">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONTS & TIMERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FONTS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-100">System Typography</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/20 border border-slate-800 rounded-2xl">
                    {[
                      { id: 'sans', label: 'Inter (Sans)' },
                      { id: 'mono', label: 'Code (Mono)' },
                      { id: 'serif', label: 'Editorial (Serif)' }
                    ].map(font => (
                      <button 
                        key={font.id}
                        onClick={() => updateTheme({ fontFamily: font.id })}
                        className={`py-2 rounded-xl border text-center text-xs font-semibold transition-all ${theme.fontFamily === font.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ANIMATION VELOCITIES */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-sky-400" />
                    <h4 className="text-sm font-bold text-slate-100">Window Velocity</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'instant', label: 'Warp Speed', desc: 'No animations' },
                      { id: 'snappy', label: 'Snappy Fast', desc: 'Responsive (100ms)' },
                      { id: 'smooth', label: 'Balanced', desc: 'Fluid (180ms)' },
                      { id: 'dreamy', label: 'Slow Motion', desc: 'Cinematic (350ms)' }
                    ].map(speed => (
                      <button 
                        key={speed.id}
                        onClick={() => updateTheme({ animationSpeed: speed.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${theme.animationSpeed === speed.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                      >
                        <div className="font-bold text-[11px]">{speed.label}</div>
                        <div className="text-[9px] text-slate-500 leading-none mt-0.5">{speed.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* DESKTOP ACTIVE WIDGETS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-bold text-slate-100">Active Desktop Widgets</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'clock', label: 'Giant Digital Clock', desc: 'Displays time prominently on desktop.' },
                    { id: 'cpu', label: 'Hardware Monitor', desc: 'Live CPU and RAM graphs.' },
                    { id: 'weather', label: 'Weather Forecast', desc: 'Current temperature and conditions.' }
                  ].map(widget => (
                    <div 
                      key={widget.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-200">{widget.label}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-snug">{widget.desc}</div>
                      </div>
                      <button 
                        onClick={() => toggleWidget(widget.id)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${theme.widgets.includes(widget.id) ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                      >
                        {theme.widgets.includes(widget.id) ? 'REMOVE FROM DESKTOP' : 'PIN TO DESKTOP'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AUDIO PACKS & CURSORS */}
          {activeTab === 'sound_cursor' && (
            <div className="space-y-8">
              
              {/* SOUNDPACKS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-slate-100">System Sound Packs</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Synthesized OS Feedback</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'bubble', label: 'Bubble Click', desc: 'Liquid water drops and quick pop bursts.' },
                    { id: 'synth', label: 'Cyber Synth', desc: 'Warm ambient digital waves.' },
                    { id: 'retro', label: 'Retro 8-bit', desc: 'Nostalgic chip tune game beeps.' },
                    { id: 'muted', label: 'Silent Mode', desc: 'Mutes all system sounds.' }
                  ].map(pack => (
                    <div 
                      key={pack.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-left transition-all ${theme.soundPack === pack.id ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span className={theme.soundPack === pack.id ? 'text-indigo-300' : 'text-slate-300'}>{pack.label}</span>
                          {theme.soundPack === pack.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{pack.desc}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTheme({ soundPack: pack.id })}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${theme.soundPack === pack.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                        >
                          SELECT
                        </button>
                        {pack.id !== 'muted' && (
                          <button
                            onClick={() => testSoundPack(pack.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            title="Play sound sample"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURSORS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-slate-100">System Pointer Styles</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'default', label: 'Standard Arrow', desc: 'Traditional desktop cursor.' },
                    { id: 'crosshair', label: 'Digital Crosshair', desc: 'Precision gaming targeted reticle.' },
                    { id: 'terminal', label: 'Terminal Caret', desc: 'Hacker text beam line style.' }
                  ].map(cursor => (
                    <button
                      key={cursor.id}
                      onClick={() => updateTheme({ cursorStyle: cursor.id })}
                      className={`p-4 text-left rounded-2xl border transition-all ${theme.cursorStyle === cursor.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        {cursor.label}
                        {theme.cursorStyle === cursor.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{cursor.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: WALLPAPER STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Paintbrush className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-base font-bold text-slate-100">Interactive Wallpaper Studio</h4>
                  <p className="text-xs text-slate-400">Design your own mathematically generated abstract background gradient.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/30 p-5 rounded-2xl border border-slate-800">
                {/* STUDIO CONTROLS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Primary Color Accent</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={gradColor1} 
                        onChange={(e) => setGradColor1(e.target.value)} 
                        className="w-10 h-10 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={gradColor1} 
                        onChange={(e) => setGradColor1(e.target.value)} 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Secondary Color Accent</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={gradColor2} 
                        onChange={(e) => setGradColor2(e.target.value)} 
                        className="w-10 h-10 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={gradColor2} 
                        onChange={(e) => setGradColor2(e.target.value)} 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Base Slate Foundation</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={gradColor3} 
                        onChange={(e) => setGradColor3(e.target.value)} 
                        className="w-10 h-10 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={gradColor3} 
                        onChange={(e) => setGradColor3(e.target.value)} 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Angle ({gradAngle}°)</label>
                      <input 
                        type="range" min="0" max="360" value={gradAngle}
                        onChange={(e) => setGradAngle(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                        disabled={gradStyle !== 'linear'}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Gradient Style</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button 
                          onClick={() => setGradStyle('linear')}
                          className={`py-1 text-[10px] font-bold rounded-md ${gradStyle === 'linear' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                          Linear
                        </button>
                        <button 
                          onClick={() => setGradStyle('radial')}
                          className={`py-1 text-[10px] font-bold rounded-md ${gradStyle === 'radial' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                          Radial
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={applyCustomGradient}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-400 hover:to-fuchsia-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> GENERATE & SET AS WALLPAPER
                  </button>
                </div>

                {/* PREVIEW DISPLAY */}
                <div className="flex flex-col gap-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Wallpaper Studio Preview</div>
                  <div 
                    className="flex-1 min-h-[160px] rounded-2xl border-2 border-dashed border-slate-700 overflow-hidden relative shadow-inner"
                    style={{ 
                      background: gradStyle === 'linear' 
                        ? `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${gradColor2} 50%, ${gradColor3} 100%)`
                        : `radial-gradient(circle, ${gradColor1} 0%, ${gradColor2} 60%, ${gradColor3} 100%)`
                    }}
                  >
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs p-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="truncate max-w-[80%]">
                        {gradStyle === 'linear' 
                          ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2}, ${gradColor3})`
                          : `radial-gradient(circle, ${gradColor1}, ${gradColor2}, ${gradColor3})`
                        }
                      </span>
                      <span className="text-indigo-400 font-bold shrink-0">Studio v1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        {/* WIDGETS TAB */}
        {activeTab === 'widgets' && (
          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                  <Box className="w-8 h-8" /> Desktop Widgets
                </h2>
                <p className="text-white/70 max-w-md font-medium">Add live data blocks to your home screen. You can drag to move and resize them directly on the desktop.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableWidgets.map(widget => (
                <div 
                  key={widget.id}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 hover:border-fuchsia-500/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <widget.icon className={`w-7 h-7 ${widget.iconColor || 'text-white'}`} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1.5">{widget.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">{widget.desc}</p>
                    
                    <button 
                      onClick={() => addWidgetToDesktop(widget)}
                      className="w-full py-4 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-fuchsia-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>Add Widget</span>
                      <Box className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
