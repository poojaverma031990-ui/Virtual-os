import React, { useState, useEffect } from 'react';
import { Cloud, TrendingUp, Calendar, Battery, Music, Clock, Sun, Wind, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface WidgetContainerProps {
  type: 'clock' | 'weather' | 'calendar' | 'stocks' | 'battery' | 'music';
}

export default function WidgetContainer({ type }: WidgetContainerProps) {
  switch (type) {
    case 'weather':
      return <WeatherWidget />;
    case 'stocks':
      return <StocksWidget />;
    case 'calendar':
      return <CalendarWidget />;
    case 'battery':
      return <BatteryWidget />;
    case 'music':
      return <MusicWidget />;
    default:
      return <ClockWidget />;
  }
}

function WeatherWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="h-full w-full p-4 flex flex-col justify-center items-center text-white/40 bg-slate-500/10 animate-pulse">
        <Cloud className="w-8 h-8 mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest">Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 md:p-6 flex flex-col justify-between text-white transition-all duration-500">
      <div className="flex justify-between items-start gap-2">
        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 min-w-0">
          <div className="text-3xl md:text-5xl font-black tabular-nums leading-none mb-1">{Math.round(data.temp)}°</div>
          <div className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-white/60 truncate">{data.condition}</div>
          <div className="text-[8px] md:text-[10px] font-medium text-white/40 truncate">{data.location}</div>
        </motion.div>
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="shrink-0">
          <Cloud className="w-8 h-8 md:w-12 md:h-12 text-white/80" />
        </motion.div>
      </div>
      <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-tighter opacity-80 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1"><Sun className="w-3 h-3" /> {data.high}°</div>
        <div className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {data.humidity}%</div>
        <div className="flex items-center gap-1"><Wind className="w-3 h-3" /> {data.windSpeed}km/h</div>
      </div>
    </div>
  );
}

function StocksWidget() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(setStocks)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full p-4 flex flex-col justify-center items-center text-white/40 bg-slate-500/10 animate-pulse">
        <TrendingUp className="w-4 h-4 mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest">Updating...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 flex flex-col justify-between text-white bg-gradient-to-br from-emerald-500/10 to-teal-600/10 group">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Market Pulse</span>
      </div>
      <div className="space-y-2">
        {stocks.map((s, i) => (
          <motion.div 
            key={s.s} 
            initial={{ x: -10, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: i * 0.1 }}
            className="flex justify-between items-center"
          >
            <span className="text-xs font-black">{s.s}</span>
            <div className="text-right">
              <div className="text-[10px] font-bold tabular-nums">${s.p}</div>
              <div className={`text-[8px] font-bold ${s.c.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{s.c}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CalendarWidget() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const date = new Date();
  
  return (
    <div className="h-full w-full p-4 flex flex-col text-white">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-black">{date.toLocaleString('default', { month: 'long' })}</span>
        <Calendar className="w-4 h-4 text-orange-400" />
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {days.map(d => <div key={d} className="text-[8px] font-bold text-center text-white/40">{d}</div>)}
        {Array.from({ length: 31 }, (_, i) => (
          <div key={i} className={`text-[9px] font-bold text-center p-0.5 rounded-md transition-colors ${i + 1 === date.getDate() ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40' : 'hover:bg-white/5 text-white/70'}`}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function BatteryWidget() {
  return (
    <div className="h-full w-full p-6 flex flex-col justify-center items-center text-white bg-gradient-to-br from-blue-500/10 to-cyan-600/10">
      <div className="relative w-20 h-32 border-4 border-white/20 rounded-2xl flex items-end p-1">
        <div className="w-6 h-3 bg-white/20 rounded-t-lg absolute -top-4 left-1/2 -translate-x-1/2" />
        <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-xl animate-pulse" style={{ height: '82%' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Battery className="w-6 h-6 mb-1 text-white/40" />
          <span className="text-2xl font-black">82%</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Charging</span>
        </div>
      </div>
    </div>
  );
}

function MusicWidget() {
  return (
    <div className="h-full w-full p-4 md:p-6 flex flex-col justify-between text-white">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center animate-[spin_8s_linear_infinite] shrink-0">
          <Music className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black truncate">Midnight City</div>
          <div className="text-[10px] font-bold text-white/60 truncate">M83</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-white rounded-full" />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase">
          <span>1:24</span>
          <span>4:03</span>
        </div>
      </div>
    </div>
  );
}

function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full p-4 md:p-6 flex flex-col justify-center items-center text-white text-center">
      <div className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums mb-1 leading-none">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 truncate w-full">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}
