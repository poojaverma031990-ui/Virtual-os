import { ElementType, ReactNode, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Minus, Maximize2, Square } from 'lucide-react';
import { themeStore } from '../themeStore';
import { playSound } from '../lib/sounds';

interface WindowProps {
  key?: string | number;
  title: string;
  isActive: boolean;
  onClose: () => void;
  onFocus: () => void;
  icon: ElementType;
  children: ReactNode;
  defaultMaximized?: boolean;
}

export default function Window({ title, isActive, onClose, onFocus, icon: Icon, children, defaultMaximized }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(() => {
    const saved = localStorage.getItem(`window_maximized_${title}`);
    return saved ? JSON.parse(saved) : (defaultMaximized || false);
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [theme, setTheme] = useState(themeStore.get());

  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(`window_size_${title}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const w = Math.min(window.innerWidth - 40, 720);
    const h = Math.min(window.innerHeight - 120, 520);
    return { width: w, height: h };
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(`window_pos_${title}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const offset = Math.floor(Math.random() * 8) * 25;
    return {
      x: 60 + offset,
      y: 60 + offset
    };
  });

  useEffect(() => {
    localStorage.setItem(`window_size_${title}`, JSON.stringify(size));
  }, [size, title]);

  useEffect(() => {
    localStorage.setItem(`window_pos_${title}`, JSON.stringify(position));
  }, [position, title]);

  useEffect(() => {
    localStorage.setItem(`window_maximized_${title}`, JSON.stringify(isMaximized));
  }, [isMaximized, title]);

  useEffect(() => {
    playSound('open');
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSize(prev => {
        const newWidth = Math.min(prev.width, window.innerWidth - 16);
        const newHeight = Math.min(prev.height, window.innerHeight - 80);
        return { width: Math.max(320, newWidth), height: Math.max(240, newHeight) };
      });
      setPosition(prev => {
        const maxX = Math.max(0, window.innerWidth - 120);
        const maxY = Math.max(0, window.innerHeight - 120);
        const newX = Math.max(5, Math.min(prev.x, maxX));
        const newY = Math.max(5, Math.min(prev.y, maxY));
        return { x: newX, y: newY };
      });
    };
    window.addEventListener('resize', handleResize);
    // Let's run a short timeout to let rendering layout settle before bounding
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isActive && isMinimized) {
      setIsMinimized(false);
    }
  }, [isActive, isMinimized]);

  const getTransition = () => {
    switch (theme.animationSpeed) {
      case 'instant': return { duration: 0 };
      case 'snappy': return { type: 'spring' as const, stiffness: 480, damping: 28 };
      case 'dreamy': return { type: 'spring' as const, stiffness: 110, damping: 15 };
      case 'smooth':
      default:
        return { type: 'spring' as const, stiffness: 280, damping: 24 };
    }
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    onFocus();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = position.x;
    const startTop = position.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Prevent dragging header completely off-screen
      const newX = Math.max(-size.width + 100, Math.min(window.innerWidth - 50, startLeft + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, startTop + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleResizeStart = (e: React.PointerEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    
    const startWidth = size.width;
    const startHeight = size.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = position.x;
    const startTop = position.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // Horizontal Resize
      if (direction.includes('e')) {
        newWidth = Math.max(340, startWidth + deltaX);
      }
      if (direction.includes('w')) {
        newWidth = Math.max(340, startWidth - deltaX);
        if (newWidth > 340) {
          newLeft = startLeft + deltaX;
        }
      }

      // Vertical Resize
      if (direction.includes('s')) {
        newHeight = Math.max(260, startHeight + deltaY);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(260, startHeight - deltaY);
        if (newHeight > 260) {
          newTop = startTop + deltaY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newLeft, y: newTop });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  let windowThemeClass = '';
  let headerThemeClass = 'bg-black/20';
  if (theme.windowStyle === 'glass') {
    windowThemeClass = 'bg-white/10 backdrop-blur-2xl border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]';
    headerThemeClass = 'bg-white/10';
  } else if (theme.windowStyle === 'flat') {
    windowThemeClass = 'bg-slate-900 border-slate-700 rounded-none';
    headerThemeClass = 'bg-slate-800 rounded-none';
  } else if (theme.windowStyle === 'neon') {
    windowThemeClass = `bg-black/80 backdrop-blur-md border-[${theme.accentColor}] shadow-[0_0_20px_0_rgba(168,85,247,0.3)]`;
    headerThemeClass = `bg-[${theme.accentColor}]/20 border-b border-[${theme.accentColor}]/50`;
  } else if (theme.windowStyle === 'retro') {
    windowThemeClass = 'bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black rounded-none shadow-none text-black';
    headerThemeClass = `bg-[#000080] text-white rounded-none flex items-center`;
  } else {
    windowThemeClass = 'bg-black/40 backdrop-blur-xl border-white/10';
  }

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isMinimized ? 0 : 1, 
        scale: isMinimized ? 0.8 : 1, 
      }}
      exit={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
      transition={getTransition()}
      onPointerDown={onFocus}
      className={`absolute flex flex-col overflow-hidden border ${
        isActive 
          ? 'shadow-2xl z-50' 
          : 'shadow-xl z-40'
      } ${windowThemeClass} ${theme.windowStyle !== 'flat' && theme.windowStyle !== 'retro' ? 'rounded-xl' : ''} ${isMinimized ? 'pointer-events-none' : ''}`}
      style={
        isMaximized 
          ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 3.5rem)', borderRadius: 0, touchAction: 'none' }
          : { 
              top: `${position.y}px`, 
              left: `${position.x}px`, 
              width: `${size.width}px`, 
              height: `${size.height}px`, 
              touchAction: 'none' 
            }
      }
      data-window
    >
      {/* Header / Title Bar */}
      <div 
        className={`h-9 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none shrink-0 ${headerThemeClass}`}
        onPointerDown={handleDragStart}
        onDoubleClick={() => setIsMaximized(!isMaximized)}
      >
        <div className="flex items-center gap-2 text-slate-200">
          <Icon className="w-3.5 h-3.5 opacity-70" />
          <span className="text-[11px] font-medium tracking-wide opacity-90">{title}</span>
        </div>
        
        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
          {/* Minimize Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setIsMinimized(true);
            }}
            className={`w-7 h-7 flex items-center justify-center transition-all rounded-md group ${
              theme.windowStyle === 'retro' 
                ? 'bg-[#c0c0c0] border-t border-l border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black hover:bg-slate-300 text-black font-bold text-xs' 
                : 'bg-slate-950/70 hover:bg-emerald-600 border border-slate-800 hover:border-emerald-500 text-white shadow-sm'
            }`}
            aria-label="Minimize"
            title="Minimize"
          >
             <Minus className={`w-3.5 h-3.5 ${theme.windowStyle === 'retro' ? 'text-black' : 'opacity-90 group-hover:opacity-100 text-current'}`} strokeWidth={3} />
          </button>
          
          {/* Maximize Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              setIsMaximized(!isMaximized);
            }}
            className={`w-7 h-7 flex items-center justify-center transition-all rounded-md group ${
              theme.windowStyle === 'retro' 
                ? 'bg-[#c0c0c0] border-t border-l border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black hover:bg-slate-300 text-black font-bold text-xs' 
                : 'bg-slate-950/70 hover:bg-amber-600 border border-slate-800 hover:border-amber-500 text-white shadow-sm'
            }`}
            aria-label="Maximize"
            title={isMaximized ? "Restore Down" : "Maximize Screen"}
          >
             {isMaximized ? (
                <Square className={`w-3 h-3 ${theme.windowStyle === 'retro' ? 'text-black' : 'opacity-90 group-hover:opacity-100 text-current'}`} strokeWidth={3} />
             ) : (
                <Maximize2 className={`w-3.5 h-3.5 ${theme.windowStyle === 'retro' ? 'text-black' : 'opacity-90 group-hover:opacity-100 text-current'}`} strokeWidth={3} />
             )}
          </button>
          
          {/* Close Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playSound('close');
              onClose();
            }}
            className={`w-7 h-7 flex items-center justify-center transition-all rounded-md group ${
              theme.windowStyle === 'retro' 
                ? 'bg-[#c0c0c0] border-t border-l border-t-white border-l-white border-b-2 border-r-2 border-b-black border-r-black hover:bg-slate-300 text-black font-bold text-xs' 
                : 'bg-slate-950/70 hover:bg-rose-600 border border-slate-800 hover:border-rose-500 text-white shadow-sm'
            }`}
            aria-label="Close"
            title="Close App"
          >
            <X className={`w-3.5 h-3.5 ${theme.windowStyle === 'retro' ? 'text-black' : 'opacity-90 group-hover:opacity-100 text-current'}`} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-black/20 cursor-auto relative" onPointerDown={(e) => e.stopPropagation()}>
        {children}
      </div>

      {/* Resize handles (8 directions) */}
      {!isMaximized && (
        <>
          {/* East (Right Edge) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'e')} 
            className="absolute right-0 top-1 bottom-1 w-1.5 cursor-ew-resize z-50 hover:bg-blue-500/10 active:bg-blue-500/30 transition-colors" 
          />
          {/* West (Left Edge) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'w')} 
            className="absolute left-0 top-1 bottom-1 w-1.5 cursor-ew-resize z-50 hover:bg-blue-500/10 active:bg-blue-500/30 transition-colors" 
          />
          {/* South (Bottom Edge) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 's')} 
            className="absolute left-1 right-1 bottom-0 h-1.5 cursor-ns-resize z-50 hover:bg-blue-500/10 active:bg-blue-500/30 transition-colors" 
          />
          {/* North (Top Edge) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'n')} 
            className="absolute left-1 right-1 top-0 h-1.5 cursor-ns-resize z-50 hover:bg-blue-500/10 active:bg-blue-500/30 transition-colors" 
          />
          
          {/* South-East (Bottom Right) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'se')} 
            className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize z-[60] flex items-end justify-end p-0.5 group"
          >
            <svg width="8" height="8" viewBox="0 0 10 10" className="text-slate-400 group-hover:text-blue-500 transition-colors opacity-60">
              <path d="M10,0 L0,10 M10,4 L4,10 M10,8 L8,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          {/* South-West (Bottom Left) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'sw')} 
            className="absolute left-0 bottom-0 w-4 h-4 cursor-nesw-resize z-[60]" 
          />
          {/* North-East (Top Right) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'ne')} 
            className="absolute right-0 top-0 w-4 h-4 cursor-nesw-resize z-[60]" 
          />
          {/* North-West (Top Left) */}
          <div 
            onPointerDown={(e) => handleResizeStart(e, 'nw')} 
            className="absolute left-0 top-0 w-4 h-4 cursor-nwse-resize z-[60]" 
          />
        </>
      )}
    </motion.div>
  );
}
