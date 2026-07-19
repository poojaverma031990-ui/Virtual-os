import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Trash2, Volume2, Save, Activity } from 'lucide-react';

interface Recording {
  id: string;
  url: string;
  name: string;
  date: Date;
  duration: string;
}

export default function VoiceMemoApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [timer, setTimer] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(audioStream);
      const chunks: Blob[] = [];

      // Set up visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(audioStream);
      const audioAnalyser = audioCtx.createAnalyser();
      audioAnalyser.fftSize = 256;
      source.connect(audioAnalyser);
      setAnalyser(audioAnalyser);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const newRecording: Recording = {
          id: Date.now().toString(),
          url,
          name: `Memo ${recordings.length + 1}`,
          date: new Date(),
          duration: formatTime(timer)
        };
        setRecordings(prev => [newRecording, ...prev]);
        setTimer(0);
        audioStream.getTracks().forEach(track => track.stop());
        audioCtx.close();
      };

      setStream(audioStream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      // Start visualization loop
      draw(audioAnalyser);
    } catch (e) {
      console.error("Failed to start recording", e);
    }
  };

  const draw = (analyserNode: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(239, 68, 68, ${dataArray[i] / 255 + 0.2})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900/50 to-slate-950 relative">
        {isRecording && (
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={100} 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-md h-24 pointer-events-none opacity-50"
          />
        )}
        <div className="relative mb-8">
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping" />
              <div className="absolute w-40 h-40 bg-red-500/10 rounded-full animate-pulse" />
            </div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative z-10 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
          >
            {isRecording ? <Square className="w-10 h-10 fill-white" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-mono font-black tracking-tighter mb-2 tabular-nums">
            {formatTime(timer)}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isRecording ? 'text-red-500' : 'text-slate-500'}`}>
            {isRecording ? 'Recording Live Audio' : 'Ready to Record'}
          </div>
        </div>
      </div>

      <div className="h-1/2 bg-slate-900/40 border-t border-white/5 flex flex-col min-h-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Memos</span>
          <Volume2 className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {recordings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic text-xs">
              No voice memos yet
            </div>
          ) : (
            recordings.map(rec => (
              <div key={rec.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{rec.name}</div>
                    <div className="text-[9px] text-slate-500">{rec.date.toLocaleDateString()} • {rec.duration}</div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    const audio = new Audio(rec.url);
                    audio.play();
                  }} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button onClick={() => deleteRecording(rec.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
