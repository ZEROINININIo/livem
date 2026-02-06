
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Activity, Wifi, Cpu, Hexagon, AlertTriangle, Radio, User, Video, Ruler, Crosshair, Zap, Timer, Play, Square, RotateCcw, Edit2, Plus, Trash2, Save, X, Check, Terminal, RefreshCw, Sun, Moon } from 'lucide-react';

// --- Constants & Storage ---
const STORAGE_KEY_MESSAGES = 'nova_stream_messages_v1';
const STORAGE_KEY_OPS = 'nova_stream_ops_v1';
const STORAGE_KEY_ACTIVE_OP = 'nova_stream_active_op_v1';

const DEFAULT_MESSAGES = [
    "欢迎来到直播间 // WELCOME_TO_STREAM",
    "当前进行：毛绒手搓project..",
    "请遵守直播间礼仪 // 保持理性",
    "欢迎！",
    "手工制作中 [Handmade/Crafting]",
    "SYSTEM_STATUS: NOMINAL"
];

const DEFAULT_OPS = ["ZEROXV", "GUEST", "ADMIN"];

// --- 样式隔离组件 (Static) ---
const TickerStyles = React.memo(() => (
    <style>{`
        @keyframes ticker-slide-up {
            0% { opacity: 0; transform: translateY(100%); }
            15% { opacity: 1; transform: translateY(0); }
            85% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-100%); }
        }
        .animate-ticker-slide {
            animation: ticker-slide-up 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
    `}</style>
), () => true);

// --- 滚动组件 (Dynamic) ---
const NewsTicker = ({ items, onEdit, isLightTheme }: { items: string[], onEdit: () => void, isLightTheme: boolean }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [items.length]);

    // Safe access
    const currentItem = items.length > 0 ? items[currentIndex % items.length] : "NO_DATA // PLEASE_CONFIGURE";

    const themeClass = isLightTheme 
        ? 'bg-white/90 border-emerald-600/30 text-emerald-900' 
        : 'bg-black/80 border-emerald-500/30 text-emerald-100/90';

    return (
        <div 
            className="absolute bottom-6 left-4 flex gap-0 w-[420px] pointer-events-auto z-50 h-8 items-stretch font-mono group/ticker cursor-pointer"
            onClick={onEdit}
            title="Click to Edit Messages"
        >
            {/* Ticker Label */}
            <div className="bg-emerald-600 text-black font-black text-xs px-2 flex items-center gap-1 shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)] group-hover/ticker:bg-emerald-500 transition-colors">
                <AlertTriangle size={14} />
                <span>NEWS</span>
            </div>
            
            {/* Content Container */}
            <div className={`flex-1 border-y border-r relative overflow-hidden flex items-center group-hover/ticker:border-emerald-500/60 transition-colors ${themeClass}`}>
                {/* Background Grid Texture */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.3)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                
                {/* Slideshow Content */}
                <div key={`${currentIndex}-${items.length}`} className="px-4 w-full animate-ticker-slide absolute top-0 h-full flex items-center text-xs">
                    <span className="truncate w-full block">
                        {currentItem}
                        <span className="opacity-30 text-emerald-500 ml-2">///</span>
                    </span>
                </div>

                {/* Edit Hint Overlay */}
                <div className="absolute inset-0 bg-emerald-900/80 flex items-center justify-center opacity-0 group-hover/ticker:opacity-100 transition-opacity backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-widest">
                        <Edit2 size={12} /> Edit Feed
                    </span>
                </div>
            </div>
            
            {/* Live Signal Decor */}
            <div className="absolute -top-1 -right-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>
        </div>
    );
};

// --- Editor Modal Component ---
interface EditorModalProps {
    title: string;
    items: string[];
    activeItem?: string;
    onClose: () => void;
    onSave: (newItems: string[]) => void;
    onSetActive?: (item: string) => void;
    onReset: () => void;
    children?: React.ReactNode;
}

