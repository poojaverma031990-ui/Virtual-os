import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Cpu, Network, Database, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../../lib/sounds';

export function TerminalProApp() {
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Initialization complete.', '[CORE] Awaiting command input...']);
  const [input, setInput] = useState('');
  const [isHacking, setIsHacking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs]);

  useEffect(() => {
    if (isHacking) {
      const interval = setInterval(() => {
        setLogs(prev => [...prev, `[HACK] Bypassing node ${Math.floor(Math.random() * 9999)}... SUCCESS`, `[HACK] Injecting payload [${Math.random().toString(36).substring(7)}]...`]);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isHacking]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim().toLowerCase();
      setLogs(prev => [...prev, `root@cyber-core:~$ ${input}`]);
      setInput('');

      if (cmd === 'hack') {
        setIsHacking(true);
        setLogs(prev => [...prev, 'INITIALIZING CYBER-BREACH PROTOCOL...']);
      } else if (cmd === 'stop') {
        setIsHacking(false);
        setLogs(prev => [...prev, 'HACK SEQUENCE ABORTED.']);
      } else if (cmd === 'clear') {
        setLogs([]);
      } else if (cmd === 'ls') {
        setLogs(prev => [...prev, 'bin  boot  dev  etc  home  lib  media  mnt  opt  root  run  sbin  srv  sys  tmp  usr  var  CLASSIFIED_DATA.bin']);
      } else if (cmd.startsWith('ping')) {
        setLogs(prev => [...prev, `Pinging ${cmd.split(' ')[1] || '127.0.0.1'} with 32 bytes of data...`, 'Reply: bytes=32 time=14ms TTL=118', 'Reply: bytes=32 time=15ms TTL=118']);
      } else if (cmd === 'whoami') {
        setLogs(prev => [...prev, 'root (Superuser access granted)']);
      } else if (cmd === 'date') {
        setLogs(prev => [...prev, new Date().toString()]);
      } else if (cmd === 'help') {
        setLogs(prev => [...prev, 'AVAILABLE COMMANDS: hack, stop, clear, ls, ping <ip>, whoami, date, help']);
      } else {
        setLogs(prev => [...prev, `Command not found: ${cmd}`]);
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a] text-[#00ff00] font-mono text-xs rounded-b-lg overflow-hidden">
      <div className="w-48 border-r border-[#00ff00]/20 bg-[#050505] p-2 flex flex-col gap-2">
        <div className="p-2 border border-[#00ff00]/30 rounded text-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500 animate-pulse" />
          <span className="text-red-500 font-bold">SYSTEM SECURE</span>
        </div>
        <div className="flex-1 space-y-4 mt-4">
          <div>
            <div className="flex justify-between text-[#00aa00] mb-1"><Cpu className="w-3 h-3"/> CPU</div>
            <div className="w-full bg-[#002200] h-2 rounded"><div className="bg-[#00ff00] w-[75%] h-full"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-[#00aa00] mb-1"><Network className="w-3 h-3"/> NET</div>
            <div className="w-full bg-[#002200] h-2 rounded"><div className="bg-[#00ff00] w-[45%] h-full"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-[#00aa00] mb-1"><Database className="w-3 h-3"/> RAM</div>
            <div className="w-full bg-[#002200] h-2 rounded"><div className="bg-[#00ff00] w-[90%] h-full"></div></div>
          </div>
        </div>
        <div className="text-[10px] text-[#00aa00]">
          TARGET: 192.168.1.44
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10" />
        <div className="flex-1 overflow-y-auto z-20 space-y-1">
          {logs.map((log, i) => (
            <div key={i} className={log.includes('HACK') || log.includes('error') ? 'text-red-500' : ''}>{log}</div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex items-center gap-2 mt-2 z-20">
          <span className="text-red-500">root@cyber-core:~$</span>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 bg-transparent outline-none text-[#00ff00]"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export function CryptoTrackerApp() {
  const [balance, setBalance] = useState(124560.80);
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrypto = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crypto');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch market data');
      setCoins(data.map((c: any) => ({ ...c, owned: Math.floor(Math.random() * 10) })));
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'The crypto exchange is currently offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrypto();
  }, []);

  const buy = (index: number) => {
    const coin = coins[index];
    if (balance >= coin.price) {
      setBalance(b => b - coin.price);
      setCoins(prev => {
        const next = [...prev];
        next[index].owned += 1;
        return next;
      });
      playSound('success');
    } else {
      playSound('error');
    }
  };

  const sell = (index: number) => {
    const coin = coins[index];
    if (coin.owned > 0) {
      setBalance(b => b + coin.price);
      setCoins(prev => {
        const next = [...prev];
        next[index].owned -= 1;
        return next;
      });
      playSound('success');
    } else {
      playSound('error');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center text-fuchsia-500 font-black uppercase tracking-widest text-xs">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>
          Syncing with Global Exchanges...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Market Link Failed</h3>
        <p className="text-slate-400 text-sm max-w-xs mb-6">{error}</p>
        <button 
          onClick={fetchCrypto}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col rounded-b-lg text-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div>
          <div className="text-sm text-slate-400">Total Portfolio Value (Cash + Assets)</div>
          <div className="text-3xl font-bold tracking-tight text-white">${(balance + coins.reduce((acc, c) => acc + c.price * c.owned, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-emerald-400 text-sm mt-1">Available Cash: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <button className="bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2 rounded-lg font-medium shadow-lg shadow-fuchsia-600/20 transition-colors" onClick={() => setBalance(b => b + 10000)}>Deposit $10k</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
        {coins.map((coin, i) => (
          <div key={i} className="bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-white/10">
                {coin.symbol[0]}
              </div>
              <div>
                <div className="font-semibold">{coin.name}</div>
                <div className="text-xs text-slate-400">{coin.owned.toLocaleString()} {coin.symbol} owned</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-medium">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`text-sm ${coin.color}`}>{coin.change}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded font-medium text-xs border border-green-500/20" onClick={() => buy(i)}>BUY 1</button>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium text-xs border border-red-500/20" onClick={() => sell(i)}>SELL 1</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIGenApp() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setImage(null);
    setProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setImage(`https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}`);
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="h-full w-full flex bg-slate-950 text-slate-200 rounded-b-lg overflow-hidden">
      <div className="w-64 border-r border-slate-800 p-4 flex flex-col gap-4 bg-slate-900">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm resize-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none"
            placeholder="A futuristic cyberpunk city..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Style</label>
          <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none">
            <option>Photorealistic</option>
            <option>Anime</option>
            <option>Cyberpunk</option>
            <option>Oil Painting</option>
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="mt-auto w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/40 relative">
        {isGenerating ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-4 text-slate-300 font-medium">Neural Engine Processing... {progress}%</div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : image ? (
          <img src={image} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10" />
        ) : (
          <div className="text-slate-500 text-center">
            <div className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl opacity-50">✨</span>
            </div>
            <p>Enter a prompt and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
