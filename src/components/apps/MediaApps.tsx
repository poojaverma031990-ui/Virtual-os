import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import { speakText } from '../../lib/sounds';

export function MusicApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(34);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => p >= 100 ? 0 : p + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full w-full flex bg-slate-900 rounded-b-lg overflow-hidden text-slate-200">
      <div className="w-48 bg-black/40 border-r border-white/5 p-4 flex flex-col gap-6">
        <h3 className="font-bold text-lg tracking-tight">CyberMusic</h3>
        <div className="space-y-2">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Library</div>
          <div className="text-sm hover:text-fuchsia-400 cursor-pointer transition-colors">Listen Now</div>
          <div className="text-sm hover:text-fuchsia-400 cursor-pointer transition-colors text-fuchsia-400">Browse</div>
          <div className="text-sm hover:text-fuchsia-400 cursor-pointer transition-colors">Radio</div>
        </div>
        <div className="space-y-2 mt-auto">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Playlists</div>
          <div className="text-sm hover:text-white cursor-pointer transition-colors">Synthwave 2077</div>
          <div className="text-sm hover:text-white cursor-pointer transition-colors">Lo-Fi Coding</div>
          <div className="text-sm hover:text-white cursor-pointer transition-colors">Deep Focus</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/20 to-transparent pointer-events-none" />
        
        <div className="flex-1 p-8 flex flex-col items-center justify-center z-10">
          <div className="w-48 h-48 bg-gradient-to-tr from-fuchsia-600 to-blue-600 rounded-xl shadow-2xl mb-8 flex items-center justify-center">
             <div className="w-32 h-32 rounded-full bg-black/20 backdrop-blur border border-white/20 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full bg-black/40" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Neon Nights</h2>
          <p className="text-fuchsia-400 text-lg">Cyberpunk Dreams</p>
        </div>

        <div className="h-24 bg-black/60 backdrop-blur-xl border-t border-white/10 px-6 flex items-center gap-6 z-20">
          <div className="flex items-center gap-4 flex-1 justify-center">
            <Shuffle className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
            <SkipBack className="w-6 h-6 text-slate-200 hover:text-white cursor-pointer fill-current" />
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <SkipForward className="w-6 h-6 text-slate-200 hover:text-white cursor-pointer fill-current" />
            <Repeat className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 cursor-pointer">
            <div className="h-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CameraApp() {
  const [mode, setMode] = useState('PHOTO');
  const [filters, setFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Camera access denied. Please check your browser permissions.");
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (activeFilter === 'sepia') ctx.filter = 'sepia(1)';
        if (activeFilter === 'grayscale') ctx.filter = 'grayscale(1)';
        if (activeFilter === 'invert') ctx.filter = 'invert(1)';
        
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvas.toDataURL('image/png'));
        speakText("Photo captured");
        
        // Auto-clear preview after 3 seconds
        setTimeout(() => setCapturedImage(null), 3000);
      }
    }
  };
  
  return (
    <div className="h-full w-full bg-black flex flex-col rounded-b-lg overflow-hidden relative">
      <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-8">
            <p className="text-red-400 mb-2 font-bold">Access Error</p>
            <p className="text-xs opacity-50">{error}</p>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className={`w-full h-full object-cover transition-all duration-500
              ${activeFilter === 'none' ? '' : ''}
              ${activeFilter === 'sepia' ? 'sepia contrast-125' : ''}
              ${activeFilter === 'grayscale' ? 'grayscale' : ''}
              ${activeFilter === 'invert' ? 'invert' : ''}
            `}
          />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none border-[24px] border-black/20" />
        
        {/* Fake Focus box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-yellow-500/50 flex items-center justify-center transition-transform hover:scale-95 duration-200 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500" />
          <div className="w-1.5 h-1.5 bg-yellow-500/80 rounded-full" />
        </div>
        
        {filters && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto z-20">
            {['none', 'sepia', 'grayscale', 'invert'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 bg-black/50 border rounded text-xs uppercase backdrop-blur-md transition-colors ${activeFilter === f ? 'border-yellow-400 text-yellow-400' : 'border-white/20 text-white hover:bg-black/80'}`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="h-32 bg-black flex flex-col items-center justify-center gap-4 z-10 pb-4 relative">
        <div className="flex gap-6 text-xs font-bold text-white/50 tracking-widest">
          <span className={`cursor-pointer transition-colors ${mode === 'VIDEO' ? 'text-yellow-400' : 'hover:text-white'}`} onClick={() => setMode('VIDEO')}>VIDEO</span>
          <span className={`cursor-pointer transition-colors ${mode === 'PHOTO' ? 'text-yellow-400' : 'hover:text-white'}`} onClick={() => setMode('PHOTO')}>PHOTO</span>
          <span className={`cursor-pointer transition-colors ${mode === 'PORTRAIT' ? 'text-yellow-400' : 'hover:text-white'}`} onClick={() => setMode('PORTRAIT')}>PORTRAIT</span>
        </div>
        <div className="flex items-center justify-between w-full px-8 max-w-sm">
          <button 
            onClick={() => setFilters(!filters)}
            className={`w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center text-xs transition-all ${filters ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' : 'bg-slate-800 text-white/50 hover:bg-slate-700'}`}
          >
            FX
          </button>
          <button 
            onClick={takePhoto}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform group"
          >
            <div className={`w-12 h-12 rounded-full transition-all group-hover:scale-90 ${mode === 'VIDEO' ? 'bg-red-500' : 'bg-white'}`} />
          </button>
          <div 
            onClick={() => {
              setActiveFilter('none');
              speakText("Camera reset");
            }}
            className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white/50 border border-white/20 hover:bg-slate-700 cursor-pointer active:rotate-180 transition-all"
          >
            ↺
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrumKitApp() {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [kit, setKit] = useState<'808' | 'retro' | 'acoustic'>('808');
  const [bpm, setBpm] = useState(125);
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [volume, setVolume] = useState(0.5);

  // Expanded to 9 tracks for all MPC pads: Kick, Snare, Hi-Hat, Clap, Low Tom, High Tom, Cowbell, Rim, Sub Bass
  const [grid, setGrid] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false],   // Kick
    [false, false, true, false, false, false, true, false],   // Snare
    [true, true, true, true, true, true, true, true],         // Hi-Hat
    [false, false, false, true, false, false, false, true],    // Clap
    [false, false, false, false, false, false, false, false],  // Tom Lo
    [false, false, false, false, false, false, false, false],  // Tom Hi
    [false, false, true, false, false, true, false, false],    // Cowbell
    [false, false, false, false, false, false, false, false],  // Rimshot
    [true, false, false, false, false, false, false, false],   // Sub Bass
  ]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const masterGainRef = React.useRef<GainNode | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const seqTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const pads = [
    { key: 'Q', name: 'KICK', color: 'bg-rose-500', type: 'kick' },
    { key: 'W', name: 'SNARE', color: 'bg-purple-500', type: 'snare' },
    { key: 'E', name: 'HIHAT', color: 'bg-cyan-500', type: 'hihat' },
    { key: 'A', name: 'CLAP', color: 'bg-fuchsia-500', type: 'clap' },
    { key: 'S', name: 'TOM LO', color: 'bg-emerald-500', type: 'tomLo' },
    { key: 'D', name: 'TOM HI', color: 'bg-teal-500', type: 'tomHi' },
    { key: 'Z', name: 'COWBELL', color: 'bg-amber-500', type: 'cowbell' },
    { key: 'X', name: 'RIMSHOT', color: 'bg-yellow-500', type: 'rim' },
    { key: 'C', name: 'SUB BASS', color: 'bg-blue-600', type: 'sub' },
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      
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
      ctx.strokeStyle = '#06b6d4'; // bright cyan
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
    };

    draw();
  };

  // Noise Buffer Generator for Snare, Hats, Cymbals
  const getNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const playSoundSynth = (type: string) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    const now = ctx.currentTime;

    if (type === 'kick') {
      // Procedural Kick
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';

      // 808 style booming pitch slide or retro pitch sweep
      const startFreq = kit === '808' ? 140 : kit === 'retro' ? 180 : 120;
      const endFreq = kit === '808' ? 0.01 : kit === 'retro' ? 10 : 35;
      const decayTime = kit === '808' ? 0.45 : kit === 'retro' ? 0.25 : 0.18;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + decayTime);

      gainNode.gain.setValueAtTime(1.0, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      osc.connect(gainNode);
      gainNode.connect(analyser);

      osc.start(now);
      osc.stop(now + decayTime);
    } 
    else if (type === 'snare') {
      // Snare: Wood tone (triangle) + white noise crash
      // 1. Wood shell pop
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(oscGain);
      oscGain.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.1);

      // 2. White noise snare wires
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = kit === 'retro' ? 'bandpass' : 'highpass';
      filter.frequency.value = kit === '808' ? 1200 : kit === 'retro' ? 1000 : 1500;

      const noiseGain = ctx.createGain();
      const snareDecay = kit === '808' ? 0.25 : kit === 'retro' ? 0.15 : 0.2;
      noiseGain.gain.setValueAtTime(kit === 'retro' ? 0.6 : 0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + snareDecay);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(analyser);

      noise.start(now);
      noise.stop(now + snareDecay);
    } 
    else if (type === 'hihat') {
      // Hi-hat: Very short white noise highpass
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = kit === 'retro' ? 6000 : 8500;

      const gainNode = ctx.createGain();
      const hatDecay = kit === '808' ? 0.08 : kit === 'retro' ? 0.05 : 0.06;
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + hatDecay);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(analyser);

      noise.start(now);
      noise.stop(now + hatDecay);
    } 
    else if (type === 'clap') {
      // Clap: spaced impulse triggers
      const duration = 0.25;
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 2;

      const gainNode = ctx.createGain();
      // Clap stutter effect (3 micro impulses)
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01);
      gainNode.gain.setValueAtTime(0.1, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.7, now + 0.03);
      gainNode.gain.setValueAtTime(0.1, now + 0.04);
      gainNode.gain.linearRampToValueAtTime(0.6, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(analyser);

      noise.start(now);
      noise.stop(now + duration);
    }
    else if (type === 'tomLo' || type === 'tomHi') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      
      const pitch = type === 'tomHi' ? 160 : 100;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      gainNode.gain.setValueAtTime(0.6, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gainNode);
      gainNode.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.25);
    }
    else if (type === 'cowbell') {
      // Metallic dual pitch ring modulation
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'square';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(540, now);
      osc2.frequency.setValueAtTime(800, now);

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1000;

      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(bandpass);
      osc2.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(analyser);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
    }
    else if (type === 'rim') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(kit === 'retro' ? 1200 : 1600, now);
      
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gainNode);
      gainNode.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.03);
    }
    else if (type === 'sub') {
      // Heavy deep 808 sub bass drop
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.85);

      gainNode.gain.setValueAtTime(0.8, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gainNode);
      gainNode.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.85);
    }
  };

  const playPadAndFeedback = (i: number) => {
    setActivePad(i);
    setTimeout(() => setActivePad(null), 100);
    playSoundSynth(pads[i].type);
  };

  const toggleGridStep = (trackIdx: number, stepIdx: number) => {
    initAudio();
    setGrid(prev => {
      const copy = prev.map(row => [...row]);
      copy[trackIdx][stepIdx] = !copy[trackIdx][stepIdx];
      return copy;
    });
  };

  const clearSequencer = () => {
    initAudio();
    setGrid(Array(9).fill(null).map(() => Array(8).fill(false)));
    speakText("Sequencer cleared");
  };

  const randomizeSequencer = () => {
    initAudio();
    const randomized = Array(9).fill(null).map((_, rIdx) => {
      return Array(8).fill(null).map(() => {
        // High hit probability for hi-hats, moderate for kicks/snares, low for FX cowbell
        const prob = rIdx === 2 ? 0.35 : rIdx === 0 ? 0.22 : rIdx === 1 ? 0.18 : 0.06;
        return Math.random() < prob;
      });
    });
    setGrid(randomized);
    speakText("Randomized groove generated");
  };

  const applyPreset = (presetName: 'trap' | 'house' | 'cowbell') => {
    initAudio();
    const PRESETS: Record<string, boolean[][]> = {
      trap: [
        [true, false, false, false, true, false, false, false],   // Kick
        [false, false, true, false, false, false, true, false],   // Snare
        [true, true, true, true, true, true, true, true],         // Hi-Hat
        [false, false, false, true, false, false, false, true],    // Clap
        [false, false, false, false, false, false, false, false],  // Tom Lo
        [false, false, false, false, false, false, false, false],  // Tom Hi
        [false, false, false, false, false, true, false, false],    // Cowbell
        [false, false, false, false, false, false, false, false],  // Rim
        [true, false, false, false, false, false, false, false],   // Sub Bass
      ],
      house: [
        [true, false, true, false, true, false, true, false],   // Kick
        [false, false, true, false, false, false, true, false],   // Snare
        [false, true, false, true, false, true, false, true],     // Hi-Hat
        [false, false, false, false, true, false, false, false],   // Clap
        [false, false, false, false, false, false, false, false],  // Tom Lo
        [false, false, false, false, false, false, false, false],  // Tom Hi
        [false, false, false, false, false, false, false, false],  // Cowbell
        [true, false, false, false, true, false, false, false],    // Rim
        [false, false, false, false, false, false, false, false],  // Sub Bass
      ],
      cowbell: [
        [true, false, false, true, true, false, false, false],   // Kick
        [false, false, true, false, false, false, true, false],   // Snare
        [true, false, true, false, true, false, true, false],     // Hi-Hat
        [false, false, false, false, false, false, false, true],    // Clap
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [true, true, false, true, true, false, true, true],       // Cowbell
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ],
    };
    if (PRESETS[presetName]) {
      setGrid(PRESETS[presetName]);
      speakText(`${presetName} preset loaded`);
    }
  };

  // Sequencer loop clock timer
  useEffect(() => {
    if (seqTimerRef.current) {
      clearInterval(seqTimerRef.current);
      seqTimerRef.current = null;
    }

    if (isSequencerPlaying) {
      // Interval = (60 / BPM) / 2 seconds for eighth notes
      const intervalMs = (60000 / bpm) / 2;
      seqTimerRef.current = setInterval(() => {
        setCurrentStep(step => {
          const nextStep = (step + 1) % 8;
          // Play any active instruments on this eighth note step
          const tracks = ['kick', 'snare', 'hihat', 'clap', 'tomLo', 'tomHi', 'cowbell', 'rim', 'sub'];
          tracks.forEach((type, trackIdx) => {
            if (grid[trackIdx] && grid[trackIdx][nextStep]) {
              playSoundSynth(type);
            }
          });
          return nextStep;
        });
      }, intervalMs);
    }

    return () => {
      if (seqTimerRef.current) clearInterval(seqTimerRef.current);
    };
  }, [isSequencerPlaying, bpm, grid, kit]);

  // Handle master volume adjustments in real time
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Keyboard trigger bindings (Q, W, E, A, S, D, Z, X, C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const char = e.key.toUpperCase();
      const idx = pads.findIndex(p => p.key === char);
      if (idx !== -1) {
        playPadAndFeedback(idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [kit]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col p-4 rounded-b-lg text-slate-200 select-none overflow-y-auto">
      {/* Top Header Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <h2 className="text-sm font-black tracking-widest text-white">MPC CYBERDRUM 9000</h2>
            </div>
            <p className="text-[10px] text-slate-500">Synthesized audio drum controller & sequencing loop bank.</p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase">KIT BANK:</span>
            <div className="flex gap-1">
              {[
                { id: '808', label: '808 TRAP' },
                { id: 'retro', label: 'RETRO 8B' },
                { id: 'acoustic', label: 'STUDIO' }
              ].map(k => (
                <button
                  key={k.id}
                  onClick={() => { setKit(k.id as any); initAudio(); }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${kit === k.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-300'}`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Audio Oscilloscope Canvas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative h-24 md:h-full flex items-center justify-center">
          <canvas ref={canvasRef} width={280} height={90} className="w-full h-full block cursor-pointer" onClick={initAudio} />
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono tracking-wider text-fuchsia-400 border border-fuchsia-500/10">
            WAVEFORM SCREEN
          </div>
          {!audioCtxRef.current && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 shadow" onClick={initAudio}>
                Click pad or start loop to boot audio
              </span>
            </div>
          )}
        </div>

        {/* Master Volume and BPM dial */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span>Sequencer Tempo</span>
              <span className="text-cyan-400 font-mono font-black">{bpm} BPM</span>
            </div>
            <input
              type="range" min="60" max="220" step="1" value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 rounded bg-slate-950 cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/40">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Gain</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 accent-rose-500 h-1 rounded bg-slate-950 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive MPC Pads (Left) and Step Sequencer (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[220px]">
        {/* MPC Pad Trigger Area */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3 justify-center">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">TRIGGER PADS (KEYS Q-C)</div>
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full">
            {pads.map((pad, i) => (
              <button
                key={i}
                onPointerDown={() => playPadAndFeedback(i)}
                className={`aspect-square rounded-xl flex flex-col justify-between p-2.5 border transition-all active:scale-95 text-left select-none relative overflow-hidden group
                  ${activePad === i 
                    ? `${pad.color} text-white border-white scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]` 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800/80 text-slate-300'}`}
              >
                <span className={`text-[9px] font-black tracking-tight ${activePad === i ? 'text-white' : 'text-slate-500'}`}>{pad.key}</span>
                <span className={`text-[10px] font-extrabold tracking-tighter ${activePad === i ? 'text-white' : 'text-slate-400'}`}>{pad.name}</span>
                {/* Visual ripple pulse inside pad */}
                <div className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
              </button>
            ))}
          </div>
        </div>

        {/* Step Sequencer Loop Matrix Area */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">9-TRACK BEAT SEQUENCER</span>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => applyPreset('trap')}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[8px] font-black tracking-wider uppercase"
                  >
                    TRAP
                  </button>
                  <button
                    onClick={() => applyPreset('house')}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[8px] font-black tracking-wider uppercase"
                  >
                    HOUSE
                  </button>
                  <button
                    onClick={() => applyPreset('cowbell')}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[8px] font-black tracking-wider uppercase"
                  >
                    COWBELL
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={() => { setIsSequencerPlaying(!isSequencerPlaying); initAudio(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 ${isSequencerPlaying ? 'bg-red-600 text-white shadow-red-600/10' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/10'}`}
                >
                  {isSequencerPlaying ? 'PAUSE' : 'PLAY LOOP'}
                </button>
                <button
                  onClick={randomizeSequencer}
                  className="px-1.5 py-1 bg-purple-900/40 hover:bg-purple-800 text-purple-300 rounded-lg text-[9px] font-bold border border-purple-800/50 active:scale-95"
                >
                  RANDOM
                </button>
                <button
                  onClick={clearSequencer}
                  className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold border border-slate-700/60 active:scale-95"
                >
                  CLEAR
                </button>
              </div>
            </div>
 
            {/* LED Metronome bulbs row */}
            <div className="grid grid-cols-12 items-center gap-2 mb-2 pl-14 pr-1">
              <div className="col-span-1" />
              {[...Array(8)].map((_, stepIdx) => (
                <div 
                  key={stepIdx} 
                  className={`col-span-1 h-1.5 rounded-full transition-all duration-75 mx-auto w-3
                  ${isSequencerPlaying && currentStep === stepIdx 
                    ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4] scale-y-125' 
                    : 'bg-slate-800'}`}
                />
              ))}
            </div>
 
            {/* Scrollable Steps Tracks list (Supports all 9 instruments now) */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-slate-800">
              {['KICK', 'SNARE', 'HI-HAT', 'CLAP', 'TOM LO', 'TOM HI', 'COWBELL', 'RIMSHOT', 'SUB BASS'].map((label, trackIdx) => (
                <div key={label} className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-2 text-[9px] font-black tracking-tight text-slate-500 text-left truncate">{label}</span>
                  <div className="col-span-10 grid grid-cols-8 gap-1.5">
                    {grid[trackIdx] && grid[trackIdx].map((stepActive, stepIdx) => (
                      <button
                        key={stepIdx}
                        onClick={() => toggleGridStep(trackIdx, stepIdx)}
                        className={`aspect-square rounded-md border flex items-center justify-center transition-all active:scale-90
                        ${stepActive 
                          ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-800'}`}
                      >
                        {stepActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="text-[9px] text-slate-500 font-mono tracking-wider mt-4 text-center border-t border-slate-800/50 pt-3">
            Eighth note triggers. Set dots to sequence loops. Toggle genre presets for instant inspiration.
          </div>
        </div>
      </div>
    </div>
  );
}
