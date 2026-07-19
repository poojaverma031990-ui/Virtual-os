import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Mic, Square, Circle, ChevronLeft, ChevronRight, BookOpen, BarChart3, TrendingUp, TrendingDown, Maximize2, Terminal, RotateCcw } from 'lucide-react';
import { playSound, speakText } from '../../lib/sounds';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export function VideoPlayerApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative select-none">
      <div className="absolute top-4 right-4 z-10 bg-black/50 px-3 py-1 rounded-full text-xs text-white/50 backdrop-blur-md">1080p HD</div>
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden bg-slate-900">
        {/* Fake video content */}
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-900/40 to-blue-900/40 mix-blend-overlay" />
        <div className={`w-32 h-32 rounded-full border-[8px] border-white/20 border-t-white/80 animate-spin ${isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`} style={{ animationDuration: '3s' }} />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <button onClick={() => setIsPlaying(true)} className="bg-fuchsia-600/80 hover:bg-fuchsia-500 rounded-full p-6 text-white transition-transform hover:scale-110 shadow-[0_0_30px_rgba(217,70,239,0.5)]">
            <Play className="w-12 h-12 ml-2" />
          </button>
        </div>
      </div>
      
      <div className="w-full bg-slate-900 border-t border-white/10 p-4">
        <div className="w-full h-2 bg-slate-800 rounded-full mb-4 cursor-pointer overflow-hidden relative" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const p = ((e.clientX - rect.left) / rect.width) * 100;
          setProgress(p);
        }}>
          <div className="h-full bg-fuchsia-500 relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button className="hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
            <div className="text-xs font-mono opacity-60">01:23 / 04:56</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><Maximize2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VoiceRecorderApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(30).fill(10));
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTime(t => t + 1);
        setBars(prev => {
          const newBars = [...prev.slice(1), Math.random() * 80 + 10];
          return newBars;
        });
      }, 100);
    } else {
      setBars(Array(30).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 10);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col p-8 items-center relative select-none">
      <div className="text-4xl font-mono text-slate-200 mb-12 tracking-widest bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
        {formatTime(time)}
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center gap-1 mb-12 h-32">
        {bars.map((height, i) => (
          <div key={i} className="w-2 bg-gradient-to-t from-blue-500 to-fuchsia-500 rounded-full transition-all duration-75" style={{ height: `${height}%` }} />
        ))}
      </div>
      
      <button 
        onClick={() => setIsRecording(!isRecording)}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isRecording 
            ? 'bg-slate-800 border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' 
            : 'bg-red-500 hover:bg-red-400 hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
        }`}
      >
        {isRecording ? <Square className="w-8 h-8 text-red-500 fill-red-500" /> : <Mic className="w-10 h-10 text-white" />}
      </button>
      
      <div className="mt-6 text-sm text-slate-400 font-medium tracking-wide">
        {isRecording ? 'RECORDING IN PROGRESS' : 'TAP TO RECORD'}
      </div>
    </div>
  );
}

export function Cube3DApp() {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setRotation(r => ({ x: r.x - dy * 0.5, y: r.y + dx * 0.5 }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="h-full w-full bg-slate-950 flex flex-col overflow-hidden items-center justify-center relative touch-none select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute top-4 left-4 text-xs text-fuchsia-400 font-mono">DRAG TO ROTATE</div>
      
      <div style={{ perspective: '1000px' }} className="w-64 h-64">
        <div 
          className="w-full h-full relative" 
          style={{ 
            transformStyle: 'preserve-3d', 
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.5s ease-out'
          }}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-blue-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'translateZ(128px)' }}>1</div>
          {/* Back */}
          <div className="absolute inset-0 bg-fuchsia-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'rotateY(180deg) translateZ(128px)' }}>2</div>
          {/* Right */}
          <div className="absolute inset-0 bg-emerald-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'rotateY(90deg) translateZ(128px)' }}>3</div>
          {/* Left */}
          <div className="absolute inset-0 bg-yellow-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'rotateY(-90deg) translateZ(128px)' }}>4</div>
          {/* Top */}
          <div className="absolute inset-0 bg-red-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'rotateX(90deg) translateZ(128px)' }}>5</div>
          {/* Bottom */}
          <div className="absolute inset-0 bg-indigo-500/80 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white" style={{ transform: 'rotateX(-90deg) translateZ(128px)' }}>6</div>
        </div>
      </div>
    </div>
  );
}

export function StockMarketApp() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch stock data');
      setStocks(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Market connection interrupted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // 30s is more reasonable
    return () => clearInterval(interval);
  }, []);

  if (loading && stocks.length === 0) {
    return (
      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-emerald-400 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Connecting to Global Exchanges...</span>
      </div>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
          <TrendingDown className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Exchange Offline</h3>
        <p className="text-slate-400 text-sm max-w-xs mb-6">{error}</p>
        <button 
          onClick={fetchStocks}
          className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 text-white"
        >
          <RotateCcw className="w-4 h-4" /> Refresh Market
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col p-8 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">Market Watch</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Global Exchanges</p>
          </div>
        </div>
        <button onClick={fetchStocks} className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock, i) => {
          const isUp = stock.c.startsWith('+');
          return (
            <motion.div 
              key={stock.s} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{stock.s}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Asset</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono font-bold text-slate-200">${stock.p}</div>
                <div className={`text-xs font-black flex items-center justify-end gap-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stock.c}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-12 bg-emerald-500/5 p-8 rounded-3xl border border-dashed border-emerald-500/20 text-center">
        <BarChart3 className="w-10 h-10 mx-auto mb-4 text-emerald-500/40" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time analysis powered by Gemini Intelligence</p>
      </div>
    </div>
  );
}

