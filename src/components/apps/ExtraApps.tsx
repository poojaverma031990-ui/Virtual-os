import React, { useState, useEffect, useRef } from 'react';
import { Skull, Flag, Clock, RefreshCw, Zap, Volume2 } from 'lucide-react';

export function MemoryGameApp() {
  const [cards, setCards] = useState<{id: number, emoji: string, flipped: boolean, matched: boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const emojis = ['🚀', '👽', '👾', '🤖', '👻', '💀', '🎃', '😈'];

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length >= 2 || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const match = newCards[newFlipped[0]].emoji === newCards[newFlipped[1]].emoji;
      
      setTimeout(() => {
        const resetCards = [...newCards];
        if (match) {
          resetCards[newFlipped[0]].matched = true;
          resetCards[newFlipped[1]].matched = true;
        } else {
          resetCards[newFlipped[0]].flipped = false;
          resetCards[newFlipped[1]].flipped = false;
        }
        setCards(resetCards);
        setFlipped([]);
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full bg-indigo-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="flex justify-between w-full max-w-sm mb-6 text-white text-xl font-bold">
        <div>MOVES: {moves}</div>
        <button onClick={initGame} className="flex items-center gap-2 hover:text-indigo-300">
          <RefreshCw className="w-5 h-5" /> RESTART
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
        {cards.map((card, i) => (
          <div 
            key={card.id}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 transform perspective-1000 ${
              card.flipped || card.matched ? 'bg-indigo-600 rotate-y-180' : 'bg-indigo-800 hover:bg-indigo-700'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <span className={`transition-opacity duration-300 ${card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </span>
          </div>
        ))}
      </div>
      {cards.length > 0 && cards.every(c => c.matched) && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
          <h2 className="text-4xl font-black text-yellow-400 mb-4 animate-bounce">YOU WIN!</h2>
          <p className="text-xl mb-8">Completed in {moves} moves</p>
          <button onClick={initGame} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-lg">
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

export function HackerTyperApp() {
  const [text, setText] = useState('');
  const codeString = `
function bypassSecurity() {
  console.log("Accessing mainframe...");
  const enc = new Encryption("AES-256-CBC");
  enc.crack(target.ip);
  if (enc.isHacked()) {
    sys.download_all_data();
  }
}

class Rootkit {
  constructor() {
    this.stealth = true;
  }
  install() {
    kernel.inject(this);
  }
}

// ACCESS GRANTED
// DOWNLOADING CLASSIFIED FILES...
`;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    setText(prev => {
      const nextLength = prev.length + 3 + Math.floor(Math.random() * 5);
      return codeString.slice(0, nextLength % codeString.length);
    });
  };

  return (
    <div 
      className="h-full w-full bg-black text-green-500 font-mono p-4 overflow-y-auto outline-none whitespace-pre-wrap break-all cursor-text"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      autoFocus
    >
      <div className="text-red-500 mb-4">{'>> PRESS ANY KEY TO HACK <<'}</div>
      {text}
      <span className="w-2 h-4 bg-green-500 inline-block animate-pulse ml-1" />
    </div>
  );
}

export function MetronomeApp() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef(0);
  const currentBeat = useRef(0);
  const timerID = useRef<number | null>(null);

  const scheduleNote = (beatNumber: number, time: number) => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    if (beatNumber % 4 === 0) {
      osc.frequency.value = 880;
    } else {
      osc.frequency.value = 440;
    }
    
    gain.gain.value = 1;
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.start(time);
    osc.stop(time + 0.1);
  };

  const scheduler = () => {
    if (!audioCtx.current) return;
    while (nextNoteTime.current < audioCtx.current.currentTime + 0.1) {
      scheduleNote(currentBeat.current, nextNoteTime.current);
      nextNoteTime.current += 60.0 / bpm;
      currentBeat.current = (currentBeat.current + 1) % 4;
    }
    timerID.current = window.setTimeout(scheduler, 25);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (timerID.current) clearTimeout(timerID.current);
      setIsPlaying(false);
    } else {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
      nextNoteTime.current = audioCtx.current.currentTime + 0.05;
      currentBeat.current = 0;
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
    <div className="h-full w-full bg-zinc-900 flex flex-col items-center justify-center text-white select-none">
      <div className="text-6xl font-black mb-8 text-fuchsia-500 font-mono tracking-tighter">
        {bpm} <span className="text-xl text-zinc-500">BPM</span>
      </div>
      <input 
        type="range" 
        min="40" 
        max="220" 
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-64 accent-fuchsia-500 mb-12"
      />
      <button 
        onClick={togglePlay}
        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isPlaying 
            ? 'bg-red-500 shadow-red-500/50 hover:bg-red-400' 
            : 'bg-fuchsia-600 shadow-fuchsia-600/50 hover:bg-fuchsia-500'
        }`}
      >
        <Volume2 className="w-12 h-12" />
      </button>
    </div>
  );
}

export function BreathingApp() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else {
            setPhase('Inhale');
            return 4;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, phase]);

  return (
    <div className="h-full w-full bg-teal-950 flex flex-col items-center justify-center overflow-hidden">
      <div className={`relative flex items-center justify-center w-64 h-64 rounded-full border-4 border-teal-800/30 transition-all duration-1000 ${
        !isActive ? 'scale-100' : phase === 'Inhale' ? 'scale-125 bg-teal-600/20' : phase === 'Exhale' ? 'scale-75 bg-teal-900/50' : 'scale-125 bg-teal-500/30'
      }`}>
        <div className="text-center absolute z-10">
          <div className="text-2xl font-light text-teal-100 uppercase tracking-widest">{!isActive ? 'Ready' : phase}</div>
          {isActive && <div className="text-5xl font-bold text-white mt-2 font-mono">{seconds}</div>}
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-teal-400 opacity-20 animate-ping" style={{ animationDuration: '4s' }} />
      </div>
      <button 
        onClick={() => { setIsActive(!isActive); setPhase('Inhale'); setSeconds(4); }}
        className="mt-16 px-8 py-3 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-bold tracking-widest transition-colors shadow-lg shadow-teal-900"
      >
        {isActive ? 'STOP' : 'START'}
      </button>
    </div>
  );
}

import { Newspaper, ExternalLink, MapPin } from 'lucide-react';

export function NewsFlowApp() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return localStorage.getItem('news_selected_category_v1') || 'World';
  });
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [newsCity, setNewsCity] = useState(() => {
    return localStorage.getItem('news_custom_city_v1') || '';
  });
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const fetchNews = async (category = activeCategory, currentCoords = coords, city = newsCity) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/news?category=${category}`;
      if (category === 'Local') {
        if (city) {
          url += `&city=${encodeURIComponent(city)}`;
        } else if (currentCoords) {
          url += `&lat=${currentCoords.lat}&lon=${currentCoords.lon}`;
        }
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Feed disconnected");
      const items = await response.json();
      setNews(items.map((it: any, idx: number) => ({ ...it, id: idx, category: category })));
    } catch (e) {
      console.error(e);
      setError("Failed to synchronize with news servers. Please check your connection.");
      setNews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(activeCategory, coords, newsCity);

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchNews(activeCategory, coords, newsCity);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeCategory, coords, newsCity]);

  useEffect(() => {
    if (navigator.geolocation && !newsCity) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setCoords(newCoords);
          if (!localStorage.getItem('news_selected_category_v1')) {
            setActiveCategory('Local');
          }
        },
        (err) => {
          console.warn('Geolocation failed or denied:', err);
        }
      );
    }
  }, [newsCity]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    localStorage.setItem('news_selected_category_v1', cat);
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    const val = cityInput.trim();
    setNewsCity(val);
    localStorage.setItem('news_custom_city_v1', val);
    setIsEditingCity(false);
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-900">
      <div className="p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Live Connection</span>
            </div>
            <h1 className="text-3xl font-serif italic text-slate-950">Daily Flow</h1>
          </div>
          <button 
            onClick={() => fetchNews(activeCategory, coords, newsCity)} 
            disabled={loading}
            className="p-2.5 hover:bg-slate-100 rounded-full transition-all active:rotate-180 duration-500 disabled:opacity-30"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Local', 'World', 'Tech', 'Finance', 'Science', 'AI'].map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <span 
                key={cat} 
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </span>
            );
          })}
        </div>

        {/* Custom Location Row for Local Category */}
        {activeCategory === 'Local' && (
          <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs">
            {isEditingCity ? (
              <form onSubmit={handleSaveCity} className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Enter city (e.g. New Delhi, London)..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500 font-bold"
                  autoFocus
                />
                <button type="submit" className="bg-slate-950 text-white rounded-lg px-3 py-1 font-bold hover:bg-slate-800 transition-colors">Save</button>
                <button type="button" onClick={() => setIsEditingCity(false)} className="text-slate-500 font-bold hover:bg-slate-100 rounded-lg px-2 py-1">Cancel</button>
              </form>
            ) : (
              <>
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  📍 Regional News: <strong className="text-slate-900 font-bold">{newsCity || (coords ? 'GPS coordinates active' : 'Not configured')}</strong>
                </span>
                <button 
                  onClick={() => { setCityInput(newsCity); setIsEditingCity(true); }}
                  className="text-blue-600 font-black uppercase tracking-wider text-[10px] hover:underline"
                >
                  Edit Location
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-8 custom-scrollbar">
        {activeCategory === 'Local' && !coords && !newsCity && !isEditingCity ? (
          <div className="py-16 text-center px-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-blue-500 opacity-40" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 font-serif">Setup Regional Feed</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">
              Geolocation request was blocked or not configured. To view local news, configure a custom location city.
            </p>
            <button 
              onClick={() => { setCityInput(''); setIsEditingCity(true); }}
              className="px-6 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all rounded-full shadow-md active:scale-95"
            >
              Set Location City
            </button>
          </div>
        ) : loading && news.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Syncing Intel...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center px-12">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-red-500 opacity-20" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Sync Interrupted</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-8">{error}</p>
            <button 
              onClick={() => fetchNews(activeCategory, coords)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          news.map(item => (
            <div 
              key={item.id} 
              onClick={() => item.link && item.link !== '#' && window.open(item.link, '_blank')}
              className="group cursor-pointer border-b border-slate-100 pb-8 last:border-none"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-tighter rounded-lg">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {item.source} &bull; {item.time}
                </span>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3">
                {item.title}
              </h3>
              {item.desc && (
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {item.desc}
                </p>
              )}
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                Full Coverage <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
