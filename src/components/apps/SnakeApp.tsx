import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;

export default function SnakeApp() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }
        
        // Self collision
        if (prev.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [dir, isPlaying, gameOver, food]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
      case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
      case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
      case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
    }
  };

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDir({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  return (
    <div 
      className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-4 rounded-b-lg outline-none select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={boardRef}
    >
      <div className="w-full max-w-sm flex justify-between items-center mb-4 text-slate-300 font-mono">
        <div>SCORE: {score}</div>
        {!isPlaying && !gameOver && (
          <button onClick={reset} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1 rounded text-sm font-bold transition-colors">PLAY</button>
        )}
      </div>

      <div className="relative bg-black border border-slate-800 shadow-xl" style={{ width: 300, height: 300 }}>
        {isPlaying && snake.map((s, i) => (
          <div 
            key={i} 
            className="absolute bg-emerald-400 rounded-sm"
            style={{ 
              left: `${(s.x / GRID_SIZE) * 100}%`, 
              top: `${(s.y / GRID_SIZE) * 100}%`, 
              width: `${100 / GRID_SIZE}%`, 
              height: `${100 / GRID_SIZE}%` 
            }} 
          />
        ))}
        {isPlaying && (
          <div 
            className="absolute bg-red-500 rounded-full"
            style={{ 
              left: `${(food.x / GRID_SIZE) * 100}%`, 
              top: `${(food.y / GRID_SIZE) * 100}%`, 
              width: `${100 / GRID_SIZE}%`, 
              height: `${100 / GRID_SIZE}%` 
            }} 
          />
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h2 className="text-red-500 font-bold text-2xl mb-4 tracking-widest">GAME OVER</h2>
            <button onClick={reset} className="bg-white hover:bg-slate-200 text-black px-6 py-2 rounded-full font-bold transition-colors">TRY AGAIN</button>
          </div>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-2 opacity-60 sm:hidden">
        <div />
        <button className="bg-slate-800 p-4 rounded-lg" onClick={() => handleKeyDown({ key: 'ArrowUp' } as any)}>↑</button>
        <div />
        <button className="bg-slate-800 p-4 rounded-lg" onClick={() => handleKeyDown({ key: 'ArrowLeft' } as any)}>←</button>
        <button className="bg-slate-800 p-4 rounded-lg" onClick={() => handleKeyDown({ key: 'ArrowDown' } as any)}>↓</button>
        <button className="bg-slate-800 p-4 rounded-lg" onClick={() => handleKeyDown({ key: 'ArrowRight' } as any)}>→</button>
      </div>
    </div>
  );
}
