import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, ImageIcon, Music as MusicIcon, 
  ChevronLeft, ChevronRight, Plus, Trash2, Edit3, 
  Search, HardDrive, Monitor, FolderPlus, FilePlus, ExternalLink
} from 'lucide-react';
import { playSound } from '../../lib/sounds';

interface VirtualItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'image' | 'audio';
  content?: string;
  size?: string;
}

const DEFAULT_FILES: Record<string, VirtualItem[]> = {
  'Documents': [
    { id: 'welcome', name: 'welcome_note.txt', type: 'file', content: 'Welcome to your Virtual OS!\nThis is a fully persistent file system.\nYou can create, delete, and edit files for real!', size: '1.2 KB' },
    { id: 'todo', name: 'daily_todo.txt', type: 'file', content: '1. Build an operating system simulator [DONE]\n2. Make all apps work for real [PENDING]\n3. Deploy and share!', size: '320 B' },
  ],
  'Downloads': [
    { id: 'keys', name: 'secret_key.pem', type: 'file', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0y6p2... PRIVATE KEY END', size: '2.4 KB' },
  ],
  'Pictures': [
    { id: 'wallpaper_sci', name: 'cosmic_nebula.jpg', type: 'image', content: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=60', size: '4.8 MB' },
    { id: 'cyberpunk_city', name: 'cyberpunk_streets.jpg', type: 'image', content: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=600&auto=format&fit=crop&q=60', size: '3.2 MB' },
  ],
  'Music': [
    { id: 'synth_wave', name: 'retro_synth.mp3', type: 'audio', content: 'Synthwave track loop 120BPM', size: '5.1 MB' },
  ],
  'Videos': [
    { id: 'matrix_rain', name: 'matrix_digital_rain.mp4', type: 'file', content: 'Matrix digital green code stream binary', size: '12.4 MB' },
  ]
};

export default function FileExplorerApp() {
  const [currentFolder, setCurrentFolder] = useState<string>('Documents');
  const [items, setItems] = useState<Record<string, VirtualItem[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<VirtualItem | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('virtual_fs');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems(DEFAULT_FILES);
      }
    } else {
      setItems(DEFAULT_FILES);
    }
  }, []);

  const saveFS = (newFS: Record<string, VirtualItem[]>) => {
    setItems(newFS);
    localStorage.setItem('virtual_fs', JSON.stringify(newFS));
  };

  const currentItems = items[currentFolder] || [];
  const filteredItems = currentItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setPreviewFile(null);
  };

  const handleCreateFile = () => {
    playSound('click');
    const name = `new_file_${Date.now().toString().slice(-4)}.txt`;
    const newItem: VirtualItem = {
      id: `file_${Date.now()}`,
      name,
      type: 'file',
      content: 'This is a new text file. Start editing here!',
      size: '45 B'
    };
    const updated = {
      ...items,
      [currentFolder]: [...currentItems, newItem]
    };
    saveFS(updated);
  };

  const handleCreateFolder = () => {
    playSound('click');
    const name = `New Folder_${Date.now().toString().slice(-4)}`;
    const newItem: VirtualItem = {
      id: `folder_${Date.now()}`,
      name,
      type: 'folder',
      size: '0 B'
    };
    const updated = {
      ...items,
      [currentFolder]: [...currentItems, newItem]
    };
    saveFS(updated);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('close');
    const updatedFolder = currentItems.filter(item => item.id !== id);
    const updated = {
      ...items,
      [currentFolder]: updatedFolder
    };
    saveFS(updated);
    if (selectedId === id) setSelectedId(null);
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const handleStartRename = (item: VirtualItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(item.id);
    setRenameVal(item.name);
  };

  const handleSaveRename = (id: string) => {
    if (!renameVal.trim()) return;
    const updatedFolder = currentItems.map(item => {
      if (item.id === id) {
        return { ...item, name: renameVal.trim() };
      }
      return item;
    });
    const updated = {
      ...items,
      [currentFolder]: updatedFolder
    };
    saveFS(updated);
    setRenamingId(null);
  };

  const handleOpenItem = (item: VirtualItem) => {
    playSound('click');
    if (item.type === 'folder') {
      // If folder exists in fs keys, navigate there, else seed it
      const folderPath = `${currentFolder}/${item.name}`;
      if (!items[folderPath]) {
        saveFS({
          ...items,
          [folderPath]: []
        });
      }
      setCurrentFolder(folderPath);
      setSelectedId(null);
    } else {
      setPreviewFile(item);
      setEditContent(item.content || '');
    }
  };

  const handleSaveFileContent = () => {
    if (!previewFile) return;
    playSound('success');
    const updatedFolder = currentItems.map(item => {
      if (item.id === previewFile.id) {
        return { ...item, content: editContent, size: `${Math.round(editContent.length)} B` };
      }
      return item;
    });
    const updated = {
      ...items,
      [currentFolder]: updatedFolder
    };
    saveFS(updated);
    setPreviewFile({ ...previewFile, content: editContent });
  };

  const handleGoBack = () => {
    if (currentFolder.includes('/')) {
      const parts = currentFolder.split('/');
      parts.pop();
      setCurrentFolder(parts.join('/'));
      setSelectedId(null);
      setPreviewFile(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="w-12 h-12 text-amber-500 fill-amber-500/20" strokeWidth={1.5} />;
      case 'image': return <ImageIcon className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />;
      case 'audio': return <MusicIcon className="w-12 h-12 text-violet-400" strokeWidth={1.5} />;
      case 'file':
      default:
        return <FileText className="w-12 h-12 text-blue-400" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 rounded-b-lg overflow-hidden select-none font-sans">
      {/* Sidebar folders */}
      <div className="w-48 border-r border-white/10 bg-black/40 p-3 space-y-1 shrink-0 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-3">System Drives</div>
          <button 
            onClick={() => { setCurrentFolder('Documents'); setPreviewFile(null); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${currentFolder.startsWith('Documents') ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            <Folder className="w-4 h-4 text-blue-400" /> Documents
          </button>
          <button 
            onClick={() => { setCurrentFolder('Downloads'); setPreviewFile(null); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${currentFolder.startsWith('Downloads') ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            <Folder className="w-4 h-4 text-fuchsia-400" /> Downloads
          </button>
          <button 
            onClick={() => { setCurrentFolder('Pictures'); setPreviewFile(null); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${currentFolder.startsWith('Pictures') ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            <Folder className="w-4 h-4 text-emerald-400" /> Pictures
          </button>
          <button 
            onClick={() => { setCurrentFolder('Music'); setPreviewFile(null); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${currentFolder.startsWith('Music') ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            <Folder className="w-4 h-4 text-violet-400" /> Music
          </button>
          <button 
            onClick={() => { setCurrentFolder('Videos'); setPreviewFile(null); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${currentFolder.startsWith('Videos') ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
          >
            <Folder className="w-4 h-4 text-cyan-400" /> Videos
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Disk Status
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[45%]" />
          </div>
          <div className="text-[9px] text-slate-500 font-bold">54 GB / 120 GB remaining</div>
        </div>
      </div>

      {/* Main Folder View */}
      <div className="flex-1 bg-slate-900/40 flex flex-col">
        {/* Navigation bar */}
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-slate-900/80 shrink-0">
          <button 
            onClick={handleGoBack}
            disabled={!currentFolder.includes('/')}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-1.5 text-[11px] font-mono text-slate-400 flex items-center gap-2 select-all">
            <HardDrive className="w-3 h-3 text-slate-500 shrink-0" />
            <span>C:\Users\Admin\{currentFolder.replace(/\//g, '\\')}</span>
          </div>

          <div className="flex gap-1.5">
            <button 
              onClick={handleCreateFile}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-wider rounded-lg text-white flex items-center gap-1.5 transition-all"
            >
              <FilePlus className="w-3.5 h-3.5" /> File
            </button>
            <button 
              onClick={handleCreateFolder}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg text-white flex items-center gap-1.5 transition-all border border-white/5"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Folder
            </button>
          </div>
        </div>

        {/* Search bar & quick filters */}
        <div className="h-10 border-b border-white/5 flex items-center px-4 bg-slate-900/20 gap-4 shrink-0 justify-between">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-black/30 border border-white/5 rounded-lg pl-9 pr-4 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{filteredItems.length} items</span>
        </div>

        {/* Folder items grid */}
        <div className="flex-1 p-6 flex gap-6 content-start flex-wrap overflow-y-auto">
          {filteredItems.map(item => {
            const isSelected = selectedId === item.id;
            const isRenaming = renamingId === item.id;

            return (
              <div 
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                onDoubleClick={() => handleOpenItem(item)}
                className={`flex flex-col items-center gap-2 cursor-pointer p-3 rounded-2xl w-24 border relative group transition-all duration-200 ${isSelected ? 'bg-blue-600/10 border-blue-500/30' : 'border-transparent hover:bg-white/5'}`}
              >
                {/* Delete button (hover) */}
                <button 
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  className="absolute top-1 right-1 p-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="relative">
                  {getItemIcon(item.type)}
                </div>

                {isRenaming ? (
                  <input 
                    autoFocus
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={() => handleSaveRename(item.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                    className="w-full bg-blue-600 text-[10px] text-white text-center rounded border-none outline-none py-0.5 focus:ring-1 focus:ring-white/50"
                  />
                ) : (
                  <div className="text-[10px] font-bold text-center break-all w-full text-slate-200 line-clamp-2 px-1 relative">
                    {item.name}
                    <button 
                      onClick={(e) => handleStartRename(item, e)}
                      className="absolute -right-2 top-0 p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30 select-none py-12">
              <Folder className="w-16 h-16 text-slate-500 mb-2" strokeWidth={1} />
              <p className="text-xs font-bold uppercase tracking-widest">This folder is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      {previewFile && (
        <div className="w-72 border-l border-white/10 bg-slate-900 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{previewFile.name}</span>
            </div>
            <button 
              onClick={() => setPreviewFile(null)}
              className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5"
            >
              Close
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {previewFile.type === 'file' && (
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">File Editor</span>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none min-h-[160px]"
                />
                <button 
                  onClick={handleSaveFileContent}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 shrink-0"
                >
                  Save Changes
                </button>
              </div>
            )}

            {previewFile.type === 'image' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Image Preview</span>
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img src={previewFile.content} alt={previewFile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Dimensions</span><span className="font-semibold text-slate-300">1920 x 1080</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">File size</span><span className="font-semibold text-slate-300">{previewFile.size}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Format</span><span className="font-semibold text-slate-300">JPEG Image</span></div>
                </div>
              </div>
            )}

            {previewFile.type === 'audio' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audio Stream</span>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center gap-3">
                  <MusicIcon className="w-12 h-12 text-violet-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-400">{previewFile.name}</span>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold text-slate-300">3:24</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Bitrate</span><span className="font-semibold text-slate-300">320 kbps</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-semibold text-slate-300">{previewFile.size}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
