import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Navigation, Layers, Wifi, WifiOff, Moon, Sun, Monitor, 
  Paintbrush, Shield, User, Sliders, Volume2, Sparkles, RefreshCcw, Laptop, Play, CheckCircle
} from 'lucide-react';
import { themeStore } from '../../themeStore';
import { playSound } from '../../lib/sounds';
// @ts-ignore
import launcherLogo from '../../assets/images/launcher_logo_1784465849925.jpg';

export function SettingsApp() {
  const [theme, setTheme] = useState(themeStore.get());
  const [activeTab, setActiveTab] = useState('display');

  useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  const updateSetting = (updates: any) => {
    themeStore.set(updates);
    playSound('click');
  };

  const tabs = [
    { id: 'display', label: 'Display & Brightness', icon: Monitor },
    { id: 'personalization', label: 'Personalization', icon: Paintbrush },
    { id: 'network', label: 'Network & Internet', icon: Wifi },
    { id: 'sound', label: 'Sound Packs', icon: Volume2 },
    { id: 'system', label: 'System Info', icon: Shield },
  ];

  return (
    <div className="h-full w-full flex bg-slate-900 text-slate-200 rounded-b-lg select-none font-sans">
      {/* Sidebar Navigation */}
      <div className="w-56 bg-black/40 border-r border-white/5 p-4 space-y-1 overflow-y-auto flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-5 px-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Settings Panel</span>
        </div>

        <div className="relative mb-4 px-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search settings..."
            className="w-full bg-slate-950/50 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        
        {tabs.map(t => (
          <button 
            key={t.id}
            onClick={() => { playSound('click'); setActiveTab(t.id); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-white/5">
          <button 
            onClick={() => { themeStore.reset(); playSound('success'); }}
            className="w-full flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-xs font-bold py-2 rounded-lg transition-all border border-red-500/10"
          >
            <RefreshCcw className="w-3 h-3" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Settings Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
        
        {/* TAB 1: DISPLAY & BRIGHTNESS */}
        {activeTab === 'display' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-bold text-white">Display & Brightness</h2>
              <p className="text-xs text-slate-400">Manage virtual panel brightness, warm filters, and typography.</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 space-y-5">
              {/* Brightness Slider */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2 text-slate-300">
                  <label className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" /> Screen Brightness
                  </label>
                  <span className="text-xs text-blue-400 font-mono font-bold">{theme.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={theme.brightness}
                  onChange={(e) => updateSetting({ brightness: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
              </div>

              {/* Night Light Switch */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-semibold text-sm text-slate-300 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" /> Night Light Filter
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Applies a cozy, warm amber tint to help reduce eye strain.</div>
                </div>
                <div 
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${theme.nightLight ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`} 
                  onClick={() => updateSetting({ nightLight: !theme.nightLight })}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${theme.nightLight ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              {/* Font Family selector */}
              <div className="pt-4 border-t border-white/5">
                <div className="font-semibold text-sm text-slate-300 mb-2">System Font Style</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sans', label: 'Inter Sans' },
                    { id: 'mono', label: 'Code Mono' },
                    { id: 'serif', label: 'Editorial' }
                  ].map(f => (
                    <button 
                      key={f.id}
                      onClick={() => updateSetting({ fontFamily: f.id })}
                      className={`py-1.5 text-xs rounded-lg font-medium border transition-all ${theme.fontFamily === f.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZATION */}
        {activeTab === 'personalization' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-bold text-white">System Personalization</h2>
              <p className="text-xs text-slate-400">Configure your OS identity, profile avatar, and desktop layouts.</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 space-y-5">
              
              {/* Identity & Profile */}
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">User Profile & Identity</span>
                <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div className="text-3xl bg-slate-800 w-14 h-14 rounded-full flex items-center justify-center border border-white/10 shadow-lg select-none">
                    {theme.avatar}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Computer Owner Name</label>
                    <input 
                      type="text" 
                      value={theme.username}
                      onChange={(e) => updateSetting({ username: e.target.value })}
                      className="w-full bg-slate-900 border border-white/5 hover:border-white/10 focus:border-blue-500 px-3 py-1.5 rounded-lg text-xs font-semibold text-white outline-none transition-colors"
                      placeholder="Username"
                    />
                  </div>
                </div>

                {/* Avatar emojis */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['🚀', '💻', '🐱', '🦊', '👾', '👑', '⚡', '🤖', '🔥', '🎨'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => updateSetting({ avatar: emoji })}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all border ${theme.avatar === emoji ? 'bg-blue-600/35 border-blue-500 scale-110 shadow-md' : 'bg-slate-900 border-white/5 hover:bg-slate-800'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* App Icon Size */}
              <div className="pt-4 border-t border-white/5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Desktop Icon Sizing</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'small', label: 'Compact' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'large', label: 'Extra Large' }
                  ].map(sz => (
                    <button 
                      key={sz.id}
                      onClick={() => updateSetting({ iconSize: sz.id })}
                      className={`py-1.5 text-xs rounded-lg font-medium border transition-all ${theme.iconSize === sz.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color selection */}
              <div className="pt-4 border-t border-white/5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Accent Highlights</span>
                <div className="flex gap-2">
                  {[
                    { id: '#8b5cf6', name: 'Purple' },
                    { id: '#3b82f6', name: 'Blue' },
                    { id: '#ef4444', name: 'Red' },
                    { id: '#10b981', name: 'Green' },
                    { id: '#f59e0b', name: 'Amber' },
                    { id: '#ec4899', name: 'Pink' },
                  ].map(c => (
                    <button 
                      key={c.id}
                      onClick={() => updateSetting({ accentColor: c.id })}
                      className={`w-7 h-7 rounded-lg border transition-all ${theme.accentColor === c.id ? 'scale-115 border-white shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.id }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK & INTERNET */}
        {activeTab === 'network' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-bold text-white">Network Status</h2>
              <p className="text-xs text-slate-400">Control system wireless toggles, offline states, and virtual VPN server.</p>
            </div>

            {theme.wifiEnabled ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                <span className="text-xs font-semibold">Virtual Network Online (100 Gbps virtual fiber link)</span>
              </div>
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0" />
                <span className="text-xs font-semibold">Offline (Wi-Fi transmitter disabled)</span>
              </div>
            )}

            <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 space-y-5">
              {/* Wi-Fi transmitter Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-300 flex items-center gap-2">
                    {theme.wifiEnabled ? <Wifi className="w-4 h-4 text-blue-400" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
                    Wi-Fi Radio
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Toggle main wireless transceiver to access virtual networks.</div>
                </div>
                <div 
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${theme.wifiEnabled ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`} 
                  onClick={() => updateSetting({ wifiEnabled: !theme.wifiEnabled })}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${theme.wifiEnabled ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              {/* Bluetooth transmitter Switch */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-semibold text-sm text-slate-300">Bluetooth Transceiver</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Toggle hardware radio for virtual wireless accessories.</div>
                </div>
                <div 
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${theme.bluetoothEnabled ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`} 
                  onClick={() => updateSetting({ bluetoothEnabled: !theme.bluetoothEnabled })}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${theme.bluetoothEnabled ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOUNDPACKS */}
        {activeTab === 'sound' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-bold text-white">System Sound Feedback</h2>
              <p className="text-xs text-slate-400">Choose from interactive retro-chiptune, modern synth, or fluid water drop soundpacks.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { id: 'bubble', label: 'Bubble Click', desc: 'Liquid water drops and quick pop bursts.' },
                { id: 'synth', label: 'Cyber Synth', desc: 'Warm ambient digital synthesized chords.' },
                { id: 'retro', label: 'Retro 8-bit', desc: 'Classic chiptune game console tones.' },
                { id: 'muted', label: 'Silent Mode', desc: 'Disables all mechanical clicking audio.' }
              ].map(pack => (
                <div 
                  key={pack.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all ${theme.soundPack === pack.id ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/20' : 'bg-slate-900 border-white/5'}`}
                >
                  <div>
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span className={theme.soundPack === pack.id ? 'text-blue-300 font-extrabold' : 'text-slate-200'}>{pack.label}</span>
                      {theme.soundPack === pack.id && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{pack.desc}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSetting({ soundPack: pack.id })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors ${theme.soundPack === pack.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                    >
                      SELECT
                    </button>
                    {pack.id !== 'muted' && (
                      <button
                        onClick={() => { playSound('success'); }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
                        title="Sample Sound Test"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM INFO */}
        {activeTab === 'system' && (
          <div className="space-y-6 max-w-lg pb-6">
            <div>
              <h2 className="text-xl font-bold text-white">About Simulator System</h2>
              <p className="text-xs text-slate-400">View processor architectures, sandbox system properties, and security configurations.</p>
            </div>

            {/* Logo and Brand Presentation */}
            <div className="bg-slate-900/50 rounded-xl border border-white/5 p-5 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                <img 
                  src={launcherLogo} 
                  alt="Virtual OS Launcher Logo" 
                  className="relative w-28 h-28 rounded-2xl object-cover border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-300" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white tracking-wide">Official Launcher Brand Logo</h3>
                <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                  A high-resolution, watermark-free custom 3D glassmorphic brand icon crafted specifically for this Virtual OS Launcher. Fully free, premium, and open-source.
                </p>
              </div>
              <a 
                href={launcherLogo} 
                download="virtual_os_launcher_logo.jpg"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
              >
                📥 Save Logo Watermark-Free (100% Free)
              </a>
            </div>

            <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden text-xs">
              <div className="p-4 border-b border-white/5 flex justify-between">
                <span className="text-slate-400">OS Virtual Engine</span>
                <span className="font-semibold text-blue-400">CyberOS Horizon v3.0 (Vibe Edition)</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between">
                <span className="text-slate-400">Core Processor VM</span>
                <span className="font-mono text-slate-200">Quantum Grid CPU Node (128 Cores)</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between">
                <span className="text-slate-400">Sandbox Memory Heap</span>
                <span className="font-mono text-slate-200">32.0 GB Allocated (Full Thread Speed)</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between">
                <span className="text-slate-400">Graphic Framework</span>
                <span className="font-semibold text-purple-400">React 18 + Tailwind v4 CSS Hardware-accelerated</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-slate-400">Vibe Debug Logs</span>
                <span className="font-bold text-emerald-400 uppercase tracking-widest animate-pulse">● System Secured</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-slate-900 hover:bg-slate-800 py-2 rounded-lg text-xs font-semibold transition-colors border border-white/5 text-slate-200" onClick={() => alert("Simulating system check...\nOS and all microservices are fully optimized and up-to-date!")}>Check OS Updates</button>
              <button className="flex-1 bg-slate-900 hover:bg-red-500/15 hover:text-red-400 py-2 rounded-lg text-xs font-semibold transition-colors border border-white/5 text-slate-400" onClick={() => { if (confirm("Restore system default parameters? Your personalization profiles will be cleared.")) { themeStore.reset(); playSound('success'); } }}>Restore System Default</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function MapsApp() {
  const [searchVal, setSearchVal] = useState('');
  const [query, setQuery] = useState('San Francisco');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCoords({ lat, lon });
          setQuery(`${lat},${lon}`);
        },
        (err) => {
          console.warn("Maps geolocation failed:", err);
        }
      );
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setQuery(searchVal.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (userCoords) {
      setQuery(`${userCoords.lat},${userCoords.lon}`);
      setSearchVal('');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCoords({ lat, lon });
          setQuery(`${lat},${lon}`);
          setSearchVal('');
        },
        (err) => {
          alert("Could not access your physical location. Check your browser permissions.");
        }
      );
    }
  };

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col rounded-b-lg overflow-hidden relative text-slate-100 font-sans">
      <form onSubmit={handleSearch} className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="flex-1 bg-slate-950/90 backdrop-blur-md rounded-xl shadow-xl flex items-center px-4 h-12 border border-white/10">
          <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search address, city, or coordinate..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-500"
          />
        </div>
        <button 
          type="button"
          onClick={handleCurrentLocation}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xl flex items-center justify-center transition-all border border-blue-500/30 shrink-0"
          title="Zoom to Current Location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 bg-[#1e293b] relative">
        <iframe
          title="Real-time map view"
          src={embedUrl}
          className="w-full h-full border-0 grayscale invert brightness-90 contrast-125"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
