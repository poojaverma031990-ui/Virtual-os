import React, { useState, useEffect } from 'react';
import { Trash2, Save, Plus, Download, Search, FileText, Sparkles } from 'lucide-react';
import { playSound } from '../lib/sounds';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function Notepad() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperTheme, setPaperTheme] = useState<'slate' | 'sepia' | 'light' | 'matrix'>('slate');

  useEffect(() => {
    const saved = localStorage.getItem('notepad_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setDocs(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      } catch (e) {}
    }
    
    // Default initial document
    const defaultDoc = {
      id: 'default',
      title: 'Welcome Note',
      content: 'Welcome to your professional Notepad!\n\nThis upgraded version supports:\n- Multiple named documents\n- Live word & character counters\n- Download as .txt file\n- Custom color themes (Slate, Sepia, Light, Matrix)\n\nStart typing below, everything auto-saves instantly!',
      updatedAt: new Date().toLocaleTimeString()
    };
    setDocs([defaultDoc]);
    setActiveId('default');
  }, []);

  const saveDocs = (newDocs: Document[]) => {
    setDocs(newDocs);
    localStorage.setItem('notepad_docs', JSON.stringify(newDocs));
  };

  const activeDoc = docs.find(d => d.id === activeId) || docs[0];

  const updateContent = (content: string) => {
    const updated = docs.map(d => {
      if (d.id === activeId) {
        return { ...d, content, updatedAt: new Date().toLocaleTimeString() };
      }
      return d;
    });
    saveDocs(updated);
  };

  const updateTitle = (title: string) => {
    const updated = docs.map(d => {
      if (d.id === activeId) {
        return { ...d, title, updatedAt: new Date().toLocaleTimeString() };
      }
      return d;
    });
    saveDocs(updated);
  };

  const createDoc = () => {
    playSound('click');
    const newId = Date.now().toString();
    const newDoc: Document = {
      id: newId,
      title: `Draft ${docs.length + 1}`,
      content: '',
      updatedAt: new Date().toLocaleTimeString()
    };
    const nextDocs = [newDoc, ...docs];
    saveDocs(nextDocs);
    setActiveId(newId);
  };

  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('close');
    const filtered = docs.filter(d => d.id !== id);
    if (filtered.length === 0) {
      const defaultDoc = {
        id: 'default',
        title: 'Untitled Draft',
        content: '',
        updatedAt: new Date().toLocaleTimeString()
      };
      saveDocs([defaultDoc]);
      setActiveId('default');
    } else {
      saveDocs(filtered);
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
    }
  };

  const downloadTxt = () => {
    playSound('success');
    if (!activeDoc) return;
    const element = document.createElement('a');
    const file = new Blob([activeDoc.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDoc.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getWordCount = () => {
    if (!activeDoc || !activeDoc.content.trim()) return 0;
    return activeDoc.content.trim().split(/\s+/).length;
  };

  const getThemeClass = () => {
    switch (paperTheme) {
      case 'sepia': return 'bg-[#f4ecd8] text-[#433422] selection:bg-[#dfd0b0]';
      case 'light': return 'bg-[#fafafa] text-[#111111] selection:bg-blue-100';
      case 'matrix': return 'bg-[#050c05] text-[#00ff41] font-mono selection:bg-[#003b00]';
      case 'slate':
      default:
        return 'bg-slate-950 text-slate-200 selection:bg-slate-800';
    }
  };

  return (
    <div className="flex h-full w-full font-sans overflow-hidden">
      {/* Sidebar - list of drafts */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Documents</span>
          <button 
            onClick={createDoc}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Create Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {docs.map(doc => {
            const isActive = doc.id === activeId;
            return (
              <div
                key={doc.id}
                onClick={() => { playSound('click'); setActiveId(doc.id); }}
                className={`group px-2.5 py-2 rounded-lg cursor-pointer text-xs flex items-center justify-between gap-1 transition-all ${isActive ? 'bg-fuchsia-600/20 text-fuchsia-300 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <button
                  onClick={(e) => deleteDoc(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 rounded transition-opacity shrink-0"
                  title="Delete Document"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Theme select panel inside sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-2">Paper Skin</div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['slate', 'sepia', 'light', 'matrix'] as const).map(th => (
              <button
                key={th}
                onClick={() => { playSound('click'); setPaperTheme(th); }}
                className={`h-5 rounded text-[8px] font-bold uppercase border transition-all ${paperTheme === th ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
              >
                {th[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main editor pane */}
      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-200 ${getThemeClass()}`}>
        {/* Editor controls bar */}
        <div className="h-10 border-b border-black/10 flex items-center justify-between px-4 bg-black/5">
          <input 
            type="text" 
            value={activeDoc?.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Document Title"
            className="bg-transparent font-semibold text-sm border-none outline-none focus:ring-0 w-44 md:w-60 truncate"
          />
          
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadTxt}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-fuchsia-600/10 hover:bg-fuchsia-600 hover:text-white text-fuchsia-400 border border-fuchsia-500/20 transition-all font-medium"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Content input */}
        <textarea 
          value={activeDoc?.content || ''}
          onChange={(e) => updateContent(e.target.value)}
          className="flex-1 w-full p-6 bg-transparent resize-none outline-none font-sans leading-relaxed placeholder:opacity-30"
          placeholder="Start drafting..."
          autoFocus
        />

        {/* Live stats footer */}
        <div className="h-7 px-4 border-t border-black/10 bg-black/10 flex items-center justify-between text-[10px] font-mono opacity-70">
          <div className="flex gap-4">
            <span>Words: <strong>{getWordCount()}</strong></span>
            <span>Chars: <strong>{activeDoc?.content.length || 0}</strong></span>
            <span>Lines: <strong>{(activeDoc?.content.split('\n').length || 0)}</strong></span>
          </div>
          <div>
            <span>Saved: {activeDoc?.updatedAt || 'just now'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
