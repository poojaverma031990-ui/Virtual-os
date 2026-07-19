import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Cloud, Music, Settings, Activity, Key, Wifi, Camera, Map, Search, MapPin, Droplets, Wind, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

export function CalendarApp() {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
  const startDay = new Date(year, date.getMonth(), 1).getDay();

  return (
    <div className="h-full w-full bg-slate-900 p-6 text-slate-200 font-sans rounded-b-lg overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{month} {year}</h2>
        <div className="bg-fuchsia-500 text-white px-3 py-1 rounded-full text-sm font-medium">Today</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1">
        {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const isToday = i + 1 === day;
          return (
            <div 
              key={i} 
              className={`flex items-center justify-center rounded-lg text-sm transition-colors cursor-default ${
                isToday ? 'bg-fuchsia-500 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClockApp() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center rounded-b-lg">
      <div className="relative w-64 h-64 border-4 border-slate-800 rounded-full flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-3 bg-slate-600 rounded-full" style={{ transform: `rotate(${i * 30}deg) translateY(-28px)` }} />
        ))}
        {/* Hands */}
        <div className="absolute w-1.5 h-16 bg-slate-400 rounded-full origin-bottom" style={{ transform: `rotate(${time.getHours() * 30 + time.getMinutes() * 0.5}deg) translateY(-8px)` }} />
        <div className="absolute w-1 h-24 bg-slate-200 rounded-full origin-bottom" style={{ transform: `rotate(${time.getMinutes() * 6}deg) translateY(-12px)` }} />
        <div className="absolute w-0.5 h-28 bg-fuchsia-500 rounded-full origin-bottom" style={{ transform: `rotate(${time.getSeconds() * 6}deg) translateY(-14px)` }} />
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-fuchsia-500 rounded-full" />
      </div>
      <div className="mt-8 text-4xl font-light text-slate-200 tracking-wider">
        {time.toLocaleTimeString([], { hour12: false })}
      </div>
    </div>
  );
}

export function WeatherApp() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [statusMessage, setStatusMessage] = useState('Syncing weather satellites...');

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    setLoading(true);
    try {
      let url = '/api/weather';
      if (city) {
        url = `/api/weather?city=${encodeURIComponent(city)}`;
      } else if (lat && lon) {
        url = `/api/weather?lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json && !json.error) {
        setData(json);
        if (json.location) {
          localStorage.setItem('weather_selected_city_v1', json.location);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCity = localStorage.getItem('weather_selected_city_v1');
    if (savedCity) {
      fetchWeather(undefined, undefined, savedCity);
    } else {
      // Start with a fallback default city immediately so we don't show a blocking loader
      fetchWeather(undefined, undefined, 'New York');
      
      // Try background geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Geolocation background access denied/failed.");
          },
          { timeout: 3000 }
        );
      }
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeather(undefined, undefined, searchCity.trim());
      setSearchCity('');
    }
  };

  const weather = data || { temp: 20, condition: 'Partly Cloudy', location: 'New York, NY', high: 22, low: 14, humidity: 45, windSpeed: 15 };

  const getWeatherStyles = (condition: string) => {
    const cond = (condition || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
      return {
        icon: CloudRain,
        bg: 'from-slate-900 via-blue-950 to-indigo-950',
        textColor: 'text-blue-300',
        iconColor: 'text-blue-400'
      };
    }
    if (cond.includes('snow') || cond.includes('ice') || cond.includes('hail') || cond.includes('freeze')) {
      return {
        icon: CloudSnow,
        bg: 'from-slate-900 via-sky-950 to-blue-900',
        textColor: 'text-sky-200',
        iconColor: 'text-white'
      };
    }
    if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
      return {
        icon: CloudLightning,
        bg: 'from-slate-950 via-purple-950 to-slate-900',
        textColor: 'text-purple-300',
        iconColor: 'text-yellow-400 animate-pulse'
      };
    }
    if (cond.includes('clear') || cond.includes('sunny') || cond.includes('sun')) {
      return {
        icon: Sun,
        bg: 'from-sky-900 via-indigo-950 to-slate-950',
        textColor: 'text-yellow-200',
        iconColor: 'text-yellow-400 animate-spin-slow'
      };
    }
    return {
      icon: Cloud,
      bg: 'from-slate-900 via-blue-950 to-slate-950',
      textColor: 'text-slate-300',
      iconColor: 'text-slate-200'
    };
  };

  const styles = getWeatherStyles(weather.condition);
  const WeatherIcon = styles.icon;

  return (
    <div className={`h-full w-full bg-gradient-to-b ${styles.bg} flex flex-col p-6 text-white rounded-b-lg overflow-y-auto transition-all duration-500`}>
      {/* City Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-3 flex gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search city weather..."
            className="w-full bg-white/10 focus:bg-white/15 border border-white/10 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <MapPin className="w-3 h-3" /> Search
        </button>
      </form>

      {/* Quick Select Cities */}
      <div className="flex flex-wrap gap-1.5 mb-4 shrink-0 justify-center">
        {['Miami', 'London', 'Tokyo', 'Paris', 'New York', 'Mumbai'].map(city => (
          <button
            key={city}
            type="button"
            onClick={() => fetchWeather(undefined, undefined, city)}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 transition-all active:scale-95"
          >
            {city}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center my-auto">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>{weather.location}</span>
        </div>
        <h2 className="text-xl font-light mb-4 text-center opacity-90">{weather.location.split(',')[0]}</h2>
        
        {/* Animated weather indicator */}
        <WeatherIcon className={`w-24 h-24 ${styles.iconColor} my-2 drop-shadow-[0_8px_24px_rgba(59,130,246,0.3)] animate-pulse`} strokeWidth={1} />
        
        <div className="text-6xl font-light tracking-tighter mb-1 mt-2 relative">
          {weather.temp}
          <span className="text-3xl font-light absolute -top-1 -right-8">°C</span>
        </div>
        
        <div className={`${styles.textColor} text-sm font-semibold mb-6 tracking-wide uppercase`}>{weather.condition}</div>

        {/* Dynamic details */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-sm px-4 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Range</span>
            <span className="text-xs font-semibold">{weather.low || 14}°C - {weather.high || 22}°C</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Humidity</span>
            <span className="text-xs font-semibold flex items-center gap-0.5"><Droplets className="w-3 h-3 text-blue-400" /> {weather.humidity || 45}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Wind</span>
            <span className="text-xs font-semibold flex items-center gap-0.5"><Wind className="w-3 h-3 text-emerald-400" /> {weather.windSpeed || 15} km/h</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto w-full flex justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
        {(weather.forecast && weather.forecast.length > 0 ? weather.forecast : [
          { day: "MON", temp: 18 },
          { day: "TUE", temp: 21 },
          { day: "WED", temp: 22 },
          { day: "THU", temp: 24 }
        ]).map((item: any, idx: number) => {
          let DayIcon = Cloud;
          if (idx === 1) DayIcon = Sun;
          if (idx === 2) DayIcon = CloudRain;
          if (idx === 3) DayIcon = CloudLightning;
          return (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px] font-bold mb-1">{item.day}</span>
              <DayIcon className={`w-5 h-5 mb-1 ${idx === 1 ? 'text-yellow-400 animate-pulse' : idx === 2 ? 'text-sky-400' : idx === 3 ? 'text-purple-400' : 'text-blue-200'}`} />
              <span className="font-semibold text-xs">{item.temp}°C</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CPUMonitorApp() {
  const [usage, setUsage] = useState(Array(20).fill(10));

  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 80) + 10];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 p-6 flex flex-col rounded-b-lg text-emerald-400 font-mono">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5" />
        <h2 className="text-lg">System Monitor</h2>
      </div>
      
      <div className="flex-1 flex items-end gap-1 mb-4">
        {usage.map((u, i) => (
          <div key={i} className="flex-1 bg-slate-900 rounded-t-sm flex items-end overflow-hidden">
            <div className="w-full bg-emerald-500/50 transition-all duration-300" style={{ height: `${u}%` }} />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900 p-4 rounded-lg">
        <div>
          <div className="text-slate-500 mb-1">CPU Usage</div>
          <div className="text-2xl">{usage[usage.length - 1]}%</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Memory</div>
          <div className="text-2xl">4.2 GB / 16 GB</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Processes</div>
          <div className="text-2xl">142</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Uptime</div>
          <div className="text-2xl">02:14:45</div>
        </div>
      </div>
    </div>
  );
}

export function PasswordApp() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);

  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  return (
    <div className="h-full w-full bg-slate-900 p-6 flex flex-col rounded-b-lg text-slate-200">
      <div className="flex items-center gap-2 mb-6 text-fuchsia-400">
        <Key className="w-5 h-5" />
        <h2 className="text-lg">KeyVault Gen</h2>
      </div>
      
      <div className="bg-slate-950 p-4 rounded-lg mb-6 flex items-center justify-between border border-slate-800">
        <span className="font-mono text-xl tracking-wider">{password || 'Click Generate'}</span>
        <button onClick={() => navigator.clipboard.writeText(password)} className="text-slate-500 hover:text-white transition-colors">Copy</button>
      </div>

      <div className="mb-6">
        <label className="text-sm text-slate-400 mb-2 block">Length: {length}</label>
        <input 
          type="range" min="8" max="32" value={length} 
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full accent-fuchsia-500"
        />
      </div>

      <button onClick={generate} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 rounded-lg font-medium transition-colors">
        Generate Password
      </button>
    </div>
  );
}

export function NetworkApp() {
  const [ping, setPing] = useState(24);
  const [down, setDown] = useState(142);
  const [up, setUp] = useState(35);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 10) + 20);
      setDown(Math.floor(Math.random() * 50) + 120);
      setUp(Math.floor(Math.random() * 10) + 30);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 p-6 flex flex-col rounded-b-lg text-blue-400 font-mono">
      <div className="flex items-center gap-2 mb-6">
        <Wifi className="w-5 h-5" />
        <h2 className="text-lg">Network Traffic</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-xs mb-1">DOWNLOAD</div>
          <div className="text-3xl text-emerald-400">{down} <span className="text-sm text-slate-500">Mbps</span></div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-xs mb-1">UPLOAD</div>
          <div className="text-3xl text-fuchsia-400">{up} <span className="text-sm text-slate-500">Mbps</span></div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 col-span-2">
          <div className="text-slate-500 text-xs mb-1">LATENCY</div>
          <div className="text-3xl">{ping} <span className="text-sm text-slate-500">ms</span></div>
        </div>
      </div>

      <div className="flex-1 border border-slate-800 rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px]" />
        {/* Fake chart line */}
        <svg className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0,100 L0,50 L20,30 L40,60 L60,20 L80,40 L100,10 L100,100 Z" fill="rgba(56, 189, 248, 0.1)" />
          <path d="M0,50 L20,30 L40,60 L60,20 L80,40 L100,10" fill="none" stroke="#38bdf8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

export function PlaceholderApp({ title, icon: Icon, colorClass }: { title: string, icon: any, colorClass: string }) {
  return (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center rounded-b-lg">
      <Icon className={`w-24 h-24 mb-6 opacity-20 ${colorClass}`} strokeWidth={1} />
      <h2 className="text-xl font-medium text-slate-300 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-xs text-center">
        This application is fully responsive and integrates with the OS window manager.
      </p>
    </div>
  );
}
