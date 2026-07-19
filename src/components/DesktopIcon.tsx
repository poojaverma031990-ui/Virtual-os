import React, { useRef, ElementType } from 'react';
import { motion } from 'motion/react';

interface DesktopIconProps {
  id: string;
  key?: string | number;
  icon: ElementType;
  title: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  iconTheme?: 'default' | 'neon' | 'minimal' | 'glass' | 'retro';
  accentColor?: string;
  iconSize?: 'small' | 'medium' | 'large';
}

export default function DesktopIcon({ 
  id, 
  icon: Icon, 
  title, 
  onClick, 
  onContextMenu,
  iconTheme = 'default',
  accentColor = '#8b5cf6',
  iconSize = 'medium'
}: DesktopIconProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      onContextMenu(e, id);
    }, 500); // 500ms for long press trigger
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, id);
  };

  // Icon sizing parameters
  let sizeClass = "w-20";
  let iconDimensions = "w-6 h-6";
  let wrapperPadding = "p-2";
  let textClass = "text-[11px]";

  if (iconSize === 'small') {
    sizeClass = "w-16";
    iconDimensions = "w-5 h-5";
    wrapperPadding = "p-1.5";
    textClass = "text-[10px]";
  } else if (iconSize === 'large') {
    sizeClass = "w-24";
    iconDimensions = "w-8 h-8";
    wrapperPadding = "p-2.5";
    textClass = "text-[12px]";
  }

  // Theme styling parameters
  let frameStyle = `flex flex-col items-center justify-start gap-1 ${sizeClass} p-2 rounded-xl cursor-pointer transition-all group outline-none border border-transparent hover:border-white/10 hover:bg-white/5`;
  let iconWrapperClass = `${wrapperPadding} bg-slate-900/40 rounded-xl border border-white/5 group-hover:border-white/10 group-hover:scale-105 transition-all`;
  let iconStyle = `${iconDimensions} text-slate-200 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-all`;
  let textStyle = `${textClass} font-medium text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-center leading-tight truncate w-full`;

  if (iconTheme === 'neon') {
    frameStyle = `flex flex-col items-center justify-start gap-1 ${sizeClass} p-2 rounded-xl cursor-pointer transition-all group outline-none border border-fuchsia-500/10 hover:border-fuchsia-500 hover:shadow-[0_0_12px_rgba(236,72,153,0.35)] bg-fuchsia-950/5`;
    iconWrapperClass = `${wrapperPadding} bg-slate-950/85 rounded-xl border border-fuchsia-500/20 group-hover:border-fuchsia-400 group-hover:scale-105 transition-all shadow-[inset_0_0_8px_rgba(236,72,153,0.15)]`;
    iconStyle = `${iconDimensions} text-fuchsia-400 group-hover:text-fuchsia-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.55)] transition-all`;
    textStyle = `${textClass} font-semibold text-fuchsia-200 drop-shadow-[0_0_4px_rgba(236,72,153,0.3)] text-center leading-tight truncate w-full group-hover:text-white`;
  } else if (iconTheme === 'minimal') {
    frameStyle = `flex flex-col items-center justify-start gap-1 ${sizeClass} p-2 rounded-lg cursor-pointer transition-all group outline-none border border-transparent hover:border-slate-800 hover:bg-slate-900/40`;
    iconWrapperClass = `${wrapperPadding} bg-slate-950/80 rounded-md border border-slate-800 group-hover:border-slate-700 transition-all`;
    iconStyle = `${iconDimensions} text-slate-400 group-hover:text-slate-100 transition-colors`;
    textStyle = `${textClass} font-normal text-slate-400 text-center leading-tight truncate w-full group-hover:text-slate-200`;
  } else if (iconTheme === 'glass') {
    frameStyle = `flex flex-col items-center justify-start gap-1.5 ${sizeClass} p-2 rounded-2xl cursor-pointer transition-all group outline-none border border-white/5 hover:border-white/25 hover:bg-white/10`;
    iconWrapperClass = `${wrapperPadding} bg-gradient-to-tr from-white/5 to-white/12 backdrop-blur-md rounded-2xl border border-white/25 shadow-[0_4px_12px_rgba(255,255,255,0.06)] group-hover:scale-105 transition-all`;
    iconStyle = `${iconDimensions} text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-colors`;
    textStyle = `${textClass} font-semibold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center leading-tight truncate w-full`;
  } else if (iconTheme === 'retro') {
    frameStyle = `flex flex-col items-center justify-start gap-1 ${sizeClass} p-1.5 rounded-none cursor-pointer group outline-none border border-transparent hover:border-t-white hover:border-l-white hover:border-b-zinc-900 hover:border-r-zinc-900 hover:bg-[#c0c0c0]/30`;
    iconWrapperClass = `${wrapperPadding} bg-[#c0c0c0] border-b-2 border-r-2 border-b-zinc-800 border-r-zinc-800 border-t border-l border-t-white border-l-white group-hover:border-b-black group-hover:border-r-black`;
    iconStyle = `${iconDimensions} text-zinc-900 group-hover:text-black transition-colors`;
    textStyle = `${textClass} font-bold text-zinc-200 drop-shadow-[0_1px_1px_rgba(0,0,0,1)] text-center leading-tight truncate w-full group-hover:text-white`;
  }

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      className={`${frameStyle} select-none`}
    >
      <div className={`${iconWrapperClass} pointer-events-none`}>
        <Icon className={iconStyle} strokeWidth={iconTheme === 'minimal' ? 1.5 : 1.2} />
      </div>
      <span className={`${textStyle} pointer-events-none`}>
        {title}
      </span>
    </div>
  );
}
