import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, Lock, Unlock, Play, TerminalSquare, Eye, EyeOff, RefreshCw, Cpu, Code, BookOpen, Layers
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

// ==================================================
// 1. STEGANOGRAPHY & CIPHER CRYPTOGRAPHY WORKSPACE
// ==================================================
export function StegoCryptoApp() {
  const [activeSubTab, setActiveSubTab] = useState<'stego' | 'ciphers'>('stego');
  
  // Stego state
  const [secretMessage, setSecretMessage] = useState('Secret code: Apollo 11');
  const [carrierText, setCarrierText] = useState('This is standard security telemetry. Nothing suspicious here.');
  const [stegoOutput, setStegoOutput] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');

  // Cipher state
  const [cipherInput, setCipherInput] = useState('SATELLITE DOWNLINK SECURED');
  const [cipherKey, setCipherKey] = useState('VIBE');
  const [cipherOutput, setCipherOutput] = useState('');
  const [cipherMode, setCipherMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cipherType, setCipherType] = useState<'vigenere' | 'rot13' | 'binary'>('vigenere');

  const executeStegoEncode = () => {
    if (!secretMessage || !carrierText) return;
    // Steganography simulation: Hide message bits inside zero-width or special spacing characters
    // Or simpler robust representation: Append binary hidden trailing zero-width spaces
    // zero-width space is \u200B, zero-width non-joiner is \u200C
    const textToBin = (txt: string) => txt.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    const binary = textToBin(secretMessage);
    const hidden = binary.split('').map(bit => bit === '1' ? '\u200B' : '\u200C').join('');
    
    setStegoOutput(carrierText + hidden);
    playSound('success');
  };

  const executeStegoDecode = () => {
    if (!stegoOutput) return;
    // Extract zero-width spaces
    const chars = stegoOutput.split('');
    const bits: string[] = [];
    chars.forEach(char => {
      if (char === '\u200B') bits.push('1');
      if (char === '\u200C') bits.push('0');
    });

    if (bits.length === 0) {
      setDecodedMessage('No hidden steganography payload detected.');
      playSound('error');
      return;
    }

    // Convert back to string
    let txt = '';
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8).join('');
      if (byte.length === 8) {
        txt += String.fromCharCode(parseInt(byte, 2));
      }
    }
    setDecodedMessage(txt || 'Decryption failed: corrupted bits.');
    playSound('success');
  };

  const executeCipher = () => {
    if (!cipherInput) return;
    let res = '';
    if (cipherType === 'rot13') {
      res = cipherInput.replace(/[a-zA-Z]/g, (c: string) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    } else if (cipherType === 'binary') {
      if (cipherMode === 'encrypt') {
        res = cipherInput.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      } else {
        res = cipherInput.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
      }
    } else {
      // Vigenere cipher
      const input = cipherInput.toUpperCase();
      const key = cipherKey.toUpperCase() || 'KEY';
      let keyIndex = 0;

      for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        if (code >= 65 && code <= 90) { // A-Z
          const shift = key.charCodeAt(keyIndex % key.length) - 65;
          let finalCode = 0;
          if (cipherMode === 'encrypt') {
            finalCode = ((code - 65 + shift) % 26) + 65;
          } else {
            finalCode = ((code - 65 - shift + 26) % 26) + 65;
          }
          res += String.fromCharCode(finalCode);
          keyIndex++;
        } else {
          res += input[i];
        }
      }
    }
    setCipherOutput(res);
    playSound('success');
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col select-none overflow-hidden">
      
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 shrink-0">
        <button 
          onClick={() => { setActiveSubTab('stego'); playSound('click'); }}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeSubTab === 'stego' ? 'border-sky-500 text-sky-400 bg-slate-950' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Image/Text Steganography
        </button>
        <button 
          onClick={() => { setActiveSubTab('ciphers'); playSound('click'); }}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeSubTab === 'ciphers' ? 'border-sky-500 text-sky-400 bg-slate-950' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Cipher Cryptography Suite
        </button>
      </div>

      {activeSubTab === 'stego' ? (
        /* STEGANOGRAPHY */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-text">
          {/* Encoder */}
          <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sky-400 border-b border-slate-900 pb-2 mb-2">
              <Lock className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest">Payload Encoder</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Secret Message to Hide</label>
              <input 
                type="text" 
                value={secretMessage} 
                onChange={(e) => setSecretMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 outline-none rounded-xl px-3 py-2 text-xs font-medium text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Carrier Cover Text</label>
              <textarea 
                rows={3}
                value={carrierText} 
                onChange={(e) => setCarrierText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 outline-none rounded-xl px-3 py-2 text-xs font-medium text-slate-200 resize-none"
              />
            </div>

            <button
              onClick={executeStegoEncode}
              className="py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-500/10 active:scale-97 flex items-center justify-center gap-1.5"
            >
              Embed Secret Payload
            </button>

            {stegoOutput && (
              <div className="space-y-2 pt-4 border-t border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Encoded Carrier Text (Contains hidden bits)</span>
                <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-xs text-slate-400 font-mono select-all leading-normal break-all">
                  {stegoOutput}
                </div>
              </div>
            )}
          </div>

          {/* Decoder */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-900 pb-2 mb-2">
              <Unlock className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest">Payload Decoder</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Paste Encoded Carrier Text</label>
              <textarea 
                rows={4}
                placeholder="Paste telemetry code..."
                value={stegoOutput} 
                onChange={(e) => setStegoOutput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 outline-none rounded-xl px-3 py-2 text-xs font-medium text-slate-200 resize-none font-mono"
              />
            </div>

            <button
              onClick={executeStegoDecode}
              className="py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-97 flex items-center justify-center gap-1.5"
            >
              Extract Hidden Payload
            </button>

            {decodedMessage && (
              <div className="space-y-2 pt-4 border-t border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Decoded Secret Message</span>
                <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-3.5 rounded-xl text-xs font-bold leading-normal">
                  {decodedMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CRYPTOGRAPHY CIPHER SUITE */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-text">
          {/* Left panel controls */}
          <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Cipher Settings</span>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Cipher Algorithm</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'vigenere', name: 'Vigenère Polyalphabetic' },
                  { id: 'rot13', name: 'ROT13 Substitution' },
                  { id: 'binary', name: 'Raw Binary Bit-shift' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCipherType(c.id as any); playSound('click'); }}
                    className={`py-2.5 px-3 rounded-xl text-left text-xs font-bold border transition-all ${cipherType === c.id ? 'bg-sky-600 border-sky-400 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Direction</label>
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850">
                <button 
                  onClick={() => { setCipherMode('encrypt'); playSound('click'); }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${cipherMode === 'encrypt' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  Encrypt
                </button>
                <button 
                  onClick={() => { setCipherMode('decrypt'); playSound('click'); }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${cipherMode === 'decrypt' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  Decrypt
                </button>
              </div>
            </div>

            {cipherType === 'vigenere' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Vigenère Secret Key</label>
                <input 
                  type="text" 
                  value={cipherKey} 
                  onChange={(e) => setCipherKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3 py-2 text-xs font-bold text-sky-400"
                />
              </div>
            )}
          </div>

          {/* Right Workspace and Output */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Plaintext / Ciphertext Input</label>
              <textarea 
                rows={3}
                value={cipherInput} 
                onChange={(e) => setCipherInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 outline-none rounded-xl px-3 py-2 text-xs font-mono text-slate-200 resize-none uppercase"
              />
            </div>

            <button
              onClick={executeCipher}
              className="py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-500/10 active:scale-97"
            >
              Process Cipher Translation
            </button>

            {cipherOutput && (
              <div className="space-y-2 pt-4 border-t border-slate-900">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Cipher Suite Output</span>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-sm font-mono text-white select-all leading-relaxed break-all">
                  {cipherOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================================================
// 2. VIRTUAL JS SANDBOX & BENCHMARK CORE
// ==================================================
export function JSSandboxApp() {
  const [code, setCode] = useState(`// Welcome to Virtual JS Sandbox
// Write secure JS. Try running some math or loops!

const fib = (n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

console.log("Starting recursion benchmark...");
const start = performance.now();
const res = fib(18);
const duration = performance.now() - start;

console.log("Fibonacci(18) result:", res);
console.log("Execution speed:", duration.toFixed(3) + " ms");`);

  const [consoleLogs, setConsoleLogs] = useState<string[]>(['System Ready. Run code to benchmark.']);

  const executeSandboxCode = () => {
    const logs: string[] = [];
    
    // Custom simulated console override
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
      },
      error: (...args: any[]) => {
        logs.push('❌ Error: ' + args.join(' '));
      }
    };

    try {
      // Evaluate within an isolated context with console override
      const runFn = new Function('console', 'performance', code);
      runFn(customConsole, performance);
      
      setConsoleLogs(logs.length ? logs : ['Code executed successfully, but yielded no console.log statements.']);
      playSound('success');
    } catch (err: any) {
      setConsoleLogs([...logs, `❌ Runtime Crash: ${err.message}`]);
      playSound('error');
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white rounded-b-lg flex flex-col select-none overflow-hidden">
      {/* Upper editor and control toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider">Isolated JavaScript Engine</h2>
        </div>
        <button
          onClick={executeSandboxCode}
          className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" /> Compile & Run
        </button>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-text">
        {/* Code editor pane */}
        <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-850 flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-slate-950 text-slate-300 font-mono text-xs p-5 outline-none resize-none leading-relaxed overflow-y-auto"
            spellCheck={false}
          />
          <div className="absolute bottom-3 right-3 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest pointer-events-none">
            Vanilla ES6 Sandbox
          </div>
        </div>

        {/* Console logs pane */}
        <div className="w-full md:w-80 bg-slate-950 p-5 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 text-slate-400 border-b border-slate-900 pb-2 mb-3 shrink-0">
            <TerminalSquare className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Isolated System Console</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10.5px] text-slate-300 space-y-2 leading-relaxed">
            {consoleLogs.map((log, idx) => {
              const isErr = log.includes('❌');
              return (
                <div key={idx} className={`p-2 rounded-lg ${isErr ? 'bg-red-950/20 text-red-400 border border-red-900/20' : 'bg-slate-900/40 border border-slate-900 text-indigo-300'}`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
