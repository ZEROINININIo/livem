
import React, { useState, useEffect } from 'react';
import { Clock, Activity, Wifi, Cpu, Hexagon, AlertTriangle, Radio, User, Video, Ruler, Crosshair, Zap, Timer, Play, Square, RotateCcw } from 'lucide-react';

// --- 配置区域：在此处修改滚动栏讯息 ---
const CUSTOM_MESSAGES = [
    "欢迎来到直播间 // WELCOME_TO_STREAM",
    "当前进行：毛绒手搓project..",
    "请遵守直播间礼仪 // 保持理性",
    "欢迎！",
    "手工制作中 [Handmade/Crafting]",
    "SYSTEM_STATUS: NOMINAL"
];

// Define Ticker Items GLOBALLY to ensure absolute referential stability across renders
const STATIC_TICKER_ITEMS = [
    ...CUSTOM_MESSAGES,
    `SYSTEM_VER: TL.1.17.74-P`, // Updated Version
    `VOID_OS: ONLINE // MONITORING...`
];

// --- 样式隔离组件 (Static) ---
// Defined outside to prevent re-evaluation/re-injection of keyframes
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
), () => true); // Always return true (never re-render)

// --- 滚动组件 (Isolated) ---
const NewsTicker = React.memo(() => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Cycle through messages every 4 seconds
        // Note: The animation duration in CSS matches this interval for sync
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % STATIC_TICKER_ITEMS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-6 left-4 flex gap-0 w-[420px] pointer-events-auto z-20 h-8 items-stretch font-mono">
            {/* Ticker Label */}
            <div className="bg-emerald-600 text-black font-black text-xs px-2 flex items-center gap-1 shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                <AlertTriangle size={14} />
                <span>NEWS</span>
            </div>
            
            {/* Content Container */}
            <div className="flex-1 bg-black/80 border-y border-r border-emerald-500/30 relative overflow-hidden group flex items-center">
                {/* Background Grid Texture */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.3)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                
                {/* Slideshow Content */}
                {/* using key to trigger animation reset on change, though with CSS animation loop + React interval sync, we can just render the current one inside a wrapper that animates */}
                <div key={currentIndex} className="px-4 w-full animate-ticker-slide absolute top-0 h-full flex items-center text-emerald-100/90 text-xs">
                    <span className="truncate w-full block">
                        {STATIC_TICKER_ITEMS[currentIndex]}
                        <span className="opacity-30 text-emerald-500 ml-2">///</span>
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
}, () => true); // Never re-render, props are ignored as data is static global

interface StreamOverlayProps {
  language: any;
  isLightTheme: boolean;
  nickname?: string; 
}

const StreamOverlay: React.FC<StreamOverlayProps> = ({ language, isLightTheme, nickname }) => {
  const [time, setTime] = useState(new Date());
  const [offset, setOffset] = useState(0); 

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);
  const [timerInput, setTimerInput] = useState("10");

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
        <div className="absolute top-36 bottom-24 left-4 right-72 border border-emerald-500/20 rounded-sm pointer-events-none flex flex-col justify-between transition-all duration-300">
             
             {/* Background Watermark */}
             <div className="absolute inset-0 flex items-center justify-center opacity-100">
                 <img 
                    src="https://cdn.imgos.cn/vip/2026/02/01/697f7380b52b0.png" 
                    alt="Background Watermark" 
                    className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] opacity-90"
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
             <div className="absolute -top-3 left-12 bg-black px-3 py-0.5 text-emerald-500 font-bold border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)] z-10">
                <Video size={14} className="animate-pulse" />
                <span className="text-xs tracking-widest">CAM_01</span>
             </div>

             {/* REC Indicator */}
             <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/90 px-2 py-1 rounded border border-red-500/30 z-10">
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
            <div className="flex items-center gap-2 bg-black/90 text-emerald-500 border-l-4 border-emerald-500 px-3 py-1">
                <Hexagon size={18} className="animate-spin-slow" />
                <span className="font-black text-xl tracking-tighter">时域广播电台</span>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/30 px-2 py-0.5 w-fit">
                <User size={10} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">OP: ZEROXV</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1 shadow-[0_0_5px_#10b981]"></span>
            </div>

            <div className="flex gap-2 text-[10px] text-emerald-400/80 bg-black/80 px-2 py-0.5 w-fit font-mono">
                <span className="flex items-center gap-1"><Cpu size={10} /> 32%</span>
                <span className="flex items-center gap-1"><Activity size={10} /> STABLE</span>
                <span className="flex items-center gap-1"><Wifi size={10} /> 1ms</span>
            </div>
        </div>

        {/* --- Top Right: Clock & Live Indicator --- */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-auto z-20">
            <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-red-600 text-white text-xs font-black tracking-widest animate-pulse">LIVE</div>
                <div className="bg-black/90 text-emerald-400 px-3 py-1 border-r-4 border-emerald-500 text-xl font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                    <span className="text-xs opacity-50 ml-1">.{Math.floor(time.getMilliseconds() / 100)}</span>
                </div>
            </div>
            <div className="text-[10px] text-emerald-600/80 tracking-[0.2em] uppercase font-mono">
                {time.toLocaleDateString()} // ST.?/???
            </div>

            {/* Countdown Timer Widget */}
            <div className="relative mt-2 flex flex-col items-end">
                <button 
                    onClick={() => setShowTimerConfig(!showTimerConfig)}
                    className={`flex items-center gap-2 px-3 py-1 bg-black/90 border-r-4 font-mono text-sm font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all
                        ${isTimerRunning 
                            ? 'border-red-500 text-red-400 animate-pulse' 
                            : 'border-emerald-500/50 text-emerald-500 hover:text-emerald-400'
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
                                className="w-full bg-emerald-950/30 border-b border-emerald-500/50 text-emerald-400 text-sm font-mono focus:outline-none py-1"
                                placeholder="10"
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <button 
                                onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} 
                                className="p-1.5 text-red-500 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 rounded"
                                title="Reset"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button 
                                onClick={() => setIsTimerRunning(false)} 
                                className="p-1.5 text-amber-500 hover:bg-amber-950/30 border border-transparent hover:border-amber-500/30 rounded"
                                title="Pause"
                            >
                                <Square size={14} />
                            </button>
                            <button 
                                onClick={startTimer} 
                                className="p-1.5 text-emerald-500 hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 rounded"
                                title="Start"
                            >
                                <Play size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- Bottom Left: Custom Smoother Ticker (Strictly Isolated) --- */}
        <NewsTicker />

        {/* --- Right Side: Chat Column (Vertical) --- */}
        <div className="absolute top-36 right-4 bottom-20 w-64 pointer-events-auto flex flex-col gap-2 z-10">
            <div className="flex-1 bg-black/30 border border-emerald-500/20 flex flex-col relative overflow-hidden group">
                <div className="h-6 bg-emerald-950/80 border-b border-emerald-500/30 flex items-center justify-between px-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <Radio size={10} className="text-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">COMMS_LINK</span>
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
