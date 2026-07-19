import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div className="w-16 h-16 bg-white rounded-[22%] shadow-lg flex items-center justify-center relative overflow-hidden ring-1 ring-black/5">
      <svg viewBox="0 0 100 100" className="w-[88%] h-[88%]">
        {/* Subtle background circle */}
        <circle cx="50" cy="50" r="48" fill="#f8fafc" />
        
        {/* Tick Marks */}
        {[...Array(60)].map((_, i) => {
          const isMajor = i % 5 === 0;
          const isHour = i % 15 === 0;
          return (
            <line
              key={i}
              x1="50"
              y1={isHour ? "2" : isMajor ? "4" : "6"}
              x2="50"
              y2={isHour ? "10" : isMajor ? "8" : "8"}
              stroke={isHour ? "#1e293b" : isMajor ? "#64748b" : "#cbd5e1"}
              strokeWidth={isHour ? "2.5" : isMajor ? "1.5" : "1"}
              transform={`rotate(${i * 6} 50 50)`}
            />
          );
        })}

        {/* Numbers (Only 12, 3, 6, 9) */}
        <text x="50" y="24" textAnchor="middle" fontSize="15" fill="#1e293b" fontWeight="700" style={{ fontFamily: 'Inter, sans-serif' }}>12</text>
        <text x="80" y="55" textAnchor="middle" fontSize="15" fill="#1e293b" fontWeight="700" style={{ fontFamily: 'Inter, sans-serif' }}>3</text>
        <text x="50" y="86" textAnchor="middle" fontSize="15" fill="#1e293b" fontWeight="700" style={{ fontFamily: 'Inter, sans-serif' }}>6</text>
        <text x="20" y="55" textAnchor="middle" fontSize="15" fill="#1e293b" fontWeight="700" style={{ fontFamily: 'Inter, sans-serif' }}>9</text>
        
        {/* Shadow for hands */}
        <g filter="drop-shadow(0 2px 2px rgba(0,0,0,0.1))">
          {/* Hour Hand */}
          <line 
            x1="50" y1="50" x2="50" y2="30" 
            stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" 
            transform={`rotate(${hourDegrees} 50 50)`} 
          />
          {/* Minute Hand */}
          <line 
            x1="50" y1="50" x2="50" y2="18" 
            stroke="#1e293b" strokeWidth="3" strokeLinecap="round" 
            transform={`rotate(${minuteDegrees} 50 50)`} 
          />
        </g>
        
        {/* Second Hand (The most iconic part) */}
        <g transform={`rotate(${secondDegrees} 50 50)`}>
          <line x1="50" y1="60" x2="50" y2="12" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="2.5" fill="#ef4444" stroke="white" strokeWidth="1" />
          {/* Small counter-weight circle */}
          <circle cx="50" cy="50" r="0.8" fill="white" />
        </g>

        {/* Center pin top layer */}
        <circle cx="50" cy="50" r="1.5" fill="#1e293b" />
      </svg>
    </div>
  );
}
