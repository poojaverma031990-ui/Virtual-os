import React, { useState, useEffect } from 'react';
import { themeStore } from '../themeStore';
import { playSound } from '../lib/sounds';
import { 
  Wifi, Bluetooth, Volume2, Mic, Moon, Sun, 
  Battery, Settings, RotateCcw, Monitor, Layout
} from 'lucide-react';

export default function ControlCenter() {
  const [theme, setTheme] = useState(themeStore.get());
  
  useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  const toggle = (key: keyof any) => {
    themeStore.set({ [key]: !(theme as any)[key] });
    playSound('click');
  };

  return (
    <div className="w-80 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Quick Toggles Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={() => toggle('wifiEnabled')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${theme.wifiEnabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <div className={`p-2 rounded-xl ${theme.wifiEnabled ? 'bg-white/20' : 'bg-slate-800'}`}>
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Wi-Fi</p>
            <p className="text-xs font-bold">{theme.wifiEnabled ? 'Connected' : 'Off'}</p>
          </div>
        </button>

        <button 
          onClick={() => toggle('bluetoothEnabled')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${theme.bluetoothEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <div className={`p-2 rounded-xl ${theme.bluetoothEnabled ? 'bg-white/20' : 'bg-slate-800'}`}>
            <Bluetooth className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">BT</p>
            <p className="text-xs font-bold">{theme.bluetoothEnabled ? 'On' : 'Off'}</p>
          </div>
        </button>

        <button 
          onClick={() => toggle('voiceEnabled')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${theme.voiceEnabled ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <div className={`p-2 rounded-xl ${theme.voiceEnabled ? 'bg-white/20' : 'bg-slate-800'}`}>
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Voice</p>
            <p className="text-xs font-bold">{theme.voiceEnabled ? 'Active' : 'Off'}</p>
          </div>
        </button>

        <button 
          onClick={() => toggle('nightLight')}
          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${theme.nightLight ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          <div className={`p-2 rounded-xl ${theme.nightLight ? 'bg-white/20' : 'bg-slate-800'}`}>
            <Moon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Night</p>
            <p className="text-xs font-bold">{theme.nightLight ? 'On' : 'Off'}</p>
          </div>
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brightness</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">{theme.brightness}%</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            value={theme.brightness}
            onChange={(e) => themeStore.set({ brightness: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Volume</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">85%</span>
          </div>
          <input 
            type="range" 
            defaultValue="85"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
            <Battery className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Power Supply</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">100% Charged</p>
          </div>
        </div>
        <button 
          onClick={() => { themeStore.reset(); playSound('success'); }}
          className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
          title="Reset System Theme"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
