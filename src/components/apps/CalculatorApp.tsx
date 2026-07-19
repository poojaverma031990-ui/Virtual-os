import { useState } from 'react';
import { playSound } from '../../lib/sounds';
import { RefreshCw, History } from 'lucide-react';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [newNumber, setNewNumber] = useState(true);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNum = (num: string) => {
    playSound('click');
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    playSound('click');
    setEquation(display + ' ' + op + ' ');
    setNewNumber(true);
  };

  const calculate = () => {
    playSound('click');
    try {
      const sanitized = (equation + display).replace(/[^-()\d/*+.]/g, '');
      const result = new Function('return ' + sanitized)();
      const finalResult = String(Number(result).toFixed(6).replace(/\.?0+$/, '')); // trim trailing zeros
      
      const record = `${equation}${display} = ${finalResult}`;
      setCalcHistory(prev => [record, ...prev].slice(0, 20)); // keep last 20
      
      setDisplay(finalResult);
      setEquation('');
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      playSound('error');
    }
  };

  const handleScientific = (type: string) => {
    playSound('click');
    try {
      const val = parseFloat(display);
      let result = 0;
      switch (type) {
        case 'sin': result = Math.sin((val * Math.PI) / 180); break;
        case 'cos': result = Math.cos((val * Math.PI) / 180); break;
        case 'tan': result = Math.tan((val * Math.PI) / 180); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'sqr': result = val * val; break;
        case 'pi': result = Math.PI; break;
        case 'e': result = Math.E; break;
      }
      const finalResult = String(Number(result.toFixed(8)).toString());
      setCalcHistory(prev => [`${type}(${display}) = ${finalResult}`, ...prev]);
      setDisplay(finalResult);
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      playSound('error');
    }
  };

  const clear = () => {
    playSound('click');
    setDisplay('0');
    setEquation('');
    setNewNumber(true);
  };

  const backspace = () => {
    playSound('click');
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col md:flex-row font-sans select-none overflow-y-auto">
      {/* History Sidebar */}
      {showHistory && (
        <div className="w-full md:w-56 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col shrink-0 h-40 md:h-full">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Formula History</span>
            <button onClick={() => setCalcHistory([])} className="text-red-400 hover:text-red-300">Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {calcHistory.map((h, i) => (
              <div 
                key={i} 
                onClick={() => {
                  playSound('click');
                  const parts = h.split(' = ');
                  if (parts[1]) {
                    setDisplay(parts[1]);
                    setNewNumber(true);
                  }
                }}
                className="text-[11px] font-mono bg-black/30 p-2 rounded-lg border border-slate-800 hover:border-fuchsia-500/50 cursor-pointer text-slate-300 truncate transition-colors"
                title={h}
              >
                {h}
              </div>
            ))}
            {calcHistory.length === 0 && (
              <div className="text-slate-600 italic text-center text-[10px] mt-4">Empty logs</div>
            )}
          </div>
        </div>
      )}

      {/* Calculator Body */}
      <div className="flex-1 flex flex-col p-5 max-w-lg mx-auto w-full">
        {/* Header Options */}
        <div className="flex justify-between items-center mb-4 px-1">
          <button 
            onClick={() => { playSound('click'); setShowHistory(!showHistory); }}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${showHistory ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
          >
            <History className="w-4 h-4" /> {showHistory ? 'Hide History' : 'History'}
          </button>
          <span className="text-[10px] text-slate-500 tracking-wider font-mono uppercase bg-slate-900 px-2 py-1 rounded-md">VibeCalc Pro</span>
        </div>

        {/* Display Screen */}
        <div className="h-24 bg-black/40 rounded-2xl mb-5 p-5 flex flex-col items-end justify-end shadow-inner overflow-hidden border border-slate-800">
          <div className="text-slate-500 font-mono text-xs tracking-wide truncate max-w-full">{equation}</div>
          <div className="text-4xl font-light tracking-tight truncate w-full text-right font-mono mt-1">{display}</div>
        </div>

        {/* Keyboard Layout */}
        <div className="grid grid-cols-5 gap-2 flex-1">
          {/* Scientific Row */}
          <button onClick={() => handleScientific('sin')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">sin</button>
          <button onClick={() => handleScientific('cos')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">cos</button>
          <button onClick={() => handleScientific('tan')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">tan</button>
          <button onClick={() => handleScientific('sqr')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">x²</button>
          <button onClick={backspace} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all">DEL</button>

          <button onClick={() => handleScientific('sqrt')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">√x</button>
          <button onClick={() => handleScientific('log')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">log</button>
          <button onClick={() => handleScientific('ln')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">ln</button>
          <button onClick={() => handleScientific('pi')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">π</button>
          <button onClick={() => handleScientific('e')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-all">e</button>

          {/* Standard Row 1 */}
          <button onClick={clear} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-red-400 rounded-xl transition-all">AC</button>
          <button onClick={() => setDisplay(String(-parseFloat(display)))} className="bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl transition-all">+/-</button>
          <button onClick={() => handleOp('%')} className="bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl transition-all">%</button>
          <button onClick={() => handleOp('/')} className="bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/40 font-bold text-lg rounded-xl transition-all">÷</button>

          {/* Row 2 */}
          <button onClick={() => handleNum('7')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">7</button>
          <button onClick={() => handleNum('8')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">8</button>
          <button onClick={() => handleNum('9')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">9</button>
          <button onClick={() => handleOp('*')} className="col-span-2 bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/40 font-bold text-lg rounded-xl transition-all">×</button>

          {/* Row 3 */}
          <button onClick={() => handleNum('4')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">4</button>
          <button onClick={() => handleNum('5')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">5</button>
          <button onClick={() => handleNum('6')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">6</button>
          <button onClick={() => handleOp('-')} className="col-span-2 bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/40 font-bold text-lg rounded-xl transition-all">-</button>

          {/* Row 4 */}
          <button onClick={() => handleNum('1')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">1</button>
          <button onClick={() => handleNum('2')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">2</button>
          <button onClick={() => handleNum('3')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">3</button>
          <button onClick={() => handleOp('+')} className="col-span-2 bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/40 font-bold text-lg rounded-xl transition-all">+</button>

          {/* Row 5 */}
          <button onClick={() => handleNum('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">0</button>
          <button onClick={() => handleNum('.')} className="bg-slate-800 hover:bg-slate-700 font-medium text-lg rounded-xl transition-all">.</button>
          <button onClick={calculate} className="col-span-2 bg-fuchsia-600 hover:bg-fuchsia-500 font-bold text-xl rounded-xl shadow-lg shadow-fuchsia-600/20 transition-all">=</button>
        </div>
      </div>
    </div>
  );
}
