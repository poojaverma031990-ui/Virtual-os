import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Trash2, Download, Square as SquareIcon, Circle as CircleIcon, Minus, Pen } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line';

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#d946ef'); // fuchsia-500
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('pen');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tempImageData, setTempImageData] = useState<ImageData | null>(null);

  const colors = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#d946ef'];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        let tempCanvas: HTMLCanvasElement | null = null;
        if (ctx) {
          tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
          }
        }

        canvas.width = width || 800;
        canvas.height = height || 500;

        if (ctx) {
          ctx.fillStyle = '#1e293b'; // slate-800
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (tempCanvas) {
            ctx.drawImage(tempCanvas, 0, 0);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = 0;
        clientY = 0;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      setTempImageData(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
      if (tool === 'pen' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setTempImageData(null);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPos = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : color;
    ctx.fillStyle = tool === 'eraser' ? '#1e293b' : color;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (tempImageData) {
      // For shapes, we restore the previous frame first
      ctx.putImageData(tempImageData, 0, 0);
      
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'cyber-paint-art.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 rounded-b-lg overflow-hidden select-none">
      <div className="bg-slate-950 flex flex-wrap items-center px-6 py-2 gap-4 border-b border-slate-800">
        <div className="flex gap-2">
          {colors.map(c => (
            <button 
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${color === c ? 'scale-110 border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        <div className="w-px h-6 bg-slate-800" />
        
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
          <button onClick={() => setTool('pen')} className={`p-1.5 rounded-md transition-all ${tool === 'pen' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Pen">
            <Pen className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-md transition-all ${tool === 'eraser' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Eraser">
            <Eraser className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('rect')} className={`p-1.5 rounded-md transition-all ${tool === 'rect' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Rectangle">
            <SquareIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('circle')} className={`p-1.5 rounded-md transition-all ${tool === 'circle' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Circle">
            <CircleIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setTool('line')} className={`p-1.5 rounded-md transition-all ${tool === 'line' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Line">
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-800" />
        
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <span>Size</span>
          <input 
            type="range" 
            min="1" max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20 accent-fuchsia-500 cursor-pointer h-1"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={downloadImage} className="p-2 text-slate-400 hover:text-emerald-400 transition-all" title="Save Image">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-400 transition-all" title="Clear Canvas">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 bg-slate-900/50 relative cursor-crosshair touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          className="touch-none bg-slate-950 block w-full h-full"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          onTouchMove={draw}
        />
      </div>
    </div>
  );
}
