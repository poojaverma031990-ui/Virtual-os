import { AppId } from '../types';
import React, { ElementType, useState, useEffect } from 'react';
import { themeStore } from '../themeStore';
import { playSound, speakText } from '../lib/sounds';
import Clock from './Clock';
import ControlCenter from './ControlCenter';
import { 
  Sparkles, Mic, MicOff, Volume2, Gamepad2, Compass,
  Search, Pin, Home, Settings2, Sliders
} from 'lucide-react';

interface TaskbarProps {
  apps: readonly { id: AppId; title: string; icon: ElementType }[];
  allApps: readonly { id: AppId; title: string; icon: ElementType }[];
  openApps: AppId[];
  activeApp: AppId | null;
  onAppClick: (id: AppId) => void;
  themeStyle?: 'default' | 'mac' | 'top' | 'transparent';
  installedAppIds: AppId[];
  taskbarAppIds: AppId[];
  onToggleDesktopPin: (id: AppId) => void;
  onToggleTaskbarPin: (id: AppId) => void;
}

export default function Taskbar({ 
  apps, 
  allApps,
  openApps, 
  activeApp, 
  onAppClick, 
  themeStyle = 'default',
  installedAppIds,
  taskbarAppIds,
  onToggleDesktopPin,
  onToggleTaskbarPin
}: TaskbarProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(themeStore.get());

  useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  // Close Menus on clicking anywhere on the screen
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsStartOpen(false);
      setIsControlOpen(false);
    };
    if (isStartOpen || isControlOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isStartOpen, isControlOpen]);

  const toggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVoice = !theme.voiceEnabled;
    themeStore.set({ voiceEnabled: nextVoice });
    playSound('click');
    if (nextVoice) {
      setTimeout(() => speakText("Voice narration enabled"), 150);
    }
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setIsStartOpen(!isStartOpen);
    setIsControlOpen(false);
  };

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setIsControlOpen(!isControlOpen);
    setIsStartOpen(false);
  };

  return (
    <div className={`relative flex items-center justify-between px-3 z-[100] transition-all duration-300 ${
      themeStyle === 'mac' ? 'h-16 bg-slate-900/40 backdrop-blur-3xl mx-auto rounded-3xl mb-4 border border-white/20 shadow-2xl max-w-4xl' : 
      themeStyle === 'transparent' ? 'h-14 bg-transparent border-t border-transparent hover:bg-black/20' :
      'h-14 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/50'
    }`}>
      
      {/* START POPUP MENU */}
      {isStartOpen && (
        <div 
          className="absolute bottom-16 left-3 w-80 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200 z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-white">Vibe-Computer</h3>
              <p className="text-[10px] text-fuchsia-400 font-black font-mono">CORE OS v2.5</p>
            </div>
          </div>

          {/* Voice Guidance Toggle */}
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme.voiceEnabled ? (
                  <Mic className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-xs font-extrabold text-white">Voice Guidance</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextVoice = !theme.voiceEnabled;
                  themeStore.set({ voiceEnabled: nextVoice });
                  playSound('click');
                  if (nextVoice) {
                    setTimeout(() => speakText("Voice narration enabled"), 150);
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${theme.voiceEnabled ? 'bg-fuchsia-600' : 'bg-slate-800'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${theme.voiceEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Turn on Voice to read out app launches, screen updates, and gaming score celebrations in real time!
            </p>
          </div>

          {/* Sound Pack Mode */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">Sound Pack Mode</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['bubble', 'synth', 'retro', 'muted'] as const).map((pack) => (
                <button
                  key={pack}
                  onClick={() => {
                    themeStore.set({ soundPack: pack });
                    playSound('success');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all border ${theme.soundPack === pack ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/40' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'}`}
                >
                  {pack}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH & CUSTOMIZE APPS SECTION */}
          <div className="space-y-2.5 border-t border-slate-800/60 pt-3 flex flex-col min-h-0">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1">
              Customizer Panel ({allApps.length} Apps)
            </span>

            {/* Simple Elegant Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search and change apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              />
            </div>

            {/* Scrollable App Customization List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {allApps
                .filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((app) => {
                  const isDesktopPinned = installedAppIds.includes(app.id);
                  const isTaskbarPinned = taskbarAppIds.includes(app.id);
                  
                  return (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 transition-all gap-2"
                    >
                      {/* App Launch Click Target */}
                      <button 
                        onClick={() => { playSound('click'); onAppClick(app.id); setIsStartOpen(false); }}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                          <app.icon className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-fuchsia-400">
                          {app.title}
                        </span>
                      </button>

                      {/* Customizer Toggles (Pin Desktop & Pin Taskbar) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Home Screen Icon */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleDesktopPin(app.id); }}
                          className={`p-1.5 rounded-lg border transition-all ${isDesktopPinned ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-slate-950/50 border-slate-900 text-slate-600 hover:text-slate-400'}`}
                          title={isDesktopPinned ? "Remove from Home Screen" : "Add to Home Screen"}
                        >
                          <Home className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Taskbar Icon */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleTaskbarPin(app.id); }}
                          className={`p-1.5 rounded-lg border transition-all ${isTaskbarPinned ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-950/50 border-slate-900 text-slate-600 hover:text-slate-400'}`}
                          title={isTaskbarPinned ? "Unpin from Taskbar" : "Pin to Taskbar"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 h-full py-1.5">
        {/* Start Button Area (Low Logo!) */}
        <button 
          onClick={handleStartClick}
          className="h-full px-4 flex items-center justify-center rounded-lg hover:bg-slate-800/80 transition-all active:scale-95 group"
          title="Open Start Menu"
        >
          <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-fuchsia-500 to-indigo-600 group-hover:shadow-[0_0_12px_rgba(217,70,239,0.75)] transition-shadow" />
        </button>

        {/* Quick Voice Toggle (Low Logo Home Screen option!) */}
        <button
          onClick={toggleVoice}
          className={`h-full px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-[10px] font-black tracking-wider ${
            theme.voiceEnabled 
              ? 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/25 shadow-[0_0_8px_rgba(217,70,239,0.3)]' 
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
          title={theme.voiceEnabled ? "Mute Voice Guide" : "Enable Voice Guide"}
        >
          {theme.voiceEnabled ? (
            <Mic className="w-3.5 h-3.5 animate-pulse text-fuchsia-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden sm:inline">VOICE</span>
        </button>
        
        <div className="w-px h-7 bg-slate-700/50 mx-1" />

        {/* Pinned/Open Apps */}
        {apps.map((app) => {
          const isOpen = openApps.includes(app.id);
          const isActive = activeApp === app.id;
          
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className={`h-full px-4 flex items-center justify-center rounded-lg transition-all relative group ${
                isActive ? 'bg-slate-800/90' : 'hover:bg-slate-800/50'
              }`}
              title={app.title}
            >
              <app.icon className={`w-5 h-5 transition-colors ${
                isActive ? 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]' : 
                isOpen ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'
              }`} />
              
              {isOpen && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-t-full transition-colors ${
                  isActive ? 'bg-fuchsia-400' : 'bg-slate-500 group-hover:bg-slate-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center h-full gap-2 px-2 py-1.5 relative">
        {isControlOpen && (
          <div 
            className="absolute bottom-16 right-0 z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <ControlCenter />
          </div>
        )}

        {/* Quick Settings Toggle */}
        <button
          onClick={handleControlClick}
          className={`h-full px-2.5 rounded-lg border flex items-center justify-center transition-all ${
            isControlOpen 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/25 shadow-[0_0_10px_rgba(59,130,246,0.25)]' 
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Quick Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
        
        <Clock />
      </div>
    </div>
  );
}