export function MarkdownEditorApp() {
  const [content, setContent] = useState('# Hello World\n\nWelcome to the virtual markdown editor.\n\n- Write notes\n- Make lists\n- **Bold text**\n\n> This is a blockquote');
  
  return (
    <div className="h-full w-full flex bg-slate-900 text-slate-200 font-sans">
      <div className="flex-1 border-r border-slate-700 flex flex-col">
        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">Editor</div>
        <textarea 
          className="flex-1 w-full bg-transparent p-4 resize-none outline-none font-mono text-sm leading-relaxed"
          value={content}
          onChange={e => setContent(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</div>
        <div className="p-6 prose prose-invert prose-sm max-w-none">
          <div className="markdown-body">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SystemInfoApp() {
  return (
    <div className="h-full w-full bg-black text-green-500 font-mono p-6 overflow-y-auto selection:bg-green-900 selection:text-green-100">
      <h2 className="text-2xl font-bold mb-6 border-b border-green-900 pb-2 flex items-center gap-2">
        <Terminal className="w-6 h-6" /> SYSTEM_DIAGNOSTICS
      </h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-green-400 font-semibold mb-2">++ HARDWARE INFO ++</h3>
          <div className="grid grid-cols-2 gap-2 text-sm pl-4">
            <span className="text-green-600">PROCESSOR:</span> <span>Virtual Core i9-9900X (32 Threads)</span>
            <span className="text-green-600">BASE CLOCK:</span> <span>4.80 GHz</span>
            <span className="text-green-600">MEMORY (RAM):</span> <span>128 GB DDR5 6400MHz</span>
            <span className="text-green-600">GPU:</span> <span>Virtual RTX 5090 Ti 32GB VRAM</span>
            <span className="text-green-600">STORAGE:</span> <span>4TB NVMe SSD (Gen 5)</span>
          </div>
        </section>

        <section>
          <h3 className="text-green-400 font-semibold mb-2">++ OS INFO ++</h3>
          <div className="grid grid-cols-2 gap-2 text-sm pl-4">
            <span className="text-green-600">KERNEL:</span> <span>vOS 10.4.2 (Zephyr)</span>
            <span className="text-green-600">UPTIME:</span> <span>14d 2h 45m</span>
            <span className="text-green-600">ARCHITECTURE:</span> <span>64-bit Virtualized</span>
            <span className="text-green-600">PROCESSES:</span> <span>342 (Running)</span>
          </div>
        </section>
        
        <section>
          <h3 className="text-green-400 font-semibold mb-2">++ NETWORK ++</h3>
          <div className="grid grid-cols-2 gap-2 text-sm pl-4">
            <span className="text-green-600">STATUS:</span> <span className="animate-pulse">ONLINE</span>
            <span className="text-green-600">IP ADDRESS:</span> <span>192.168.1.144</span>
            <span className="text-green-600">MAC ADDRESS:</span> <span>00:1B:44:11:3A:B7</span>
            <span className="text-green-600">BANDWIDTH:</span> <span>10 Gbps</span>
          </div>
        </section>
      </div>
      <div className="mt-8 text-xs text-green-800 animate-pulse">
        Waiting for further commands..._
      </div>
    </div>
  );
}

export function PianoApp() {
  const [octave, setOctave] = useState(4);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [adsr, setAdsr] = useState({ attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.8 });
  const [volume, setVolume] = useState(0.4);
  const [showLabels, setShowLabels] = useState(true);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [lfoEnabled, setLfoEnabled] = useState(false);
  const [lfoRate, setLfoRate] = useState(6);
  const [lfoDepth, setLfoDepth] = useState(15);

  // Advanced Demo & Jam Recorder States
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const demoTimeoutRefs = React.useRef<any[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedSequence, setRecordedSequence] = useState<{ note: string; freq: number; time: number; type: 'start' | 'end' }[]>([]);
  const recordStartTime = React.useRef<number>(0);
  const [playbackActive, setPlaybackActive] = useState(false);
  const playbackTimeouts = React.useRef<any[]>([]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const masterGainRef = React.useRef<GainNode | null>(null);
  const activeNodesRef = React.useRef<Record<string, { osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode; lfoGain?: GainNode }>>({});
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = React.useRef<number | null>(null);

  const isRecordingRef = React.useRef(isRecording);
  React.useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const keys = [
    { note: 'C', type: 'white', freq: 261.63, keyBind: 'a', label: 'A' },
    { note: 'C#', type: 'black', freq: 277.18, keyBind: 'w', label: 'W' },
    { note: 'D', type: 'white', freq: 293.66, keyBind: 's', label: 'S' },
    { note: 'D#', type: 'black', freq: 311.13, keyBind: 'e', label: 'E' },
    { note: 'E', type: 'white', freq: 329.63, keyBind: 'd', label: 'D' },
    { note: 'F', type: 'white', freq: 349.23, keyBind: 'f', label: 'F' },
    { note: 'F#', type: 'black', freq: 369.99, keyBind: 't', label: 'T' },
    { note: 'G', type: 'white', freq: 392.00, keyBind: 'g', label: 'G' },
    { note: 'G#', type: 'black', freq: 415.30, keyBind: 'y', label: 'Y' },
    { note: 'A', type: 'white', freq: 440.00, keyBind: 'h', label: 'H' },
    { note: 'A#', type: 'black', freq: 466.16, keyBind: 'u', label: 'U' },
    { note: 'B', type: 'white', freq: 493.88, keyBind: 'j', label: 'J' },
    { note: 'C+', type: 'white', freq: 523.25, keyBind: 'k', label: 'K' },
    { note: 'C#+', type: 'black', freq: 554.37, keyBind: 'o', label: 'O' },
    { note: 'D+', type: 'white', freq: 587.33, keyBind: 'l', label: 'L' },
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      
      analyser.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      masterGainRef.current = masterGain;

      startVisualizer();
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      // create a beautiful cyber blue/violet neon line
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f43f5e'); // rose
      gradient.addColorStop(0.5, '#a855f7'); // purple
      gradient.addColorStop(1, '#06b6d4'); // cyan
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw active key labels or indicator circles
      const activeCount = Object.values(activeKeys).filter(Boolean).length;
      if (activeCount > 0) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40 + activeCount * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    draw();
  };

  const triggerNoteStart = (noteId: string, baseFreq: number) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    // Avoid duplicate triggers
    if (activeNodesRef.current[noteId]) return;

    // Shift pitch relative to Octave 4
    const pitchMultiplier = Math.pow(2, octave - 4);
    const targetFreq = baseFreq * pitchMultiplier;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

    // Apply ADSR Envelope
    const now = ctx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.8, now + adsr.attack);
    noteGain.gain.exponentialRampToValueAtTime(adsr.sustain, now + adsr.attack + adsr.decay);

    let lfo: OscillatorNode | undefined;
    let lfoGain: GainNode | undefined;

    if (lfoEnabled) {
      lfo = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
    }

    osc.connect(noteGain);
    noteGain.connect(analyser);
    osc.start();

    activeNodesRef.current[noteId] = { osc, gain: noteGain, lfo, lfoGain };
    setActiveKeys(prev => ({ ...prev, [noteId]: true }));

    // Record note start event
    if (isRecordingRef.current) {
      setRecordedSequence(prev => [...prev, {
        note: noteId,
        freq: baseFreq,
        time: Date.now() - recordStartTime.current,
        type: 'start'
      }]);
    }
  };

  const triggerNoteEnd = (noteId: string) => {
    const ctx = audioCtxRef.current;
    const node = activeNodesRef.current[noteId];
    if (!ctx || !node) return;

    const now = ctx.currentTime;
    node.gain.gain.cancelScheduledValues(now);
    node.gain.gain.setValueAtTime(node.gain.gain.value, now);
    node.gain.gain.exponentialRampToValueAtTime(0.0001, now + adsr.release);

    setTimeout(() => {
      try {
        node.osc.stop();
        node.osc.disconnect();
        node.gain.disconnect();
        if (node.lfo) {
          node.lfo.stop();
          node.lfo.disconnect();
        }
        if (node.lfoGain) {
          node.lfoGain.disconnect();
        }
      } catch (e) {
        // Safe disposal
      }
    }, adsr.release * 1000 + 100);

    delete activeNodesRef.current[noteId];
    setActiveKeys(prev => ({ ...prev, [noteId]: false }));

    // Record note end event
    if (isRecordingRef.current) {
      setRecordedSequence(prev => [...prev, {
        note: noteId,
        freq: 0,
        time: Date.now() - recordStartTime.current,
        type: 'end'
      }]);
    }
  };

  // Jam Recording & Playback Controller handlers
  const startRecording = () => {
    setRecordedSequence([]);
    recordStartTime.current = Date.now();
    setIsRecording(true);
    speakText("Recording. Start jamming!");
  };

  const stopRecording = () => {
    setIsRecording(false);
    speakText("Recording saved!");
  };

  const playRecording = () => {
    if (recordedSequence.length === 0) {
      speakText("No recorded notes. Try jamming first.");
      return;
    }
    initAudio();
    setPlaybackActive(true);
    speakText("Playing your recorded synth track.");

    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];

    recordedSequence.forEach(item => {
      const t = setTimeout(() => {
        if (item.type === 'start') {
          triggerNoteStart(item.note, item.freq);
        } else {
          triggerNoteEnd(item.note);
        }
      }, item.time) as any;
      playbackTimeouts.current.push(t);
    });

    const lastEvent = recordedSequence[recordedSequence.length - 1];
    const duration = lastEvent ? lastEvent.time : 0;
    const tEnd = setTimeout(() => {
      setPlaybackActive(false);
    }, duration + 200) as any;
    playbackTimeouts.current.push(tEnd);
  };

  const stopPlayback = () => {
    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];
    setPlaybackActive(false);
    Object.keys(activeNodesRef.current).forEach(id => {
      triggerNoteEnd(id);
    });
    speakText("Playback stopped.");
  };

  // Pre-programmed vintage synthesizer demo tracks
  const stopDemo = () => {
    demoTimeoutRefs.current.forEach(t => clearTimeout(t));
    demoTimeoutRefs.current = [];
    setIsPlayingDemo(false);
    Object.keys(activeNodesRef.current).forEach(id => {
      triggerNoteEnd(id);
    });
  };

  const playDemoSong = (songName: 'ode' | 'twinkle' | 'mario') => {
    stopDemo();
    initAudio();
    setIsPlayingDemo(true);
    speakText(`Playing retro demonstration song.`);

    const songNotes: { note: string, freq: number, delay: number, duration: number }[] = [];
    
    if (songName === 'ode') {
      const notes = [
        { note: 'E', f: 329.63, d: 350 }, { note: 'E', f: 329.63, d: 350 }, { note: 'F', f: 349.23, d: 350 }, { note: 'G', f: 392.00, d: 350 },
        { note: 'G', f: 392.00, d: 350 }, { note: 'F', f: 349.23, d: 350 }, { note: 'D', f: 293.66, d: 350 }, { note: 'C', f: 261.63, d: 350 },
        { note: 'C', f: 261.63, d: 350 }, { note: 'D', f: 293.66, d: 350 }, { note: 'E', f: 329.63, d: 350 }, { note: 'E', f: 329.63, d: 450 },
        { note: 'D', f: 293.66, d: 150 }, { note: 'D', f: 293.66, d: 550 }
      ];
      let accumulatedDelay = 0;
      notes.forEach((item) => {
        songNotes.push({ note: item.note, freq: item.f, delay: accumulatedDelay, duration: item.d - 40 });
        accumulatedDelay += item.d;
      });
    } else if (songName === 'twinkle') {
      const notes = [
        { note: 'C', f: 261.63, d: 350 }, { note: 'C', f: 261.63, d: 350 }, { note: 'G', f: 392.00, d: 350 }, { note: 'G', f: 392.00, d: 350 },
        { note: 'A', f: 440.00, d: 350 }, { note: 'A', f: 440.00, d: 350 }, { note: 'G', f: 392.00, d: 700 },
        { note: 'F', f: 349.23, d: 350 }, { note: 'F', f: 349.23, d: 350 }, { note: 'E', f: 329.63, d: 350 }, { note: 'E', f: 329.63, d: 350 },
        { note: 'D', f: 293.66, d: 350 }, { note: 'D', f: 293.66, d: 350 }, { note: 'C', f: 261.63, d: 700 }
      ];
      let accumulatedDelay = 0;
      notes.forEach((item) => {
        songNotes.push({ note: item.note, freq: item.f, delay: accumulatedDelay, duration: item.d - 40 });
        accumulatedDelay += item.d;
      });
    } else if (songName === 'mario') {
      const notes = [
        { note: 'E', f: 329.63, d: 140 }, { note: 'E', f: 329.63, d: 140 }, { note: 'E', f: 329.63, d: 280 },
        { note: 'C', f: 261.63, d: 140 }, { note: 'E', f: 329.63, d: 280 }, { note: 'G', f: 392.00, d: 450 }
      ];
      let accumulatedDelay = 0;
      notes.forEach((item) => {
        songNotes.push({ note: item.note, freq: item.f, delay: accumulatedDelay, duration: item.d - 25 });
        accumulatedDelay += item.d;
      });
    }

    songNotes.forEach(item => {
      const tStart = setTimeout(() => {
        triggerNoteStart(item.note, item.freq);
      }, item.delay) as any;
      
      const tEnd = setTimeout(() => {
        triggerNoteEnd(item.note);
      }, item.delay + item.duration) as any;

      demoTimeoutRefs.current.push(tStart, tEnd);
    });

    const tFinish = setTimeout(() => {
      setIsPlayingDemo(false);
    }, songNotes[songNotes.length - 1].delay + songNotes[songNotes.length - 1].duration + 100) as any;
    demoTimeoutRefs.current.push(tFinish);
  };

  // Keep volume slider up-to-date in real time
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Bind key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // Only process keys if not typing in inputs
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const matched = keys.find(k => k.keyBind === e.key.toLowerCase());
      if (matched) {
        triggerNoteStart(matched.note, matched.freq);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const matched = keys.find(k => k.keyBind === e.key.toLowerCase());
      if (matched) {
        triggerNoteEnd(matched.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      // Cleanup any ringing notes
      Object.keys(activeNodesRef.current).forEach(id => {
        try {
          activeNodesRef.current[id].osc.stop();
        } catch (e) {}
      });
    };
  }, [octave, waveType, adsr, lfoEnabled, lfoRate, lfoDepth]);

  // Handle pointer cleanups when dragging off screen
  const handlePointerUpOutside = () => {
    Object.keys(activeNodesRef.current).forEach(id => {
      triggerNoteEnd(id);
    });
  };

  return (
    <div 
      className="h-full w-full bg-slate-950 flex flex-col p-4 select-none text-slate-200 overflow-y-auto"
      onPointerUp={handlePointerUpOutside}
      onPointerLeave={handlePointerUpOutside}
    >
      {/* Waveform Screen & Visualizer Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-extrabold text-white tracking-widest uppercase">POLYPHONIC SYNTH v4.2</h2>
            </div>
            <p className="text-[10px] text-slate-500">Fully polyphonic physical sound engine. Jam using key bindings!</p>
          </div>

          {/* Controls & Helpers */}
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={() => { setOctave(o => Math.max(2, o - 1)); initAudio(); }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 active:scale-95 transition-all text-white"
            >
              OCT -
            </button>
            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800/80 text-xs font-mono font-bold text-rose-400">
              OCTAVE: {octave}
            </div>
            <button 
              onClick={() => { setOctave(o => Math.min(6, o + 1)); initAudio(); }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 active:scale-95 transition-all text-white"
            >
              OCT +
            </button>
          </div>
        </div>

        {/* Master Oscilloscope Screen */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative h-28 md:h-full flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            width={320} 
            height={110} 
            className="w-full h-full block cursor-pointer"
            onClick={initAudio}
          />
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono tracking-wider text-cyan-400 border border-cyan-500/10">
            LIVE ANALYSER
          </div>
          {!audioCtxRef.current && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center text-center p-2">
              <span className="text-[11px] text-slate-400 font-medium px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800/60 shadow-xl cursor-pointer hover:text-white" onClick={initAudio}>
                Click key to initialize sound engine
              </span>
            </div>
          )}
        </div>

        {/* Waveform Selector & Settings */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">OSCILLATOR SHAPE</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sine', 'triangle', 'sawtooth', 'square'] as OscillatorType[]).map(shape => (
                <button
                  key={shape}
                  onClick={() => { setWaveType(shape); initAudio(); }}
                  className={`py-1 rounded-md text-[10px] font-bold uppercase border transition-all ${waveType === shape ? 'bg-rose-500/20 text-rose-400 border-rose-500' : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'}`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SHOW KEY OVERLAYS</span>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1 text-[9px] font-bold rounded-lg border uppercase transition-colors ${showLabels ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              {showLabels ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* NEW JAM RECORDER & DEMO SONGS TRACKER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 shrink-0">
        {/* Real-time Session Jam Recorder */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full bg-red-500 ${isRecording ? 'animate-ping' : ''}`} /> 
              Real-time MIDI Jam Recorder
            </span>
            <p className="text-[9px] text-slate-500 mt-1">Record your custom synth performance directly into local memory, then play it back live.</p>
          </div>
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={playbackActive}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Circle className="w-2.5 h-2.5 fill-white" /> Record Live
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-2 bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse active:scale-95"
              >
                <Square className="w-2.5 h-2.5 fill-slate-950" /> Stop ({recordedSequence.length} notes)
              </button>
            )}

            {!playbackActive ? (
              <button
                onClick={playRecording}
                disabled={isRecording || recordedSequence.length === 0}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-2.5 h-2.5 fill-white" /> Play Session
              </button>
            ) : (
              <button
                onClick={stopPlayback}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Square className="w-2.5 h-2.5 fill-white" /> Stop Play
              </button>
            )}
          </div>
        </div>

        {/* Retro Demotrack Player */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              🎵 Retro Demotrack Sequencer
            </span>
            <p className="text-[9px] text-slate-500 mt-1">Play built-in pre-sequenced synthetic melodies with retro style and acoustic waves.</p>
          </div>
          <div className="flex gap-2">
            {isPlayingDemo ? (
              <button
                onClick={stopDemo}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Square className="w-2.5 h-2.5 fill-white" /> Stop Demo Track
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  onClick={() => playDemoSong('ode')}
                  disabled={isRecording || playbackActive}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                >
                  Ode to Joy
                </button>
                <button
                  onClick={() => playDemoSong('twinkle')}
                  disabled={isRecording || playbackActive}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                >
                  Twinkle Star
                </button>
                <button
                  onClick={() => playDemoSong('mario')}
                  disabled={isRecording || playbackActive}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                >
                  Mario Theme
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADSR & LFO Customizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 shrink-0">
        {/* Envelope Controls */}
        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-2.5">
          <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase">ADSR VOLUME ENVELOPE</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: 'Attack', key: 'attack', min: 0.01, max: 1.0, value: adsr.attack, step: 0.01, unit: 's' },
              { label: 'Decay', key: 'decay', min: 0.05, max: 1.5, value: adsr.decay, step: 0.01, unit: 's' },
              { label: 'Sustain', key: 'sustain', min: 0.0, max: 1.0, value: adsr.sustain, step: 0.05, unit: '%' },
              { label: 'Release', key: 'release', min: 0.1, max: 2.5, value: adsr.release, step: 0.05, unit: 's' }
            ].map(ctrl => (
              <div key={ctrl.key} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[9px] font-medium text-slate-500">
                  <span>{ctrl.label}</span>
                  <span className="font-mono text-slate-300">{ctrl.value}{ctrl.unit}</span>
                </div>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={ctrl.value}
                  onChange={(e) => setAdsr(prev => ({ ...prev, [ctrl.key]: Number(e.target.value) }))}
                  className="w-full accent-rose-500 h-1 rounded bg-slate-950 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* LFO & volume */}
        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">PITCH MODULATION (LFO)</span>
              <button 
                onClick={() => setLfoEnabled(!lfoEnabled)}
                className={`px-2.5 py-0.5 text-[8px] font-bold rounded border uppercase ${lfoEnabled ? 'bg-purple-500/20 text-purple-300 border-purple-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
              >
                {lfoEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[9px] font-medium text-slate-500">
                  <span>Rate</span>
                  <span className="font-mono text-slate-300">{lfoRate}Hz</span>
                </div>
                <input
                  type="range" min="1" max="20" step="0.5" value={lfoRate}
                  onChange={(e) => setLfoRate(Number(e.target.value))}
                  disabled={!lfoEnabled}
                  className="w-full accent-purple-500 h-1 rounded bg-slate-950 cursor-pointer disabled:opacity-30"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[9px] font-medium text-slate-500">
                  <span>Depth</span>
                  <span className="font-mono text-slate-300">±{lfoDepth}Hz</span>
                </div>
                <input
                  type="range" min="2" max="50" step="1" value={lfoDepth}
                  onChange={(e) => setLfoDepth(Number(e.target.value))}
                  disabled={!lfoEnabled}
                  className="w-full accent-purple-500 h-1 rounded bg-slate-950 cursor-pointer disabled:opacity-30"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/40">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase">MASTER VOLUME</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 accent-cyan-500 h-1 rounded bg-slate-950 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Piano Keybed */}
      <div className="flex-1 min-h-[140px] bg-slate-950 relative flex justify-center py-2">
        <div className="relative h-full w-full max-w-4xl flex bg-slate-950 select-none pb-2">
          {keys.map((k, i) => {
            const isBlack = k.type === 'black';
            const isActive = !!activeKeys[k.note];
            
            // Calculate offset position for black keys dynamically to span beautifully
            if (isBlack) {
              // Map black key index position relative to its preceding white key
              // Standard piano layout matches: C, C#, D, D#, E, F, F#, G, G#, A, A#, B, C+
              // Let's place it absolutely with offset
              let leftPercent = 0;
              if (k.note === 'C#') leftPercent = 5.2;
              else if (k.note === 'D#') leftPercent = 14.8;
              else if (k.note === 'F#') leftPercent = 34.2;
              else if (k.note === 'G#') leftPercent = 43.8;
              else if (k.note === 'A#') leftPercent = 53.4;
              else if (k.note === 'C#+') leftPercent = 72.8;

              return (
                <button 
                  key={k.note}
                  onPointerDown={() => triggerNoteStart(k.note, k.freq)}
                  onPointerUp={() => triggerNoteEnd(k.note)}
                  onPointerLeave={() => triggerNoteEnd(k.note)}
                  className={`absolute h-[60%] w-[6.5%] bg-slate-900 hover:bg-slate-800 active:bg-rose-500 rounded-b-md z-30 flex flex-col justify-end items-center pb-2 cursor-pointer transition-all duration-75 outline-none border-x border-b border-black shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)]
                    ${isActive ? 'bg-gradient-to-t from-rose-600 to-slate-950 border-rose-500 shadow-[0_0_12px_#f43f5e] h-[58%]' : ''}`}
                  style={{ left: `${leftPercent}%` }}
                >
                  {showLabels && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[7px] text-rose-400 font-bold tracking-tight">{k.note}</span>
                      <span className="text-[7px] px-1 bg-black/40 text-slate-500 rounded font-mono font-black">{k.label}</span>
                    </div>
                  )}
                </button>
              );
            }

            // White keys are laid out inline using standard flex/grid spacing
            return (
              <button 
                key={k.note}
                onPointerDown={() => triggerNoteStart(k.note, k.freq)}
                onPointerUp={() => triggerNoteEnd(k.note)}
                onPointerLeave={() => triggerNoteEnd(k.note)}
                className={`flex-1 h-full bg-slate-50 hover:bg-slate-200 active:bg-cyan-500 border-r border-slate-300 rounded-b-lg flex flex-col justify-end items-center pb-3 cursor-pointer transition-all duration-75 outline-none z-10 shadow-md
                  ${isActive ? 'bg-gradient-to-t from-cyan-400 to-white text-cyan-950 border-cyan-400 shadow-[0_0_15px_#06b6d4] scale-y-98' : 'text-slate-800'}`}
              >
                {showLabels && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black text-slate-400">{k.note}</span>
                    <span className="text-[9px] w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center font-mono font-black text-slate-700 shadow-xs">{k.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CompassApp() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeading(h => (h + (Math.random() * 10 - 5)) % 360);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 select-none overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="text-6xl font-light text-white mb-12 tracking-tighter relative z-10">
        {Math.abs(Math.round(heading))}°
      </div>
      <div className="relative w-64 h-64 rounded-full border-2 border-slate-800 bg-slate-900/50 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 backdrop-blur-sm">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-full py-2 flex flex-col justify-between items-center"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className={`w-1 h-3 ${i % 3 === 0 ? 'bg-white' : 'bg-slate-600'}`} />
            <div className={`w-1 h-3 ${i % 3 === 0 ? 'bg-white' : 'bg-slate-600'}`} />
          </div>
        ))}
        <div className="absolute inset-4 font-bold text-lg text-slate-500">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500">N</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2">S</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2">W</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2">E</span>
        </div>
        
        <div 
          className="absolute w-full h-full flex flex-col items-center justify-center transition-transform duration-700 ease-in-out"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[90px] border-l-transparent border-r-transparent border-b-red-500 origin-bottom" />
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[90px] border-l-transparent border-r-transparent border-t-white origin-top" />
          <div className="absolute w-4 h-4 bg-slate-900 rounded-full border-2 border-red-500 shadow-xl" />
        </div>
      </div>
    </div>
  );
}