const EditorModal: React.FC<EditorModalProps> = ({ title, items, activeItem, onClose, onSave, onSetActive, onReset, children }) => {
    const [localItems, setLocalItems] = useState(items);
    const [newItemText, setNewItemText] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const handleAddItem = () => {
        if (newItemText.trim()) {
            const updated = [...localItems, newItemText.trim()];
            setLocalItems(updated);
            onSave(updated);
            setNewItemText("");
        }
    };

    const handleDeleteItem = (index: number) => {
        const updated = localItems.filter((_, i) => i !== index);
        setLocalItems(updated);
        onSave(updated);
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditText(localItems[index]);
    };

    const saveEdit = (index: number) => {
        if (editText.trim()) {
            const updated = [...localItems];
            updated[index] = editText.trim();
            setLocalItems(updated);
            onSave(updated);
        }
        setEditingIndex(null);
    };

    const handleReset = () => {
        if (window.confirm("RESET TO DEFAULT SETTINGS?")) {
            onReset();
            onClose(); // Close to refresh state from parent
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center font-custom-02 animate-fade-in cursor-default" onClick={onClose}>
            <div className="w-96 bg-black border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-emerald-950/50 border-b border-emerald-500/30 p-3 flex justify-between items-center cursor-move">
                    <div className="text-emerald-400 font-bold font-mono uppercase tracking-widest flex items-center gap-2 select-none">
                        <Terminal size={14} /> {title}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="text-emerald-700 hover:text-red-500 transition-colors" title="Reset Defaults">
                            <RefreshCw size={14} />
                        </button>
                        <button onClick={onClose} className="text-emerald-600 hover:text-emerald-300 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMTAxMDEwIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]">
                    {localItems.length === 0 && <div className="text-center text-emerald-800 text-xs py-4">NO_DATA_AVAILABLE</div>}
                    
                    {localItems.map((item, idx) => (
                        <div key={idx} className={`group flex items-center gap-2 p-2 border ${onSetActive && item === activeItem ? 'border-emerald-400 bg-emerald-900/20' : 'border-emerald-900/30 bg-black/50 hover:border-emerald-500/50'} transition-all`}>
                            {onSetActive && (
                                <button 
                                    onClick={() => onSetActive(item)}
                                    className={`w-3 h-3 rounded-full border border-emerald-500 flex items-center justify-center cursor-pointer ${item === activeItem ? 'bg-emerald-500' : ''}`}
                                >
                                    {item === activeItem && <div className="w-1 h-1 bg-black rounded-full"></div>}
                                </button>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                {editingIndex === idx ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx)}
                                            className="w-full bg-emerald-950/50 text-emerald-100 text-xs px-1 border-b border-emerald-500 focus:outline-none cursor-text"
                                        />
                                        <button onClick={() => saveEdit(idx)} className="text-emerald-400 hover:text-emerald-200 cursor-pointer"><Check size={12} /></button>
                                    </div>
                                ) : (
                                    <div 
                                        className={`text-xs truncate font-mono select-text ${onSetActive && item === activeItem ? 'text-emerald-300 font-bold' : 'text-emerald-600'}`}
                                        title={item}
                                    >
                                        {item}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingIndex !== idx && (
                                    <button onClick={() => startEditing(idx)} className="p-1 text-emerald-700 hover:text-emerald-400 cursor-pointer"><Edit2 size={12} /></button>
                                )}
                                <button onClick={() => handleDeleteItem(idx)} className="p-1 text-emerald-900 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Extra Children (Theme Toggle etc) */}
                {children && (
                    <div className="p-3 bg-emerald-950/20 border-t border-emerald-500/20">
                        {children}
                    </div>
                )}

                {/* Add Input */}
                <div className="p-3 border-t border-emerald-500/30 bg-black/80">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder="ADD_NEW_ENTRY..."
                            className="flex-1 bg-emerald-950/20 border border-emerald-900/50 text-emerald-100 text-xs px-2 py-1 focus:outline-none focus:border-emerald-500 placeholder-emerald-900 cursor-text"
                        />
                        <button 
                            onClick={handleAddItem}
                            className="bg-emerald-900/30 border border-emerald-600/50 text-emerald-400 p-1.5 hover:bg-emerald-600 hover:text-black transition-colors cursor-pointer"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StreamOverlayProps {
  language: any;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;
  nickname?: string; 
}

const StreamOverlay: React.FC<StreamOverlayProps> = ({ language, isLightTheme, setIsLightTheme, nickname }) => {
  const [time, setTime] = useState(new Date());
  const [offset, setOffset] = useState(0); 

  // --- Persistent State ---
  const [messages, setMessages] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
          return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
      } catch { return DEFAULT_MESSAGES; }
  });

  const [ops, setOps] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY_OPS);
          return saved ? JSON.parse(saved) : DEFAULT_OPS;
      } catch { return DEFAULT_OPS; }
  });

  const [activeOp, setActiveOp] = useState<string>(() => {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_OP) || DEFAULT_OPS[0];
  });

  // --- Editor State ---
  const [editingMode, setEditingMode] = useState<'none' | 'messages' | 'ops'>('none');

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);
  const [timerInput, setTimerInput] = useState("10");

  // Persist Changes
  const saveMessages = (newMessages: string[]) => {
      setMessages(newMessages);
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(newMessages));
  };

  const saveOps = (newOps: string[]) => {
      setOps(newOps);
      localStorage.setItem(STORAGE_KEY_OPS, JSON.stringify(newOps));
  };

  const updateActiveOp = (op: string) => {
      setActiveOp(op);
      localStorage.setItem(STORAGE_KEY_ACTIVE_OP, op);
  };

  // Reset Handlers
  const resetMessages = () => {
      setMessages(DEFAULT_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
  };

  const resetOps = () => {
      setOps(DEFAULT_OPS);
      setActiveOp(DEFAULT_OPS[0]);
      localStorage.removeItem(STORAGE_KEY_OPS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_OP);
  };

  // Time Sync
  useEffect(() => {
      const syncTime = async () => {
          try {
              const response = await fetch('https://cn.apihz.cn/api/time/getapi.php?id=88888888&key=88888888&type=1');
              const data = await response.json();
              if (data && data.time) {
                  const serverTime = data.time * 1000;
                  const localTime = Date.now();
                  setOffset(serverTime - localTime);
              }
          } catch (e) {
              console.warn("Time sync failed, using local time.", e);
          }
      };
      syncTime();
      const interval = setInterval(syncTime, 600000);
      return () => clearInterval(interval);
  }, []);

  // Clock Update Loop (High Frequency)
  useEffect(() => {
    const timer = setInterval(() => {
        setTime(new Date(Date.now() + offset));
    }, 100);
    return () => clearInterval(timer);
  }, [offset]);

  // Countdown Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds > 0) {
        interval = setInterval(() => {
            setTimerSeconds(prev => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    const mins = parseFloat(timerInput);
    if (!isNaN(mins) && mins > 0) {
        setTimerSeconds(Math.floor(mins * 60));
        setIsTimerRunning(true);
        setShowTimerConfig(false);
    }
  };

  // --- Dynamic Theme Styles ---
  const theme = isLightTheme ? {
      bg: 'bg-white/90',
      text: 'text-emerald-900',
      textDim: 'text-emerald-700/80',
      border: 'border-emerald-600/30',
      headerBg: 'bg-white/90',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
      // Chat Column
      chatBg: 'bg-white/40',
      chatBorder: 'border-emerald-600/40',
      chatHeader: 'bg-emerald-100/90',
      chatHeaderText: 'text-emerald-900',
      // Main Frame
      frameBorder: 'border-emerald-600/30',
      logoFilter: 'brightness-0 invert opacity-10'
  } : {
      bg: 'bg-black/90',
      text: 'text-emerald-400',
      textDim: 'text-emerald-600/80',
      border: 'border-emerald-500/30',
      headerBg: 'bg-black/90',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      // Chat Column
      chatBg: 'bg-black/30',
      chatBorder: 'border-emerald-500/20',
      chatHeader: 'bg-emerald-950/80',
      chatHeaderText: 'text-emerald-400',
      // Main Frame
      frameBorder: 'border-emerald-500/20',
      logoFilter: 'opacity-90'
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none font-custom-02">
        {/* Inject Styles Once */}
        <TickerStyles />

        {/* --- CRT Overlay Effects --- */}
        <div 
            className="fixed inset-0 z-[10000] pointer-events-none opacity-30 mix-blend-hard-light"
            style={{
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 3px, 3px 100%"
            }}
        />
        <div className="fixed inset-0 z-[10000] pointer-events-none bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.6)_100%)]" />

        {/* === MAIN WORKBENCH CAMERA FRAME === */}
        <div className={`absolute top-36 bottom-24 left-4 right-72 border rounded-sm pointer-events-none flex flex-col justify-between transition-all duration-300 ${theme.frameBorder}`}>
             
             {/* Background Watermark */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <img 
                    src="https://cdn.imgos.cn/vip/2026/02/01/697f7380b52b0.png" 
                    alt="Background Watermark" 
                    className={`w-[80%] h-[80%] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] ${theme.logoFilter}`}
                 />
             </div>

             {/* Top Ruler */}
             <div className="w-full h-2 border-b border-emerald-500/30 flex justify-between px-2 z-10">
                 {Array.from({length: 20}).map((_, i) => (
                     <div key={i} className={`w-px h-1 bg-emerald-500/30 ${i % 5 === 0 ? 'h-2 bg-emerald-500/60' : ''}`}></div>
                 ))}
             </div>

             {/* Corner Brackets */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500 z-10"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500 z-10"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500 z-10"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500 z-10"></div>

             {/* Cam Label */}
             <div className={`absolute -top-3 left-12 px-3 py-0.5 font-bold border flex items-center gap-2 z-10 ${theme.bg} ${theme.text} ${theme.border} ${theme.shadow}`}>
                <Video size={14} className="animate-pulse" />
                <span className="text-xs tracking-widest">CAM_01</span>
             </div>

             {/* REC Indicator */}
             <div className={`absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded border border-red-500/30 z-10 ${theme.bg}`}>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                <span className="text-xs font-mono text-red-500 font-bold tracking-widest">REC</span>
             </div>

             {/* Bottom Ruler */}
             <div className="w-full h-2 border-t border-emerald-500/30 flex justify-between px-2 z-10">
                 {Array.from({length: 20}).map((_, i) => (
                     <div key={i} className={`w-px h-full bg-emerald-500/30 ${i % 5 === 0 ? 'bg-emerald-500/60' : ''}`}></div>
                 ))}
             </div>
        </div>

        {/* --- Top Left: Branding & Status --- */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto z-20">
            <div className={`flex items-center gap-2 border-l-4 border-emerald-500 px-3 py-1 ${theme.headerBg} ${theme.text}`}>
                <Hexagon size={18} className="animate-spin-slow" />
                <span className="font-black text-xl tracking-tighter">时域广播电台</span>
            </div>
            
            {/* Interactive OP Label */}
            <div 
                className={`flex items-center gap-2 border px-2 py-0.5 w-fit group cursor-pointer transition-all ${theme.bg} ${theme.border} hover:border-emerald-400`}
                onClick={() => setEditingMode('ops')}
                title="Change Operator"
            >
                <User size={10} className="text-emerald-400" />
                <span className={`text-[10px] font-bold tracking-wider ${theme.text}`}>OP: {activeOp}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1 shadow-[0_0_5px_#10b981]"></span>
                
                {/* Edit Hint */}
                <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-black px-1 border border-emerald-900 rounded text-emerald-500">EDIT</span>
            </div>

            <div className={`flex gap-2 text-[10px] px-2 py-0.5 w-fit font-mono ${theme.bg} ${theme.textDim}`}>
                <span className="flex items-center gap-1"><Cpu size={10} /> 32%</span>
                <span className="flex items-center gap-1"><Activity size={10} /> STABLE</span>
                <span className="flex items-center gap-1"><Wifi size={10} /> 1ms</span>
            </div>
        </div>

        {/* --- Top Right: Clock & Live Indicator --- */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-auto z-20">
            <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-red-600 text-white text-xs font-black tracking-widest animate-pulse">LIVE</div>
                <div className={`px-3 py-1 border-r-4 border-emerald-500 text-xl font-bold font-mono ${theme.headerBg} ${theme.text} ${theme.shadow}`}>
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                    <span className="text-xs opacity-50 ml-1">.{Math.floor(time.getMilliseconds() / 100)}</span>
                </div>
            </div>
            <div className={`text-[10px] tracking-[0.2em] uppercase font-mono ${theme.textDim}`}>
                {time.toLocaleDateString()} // ST.?/???
            </div>

            {/* Countdown Timer Widget */}
            <div className="relative mt-2 flex flex-col items-end">
                <button 
                    onClick={() => setShowTimerConfig(!showTimerConfig)}
                    className={`flex items-center gap-2 px-3 py-1 border-r-4 font-mono text-sm font-bold transition-all cursor-pointer ${theme.bg} ${theme.shadow}
                        ${isTimerRunning 
                            ? 'border-red-500 text-red-400 animate-pulse' 
                            : `border-emerald-500/50 ${theme.text}`
                        }`}
                >
                    <Timer size={14} />
                    <span>{timerSeconds > 0 ? `T- ${formatTimer(timerSeconds)}` : "TIMER_OPT"}</span>
                </button>

                {showTimerConfig && (
                    <div className="absolute top-full right-0 mt-1 bg-black/95 border border-emerald-500/30 p-3 flex flex-col gap-2 shadow-2xl z-50 w-40">
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Set Duration (Min)</div>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={timerInput}
                                onChange={(e) => setTimerInput(e.target.value)}
                                className="w-full bg-emerald-950/30 border-b border-emerald-500/50 text-emerald-400 text-sm font-mono focus:outline-none py-1 cursor-text"
                                placeholder="10"
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <button 
                                onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} 
                                className="p-1.5 text-red-500 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 rounded cursor-pointer"
                                title="Reset"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button 
                                onClick={() => setIsTimerRunning(false)} 
                                className="p-1.5 text-amber-500 hover:bg-amber-950/30 border border-transparent hover:border-amber-500/30 rounded cursor-pointer"
                                title="Pause"
                            >
                                <Square size={14} />
                            </button>
                            <button 
                                onClick={startTimer} 
                                className="p-1.5 text-emerald-500 hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 rounded cursor-pointer"
                                title="Start"
                            >
                                <Play size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- Bottom Left: Custom Smoother Ticker (Interactive) --- */}
        <NewsTicker 
            items={[...messages, `SYSTEM_VER: TL.1.17.74-R`, `VOID_OS: ONLINE // MONITORING...`]} 
            onEdit={() => setEditingMode('messages')}
            isLightTheme={isLightTheme}
        />

        {/* --- Editors --- */}
        {editingMode === 'messages' && (
            <div className="pointer-events-auto">
                <EditorModal 
                    title="NEWS_EDITOR"
                    items={messages}
                    onClose={() => setEditingMode('none')}
                    onSave={saveMessages}
                    onReset={resetMessages}
                />
            </div>
        )}

        {editingMode === 'ops' && (
            <div className="pointer-events-auto">
                <EditorModal 
                    title="OPERATOR_CONFIG"
                    items={ops}
                    activeItem={activeOp}
                    onClose={() => setEditingMode('none')}
                    onSave={saveOps}
                    onSetActive={updateActiveOp}
                    onReset={resetOps}
                >
                    {/* Hidden Theme Toggle for Operators */}
                    <button 
                        onClick={() => setIsLightTheme(!isLightTheme)}
                        className={`w-full flex items-center justify-between px-3 py-2 border border-dashed transition-all text-xs font-mono font-bold uppercase cursor-pointer ${isLightTheme ? 'bg-white text-black border-black hover:bg-gray-100' : 'bg-black text-white border-white hover:bg-gray-900'}`}
                    >
                        <span className="flex items-center gap-2">
                            {isLightTheme ? <Sun size={12} /> : <Moon size={12} />}
                            THEME_SWITCH
                        </span>
                        <span>{isLightTheme ? 'LIGHT' : 'DARK'}</span>
                    </button>
                </EditorModal>
            </div>
        )}

        {/* --- Right Side: Chat Column (Vertical) --- */}
        <div className="absolute top-36 right-4 bottom-20 w-64 pointer-events-auto flex flex-col gap-2 z-10">
            <div className={`flex-1 border flex flex-col relative overflow-hidden group ${theme.chatBg} ${theme.chatBorder}`}>
                <div className={`h-6 border-b flex items-center justify-between px-2 shrink-0 ${theme.chatHeader} ${theme.chatBorder}`}>
                    <div className="flex items-center gap-2">
                        <Radio size={10} className="text-emerald-500 animate-pulse" />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${theme.chatHeaderText}`}>COMMS_LINK</span>
                    </div>
                    <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-emerald-500/50 rounded-full"></div>
                    </div>
                </div>
                
                <div className="flex-1 w-full relative p-2">
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <span className="text-[8px] font-mono text-emerald-500 tracking-[0.2em] -rotate-90 whitespace-nowrap border border-emerald-500/50 px-4 py-1">
                            CHAT_OVERLAY_ZONE
                        </span>
                    </div>
                </div>
                
                <div className="h-1 w-full bg-emerald-900/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-emerald-500 animate-[shimmer_3s_infinite]"></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StreamOverlay;
