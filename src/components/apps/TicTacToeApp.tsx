import { useState, useEffect } from 'react';
import { playSound } from '../../lib/sounds';
import { User, Cpu, RotateCcw } from 'lucide-react';

export default function TicTacToeApp() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('hard');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(s => s !== null);

  // Trigger AI move
  useEffect(() => {
    if (gameMode === 'ai' && !xIsNext && !winner && !isDraw) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, gameMode]);

  const makeAiMove = () => {
    const emptyIndices: number[] = [];
    board.forEach((cell, idx) => {
      if (cell === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) return;

    let targetIndex = emptyIndices[0];

    if (aiDifficulty === 'easy') {
      // Choose completely random empty space
      targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else {
      // minimax unbeatable AI
      targetIndex = getBestMove(board);
    }

    const nextBoard = [...board];
    nextBoard[targetIndex] = 'O';
    setBoard(nextBoard);
    playSound('move');
    setXIsNext(true);
  };

  // Minimax implementation
  const getBestMove = (currentBoard: (string | null)[]): number => {
    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const moveVal = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const minimax = (tempBoard: (string | null)[], depth: number, isMax: boolean): number => {
    const score = evaluateBoard(tempBoard);

    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (tempBoard.every(s => s !== null)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'O';
          best = Math.max(best, minimax(tempBoard, depth + 1, false));
          tempBoard[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'X';
          best = Math.min(best, minimax(tempBoard, depth + 1, true));
          tempBoard[i] = null;
        }
      }
      return best;
    }
  };

  const evaluateBoard = (b: (string | null)[]): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b_idx, c] of lines) {
      if (b[a] === 'O' && b[b_idx] === 'O' && b[c] === 'O') return 10;
      if (b[a] === 'X' && b[b_idx] === 'X' && b[c] === 'X') return -10;
    }
    return 0;
  };

  const handleClick = (i: number) => {
    if (winner || board[i] || isAiThinking) return;
    if (gameMode === 'ai' && !xIsNext) return; // AI's turn

    playSound('click');
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const nextWinner = calculateWinner(newBoard);
    if (nextWinner) {
      playSound('success');
    } else if (newBoard.every(cell => cell !== null)) {
      playSound('click');
    } else {
      playSound('move');
    }

    setXIsNext(!xIsNext);
  };

  const restartGame = () => {
    playSound('success');
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans select-none rounded-b-lg overflow-y-auto">
      {/* Top Configuration Bar */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => { playSound('click'); setGameMode('ai'); restartGame(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${gameMode === 'ai' ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          <Cpu className="w-3.5 h-3.5" /> VS Computer
        </button>
        <button 
          onClick={() => { playSound('click'); setGameMode('pvp'); restartGame(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${gameMode === 'pvp' ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          <User className="w-3.5 h-3.5" /> Pass & Play
        </button>
      </div>

      {gameMode === 'ai' && (
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => { playSound('click'); setAiDifficulty('easy'); }}
            className={`px-2.5 py-1 text-[10px] rounded border font-semibold ${aiDifficulty === 'easy' ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-slate-800 text-slate-500'}`}
          >
            Easy AI
          </button>
          <button 
            onClick={() => { playSound('click'); setAiDifficulty('hard'); }}
            className={`px-2.5 py-1 text-[10px] rounded border font-semibold ${aiDifficulty === 'hard' ? 'bg-red-600/10 border-red-500/30 text-red-400' : 'bg-transparent border-slate-800 text-slate-500'}`}
          >
            Impossible AI
          </button>
        </div>
      )}

      {/* Game Status */}
      <div className="mb-6 text-base font-medium text-slate-300">
        {winner ? (
          <span className="text-emerald-400 font-bold tracking-wide">🎉 Winner: {winner === 'X' ? 'Player 1 (X)' : gameMode === 'ai' ? 'Computer (O)' : 'Player 2 (O)'}</span>
        ) : isDraw ? (
          <span className="text-amber-400 font-bold">🤝 Draw! Play again!</span>
        ) : isAiThinking ? (
          <span className="text-fuchsia-400 animate-pulse">Computer is calculating...</span>
        ) : (
          <span>
            Next Turn:{' '}
            <span className={xIsNext ? 'text-fuchsia-400 font-bold' : 'text-blue-400 font-bold'}>
              {xIsNext ? 'X' : 'O'}
            </span>
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5 shadow-2xl relative">
        {board.map((cell, i) => (
          <button
            key={i}
            disabled={isAiThinking || winner !== null}
            className={`w-20 h-20 bg-slate-950 hover:bg-slate-900/80 rounded-xl flex items-center justify-center text-4xl font-extralight transition-all duration-150 border border-white/5 active:scale-95 ${cell ? 'shadow-inner' : 'hover:border-white/10'}`}
            onClick={() => handleClick(i)}
          >
            <span className={cell === 'X' ? 'text-fuchsia-500 font-semibold drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]' : 'text-blue-400 font-semibold drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]'}>
              {cell}
            </span>
          </button>
        ))}
      </div>

      <button 
        onClick={restartGame}
        className="mt-8 px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-full transition-all text-xs font-semibold flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Restart Game
      </button>
    </div>
  );
}
