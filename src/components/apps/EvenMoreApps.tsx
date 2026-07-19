import React, { useState, useEffect } from 'react';
import { Send, Settings2, Play, Pause, Square, Power, ChevronRight, Hash, Code, Layout, Database, Volume2, Cpu, User, RefreshCw, Terminal } from 'lucide-react';
import { playSound } from '../../lib/sounds';

export function ChatApp() {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! I am the virtual assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That's very interesting. Tell me more.",
        "I am currently a simulated AI in a virtual OS.",
        "Computing...",
        "I understand. Have you considered turning it off and on again?",
        "As an AI, I don't have personal feelings, but I'm here to help!",
      ];
      setMessages(prev => [...prev, { role: 'bot', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-sans">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SynthApp() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const audioCtx = React.useRef<AudioContext | null>(null);
  const oscillators = React.useRef<{ [key: number]: OscillatorNode }>({});

  const playNote = (index: number) => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    
    // frequencies for a scale (C major pentatonic style for fun)
    const baseFreq = 261.63; // C4
    const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
    const freq = baseFreq * Math.pow(2, scale[index] / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    
    oscillators.current[index] = osc;

    setActiveNotes(prev => new Set(prev).add(index));
  };

  const stopNote = (index: number) => {
    if (oscillators.current[index]) {
      try {
        oscillators.current[index].stop();
      } catch (e) {}
      delete oscillators.current[index];
    }
    setActiveNotes(prev => { const n = new Set(prev); n.delete(index); return n; });
  };
  
  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col p-6 text-slate-300 font-mono select-none">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold tracking-widest text-fuchsia-400">VIRTUAL SYNTH V1</h2>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5 shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 relative mb-3 group cursor-pointer">
              <div className="absolute top-1/2 left-1/2 w-1 h-8 bg-white origin-bottom -translate-x-1/2 -translate-y-full transition-transform group-hover:rotate-45" />
            </div>
            <span className="text-[10px] text-slate-500">OSC {i}</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-8 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            onPointerDown={() => playNote(i)}
            onPointerUp={() => stopNote(i)}
            onPointerLeave={() => stopNote(i)}
            className={`rounded-b-lg border-x border-b border-black transition-colors cursor-pointer ${activeNotes.has(i) ? 'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-[#e0e0e0] hover:bg-[#d0d0d0]'}`}
            style={{ height: i % 2 === 0 ? '100%' : '60%', transform: i % 2 === 0 ? 'none' : 'translateY(0)', marginTop: i % 2 !== 0 ? '0' : '0' }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChessApp() {
  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<{ r: number, c: number } | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [gameMode, setGameMode] = useState<'vs_ai' | 'pass_play'>('vs_ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('Play your move!');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const getPiece = (p: string) => {
    switch (p) {
      case 'r': return '♜'; case 'n': return '♞'; case 'b': return '♝'; case 'q': return '♛'; case 'k': return '♚'; case 'p': return '♟';
      case 'R': return '♖'; case 'N': return '♘'; case 'B': return '♗'; case 'Q': return '♕'; case 'K': return '♔'; case 'P': return '♙';
      default: return '';
    }
  };

  const getPieceValue = (p: string): number => {
    switch (p.toLowerCase()) {
      case 'p': return 10;
      case 'n': return 30;
      case 'b': return 30;
      case 'r': return 50;
      case 'q': return 90;
      case 'k': return 900;
      default: return 0;
    }
  };

  // True chess logic checking
  const checkMoveLegality = (fromR: number, fromC: number, toR: number, toC: number, currentBoard: string[][]): boolean => {
    const p = currentBoard[fromR][fromC];
    if (!p) return false;
    const isW = p === p.toUpperCase();
    const dest = currentBoard[toR][toC];

    // Cannot capture own piece
    if (dest) {
      const isDestW = dest === dest.toUpperCase();
      if (isW === isDestW) return false;
    }

    const dr = toR - fromR;
    const dc = toC - fromC;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    const pieceType = p.toLowerCase();

    if (pieceType === 'p') {
      const dir = isW ? -1 : 1;
      const startRow = isW ? 6 : 1;
      // Single push
      if (dc === 0 && dr === dir && !dest) return true;
      // Double push
      if (dc === 0 && fromR === startRow && dr === 2 * dir && !currentBoard[fromR + dir][fromC] && !dest) return true;
      // Diag capture
      if (absDc === 1 && dr === dir && dest) return true;
      return false;
    }

    if (pieceType === 'r') {
      if (dr !== 0 && dc !== 0) return false;
      const stepR = dr === 0 ? 0 : dr / absDr;
      const stepC = dc === 0 ? 0 : dc / absDc;
      let currR = fromR + stepR;
      let currC = fromC + stepC;
      while (currR !== toR || currC !== toC) {
        if (currentBoard[currR][currC]) return false;
        currR += stepR;
        currC += stepC;
      }
      return true;
    }

    if (pieceType === 'n') {
      return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
    }

    if (pieceType === 'b') {
      if (absDr !== absDc) return false;
      const stepR = dr / absDr;
      const stepC = dc / absDc;
      let currR = fromR + stepR;
      let currC = fromC + stepC;
      while (currR !== toR || currC !== toC) {
        if (currentBoard[currR][currC]) return false;
        currR += stepR;
        currC += stepC;
      }
      return true;
    }

    if (pieceType === 'q') {
      if (absDr !== absDc && dr !== 0 && dc !== 0) return false;
      const stepR = dr === 0 ? 0 : dr / absDr;
      const stepC = dc === 0 ? 0 : dc / absDc;
      let currR = fromR + stepR;
      let currC = fromC + stepC;
      while (currR !== toR || currC !== toC) {
        if (currentBoard[currR][currC]) return false;
        currR += stepR;
        currC += stepC;
      }
      return true;
    }

    if (pieceType === 'k') {
      return absDr <= 1 && absDc <= 1;
    }

    return false;
  };

  // Find all legal moves for a player side
  const getAllLegalMoves = (player: 'w' | 'b', currentBoard: string[][]) => {
    const moves: { fromR: number, fromC: number, toR: number, toC: number, weight: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (!p) continue;
        const isW = p === p.toUpperCase();
        if ((player === 'w' && !isW) || (player === 'b' && isW)) continue;

        // check all potential landing spots on the board
        for (let targetR = 0; targetR < 8; targetR++) {
          for (let targetC = 0; targetC < 8; targetC++) {
            if (checkMoveLegality(r, c, targetR, targetC, currentBoard)) {
              const targetPiece = currentBoard[targetR][targetC];
              let weight = targetPiece ? getPieceValue(targetPiece) : 0;
              
              // positional minor bonus weight
              if (p.toLowerCase() === 'p') {
                weight += (player === 'b' ? targetR : 7 - targetR) * 0.1; // encourage advancing pawns
              }
              moves.push({ fromR: r, fromC: c, toR: targetR, toC: targetC, weight });
            }
          }
        }
      }
    }
    return moves;
  };

  const getAlgebraicNotation = (piece: string, fromR: number, fromC: number, toR: number, toC: number, capture: boolean) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const pStr = piece.toLowerCase() === 'p' ? '' : piece.toUpperCase();
    return `${pStr}${capture ? 'x' : ''}${files[toC]}${ranks[toR]}`;
  };

  // Perform Chess move
  const executeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const p = board[fromR][fromC];
    const target = board[toR][toC];

    if (target) {
      playSound('capture');
      if (target === target.toUpperCase()) {
        setCapturedWhite(prev => [...prev, target]);
      } else {
        setCapturedBlack(prev => [...prev, target]);
      }
    } else {
      playSound('move');
    }

    const nextBoard = board.map(row => [...row]);
    nextBoard[toR][toC] = p;
    nextBoard[fromR][fromC] = '';

    const moveNotation = getAlgebraicNotation(p, fromR, fromC, toR, toC, !!target);
    setMoveHistory(prev => [...prev, moveNotation]);
    setBoard(nextBoard);
    setSelected(null);

    const nextTurn = turn === 'w' ? 'b' : 'w';
    setTurn(nextTurn);
    setGameStatus(nextTurn === 'w' ? "Your Turn (White)" : "Black's Turn");
  };

  const handleSquareClick = (r: number, c: number) => {
    if (isAiThinking) return;

    const piece = board[r][c];
    const isW = piece && piece === piece.toUpperCase();

    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
        return;
      }

      const selectedPiece = board[selected.r][selected.c];
      const isSelectedW = selectedPiece === selectedPiece.toUpperCase();

      if (isSelectedW === isW && piece) {
        // Change selection to another own piece
        if ((turn === 'w' && isW) || (turn === 'b' && !isW)) {
          setSelected({ r, c });
        }
        return;
      }

      // Check if clicked square is legal target
      if (checkMoveLegality(selected.r, selected.c, r, c, board)) {
        executeMove(selected.r, selected.c, r, c);
      } else {
        playSound('error');
      }
    } else {
      // First select piece
      if (piece) {
        if ((turn === 'w' && isW) || (turn === 'b' && !isW)) {
          setSelected({ r, c });
        }
      }
    }
  };

  // AI Core engine turn simulator
  useEffect(() => {
    if (gameMode === 'vs_ai' && turn === 'b' && !isAiThinking) {
      const legalMoves = getAllLegalMoves('b', board);
      if (legalMoves.length === 0) {
        setGameStatus('Checkmate! White wins! 🏆');
        playSound('success');
        return;
      }

      setIsAiThinking(true);
      setGameStatus('AI is analyzing board...');

      setTimeout(() => {
        let selectedMove = legalMoves[0];

        if (difficulty === 'easy') {
          // Mostly random moves
          selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        } else if (difficulty === 'medium') {
          // Mix of random and greed
          legalMoves.sort((a, b) => b.weight - a.weight);
          const topMoves = legalMoves.slice(0, Math.min(3, legalMoves.length));
          selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        } else {
          // Smartest greedy minmax move
          legalMoves.sort((a, b) => b.weight - a.weight);
          selectedMove = legalMoves[0];
        }

        if (selectedMove) {
          executeMove(selectedMove.fromR, selectedMove.fromC, selectedMove.toR, selectedMove.toC);
        }
        setIsAiThinking(false);
      }, Math.random() * 500 + 400); // realistic think duration
    }
  }, [turn, gameMode]);

  const resetGame = () => {
    setBoard(initialBoard);
    setSelected(null);
    setTurn('w');
    setCapturedWhite([]);
    setCapturedBlack([]);
    setMoveHistory([]);
    setGameStatus('New game started. Your move (White)!');
    playSound('success');
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row font-sans overflow-y-auto">
      {/* Settings Panel left */}
      <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">VibeChess Engine</h3>
          </div>

          <div className="space-y-4">
            {/* Game Mode */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Game Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setGameMode('vs_ai'); resetGame(); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${gameMode === 'vs_ai' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Cpu className="w-3.5 h-3.5" /> VS AI
                </button>
                <button
                  onClick={() => { setGameMode('pass_play'); resetGame(); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${gameMode === 'pass_play' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <User className="w-3.5 h-3.5" /> 2 Player
                </button>
              </div>
            </div>

            {/* Difficulty */}
            {gameMode === 'vs_ai' && (
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">AI Strength</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-1 rounded text-[10px] font-bold uppercase transition-colors ${difficulty === diff ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Captured Black Tray */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Captured Black</label>
              <div className="flex flex-wrap gap-1 bg-slate-950/60 p-2 rounded-lg min-h-[2.5rem] border border-slate-800 text-black">
                {capturedBlack.map((p, i) => (
                  <span key={i} className="text-xl bg-white/10 px-1 rounded">{getPiece(p)}</span>
                ))}
              </div>
            </div>

            {/* Captured White Tray */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Captured White</label>
              <div className="flex flex-wrap gap-1 bg-slate-950/60 p-2 rounded-lg min-h-[2.5rem] border border-slate-800 text-white">
                {capturedWhite.map((p, i) => (
                  <span key={i} className="text-xl bg-white/5 px-1 rounded">{getPiece(p)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="mt-4 md:mt-0 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restart Match
        </button>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-w-0">
        {/* Status bar */}
        <div className="mb-3 flex items-center justify-between w-full max-w-md bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${turn === 'w' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]'}`} />
            {gameStatus}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {gameMode === 'vs_ai' ? `Engine : ${difficulty}` : 'Pass & Play'}
          </span>
        </div>

        {/* The Chessboard Grid */}
        <div className="aspect-square w-full max-w-md bg-slate-950 border-4 border-slate-800 shadow-[0_15px_50px_rgba(0,0,0,0.8)] rounded-2xl grid grid-rows-8 grid-cols-8 overflow-hidden select-none">
          {board.map((row, r) => row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0;
            const isSelected = selected?.r === r && selected?.c === c;
            const isTargetLegal = selected && checkMoveLegality(selected.r, selected.c, r, c, board);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`flex items-center justify-center text-3.5xl sm:text-4xl transition-all cursor-pointer relative h-full w-full
                  ${isSelected ? 'bg-violet-500/30 ring-2 ring-violet-500 ring-inset' : isLight ? 'bg-slate-800/80 hover:bg-slate-700/80' : 'bg-slate-900 hover:bg-slate-800'}
                `}
              >
                {/* Visual legal move dot */}
                {isTargetLegal && (
                  <div className={`absolute w-3 h-3 rounded-full ${board[r][c] ? 'border-2 border-red-500/80 w-8 h-8' : 'bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                )}

                {/* The Piece itself */}
                {piece && (
                  <span className={`transition-transform duration-200 hover:scale-115 active:scale-95 ${piece === piece.toUpperCase() ? 'text-slate-100 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]' : 'text-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
                    {getPiece(piece)}
                  </span>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Move history log right */}
      <div className="w-full md:w-48 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/50 p-4 flex flex-col shrink-0 overflow-y-auto h-40 md:h-full">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Game Notation</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 text-[9px]">{moveHistory.length} moves</span>
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 pr-1 scrollbar-thin">
          {moveHistory.reduce((acc, move, idx) => {
            if (idx % 2 === 0) {
              acc.push({ white: move, black: '' });
            } else {
              acc[acc.length - 1].black = move;
            }
            return acc;
          }, [] as { white: string, black: string }[]).map((turnRow, i) => (
            <div key={i} className="flex justify-between py-0.5 border-b border-slate-800/40">
              <span className="text-slate-500 w-8">{i + 1}.</span>
              <span className="text-slate-200 flex-1">{turnRow.white}</span>
              <span className="text-slate-400 flex-1">{turnRow.black || '...'}</span>
            </div>
          ))}
          {moveHistory.length === 0 && (
            <div className="text-slate-600 italic text-[11px] text-center mt-6">No moves played yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DJMixerApp() {
  const [deck1Playing, setDeck1Playing] = useState(false);
  const [deck2Playing, setDeck2Playing] = useState(false);
  const [bpm, setBpm] = useState(128);
  const [crossfader, setCrossfader] = useState(50); // 0 (Left) to 100 (Right)
  const [deck1Vol, setDeck1Vol] = useState(80);
  const [deck2Vol, setDeck2Vol] = useState(80);
  const [deck1Filter, setDeck1Filter] = useState(100); // 0 (Muffled) to 100 (Full)
  const [deck2Filter, setDeck2Filter] = useState(100);
  const [scratching1, setScratching1] = useState(false);
  const [scratching2, setScratching2] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const engineRef = React.useRef<{
    deck1Gain: GainNode | null;
    deck2Gain: GainNode | null;
    deck1FilterNode: BiquadFilterNode | null;
    deck2FilterNode: BiquadFilterNode | null;
  }>({
    deck1Gain: null,
    deck2Gain: null,
    deck1FilterNode: null,
    deck2FilterNode: null,
  });

  const stepRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);

  // Initialize Web Audio API nodes
  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Create Filters
    const f1 = ctx.createBiquadFilter();
    f1.type = 'lowpass';
    f1.frequency.setValueAtTime(20000, ctx.currentTime);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'lowpass';
    f2.frequency.setValueAtTime(20000, ctx.currentTime);

    // Create Gains
    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    g1.gain.setValueAtTime(0.4, ctx.currentTime);
    g2.gain.setValueAtTime(0.4, ctx.currentTime);

    // Connections
    f1.connect(g1);
    f2.connect(g2);
    g1.connect(ctx.destination);
    g2.connect(ctx.destination);

    engineRef.current = {
      deck1Gain: g1,
      deck2Gain: g2,
      deck1FilterNode: f1,
      deck2FilterNode: f2,
    };

    return ctx;
  };

  // Adjust volumes & filters when state changes
  useEffect(() => {
    const g1 = engineRef.current.deck1Gain;
    const g2 = engineRef.current.deck2Gain;
    const f1 = engineRef.current.deck1FilterNode;
    const f2 = engineRef.current.deck2FilterNode;

    const leftMix = crossfader <= 50 ? 1 : (100 - crossfader) / 50;
    const rightMix = crossfader >= 50 ? 1 : crossfader / 50;

    if (g1) g1.gain.setValueAtTime((deck1Vol / 100) * leftMix * 0.4, audioCtxRef.current?.currentTime || 0);
    if (g2) g2.gain.setValueAtTime((deck2Vol / 100) * rightMix * 0.4, audioCtxRef.current?.currentTime || 0);

    if (f1) {
      // Exponential curve for filter cutoff frequency
      const freq = 100 + (Math.pow(deck1Filter / 100, 2) * 19900);
      f1.frequency.setValueAtTime(freq, audioCtxRef.current?.currentTime || 0);
    }
    if (f2) {
      const freq = 100 + (Math.pow(deck2Filter / 100, 2) * 19900);
      f2.frequency.setValueAtTime(freq, audioCtxRef.current?.currentTime || 0);
    }
  }, [crossfader, deck1Vol, deck2Vol, deck1Filter, deck2Filter]);

  // Synthesis helpers for sequencer steps
  const playSynthesizedSound = (deck: 1 | 2, type: 'kick' | 'hihat' | 'snare' | 'bass' | 'chime', freqArg?: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const dest = deck === 1 ? engineRef.current.deck1FilterNode : engineRef.current.deck2FilterNode;
    if (!dest) return;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(1.0, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'hihat') {
      // Noise source for ch-ch sound
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start();
    } else if (type === 'snare') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.connect(gain);
      gain.connect(dest);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);

      // Noise component
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start();
    } else if (type === 'bass') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const targetFreq = freqArg || 65.41; // C2
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

      osc.connect(gain);
      gain.connect(dest);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'chime') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const targetFreq = freqArg || 523.25; // C5
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

      osc.connect(gain);
      gain.connect(dest);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  // Run DJ Mixer Sequencer Tick
  const handleSequencerTick = () => {
    const currentStep = stepRef.current;
    
    // Deck 1 Synthesizer Sequencer Loops (Acid Techno)
    if (deck1Playing) {
      // Acid melody
      const melody = [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 98.00, 77.78]; // C2, C2, Eb2, C2, F2, C2, G2, Eb2
      const targetFreq = melody[currentStep % melody.length];

      // Kick drum Four-on-the-floor
      if (currentStep % 4 === 0) {
        playSynthesizedSound(1, 'kick');
      }
      // Offbeat hi-hats
      if (currentStep % 4 === 2) {
        playSynthesizedSound(1, 'hihat');
      }
      // Acid Bass step
      if (currentStep % 2 === 0) {
        playSynthesizedSound(1, 'bass', targetFreq);
      }
    }

    // Deck 2 Synthesizer Sequencer Loops (Chill Lofi Synthwave)
    if (deck2Playing) {
      // Snare on 4, 12
      if (currentStep % 8 === 4) {
        playSynthesizedSound(2, 'snare');
      }
      // Soft high hats on every odd beat
      if (currentStep % 2 !== 0) {
        playSynthesizedSound(2, 'hihat');
      }
      // Arpeggio chords
      const chimes = [261.63, 311.13, 392.00, 311.13, 293.66, 349.23, 440.00, 349.23]; // C4, Eb4, G4, Eb4, D4, F4, A4, F4
      const targetFreq = chimes[currentStep % chimes.length];
      if (currentStep % 2 === 0) {
        playSynthesizedSound(2, 'chime', targetFreq);
      }
    }

    setActiveStep(currentStep);
    stepRef.current = (currentStep + 1) % 16;
  };

  // Start/Stop interval timer
  useEffect(() => {
    if (deck1Playing || deck2Playing) {
      initAudio();
      const intervalMs = (60 / bpm / 4) * 1000; // 16th notes
      timerRef.current = window.setInterval(handleSequencerTick, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [deck1Playing, deck2Playing, bpm]);

  // Vinyl scratching trigger sound
  const playScratchSound = (deck: 1 | 2, speed: number) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const dest = deck === 1 ? engineRef.current.deck1FilterNode : engineRef.current.deck2FilterNode;
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300 * speed, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80 * speed, ctx.currentTime + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600 * speed, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  // Hotcue sound trigger buttons
  const triggerHotcue = (deck: 1 | 2, noteIndex: number) => {
    initAudio();
    const scale = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25, 659.25]; // C3 to E5
    if (noteIndex < 3) {
      playSynthesizedSound(deck, 'kick');
    } else if (noteIndex < 5) {
      playSynthesizedSound(deck, 'snare');
    } else if (noteIndex < 6) {
      playSynthesizedSound(deck, 'hihat');
    } else {
      playSynthesizedSound(deck, 'chime', scale[noteIndex]);
    }
    playSound('click');
  };

  return (
    <div className="h-full w-full bg-[#0a0a0d] p-4 text-white flex flex-col select-none font-sans rounded-b-lg">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center mb-4 px-4 py-3 bg-slate-900/80 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="font-mono text-fuchsia-500 font-black tracking-widest text-lg flex items-center gap-1.5 animate-pulse">
            <Volume2 className="w-5 h-5 text-fuchsia-400" /> PRO SYNTH DJ MIXER
          </div>
          <div className="text-[10px] text-slate-400 font-semibold tracking-wider">REALTIME WEB AUDIO SYNTHESIZER SEQUENCER</div>
        </div>
        
        <div className="flex items-center gap-5">
          {/* Step Sequencer Lights */}
          <div className="flex gap-1 bg-black/60 p-1.5 rounded-lg border border-slate-800">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeStep === i && (deck1Playing || deck2Playing)
                    ? 'bg-fuchsia-500 shadow-[0_0_8px_#ec4899] scale-125' 
                    : i % 4 === 0 
                      ? 'bg-slate-600' 
                      : 'bg-slate-800'
                }`} 
              />
            ))}
          </div>

          <div className="font-mono text-xs flex flex-col items-end shrink-0">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Beats Velocity</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-blue-400 font-black font-mono">{bpm} BPM</span>
              <input 
                type="range" 
                min="100" 
                max="180" 
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-16 accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* DUAL DECKS & MIXER MAIN CONTAINER */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-y-auto pr-1">
        
        {/* DECK 1 (LEFT TURNTABLE) */}
        <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-between relative shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
          <div className="text-[10px] font-black tracking-widest text-pink-500 uppercase self-start bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 mb-2">DECK A (ACID TECHNO)</div>
          
          {/* Vinyl Record */}
          <div 
            className={`w-36 h-36 rounded-full border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-2xl relative cursor-grab active:cursor-grabbing ${
              deck1Playing ? 'animate-[spin_4s_linear_infinite]' : ''
            } ${scratching1 ? 'ring-2 ring-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : ''}`}
            onMouseDown={() => { setScratching1(true); playScratchSound(1, 1.4); }}
            onMouseUp={() => setScratching1(false)}
            onMouseLeave={() => setScratching1(false)}
            onTouchStart={() => { setScratching1(true); playScratchSound(1, 1.4); }}
            onTouchEnd={() => setScratching1(false)}
          >
            {/* Vinyl grooved lines */}
            <div className="absolute inset-2 rounded-full border border-zinc-900 opacity-80" />
            <div className="absolute inset-5 rounded-full border border-zinc-900 opacity-80" />
            <div className="absolute inset-8 rounded-full border border-zinc-900 opacity-60" />
            <div className="absolute inset-12 rounded-full border border-zinc-900 opacity-40" />
            
            <div className="w-12 h-12 rounded-full bg-pink-500/20 border-4 border-zinc-900 flex items-center justify-center shadow-lg relative">
              <div className="w-3.5 h-3.5 bg-zinc-950 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            {/* Red tracking marker */}
            <div className="absolute top-2 left-1/2 w-1.5 h-4 bg-pink-500 rounded-full origin-bottom -translate-x-1/2 shadow-lg" />
          </div>

          {/* Controls Bottom A */}
          <div className="w-full flex justify-between items-center mt-4">
            <button 
              onClick={() => { setDeck1Playing(!deck1Playing); playSound('click'); }} 
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all transform active:scale-90 ${
                deck1Playing 
                  ? 'bg-pink-600 border-pink-500 text-white shadow-pink-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {deck1Playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* EQ Highpass/Lowpass Filter slider */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">LP Filter</span>
              <input 
                type="range"
                min="10"
                max="100"
                value={deck1Filter}
                onChange={(e) => setDeck1Filter(Number(e.target.value))}
                className="w-20 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            {/* Deck Volume Slider */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Volume</span>
              <input 
                type="range"
                min="0"
                max="100"
                value={deck1Vol}
                onChange={(e) => setDeck1Vol(Number(e.target.value))}
                className="w-20 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Cue Hot Pads */}
          <div className="grid grid-cols-4 gap-1.5 w-full mt-4 border-t border-slate-800/60 pt-3">
            {['Kick', 'Bass', 'Hat', 'Synth'].map((pad, idx) => (
              <button 
                key={pad}
                onClick={() => triggerHotcue(1, idx * 2)}
                className="py-1 rounded bg-slate-900 border border-slate-800 hover:border-pink-500 text-[10px] font-mono font-bold uppercase transition-all tracking-wider text-pink-400 hover:text-white hover:bg-pink-600/10"
              >
                {pad}
              </button>
            ))}
          </div>
        </div>
        
        {/* CENTER DJ MIXER COLUMN */}
        <div className="w-24 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-between py-4 shadow-xl shrink-0">
          <div className="text-[9px] font-black tracking-widest text-slate-500 text-center uppercase border-b border-slate-800 pb-1.5 w-full">Mixer EQ</div>
          
          {/* Vol VU meters left */}
          <div className="flex-1 w-full flex justify-around py-4">
            <div className="w-2 bg-black/60 rounded-full relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ height: deck1Playing ? `${deck1Vol * 0.7 + (activeStep % 4 === 0 ? 30 : 5)}%` : '0%' }}
              />
            </div>
            <div className="w-2 bg-black/60 rounded-full relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ height: deck2Playing ? `${deck2Vol * 0.7 + (activeStep % 2 !== 0 ? 25 : 5)}%` : '0%' }}
              />
            </div>
          </div>

          {/* Crossfader horizontal controller */}
          <div className="w-full space-y-1.5 mt-2">
            <div className="text-[8px] font-black tracking-widest text-slate-500 text-center uppercase">Crossfader</div>
            <div className="w-full h-8 bg-black rounded-lg relative border border-slate-800 overflow-hidden flex items-center px-1">
              <input 
                type="range"
                min="0"
                max="100"
                value={crossfader}
                onChange={(e) => setCrossfader(Number(e.target.value))}
                className="w-full accent-fuchsia-500 bg-transparent h-4 cursor-ew-resize opacity-80"
              />
            </div>
            <div className="flex justify-between font-mono text-[8px] text-slate-600 px-1">
              <span>Deck A</span>
              <span>Center</span>
              <span>Deck B</span>
            </div>
          </div>
        </div>
        
        {/* DECK 2 (RIGHT TURNTABLE) */}
        <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-between relative shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
          <div className="text-[10px] font-black tracking-widest text-cyan-500 uppercase self-start bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 mb-2">DECK B (LOFI CHILL)</div>
          
          {/* Vinyl Record */}
          <div 
            className={`w-36 h-36 rounded-full border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-2xl relative cursor-grab active:cursor-grabbing ${
              deck2Playing ? 'animate-[spin_4s_linear_infinite]' : ''
            } ${scratching2 ? 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''}`}
            onMouseDown={() => { setScratching2(true); playScratchSound(2, 1.4); }}
            onMouseUp={() => setScratching2(false)}
            onMouseLeave={() => setScratching2(false)}
            onTouchStart={() => { setScratching2(true); playScratchSound(2, 1.4); }}
            onTouchEnd={() => setScratching2(false)}
          >
            {/* Vinyl grooved lines */}
            <div className="absolute inset-2 rounded-full border border-zinc-900 opacity-80" />
            <div className="absolute inset-5 rounded-full border border-zinc-900 opacity-80" />
            <div className="absolute inset-8 rounded-full border border-zinc-900 opacity-60" />
            <div className="absolute inset-12 rounded-full border border-zinc-900 opacity-40" />
            
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-4 border-zinc-900 flex items-center justify-center shadow-lg relative">
              <div className="w-3.5 h-3.5 bg-zinc-950 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            {/* Blue tracking marker */}
            <div className="absolute top-2 left-1/2 w-1.5 h-4 bg-cyan-500 rounded-full origin-bottom -translate-x-1/2 shadow-lg" />
          </div>

          {/* Controls Bottom B */}
          <div className="w-full flex justify-between items-center mt-4">
            {/* Deck Volume Slider */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Volume</span>
              <input 
                type="range"
                min="0"
                max="100"
                value={deck2Vol}
                onChange={(e) => setDeck2Vol(Number(e.target.value))}
                className="w-20 accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            {/* EQ Filter Slider */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">LP Filter</span>
              <input 
                type="range"
                min="10"
                max="100"
                value={deck2Filter}
                onChange={(e) => setDeck2Filter(Number(e.target.value))}
                className="w-20 accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <button 
              onClick={() => { setDeck2Playing(!deck2Playing); playSound('click'); }} 
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all transform active:scale-90 ${
                deck2Playing 
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-cyan-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {deck2Playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          {/* Cue Hot Pads */}
          <div className="grid grid-cols-4 gap-1.5 w-full mt-4 border-t border-slate-800/60 pt-3">
            {['Kick', 'Snare', 'Hat', 'Chime'].map((pad, idx) => (
              <button 
                key={pad}
                onClick={() => triggerHotcue(2, idx * 2)}
                className="py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono font-bold uppercase transition-all tracking-wider text-cyan-400 hover:text-white hover:bg-cyan-600/10"
              >
                {pad}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export function CodeEditorApp() {
  const [code, setCode] = useState(`function calculateMatrix(x, y) {\n  const result = [];\n  for (let i = 0; i < x; i++) {\n    result.push(new Array(y).fill(0));\n  }\n  return result;\n}\n\n// Initialize system\nconsole.log("Matrix initialized:", calculateMatrix(4, 4));\nconsole.log("CyberOS Core: Node Active");`);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    const originalLog = console.log;
    const logs: string[] = [];
    
    // Simple mock console
    console.log = (...args) => {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    try {
      // Execute the code
      new Function(code)();
      setOutput(logs);
      playSound('success');
    } catch (err: any) {
      setOutput([`Error: ${err.message}`]);
      playSound('error');
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };
  
  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col md:flex-row text-[#d4d4d4] font-mono text-sm overflow-hidden font-sans">
      <div className="w-12 bg-[#252526] flex flex-col items-center py-4 gap-6 border-r border-[#333] shrink-0">
        <Code className="w-6 h-6 text-blue-400 cursor-pointer" />
        <Play onClick={runCode} className={`w-6 h-6 cursor-pointer transition-all ${isRunning ? 'text-green-500 animate-pulse' : 'text-slate-500 hover:text-green-400'}`} />
        <Terminal className="w-6 h-6 text-slate-500 hover:text-slate-300 cursor-pointer" />
      </div>
      
      <div className="w-48 bg-[#252526] border-r border-[#333] hidden lg:block shrink-0">
        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Explorer</div>
        <div className="px-4 py-1 text-slate-300 bg-[#37373d] flex items-center gap-2 cursor-pointer">
          <div className="w-3 h-3 text-yellow-400 font-bold text-[8px] flex items-center justify-center border border-yellow-400/30 rounded">JS</div> main.js
        </div>
        <div className="px-4 py-1 text-slate-400 hover:text-slate-300 flex items-center gap-2 cursor-pointer">
          <div className="w-3 h-3 text-blue-400 font-bold text-[8px] flex items-center justify-center border border-blue-400/30 rounded">TS</div> utils.ts
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex bg-[#2d2d2d] border-b border-[#1e1e1e] justify-between items-center pr-4">
          <div className="flex">
            <div className="px-4 py-2 bg-[#1e1e1e] text-yellow-400 border-t-2 border-yellow-500 flex items-center gap-2">
              main.js <span className="text-slate-500 text-[10px]">✕</span>
            </div>
          </div>
          <button 
            onClick={runCode}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold transition-all"
          >
            <Play className="w-3 h-3" /> RUN
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto outline-none flex relative bg-[#1e1e1e]">
            <div className="text-right text-slate-600 select-none pr-4 min-w-[2.5rem] border-r border-[#333] mr-4">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea 
              className="flex-1 bg-transparent resize-none outline-none text-[#9cdcfe] caret-white font-mono leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              wrap="off"
            />
          </div>

          {/* Console Panel */}
          <div className="h-1/3 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
            <div className="px-4 py-1 bg-[#252526] text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
              <span>Debug Console</span>
              <button onClick={() => setOutput([])} className="hover:text-white">Clear</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1">
              {output.map((line, i) => (
                <div key={i} className={line.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>
                  <span className="text-slate-600 mr-2">›</span>{line}
                </div>
              ))}
              {output.length === 0 && <div className="text-slate-600 italic">No output yet. Press RUN to execute code.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface SolitaireCard {
  id: string;
  suit: '♥' | '♦' | '♣' | '♠';
  value: number; // 1 (Ace) to 13 (King)
  isFaceUp: boolean;
}

export function SolitaireApp() {
  const [stock, setStock] = useState<SolitaireCard[]>([]);
  const [waste, setWaste] = useState<SolitaireCard[]>([]);
  const [foundations, setFoundations] = useState<SolitaireCard[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<SolitaireCard[][]>([[], [], [], [], [], [], []]);
  
  // Selection state
  // source: 'waste' | { type: 'tableau', colIndex: number, cardIndex: number }
  const [selected, setSelected] = useState<{
    source: 'waste' | { type: 'tableau'; colIndex: number; cardIndex: number };
  } | null>(null);

  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    playSound('success');
    const suits: ('♥' | '♦' | '♣' | '♠')[] = ['♥', '♦', '♣', '♠'];
    const newDeck: SolitaireCard[] = [];
    
    // Create deck
    suits.forEach(suit => {
      for (let value = 1; value <= 13; value++) {
        newDeck.push({
          id: `${suit}-${value}`,
          suit,
          value,
          isFaceUp: false
        });
      }
    });

    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Distribute to Tableau
    const newTableau: SolitaireCard[][] = Array.from({ length: 7 }, () => []);
    let deckIndex = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = col; row < 7; row++) {
        const card = newDeck[deckIndex++];
        if (row === col) {
          card.isFaceUp = true;
        }
        newTableau[row].push(card);
      }
    }

    // Set states
    setTableau(newTableau);
    setStock(newDeck.slice(deckIndex));
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelected(null);
    setScore(0);
    setMoves(0);
    setHasWon(false);
  };

  const getCardColor = (suit: '♥' | '♦' | '♣' | '♠') => {
    return (suit === '♥' || suit === '♦') ? 'red' : 'black';
  };

  const getCardLabel = (value: number) => {
    if (value === 1) return 'A';
    if (value === 11) return 'J';
    if (value === 12) return 'Q';
    if (value === 13) return 'K';
    return String(value);
  };

  // Stock click logic: Draw card or recycle waste
  const handleStockClick = () => {
    playSound('click');
    setSelected(null);
    if (stock.length === 0) {
      if (waste.length === 0) return;
      // Recycle waste to stock
      const recycled = [...waste].reverse().map(c => ({ ...c, isFaceUp: false }));
      setStock(recycled);
      setWaste([]);
      setMoves(m => m + 1);
    } else {
      const nextCard = { ...stock[stock.length - 1], isFaceUp: true };
      setWaste(prev => [...prev, nextCard]);
      setStock(prev => prev.slice(0, -1));
      setMoves(m => m + 1);
    }
  };

  // Card select/move handler
  const handleCardClick = (clickedCard: SolitaireCard, context: 'waste' | { colIndex: number; cardIndex: number }) => {
    playSound('click');
    
    // If no card selected yet, try to select
    if (!selected) {
      if (context === 'waste') {
        setSelected({ source: 'waste' });
      } else {
        const { colIndex, cardIndex } = context;
        // Only select if card is face up
        if (tableau[colIndex][cardIndex].isFaceUp) {
          setSelected({ source: { type: 'tableau', colIndex, cardIndex } });
        }
      }
      return;
    }

    // If already selected, try to move to clicked tableau pile
    if (context !== 'waste') {
      const { colIndex } = context;
      executeTableauMove(colIndex);
    } else {
      // Re-select waste
      setSelected({ source: 'waste' });
    }
  };

  const executeTableauMove = (destColIndex: number) => {
    if (!selected) return;

    // Get cards being moved
    let movingCards: SolitaireCard[] = [];
    if (selected.source === 'waste') {
      if (waste.length > 0) {
        movingCards = [waste[waste.length - 1]];
      }
    } else {
      const { colIndex, cardIndex } = selected.source;
      movingCards = tableau[colIndex].slice(cardIndex);
    }

    if (movingCards.length === 0) return;

    const firstMoving = movingCards[0];
    const destPile = tableau[destColIndex];
    const targetCard = destPile.length > 0 ? destPile[destPile.length - 1] : null;

    let isValid = false;
    if (!targetCard) {
      // Empty column can only receive a King (value 13)
      if (firstMoving.value === 13) {
        isValid = true;
      }
    } else {
      // Destination card must be opposite color and 1 rank higher
      const oppositeColor = getCardColor(firstMoving.suit) !== getCardColor(targetCard.suit);
      const rankValid = targetCard.value === firstMoving.value + 1;
      if (oppositeColor && rankValid) {
        isValid = true;
      }
    }

    if (isValid) {
      playSound('success');
      // Apply move
      const updatedTableau = tableau.map((col, idx) => {
        if (selected.source !== 'waste' && idx === selected.source.colIndex) {
          // Remove moving cards
          const nextCol = col.slice(0, selected.source.cardIndex);
          // Auto reveal the new top card
          if (nextCol.length > 0 && !nextCol[nextCol.length - 1].isFaceUp) {
            nextCol[nextCol.length - 1].isFaceUp = true;
            setScore(s => s + 5);
          }
          return nextCol;
        }
        return col;
      });

      // Add to destination
      updatedTableau[destColIndex] = [...updatedTableau[destColIndex], ...movingCards];

      if (selected.source === 'waste') {
        setWaste(prev => prev.slice(0, -1));
      }

      setTableau(updatedTableau);
      setScore(s => s + 10);
      setMoves(m => m + 1);
    } else {
      playSound('error');
    }

    setSelected(null);
  };

  // Click on empty Tableau spot
  const handleEmptyTableauClick = (colIndex: number) => {
    executeTableauMove(colIndex);
  };

  // Click on foundation to stack
  const handleFoundationClick = (fIdx: number) => {
    if (!selected) return;

    let cardToMove: SolitaireCard | null = null;
    if (selected.source === 'waste') {
      if (waste.length > 0) cardToMove = waste[waste.length - 1];
    } else {
      const { colIndex, cardIndex } = selected.source;
      // Can only stack single card on foundation (the top one of the tableau column)
      if (cardIndex === tableau[colIndex].length - 1) {
        cardToMove = tableau[colIndex][cardIndex];
      }
    }

    if (!cardToMove) {
      playSound('error');
      setSelected(null);
      return;
    }

    const currentFoundation = foundations[fIdx];
    let isValid = false;

    if (currentFoundation.length === 0) {
      // Must be an Ace (value 1) to start a foundation
      if (cardToMove.value === 1) {
        isValid = true;
      }
    } else {
      const topCard = currentFoundation[currentFoundation.length - 1];
      // Must match suit and be exactly 1 rank higher
      if (cardToMove.suit === topCard.suit && cardToMove.value === topCard.value + 1) {
        isValid = true;
      }
    }

    if (isValid) {
      playSound('success');
      // Execute Move
      const updatedFoundations = foundations.map((f, idx) => {
        if (idx === fIdx) return [...f, cardToMove!];
        return f;
      });

      if (selected.source === 'waste') {
        setWaste(prev => prev.slice(0, -1));
      } else {
        const { colIndex } = selected.source;
        const updatedTableau = tableau.map((col, idx) => {
          if (idx === colIndex) {
            const nextCol = col.slice(0, -1);
            if (nextCol.length > 0 && !nextCol[nextCol.length - 1].isFaceUp) {
              nextCol[nextCol.length - 1].isFaceUp = true;
              setScore(s => s + 5);
            }
            return nextCol;
          }
          return col;
        });
        setTableau(updatedTableau);
      }

      setFoundations(updatedFoundations);
      setScore(s => s + 20);
      setMoves(m => m + 1);

      // Check win condition (all foundations have 13 cards)
      const totalCardsInFoundations = updatedFoundations.reduce((sum, f) => sum + f.length, 0);
      if (totalCardsInFoundations === 52) {
        setHasWon(true);
        playSound('success');
      }
    } else {
      playSound('error');
    }

    setSelected(null);
  };

  return (
    <div className="h-full w-full bg-[#005f24] p-4 font-sans relative select-none overflow-y-auto" onClick={() => setSelected(null)}>
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-white text-base tracking-wider italic">VIBESOLITAIRE PRO</span>
          <button 
            onClick={(e) => { e.stopPropagation(); startNewGame(); }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors font-semibold"
          >
            New Game
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-white text-xs font-mono">
          <div>Moves: <span className="font-bold text-yellow-300">{moves}</span></div>
          <div>Score: <span className="font-bold text-yellow-300">{score}</span></div>
        </div>
      </div>

      {hasWon && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
          <div className="text-4xl font-extrabold text-yellow-400 mb-4 animate-bounce">🏆 YOU WON! 🏆</div>
          <p className="text-sm text-slate-300 mb-6">Total Score: {score} | Moves: {moves}</p>
          <button 
            onClick={startNewGame}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-full shadow-lg hover:shadow-yellow-500/20 transition-all text-sm"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Main playing field */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-3 mb-6">
        {/* Stock Pile */}
        <div className="flex flex-col items-center">
          <div 
            onClick={(e) => { e.stopPropagation(); handleStockClick(); }}
            className={`w-full max-w-[70px] aspect-[2/3] rounded-lg shadow-md border-2 cursor-pointer flex items-center justify-center transition-all ${stock.length > 0 ? 'bg-gradient-to-br from-indigo-700 to-blue-900 border-indigo-400/80 hover:border-white' : 'border-white/10 bg-black/10'}`}
          >
            {stock.length > 0 ? (
              <div className="w-4 h-6 border border-white/20 rounded-sm bg-indigo-800/50" />
            ) : (
              <RefreshCw className="w-5 h-5 text-white/20" />
            )}
          </div>
          <span className="text-[9px] text-white/40 font-mono mt-1">Stock ({stock.length})</span>
        </div>

        {/* Waste Pile */}
        <div className="flex flex-col items-center">
          <div 
            className="w-full max-w-[70px] aspect-[2/3] rounded-lg border border-white/10 bg-black/10 relative"
          >
            {waste.length > 0 && (
              <div 
                onClick={(e) => { e.stopPropagation(); handleCardClick(waste[waste.length - 1], 'waste'); }}
                className={`w-full h-full rounded-lg bg-white p-1 text-left flex flex-col justify-between cursor-pointer transition-all ${selected?.source === 'waste' ? 'ring-2 ring-yellow-400 shadow-xl scale-105' : 'shadow-md border border-slate-300'}`}
              >
                <div className={`text-xs font-bold leading-none ${getCardColor(waste[waste.length - 1].suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {getCardLabel(waste[waste.length - 1].value)}<br/>{waste[waste.length - 1].suit}
                </div>
                <div className={`text-lg self-center ${getCardColor(waste[waste.length - 1].suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {waste[waste.length - 1].suit}
                </div>
              </div>
            )}
          </div>
          <span className="text-[9px] text-white/40 font-mono mt-1">Waste ({waste.length})</span>
        </div>

        {/* Gap */}
        <div />

        {/* Foundations (4) */}
        {foundations.map((f, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div 
              onClick={(e) => { e.stopPropagation(); handleFoundationClick(idx); }}
              className="w-full max-w-[70px] aspect-[2/3] rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 bg-black/10 flex items-center justify-center text-white/30 text-lg cursor-pointer transition-colors relative"
            >
              {f.length > 0 ? (
                <div className="absolute inset-0 rounded-lg bg-white p-1 text-left flex flex-col justify-between border border-slate-300">
                  <div className={`text-xs font-bold leading-none ${getCardColor(f[f.length - 1].suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {getCardLabel(f[f.length - 1].value)}<br/>{f[f.length - 1].suit}
                  </div>
                  <div className={`text-lg self-center ${getCardColor(f[f.length - 1].suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {f[f.length - 1].suit}
                  </div>
                </div>
              ) : (
                ['♠', '♥', '♣', '♦'][idx]
              )}
            </div>
            <span className="text-[9px] text-white/40 font-mono mt-1">Found</span>
          </div>
        ))}
      </div>

      {/* Tableau Columns (7) */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-3 min-h-[300px]">
        {tableau.map((col, colIdx) => (
          <div 
            key={colIdx} 
            onClick={(e) => { e.stopPropagation(); handleEmptyTableauClick(colIdx); }}
            className="flex flex-col items-center relative min-h-[150px] w-full"
          >
            {col.length === 0 ? (
              <div className="w-full max-w-[70px] aspect-[2/3] rounded-lg border-2 border-dashed border-white/10 bg-black/5" />
            ) : (
              col.map((card, cardIdx) => {
                const isCardSelected = selected?.source !== 'waste' && 
                                       selected?.source?.type === 'tableau' && 
                                       selected.source.colIndex === colIdx && 
                                       selected.source.cardIndex <= cardIdx;
                return (
                  <div 
                    key={card.id}
                    onClick={(e) => { e.stopPropagation(); handleCardClick(card, { colIndex: colIdx, cardIndex: cardIdx }); }}
                    className={`absolute w-full max-w-[70px] aspect-[2/3] rounded-lg transition-all
                      ${card.isFaceUp 
                        ? 'bg-white p-1 text-left flex flex-col justify-between border border-slate-300 cursor-pointer shadow-md hover:-translate-y-1' 
                        : "bg-gradient-to-br from-indigo-700 to-blue-900 border border-indigo-400/30"
                      }
                      ${isCardSelected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-[#005f24] scale-105 z-40' : ''}
                    `}
                    style={{ 
                      top: `${cardIdx * 16}px`,
                      zIndex: cardIdx + 10
                    }}
                  >
                    {card.isFaceUp ? (
                      <>
                        <div className={`text-xs font-bold leading-none ${getCardColor(card.suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                          {getCardLabel(card.value)}<br/>{card.suit}
                        </div>
                        <div className={`text-lg self-center leading-none ${getCardColor(card.suit) === 'red' ? 'text-rose-600' : 'text-slate-900'}`}>
                          {card.suit}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <div className="w-4 h-6 border border-white/20 rounded-sm" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
