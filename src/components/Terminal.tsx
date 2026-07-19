import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { themeStore } from '../themeStore';

type Log = {
  id: string;
  type: 'input' | 'output' | 'matrix';
  content: string;
};

export default function Terminal() {
  const [logs, setLogs] = useState<Log[]>([
    { id: '1', type: 'output', content: 'Welcome to CyberOS v1.0.0' },
    { id: '2', type: 'output', content: 'Type "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMatrixActive) {
      interval = setInterval(() => {
        const chars = '01';
        let line = '';
        for (let i = 0; i < 50; i++) {
          line += chars.charAt(Math.floor(Math.random() * chars.length)) + ' ';
        }
        setLogs(prev => [...prev, { id: Date.now().toString() + Math.random(), type: 'matrix', content: line }]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isMatrixActive]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = input.trim().toLowerCase();
      setInput('');
      
      const newLog: Log = { id: Date.now().toString(), type: 'input', content: input };
      
      if (command === 'clear') {
        setLogs([]);
        setIsMatrixActive(false);
        return;
      }

      setLogs(prev => [...prev, newLog]);

      if (command === 'neofetch') {
        const lines = [
          '      .---.       admin@cyber-os',
          '     /     \\      --------------',
          '    | () () |     OS: CyberOS Horizon v3.0',
          '     \\  ^  /      Kernel: React 18.2.0',
          '      |||||       Uptime: 2 hours, 14 mins',
          '      |||||       Packages: 248 (npm)',
          '                  Shell: vibe-sh 1.0',
          '                  Resolution: 1920x1080',
          '                  WM: HorizonWM',
          '                  CPU: Quantum Grid (128) @ 5.0GHz',
          '                  GPU: React Virtualized Compute',
          '                  Memory: 4.2GiB / 16.0GiB'
        ];
        lines.forEach((l, i) => {
          setTimeout(() => {
            setLogs(prev => [...prev, { id: Date.now().toString() + i, type: 'output', content: l }]);
          }, i * 20);
        });
      } else if (command === 'help') {
        const helpLines = [
          'Available commands:',
          '- help     : Displays this list of commands',
          '- about    : Prints out a short description of this simulator',
          '- clear    : Wipes the screen logs clean',
          '- matrix   : Prints continuous stream of green binary numbers',
          '- date     : Display the current system time',
          '- ls       : List files in current directory',
          '- weather  : Get real-time weather update',
          '- news     : Get the latest news headlines',
          '- whoami   : Show current user identity',
          '- neofetch : Show system information with ASCII art'
        ];
        helpLines.forEach((l, i) => {
          setTimeout(() => {
            setLogs(prev => [...prev, { id: Date.now().toString() + i, type: 'output', content: l }]);
          }, i * 50);
        });
      } else if (command === 'about') {
        setLogs(prev => [...prev, { id: Date.now().toString() + '1', type: 'output', content: 'CyberOS Simulator - A React-based virtual desktop environment.' }]);
      } else if (command === 'matrix') {
        setIsMatrixActive(true);
      } else if (command === 'date') {
        setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: new Date().toString() }]);
      } else if (command === 'ls') {
        setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: 'Documents/  Downloads/  Pictures/  Music/  system_core.dll  config.yaml' }]);
      } else if (command === 'whoami') {
        setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: themeStore.get().username }]);
      } else if (command === 'weather') {
        setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: 'Connecting to satellite...' }]);
        fetch('/api/weather').then(r => r.json()).then(data => {
          setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: `Weather in ${data.location}: ${data.temp}°C, ${data.condition}. Wind: ${data.windSpeed} km/h.` }]);
        }).catch(() => {
          setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: 'Error: Satellite connection lost.' }]);
        });
      } else if (command === 'news') {
        setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: 'Fetching news stream...' }]);
        fetch('/api/news').then(r => r.json()).then(data => {
          data.forEach((n: any, i: number) => {
            setTimeout(() => {
              setLogs(prev => [...prev, { id: Date.now().toString() + i, type: 'output', content: `[${n.source}] ${n.title}` }]);
            }, i * 200);
          });
        }).catch(() => {
          setLogs(prev => [...prev, { id: Date.now().toString(), type: 'output', content: 'Error: Failed to connect to news server.' }]);
        });
      } else if (command !== '') {
        setLogs(prev => [...prev, { id: Date.now().toString() + '1', type: 'output', content: `Command not found: ${command}. Type 'help' for options.` }]);
      }
    }
  };

  return (
    <div 
      className="p-4 font-mono text-sm h-full overflow-y-auto flex flex-col bg-slate-950/80 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {logs.map((log) => (
        <div key={log.id} className="mb-1">
          {log.type === 'input' && (
            <div className="flex gap-2 text-slate-300">
              <span className="text-emerald-400">admin@cyber-os:~$</span>
              <span>{log.content}</span>
            </div>
          )}
          {log.type === 'output' && (
            <div className="text-fuchsia-400">{log.content}</div>
          )}
          {log.type === 'matrix' && (
            <div className="text-green-500 font-bold whitespace-pre-wrap">{log.content}</div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 text-slate-300 mt-1">
        <span className="text-emerald-400">admin@cyber-os:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1 text-slate-300"
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
