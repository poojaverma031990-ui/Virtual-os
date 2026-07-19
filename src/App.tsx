/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import { AppId, DesktopItem, AppFolder, DesktopWidget } from './types';
import { 
  Terminal, FileText, Monitor, Globe, Trash2, Folder,
  Calculator, Calendar, Clock as ClockIcon, Cloud,
  Music, Settings, Palette, Gamepad2, Hash,
  Activity, Key, Wifi, Camera, Map as MapIcon,
  ShoppingBag, PenTool, Bitcoin, ImageIcon,
  Mic, Sparkles, Code, Newspaper, X, Layout, Edit2, FolderPlus, Search, RefreshCw, FolderMinus, Anchor, XCircle, Info, Rocket
} from 'lucide-react';
import Window from './components/Window';
import DesktopIcon from './components/DesktopIcon';
import TerminalApp from './components/Terminal';
import NotepadApp from './components/Notepad';
import BrowserApp from './components/apps/BrowserApp';
import CalculatorApp from './components/apps/CalculatorApp';
import SnakeApp from './components/apps/SnakeApp';
import PaintApp from './components/apps/PaintApp';
import TicTacToeApp from './components/apps/TicTacToeApp';
import { CalendarApp, ClockApp, WeatherApp, CPUMonitorApp, PasswordApp, NetworkApp, PlaceholderApp } from './components/apps/UtilityApps';
import AppStore, { STORE_INVENTORY } from './components/apps/AppStore';
import { TerminalProApp, CryptoTrackerApp, AIGenApp } from './components/apps/ProApps';
import { VideoPlayerApp, VoiceRecorderApp, Cube3DApp, StockMarketApp, MarkdownEditorApp, SystemInfoApp, PianoApp, CompassApp } from './components/apps/MoreApps';
import { ChatApp, SynthApp, ChessApp, DJMixerApp, CodeEditorApp, SolitaireApp } from './components/apps/EvenMoreApps';
import { ThemeStoreApp } from './components/apps/ThemeStoreApp';
import { MemoryGameApp, HackerTyperApp, MetronomeApp, BreathingApp, NewsFlowApp } from './components/apps/ExtraApps';
import { PongApp, DrumSequencerApp, SpaceInvadersApp } from './components/apps/NewExtraApps';
import CryptoPulseApp from './components/apps/FinanceApps';
import VoiceMemoApp from './components/apps/AudioApps';
import ZenPhysicsApp from './components/apps/ZenApps';
import CodePadApp from './components/apps/DeveloperApps';
import ULabsApp from './components/apps/ULabsApp';
import { MusicApp, CameraApp, DrumKitApp } from './components/apps/MediaApps';
import { SettingsApp, MapsApp } from './components/apps/SystemApps';
import { ScopeApp } from './components/apps/ScopeApp';
import FileExplorerApp from './components/apps/FileExplorerApp';

// New Advanced Dynamic Apps
import { SkyExplorerApp, PeriodicTableApp } from './components/apps/ScientificApps';
import { FractalArtApp, PixelStudioApp, CellularAutomataApp, AudioVisualizerApp } from './components/apps/CreativeDesignApps';
import { StegoCryptoApp, JSSandboxApp } from './components/apps/CyberSecurityApps';
import { MindMapApp, TypingRaceApp, RPGQuestApp } from './components/apps/MindRacingApps';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { themeStore } from './themeStore';
import { speakText } from './lib/sounds';

const CORE_APPS = [
  { id: 'computer', title: 'My Computer', icon: Monitor },
  { id: 'files', title: 'Files', icon: Folder },
  { id: 'browser', title: 'Browser', icon: Globe },
  { id: 'store', title: 'App Store', icon: ShoppingBag },
  { id: 'terminal', title: 'Terminal', icon: Terminal },
  { id: 'notepad', title: 'Notepad', icon: FileText },
  { id: 'calculator', title: 'Calculator', icon: Calculator },
  { id: 'calendar', title: 'Calendar', icon: Calendar },
  { id: 'clock', title: 'Clock', icon: ClockIcon },
  { id: 'weather', title: 'Weather', icon: Cloud },
  { id: 'paint', title: 'Paint', icon: Palette },
  { id: 'snake', title: 'Snake Game', icon: Gamepad2 },
  { id: 'tictactoe', title: 'Tic Tac Toe', icon: Hash },
  { id: 'cpu', title: 'CPU Monitor', icon: Activity },
  { id: 'music', title: 'Music', icon: Music },
  { id: 'settings', title: 'Settings', icon: Settings },
  { id: 'crypto_tracker', title: 'Crypto Pulse', icon: Bitcoin },
  { id: 'voice_recorder', title: 'Voice Memo', icon: Mic },
  { id: 'zen_physics', title: 'Zen Physics', icon: Sparkles },
  { id: 'code_editor', title: 'CodePad', icon: Code },
  { id: 'news_flow', title: 'News Flow', icon: Newspaper },
  { id: 'passwords', title: 'Passwords', icon: Key },
  { id: 'network', title: 'Network', icon: Wifi },
  { id: 'camera', title: 'Camera', icon: Camera },
  { id: 'maps', title: 'Maps', icon: MapIcon },
  { id: 'scope', title: 'Scope', icon: Search, color: 'bg-blue-600' },
  { id: 'trash', title: 'Trash', icon: Trash2 },
] as const;

const ALL_APPS_REGISTRY = [
  ...CORE_APPS,
  ...STORE_INVENTORY.filter(s => !CORE_APPS.some(c => c.id === s.id))
];

import WidgetContainer from './components/WidgetContainer';

export default function App() {
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>(() => {
    const saved = localStorage.getItem('desktop_items_v2');
    let items: DesktopItem[];
    if (saved) {
      try { 
        items = JSON.parse(saved); 
      } catch (e) { 
        items = CORE_APPS.map(a => ({ type: 'app', id: a.id as AppId })); 
      }
    } else {
      items = CORE_APPS.map(a => ({ type: 'app', id: a.id as AppId }));
    }
    
    // Deduplicate items to prevent key collision errors
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  });
  
  const [folders, setFolders] = useState<AppFolder[]>(() => {
    const saved = localStorage.getItem('desktop_folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [widgets, setWidgets] = useState<DesktopWidget[]>(() => {
    const saved = localStorage.getItem('desktop_widgets');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('desktop_widgets', JSON.stringify(widgets));
  }, [widgets]);

  const [activeFolder, setActiveFolder] = useState<AppFolder | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [desktopLocked, setDesktopLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('desktop_locked_v2');
    return saved === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('desktop_locked_v2', String(desktopLocked));
  }, [desktopLocked]);

  const [taskbarAppIds, setTaskbarAppIds] = useState<AppId[]>(() => {
    const saved = localStorage.getItem('taskbar_pinned_v1');
    return saved ? JSON.parse(saved) : ['computer', 'files', 'browser', 'store', 'terminal', 'crypto_tracker', 'code_editor', 'settings'];
  });

  React.useEffect(() => {
    localStorage.setItem('taskbar_pinned_v1', JSON.stringify(taskbarAppIds));
  }, [taskbarAppIds]);

  const [openApps, setOpenApps] = useState<AppId[]>(() => {
    const saved = localStorage.getItem('open_apps_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [activeApp, setActiveApp] = useState<AppId | null>(() => {
    const saved = localStorage.getItem('active_app_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  React.useEffect(() => {
    localStorage.setItem('open_apps_v1', JSON.stringify(openApps));
  }, [openApps]);

  React.useEffect(() => {
    localStorage.setItem('active_app_v1', JSON.stringify(activeApp));
  }, [activeApp]);

  const [contextMenu, setContextMenu] = useState<{ id?: string; x: number; y: number; type: 'item' | 'desktop'; parentFolderId?: string } | null>(null);
  const [aboutApp, setAboutApp] = useState<AppId | null>(null);
  const [theme, setTheme] = useState(themeStore.get());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('desktop_items_v2', JSON.stringify(desktopItems));
  }, [desktopItems]);

  React.useEffect(() => {
    localStorage.setItem('desktop_folders', JSON.stringify(folders));
  }, [folders]);

  React.useEffect(() => {
    const handleAddWidget = (e: any) => {
      setWidgets(prev => [...prev, e.detail]);
    };
    window.addEventListener('add_desktop_widget', handleAddWidget);
    return () => window.removeEventListener('add_desktop_widget', handleAddWidget);
  }, []);

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<DesktopWidget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  React.useEffect(() => {
    return themeStore.subscribe(() => {
      setTheme(themeStore.get());
    });
  }, []);

  const handleDragEnd = (event: any, info: any, itemId: string) => {
    setDraggingId(null);
    
    // Use bounding rects for more reliable drop target detection
    const elements = Array.from(document.querySelectorAll('[data-desktop-item-id]'));
    let targetId: string | null = null;
    
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      // Hit detection area
      if (
        info.point.x >= rect.left && 
        info.point.x <= rect.right && 
        info.point.y >= rect.top && 
        info.point.y <= rect.bottom
      ) {
        const id = el.getAttribute('data-desktop-item-id');
        if (id && id !== itemId) {
          targetId = id;
          break;
        }
      }
    }

    if (targetId) {
      const itemIndex = desktopItems.findIndex(i => i.id === itemId);
      const targetIndex = desktopItems.findIndex(i => i.id === targetId);
      
      if (itemIndex !== -1 && targetIndex !== -1) {
        const item = desktopItems[itemIndex];
        const target = desktopItems[targetIndex];

        // App onto App -> Folder
        if (item.type === 'app' && target.type === 'app') {
          const newFolderId = `folder_${Date.now()}`;
          const newFolder: AppFolder = {
            id: newFolderId,
            title: 'New Folder',
            appIds: [target.id as AppId, item.id as AppId]
          };
          setFolders(prev => [...prev, newFolder]);
          
          const newItems = [...desktopItems];
          newItems[targetIndex] = { type: 'folder', id: newFolderId, title: 'New Folder' };
          newItems.splice(itemIndex, 1);
          setDesktopItems(newItems.filter(i => i.id !== itemId));
          speakText("New folder created");
          return;
        }

        // App onto Folder -> Add
        if (item.type === 'app' && target.type === 'folder') {
          setFolders(prev => prev.map(f => f.id === target.id ? { ...f, appIds: [...f.appIds, item.id as AppId] } : f));
          setDesktopItems(prev => prev.filter(i => i.id !== itemId));
          speakText("App added to folder");
          return;
        }

        // Reorder
        const newItems = [...desktopItems];
        const [movedItem] = newItems.splice(itemIndex, 1);
        const reTargetIndex = newItems.findIndex(i => i.id === targetId);
        newItems.splice(reTargetIndex, 0, movedItem);
        setDesktopItems(newItems);
        speakText("Item reordered");
      }
    }
  };

  const openFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) setActiveFolder(folder);
  };

  const closeFolder = () => setActiveFolder(null);

  const openApp = (id: AppId) => {
    if (!openApps.includes(id)) {
      setOpenApps([...openApps, id]);
    }
    setActiveApp(id);
    setContextMenu(null);
    const app = ALL_APPS_REGISTRY.find((a) => a.id === id);
    if (app) {
      speakText(`${app.title} loaded`);
    }
  };

  const closeApp = (id: AppId) => {
    setOpenApps(openApps.filter((appId) => appId !== id));
    if (activeApp === id) {
      setActiveApp(openApps[openApps.length - 2] || null);
    }
    const app = ALL_APPS_REGISTRY.find((a) => a.id === id);
    if (app) {
      speakText(`Closed ${app.title}`);
    }
  };

  const focusApp = (id: AppId) => {
    setActiveApp(id);
  };

  const handleInstallApp = (id: AppId) => {
    if (!desktopItems.some(item => item.id === id)) {
      setDesktopItems(prev => [...prev, { type: 'app', id }]);
    }
  };

  const handleUninstallApp = (id: AppId) => {
    setDesktopItems(prev => prev.filter(item => item.id !== id));
    closeApp(id);
    setContextMenu(null);
  };

  const handleRenameItem = (id: string, newTitle: string) => {
    const item = desktopItems.find(i => i.id === id);
    if (item?.type === 'folder') {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, title: newTitle } : f));
    } else {
      setDesktopItems(prev => prev.map(i => i.id === id ? { ...i, title: newTitle } : i));
    }
    setRenamingId(null);
  };

  const handleToggleDesktopPin = (id: AppId) => {
    if (desktopItems.some(item => item.id === id)) {
      setDesktopItems(prev => prev.filter(item => item.id !== id));
      speakText(`Removed shortcut from Home Screen`);
    } else {
      setDesktopItems(prev => [...prev, { type: 'app', id }]);
      speakText(`Added shortcut to Home Screen`);
    }
    setContextMenu(null);
  };

  const handleToggleTaskbarPin = (id: AppId) => {
    if (taskbarAppIds.includes(id)) {
      setTaskbarAppIds(prev => prev.filter(appId => appId !== id));
      speakText(`Unpinned from Down Panel`);
    } else {
      setTaskbarAppIds(prev => [...prev, id]);
      speakText(`Pinned to Down Panel`);
    }
    setContextMenu(null);
  };

  const handleRemoveFromFolder = (folderId: string, appId: string) => {
    let updatedFolders = folders.map(f => {
      if (f.id === folderId) {
        return { ...f, appIds: f.appIds.filter(id => id !== appId) };
      }
      return f;
    });

    const targetFolder = updatedFolders.find(f => f.id === folderId);
    const isEmpty = targetFolder ? targetFolder.appIds.length === 0 : false;

    if (isEmpty) {
      updatedFolders = updatedFolders.filter(f => f.id !== folderId);
      setDesktopItems(prev => prev.filter(i => i.id !== folderId));
      if (activeFolder?.id === folderId) {
        setActiveFolder(null);
      }
      speakText(`Removed empty folder`);
    } else {
      if (activeFolder?.id === folderId) {
        setActiveFolder(prev => prev ? { ...prev, appIds: prev.appIds.filter(id => id !== appId) } : null);
      }
      speakText(`Removed app from folder`);
    }

    setFolders(updatedFolders);

    if (!desktopItems.some(i => i.id === appId)) {
      setDesktopItems(prev => [...prev, { type: 'app', id: appId as AppId }]);
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, id?: string, parentFolderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    let x = 0;
    let y = 0;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }
    setContextMenu({ id, x, y, type: id ? 'item' : 'desktop', parentFolderId });
  };

  let fontClass = 'font-sans';
  if (theme.fontFamily === 'mono') fontClass = 'font-mono';
  if (theme.fontFamily === 'serif') fontClass = 'font-serif';

  let cursorClass = 'cursor-default';
  if (theme.cursorStyle === 'crosshair') cursorClass = 'cursor-crosshair';
  if (theme.cursorStyle === 'terminal') cursorClass = 'cursor-text';

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden text-slate-100 ${fontClass} ${cursorClass} selection:bg-fuchsia-500/30 bg-cover bg-center transition-all duration-500 ${theme.taskbarStyle === 'top' ? 'flex-col-reverse' : 'flex-col'} ${theme.iconTheme === 'neon' ? 'theme-icon-neon' : ''} ${theme.iconTheme === 'minimal' ? 'grayscale' : ''} ${theme.iconTheme === 'glass' ? 'theme-icon-glass' : ''}`} 
      style={{ background: (theme.wallpaper === 'default' || ['matrix', 'starfield', 'neon_waves', 'aurora_glow'].includes(theme.wallpaper)) 
        ? '#020205' 
        : (theme.wallpaper.startsWith('http') || theme.wallpaper.startsWith('/') || theme.wallpaper.includes('unsplash.com'))
          ? `url("${theme.wallpaper}")`
          : theme.wallpaper 
      }}
      onClick={() => setContextMenu(null)}
    >
      <Desktop>
        {/* Desktop Context Menu Trigger Background */}
        <div 
          className="absolute inset-0 z-0" 
          onContextMenu={(e) => handleContextMenu(e)}
        />
        {/* Widgets Layer */}
        <div className="absolute inset-0 pointer-events-none p-6 pt-12">
          <Reorder.Group 
            axis="y" 
            values={widgets} 
            onReorder={setWidgets}
            className="grid grid-cols-6 md:grid-cols-12 gap-6 h-full pointer-events-auto overflow-y-auto pb-24 pr-4 custom-scrollbar"
          >
            {widgets.map((widget) => (
              <Reorder.Item
                key={widget.id}
                value={widget}
                dragListener={false}
                className={`rounded-3xl border shadow-2xl overflow-hidden group relative transition-all duration-300 ${
                  widget.variant === 'solid' 
                    ? 'bg-slate-900 border-slate-700' 
                    : widget.variant === 'neon'
                      ? 'bg-black/80 border-fuchsia-500/50 shadow-fuchsia-500/20'
                      : 'bg-white/10 backdrop-blur-2xl border-white/20'
                }`}
                style={{
                  gridColumn: `span ${widget.w}`,
                  gridRow: `span ${widget.h}`,
                }}
              >
                <div className="h-full w-full relative">
                  {/* Drag Handle */}
                  <div 
                    onPointerDown={(e) => { e.preventDefault(); /* Reorder trigger logic is handled by Reorder.Item with dragListener={false} but we need a handle */ }}
                    className="absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/20 to-transparent"
                    onPointerDownCapture={(e) => { 
                      // This allows the item to be dragged only via this handle
                      // @ts-ignore
                      e.currentTarget.parentElement.parentElement.dispatchEvent(new PointerEvent('pointerdown', e)); 
                    }}
                  />

                  <WidgetContainer type={widget.type} />
                  
                  {/* Widget Controls Overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-4px] group-hover:translate-y-0 z-30">
                    {/* Size Controls */}
                    <div className="flex bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-1 gap-1">
                      <button 
                        onClick={() => updateWidget(widget.id, { w: Math.min(6, widget.w + 1) })}
                        disabled={widget.w >= 6}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-colors"
                        title="Expand Width"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => updateWidget(widget.id, { w: Math.max(2, widget.w - 1) })}
                        disabled={widget.w <= 2}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-colors"
                        title="Shrink Width"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-1 gap-1">
                      <button 
                        onClick={() => updateWidget(widget.id, { h: Math.min(4, widget.h + 1) })}
                        disabled={widget.h >= 4}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-colors"
                        title="Expand Height"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => updateWidget(widget.id, { h: Math.max(1, widget.h - 1) })}
                        disabled={widget.h <= 1}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-colors"
                        title="Shrink Height"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variant Cycle */}
                    <button 
                      onClick={() => {
                        const variants: any[] = ['glass', 'solid', 'neon'];
                        const next = variants[(variants.indexOf(widget.variant || 'glass') + 1) % variants.length];
                        updateWidget(widget.id, { variant: next });
                      }}
                      className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-white/20 rounded-xl text-white border border-white/10 transition-colors"
                      title="Toggle Style"
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => removeWidget(widget.id)}
                      className="p-1.5 bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 rounded-xl text-red-400 border border-red-500/20 transition-colors"
                      title="Remove Widget"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Icons Grid */}
        <div className="p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 items-start content-start h-full overflow-y-auto pb-20 relative z-10">
          {desktopItems.map((item) => {
            if (item.type === 'app') {
              const app = ALL_APPS_REGISTRY.find((a) => a.id === item.id);
              if (!app) return null;
              const displayTitle = item.title || app.title;
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  drag={!isTouchDevice && !desktopLocked}
                  dragElastic={0.1}
                  onDragStart={() => setDraggingId(item.id)}
                  onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                  data-desktop-item-id={item.id}
                  className="z-10"
                >
                  {renamingId === item.id ? (
                    <div className="flex flex-col items-center gap-1 w-20">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                        <app.icon className="w-6 h-6 text-white/40" />
                      </div>
                      <input 
                        autoFocus
                        className="w-full bg-blue-500/80 text-[10px] font-bold text-white text-center rounded border-none outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue={displayTitle}
                        onBlur={(e) => handleRenameItem(item.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameItem(item.id, e.currentTarget.value)}
                      />
                    </div>
                  ) : (
                    <DesktopIcon
                      id={app.id}
                      icon={app.icon}
                      title={displayTitle}
                      onClick={() => openApp(app.id as AppId)}
                      onContextMenu={handleContextMenu}
                      iconTheme={theme.iconTheme}
                      accentColor={theme.accentColor}
                      iconSize={theme.iconSize}
                    />
                  )}
                </motion.div>
              );
            } else {
              const folder = folders.find(f => f.id === item.id);
              if (!folder) return null;
              return (
                <motion.div
                  key={item.id}
                  layout
                  drag={!isTouchDevice && !desktopLocked}
                  dragElastic={0.1}
                  onDragStart={() => setDraggingId(item.id)}
                  onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                  data-desktop-item-id={item.id}
                  className="z-10"
                >
                  <div 
                    onClick={() => openFolder(folder.id)}
                    onContextMenu={(e) => handleContextMenu(e, folder.id)}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 grid grid-cols-2 p-2 gap-1 group-hover:bg-white/20 transition-all">
                      {folder.appIds.slice(0, 4).map(id => {
                        const app = ALL_APPS_REGISTRY.find(a => a.id === id);
                        return app ? <app.icon key={id} className="w-full h-full text-white/80" /> : null;
                      })}
                    </div>
                    {renamingId === folder.id ? (
                      <input 
                        autoFocus
                        className="w-full bg-blue-500/80 text-[10px] font-bold text-white text-center rounded border-none outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue={folder.title}
                        onClick={e => e.stopPropagation()}
                        onBlur={(e) => handleRenameItem(folder.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameItem(folder.id, e.currentTarget.value)}
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-white shadow-sm">{folder.title}</span>
                    )}
                  </div>
                </motion.div>
              );
            }
          })}
        </div>

        {/* Folder Overlay */}
        <AnimatePresence>
          {activeFolder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-lg"
              onClick={closeFolder}
            >
              <div 
                className="bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 w-full max-w-lg shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={closeFolder} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                  <X className="w-6 h-6" />
                </button>
                <div className="mb-8">
                  <input 
                    className="bg-transparent text-3xl font-black text-white border-none outline-none focus:ring-0 w-full"
                    value={activeFolder.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFolders(prev => prev.map(f => f.id === activeFolder.id ? { ...f, title: newTitle } : f));
                      setActiveFolder({ ...activeFolder, title: newTitle });
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-6">
                  {activeFolder.appIds.map(appId => {
                    const app = ALL_APPS_REGISTRY.find(a => a.id === appId);
                    if (!app) return null;
                    return (
                      <DesktopIcon
                        key={appId}
                        id={app.id}
                        icon={app.icon}
                        title={app.title}
                        onClick={() => { openApp(appId as AppId); closeFolder(); }}
                        onContextMenu={(e) => handleContextMenu(e, appId, activeFolder.id)}
                        iconTheme={theme.iconTheme}
                        accentColor={theme.accentColor}
                        iconSize={theme.iconSize}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-[190]" 
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
            />
            <div 
              className="absolute z-[200] w-56 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              style={{ left: Math.min(contextMenu.x, window.innerWidth - 240), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.type === 'item' && contextMenu.id ? (
                <>
                  <div className="px-3.5 py-1.5 border-b border-white/5 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                      {ALL_APPS_REGISTRY.find(a => a.id === contextMenu.id)?.title || 
                       folders.find(f => f.id === contextMenu.id)?.title || 
                       "Application"}
                    </span>
                  </div>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-blue-600 transition-colors flex items-center justify-between"
                    onClick={() => {
                      if (folders.some(f => f.id === contextMenu.id)) {
                        openFolder(contextMenu.id!);
                      } else {
                        openApp(contextMenu.id as AppId);
                      }
                      setContextMenu(null);
                    }}
                  >
                    <span>🚀 Launch Item</span>
                  </button>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => { setRenamingId(contextMenu.id!); setContextMenu(null); }}
                  >
                    <span>✏️ Rename / Edit</span>
                    <Edit2 className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  {contextMenu.parentFolderId && (
                    <button 
                      className="w-full text-left px-4 py-2 text-xs font-bold text-orange-400 hover:bg-white/5 transition-colors flex items-center justify-between"
                      onClick={() => { handleRemoveFromFolder(contextMenu.parentFolderId!, contextMenu.id!); setContextMenu(null); }}
                    >
                      <span>📦 Move to Desktop</span>
                      <FolderPlus className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  )}

                  {!contextMenu.parentFolderId && !folders.some(f => f.id === contextMenu.id) && (
                    <button 
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                      onClick={() => { handleToggleDesktopPin(contextMenu.id as AppId); setContextMenu(null); }}
                    >
                      <span>❌ Remove Shortcut</span>
                    </button>
                  )}

                  {!folders.some(f => f.id === contextMenu.id) && (
                    <button 
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                      onClick={() => { handleToggleTaskbarPin(contextMenu.id as AppId); setContextMenu(null); }}
                    >
                      {taskbarAppIds.includes(contextMenu.id as AppId) ? (
                        <span className="text-pink-400">⚓ Unpin from Panel</span>
                      ) : (
                        <span>⚓ Pin to Down Panel</span>
                      )}
                    </button>
                  )}

                  <div className="h-px bg-white/5 my-1.5" />

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 transition-colors"
                    onClick={() => { 
                      const app = ALL_APPS_REGISTRY.find(a => a.id === contextMenu.id);
                      if (app) {
                        setAboutApp(app.id as AppId);
                      } else {
                        const folder = folders.find(f => f.id === contextMenu.id);
                        alert(`Folder: ${folder?.title}\nContains: ${folder?.appIds.length} apps`);
                      }
                      setContextMenu(null); 
                    }}
                  >
                    ℹ️ About & Details
                  </button>

                  {!folders.some(f => f.id === contextMenu.id) && (
                    <button 
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={() => { handleUninstallApp(contextMenu.id as AppId); setContextMenu(null); }}
                    >
                      💥 Delete & Uninstall
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="px-3.5 py-1.5 border-b border-white/5 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Desktop</span>
                  </div>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => {
                      speakText("Refreshing system cache");
                      setContextMenu(null);
                    }}
                  >
                    <span>🔃 Refresh Interface</span>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  </button>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => {
                      const nextLock = !desktopLocked;
                      setDesktopLocked(nextLock);
                      speakText(nextLock ? "Desktop icons locked" : "Desktop icons unlocked");
                      setContextMenu(null);
                    }}
                  >
                    {desktopLocked ? (
                      <>
                        <span>🔓 Unlock Desktop Icons</span>
                        <Anchor className="w-3.5 h-3.5 text-orange-400" />
                      </>
                    ) : (
                      <>
                        <span>🔒 Lock Desktop Icons</span>
                        <Anchor className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      </>
                    )}
                  </button>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => {
                      const newFolder: AppFolder = {
                        id: 'folder-' + Date.now(),
                        title: 'New Folder',
                        appIds: []
                      };
                      setFolders(prev => [...prev, newFolder]);
                      setDesktopItems(prev => [...prev, { type: 'folder', id: newFolder.id }]);
                      setContextMenu(null);
                      speakText("Created new folder");
                    }}
                  >
                    <span>📁 Create Directory</span>
                    <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  <div className="h-px bg-white/5 my-1.5" />

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => {
                      openApp('settings');
                      setContextMenu(null);
                    }}
                  >
                    <span>🎨 Personalization</span>
                  </button>

                  <button 
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => {
                      openApp('terminal');
                      setContextMenu(null);
                    }}
                  >
                    <span>📟 Open Terminal</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}

        <AnimatePresence>
          {aboutApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              onClick={() => setAboutApp(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-500" />
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                    {(() => {
                      const app = ALL_APPS_REGISTRY.find(a => a.id === aboutApp);
                      return app ? <app.icon className="w-10 h-10 text-white" /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {ALL_APPS_REGISTRY.find(a => a.id === aboutApp)?.title}
                    </h3>
                    <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">Version 1.0.4-LTS</p>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This professional-grade application is part of the CyberOS ecosystem, optimized for ultra-fast performance and real-time interaction.
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full mt-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</div>
                      <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Optimized
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Memory</div>
                      <div className="text-[10px] font-bold text-blue-400">0.42 MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAboutApp(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all border border-white/10 mt-2"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openApps.map((appId) => {
            const app = ALL_APPS_REGISTRY.find((a) => a.id === appId)!;
            return (
              <Window
                key={app.id}
                title={app.title}
                isActive={activeApp === app.id}
                onClose={() => closeApp(app.id as AppId)}
                onFocus={() => focusApp(app.id as AppId)}
                icon={app.icon}
                defaultMaximized={app.id === 'u_labs'}
              >
                {/* App Content */}
                <div className="h-full w-full relative">
                  {app.id === 'store' && <AppStore installedApps={desktopItems.map(i => i.id as AppId)} onInstall={handleInstallApp} />}
                  {app.id === 'terminal' && <TerminalApp />}
                  {app.id === 'notepad' && <NotepadApp />}
                  {app.id === 'browser' && <BrowserApp />}
                  {app.id === 'calculator' && <CalculatorApp />}
                  {app.id === 'snake' && <SnakeApp />}
                  {app.id === 'paint' && <PaintApp />}
                  {app.id === 'tictactoe' && <TicTacToeApp />}
                  {app.id === 'calendar' && <CalendarApp />}
                  {app.id === 'clock' && <ClockApp />}
                  {app.id === 'weather' && <WeatherApp />}
                  {app.id === 'cpu' && <CPUMonitorApp />}
                  {app.id === 'passwords' && <PasswordApp />}
                  {app.id === 'network' && <NetworkApp />}
                  {app.id === 'terminal_pro' && <TerminalProApp />}
                  {app.id === 'crypto_tracker' && <CryptoPulseApp />}
                  {app.id === 'ai_gen' && <AIGenApp />}
                  {app.id === 'music' && <MusicApp />}
                  {app.id === 'camera' && <CameraApp />}
                  {app.id === 'drum_kit' && <DrumKitApp />}
                  {app.id === 'settings' && <SettingsApp />}
                  {app.id === 'maps' && <MapsApp />}
                  {app.id === 'scope' && <ScopeApp />}
                  {app.id === 'cyber_paint' && <PaintApp />}
                  {app.id === 'space_invaders' && <SpaceInvadersApp />}
                  {app.id === 'video_player' && <VideoPlayerApp />}
                  {app.id === 'voice_recorder' && <VoiceMemoApp />}
                  {app.id === 'cube_3d' && <Cube3DApp />}
                  {app.id === 'stock_market' && <StockMarketApp />}
                  {app.id === 'markdown_editor' && <MarkdownEditorApp />}
                  {app.id === 'system_info' && <SystemInfoApp />}
                  {app.id === 'piano' && <PianoApp />}
                  {app.id === 'compass' && <CompassApp />}
                  {app.id === 'chat' && <ChatApp />}
                  {app.id === 'synth' && <SynthApp />}
                  {app.id === 'chess' && <ChessApp />}
                  {app.id === 'dj_mixer' && <DJMixerApp />}
                  {app.id === 'code_editor' && <CodePadApp />}
                  {app.id === 'solitaire' && <SolitaireApp />}
                  {app.id === 'theme_store' && <ThemeStoreApp />}
                  {app.id === 'memory_game' && <MemoryGameApp />}
                  {app.id === 'hacker_typer' && <HackerTyperApp />}
                  {app.id === 'metronome' && <MetronomeApp />}
                  {app.id === 'breathing' && <BreathingApp />}
                  {app.id === 'news_flow' && <NewsFlowApp />}
                  {app.id === 'zen_physics' && <ZenPhysicsApp />}
                  {app.id === 'pong' && <PongApp />}
                  {app.id === 'drum_sequencer' && <DrumSequencerApp />}
                  {app.id === 'u_labs' && <ULabsApp />}
                  {app.id === 'sky_explorer' && <SkyExplorerApp />}
                  {app.id === 'periodic_table' && <PeriodicTableApp />}
                  {app.id === 'fractal_art' && <FractalArtApp />}
                  {app.id === 'pixel_studio' && <PixelStudioApp />}
                  {app.id === 'cellular_automata' && <CellularAutomataApp />}
                  {app.id === 'stego_crypto' && <StegoCryptoApp />}
                  {app.id === 'js_sandbox' && <JSSandboxApp />}
                  {app.id === 'mind_map' && <MindMapApp />}
                  {app.id === 'typing_race' && <TypingRaceApp />}
                  {app.id === 'rpg_quest' && <RPGQuestApp />}
                  {app.id === 'audio_visualizer' && <AudioVisualizerApp />}
                  
                  {app.id === 'computer' && (
                    <div className="flex h-full w-full bg-slate-900/50 text-slate-200 rounded-b-lg overflow-hidden select-none">
                      <div className="w-48 border-r border-white/10 bg-black/40 p-2 space-y-1">
                        <div className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2"><Monitor className="w-4 h-4"/> This PC</div>
                        <div className="px-3 py-2 hover:bg-white/10 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2"><Globe className="w-4 h-4"/> Network</div>
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto">
                        <h2 className="text-sm font-bold text-slate-400 border-b border-white/10 pb-2 mb-4">Devices and drives (2)</h2>
                        <div className="flex gap-4">
                          <div className="w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors shadow-lg flex gap-4 items-center">
                             <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center border border-white/10">
                               <Monitor className="w-6 h-6 text-blue-400" />
                             </div>
                             <div className="flex-1">
                               <div className="text-sm font-bold text-white mb-1">Local Disk (C:)</div>
                               <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 mb-1">
                                 <div className="bg-blue-500 h-full w-[65%]" />
                               </div>
                               <div className="text-[10px] text-slate-400">42.5 GB free of 120 GB</div>
                             </div>
                          </div>
                          
                          <div className="w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors shadow-lg flex gap-4 items-center">
                             <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center border border-white/10">
                               <Monitor className="w-6 h-6 text-fuchsia-400" />
                             </div>
                             <div className="flex-1">
                               <div className="text-sm font-bold text-white mb-1">Storage (D:)</div>
                               <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 mb-1">
                                 <div className="bg-fuchsia-500 h-full w-[12%]" />
                               </div>
                               <div className="text-[10px] text-slate-400">880 GB free of 1000 GB</div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {app.id === 'trash' && (
                    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-200 rounded-b-lg overflow-hidden select-none">
                      <div className="h-12 bg-slate-900 border-b border-white/10 flex items-center px-4 gap-4">
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded border border-white/10 transition-colors flex items-center gap-2 active:bg-slate-600" onClick={() => alert("Trash is already empty.")}>
                          <Trash2 className="w-3 h-3 text-red-400" /> Empty Trash
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <Trash2 className="w-16 h-16 mb-4 opacity-20 text-slate-400" />
                        <p className="text-sm font-medium text-slate-400">Trash is empty</p>
                      </div>
                    </div>
                  )}
                  {app.id === 'files' && (
                    <FileExplorerApp />
                  )}
                </div>
              </Window>
            );
          })}
        </AnimatePresence>
      </Desktop>
      
      <Taskbar 
        apps={ALL_APPS_REGISTRY.filter(app => 
          taskbarAppIds.includes(app.id as AppId) || openApps.includes(app.id as AppId)
        )} 
        allApps={ALL_APPS_REGISTRY}
        openApps={openApps} 
        activeApp={activeApp} 
        onAppClick={openApp} 
        themeStyle={theme.taskbarStyle}
        installedAppIds={desktopItems.map(i => i.id as AppId)}
        taskbarAppIds={taskbarAppIds}
        onToggleDesktopPin={handleToggleDesktopPin}
        onToggleTaskbarPin={handleToggleTaskbarPin}
      />

      {/* Dynamic System Overlays */}
      {theme.brightness < 100 && (
        <div 
          className="absolute inset-0 pointer-events-none z-[9999] bg-black transition-opacity duration-200" 
          style={{ opacity: (100 - theme.brightness) / 100 }}
        />
      )}
      {theme.nightLight && (
        <div 
          className="absolute inset-0 pointer-events-none z-[9998] bg-amber-600/15 mix-blend-multiply transition-all duration-300"
        />
      )}
    </div>
  );
}
