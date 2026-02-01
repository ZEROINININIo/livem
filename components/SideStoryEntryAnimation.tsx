
import React, { useEffect, useState } from 'react';
import { Binary, Database, Brain, CloudRain, Sparkle, Clock, Cpu, GitBranch, Activity, Moon, Radio, Sun, Hourglass, Star, Zap } from 'lucide-react';
import { Language } from '../types';

interface SideStoryEntryAnimationProps {
  onComplete: () => void;
  language: Language;
  volumeId?: string;
}

const SideStoryEntryAnimation: React.FC<SideStoryEntryAnimationProps> = ({ onComplete, language, volumeId }) => {
  const [stage, setStage] = useState(0);

  const isRainTheme = volumeId === 'VOL_MEMORIES';
  const isVariableTheme = volumeId === 'VOL_VARIABLE';
  const isMidnightTheme = volumeId === 'VOL_PB';
  const isTimeOriginTheme = volumeId === 'VOL_TIME_ORIGIN';
  const isCollabStarTheme = volumeId === 'VOL_COLLAB_STAR';

  // Animation Sequence
  useEffect(() => {
    // 0ms: Init (Static)
    // 500ms: Start (Rain/Glitch/Clock)
    // 1500ms: Deep Dive
    // 3000ms: Submerge (White/Flash)
    
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 2000);
    const t3 = setTimeout(() => setStage(3), 3500);
    const t4 = setTimeout(onComplete, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const t = {
    'zh-CN': {
      accessing: "访问记忆扇区...",
      decompressing: "解压碎片数据",
      syncing: "神经同步中",
      complete: "重构完成",
      // Rain Theme
      rain_init: "正在回溯时间轴...",
      rain_mem: "检索关键节点：[雨]",
      rain_sync: "VoidOS部署中",
      // Variable Theme
      var_init: "检测到未定义变量...",
      var_mem: "纠正量子偏差：[Byaki]",
      var_sync: "进入本地记忆调用模式 // 正在进入VoidOS",
      // Midnight Theme
      mid_init: "正在剥离色彩模块...",
      mid_mem: "时间轴校准：00:00:00",
      mid_sync: "欢迎来到午夜",
      // Time Origin Theme
      time_init: "初始化时域穿梭...",
      time_mem: "锁定起源点",
      time_sync: "欢迎来到未定义时域",
      // Collab Star Theme
      collab_init: "捕获跨界信号...",
      collab_mem: "计算坠落轨迹 // 修正坐标",
      collab_sync: "接触确认"
    },
    'zh-TW': {
      accessing: "訪問記憶扇區...",
      decompressing: "解壓碎片數據",
      syncing: "神經同步中",
      complete: "重構完成",
      // Rain Theme
      rain_init: "正在回溯時間軸...",
      rain_mem: "檢索關鍵節點：[雨]",
      rain_sync: "VoidOS部署中",
      // Variable Theme
      var_init: "檢測到未定義變量...",
      var_mem: "糾正量子偏差：[Byaki]",
      var_sync: "進入本地記憶調用模式 // 正在進入VoidOS",
      // Midnight Theme
      mid_init: "正在剝離色彩模塊...",
      mid_mem: "時間軸校準：00:00:00",
      mid_sync: "歡迎來到午夜",
      // Time Origin Theme
      time_init: "初始化時域穿梭...",
      time_mem: "鎖定起源點",
      time_sync: "歡迎來到時間的混沌",
      // Collab Star Theme
      collab_init: "捕獲跨界信號...",
      collab_mem: "計算墜落軌跡 // 修正坐標",
      collab_sync: "接觸確認"
    },
    'en': {
      accessing: "ACCESSING_MEMORY_SECTOR...",
      decompressing: "DECOMPRESSING_FRAGMENTS",
      syncing: "NEURAL_SYNC_IN_PROGRESS",
      complete: "RECONSTRUCTION_COMPLETE",
      // Rain Theme
      rain_init: "REWINDING_TIMELINE...",
      rain_mem: "SEARCHING_NODE: [RAIN]",
      rain_sync: "DEPLOYING_VOID_OS",
      // Variable Theme
      var_init: "UNDEFINED_VARIABLE_DETECTED...",
      var_mem: "CORRECTING_QUANTUM_BIAS: [Byaki]",
      var_sync: "LOCAL_MEM_CALL_MODE // ENTERING_VOID_OS",
      // Midnight Theme
      mid_init: "STRIPPING_COLOR_MODULES...",
      mid_mem: "TIMELINE_CALIBRATION: 00:00:00",
      mid_sync: "WELCOME TO MIDNIGHT",
      // Time Origin Theme
      time_init: "INITIATING_CHRONO_DIVE...",
      time_mem: "REVERSING_ENTROPY // LOCKING_ORIGIN",
      time_sync: "WELCOME TO THE END OF TIME",
      // Collab Star Theme
      collab_init: "INTERCEPTING_SIGNAL...",
      collab_mem: "CALCULATING_TRAJECTORY // FIXING",
      collab_sync: "CONTACT_CONFIRMED"
    }
  }[language];

  // --- Collab Star Theme Render (Meteor/Purple/Cyan) ---
  if (isCollabStarTheme) {
      return (
        <div className="fixed inset-0 z-[99999] bg-[#090510] text-purple-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
            <style>{`
                @keyframes meteor {
                    0% { transform: translate(100%, -100%) rotate(45deg); opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translate(-200%, 200%) rotate(45deg); opacity: 0; }
                }
                @keyframes warp-star {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(30, 1); opacity: 0; }
                }
            `}</style>

             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-purple-500/50 text-purple-300 px-2 py-1 hover:bg-purple-500 hover:text-white transition-colors cursor-pointer"
            >
                [CATCH_STAR]
            </button>

            {/* Background - Deep Space Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[#0f0518] via-[#1a0b2e] to-[#050b14] transition-opacity duration-1000 ${stage > 0 ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Warp Stars (Stage 2) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-1000">
                {stage >= 2 && Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={`warp-${i}`} 
                        className="absolute bg-cyan-200 h-[1px] w-[2px] rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `warp-star 0.5s linear infinite`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            transformOrigin: 'center'
                        }}
                    >
                    </div>
                ))}
                
                {/* Static Stars (Stage 0-1) */}
                {stage < 2 && Array.from({ length: 60 }).map((_, i) => (
                    <div 
                        key={`star-${i}`} 
                        className={`absolute w-0.5 h-0.5 bg-white rounded-full ${i % 3 === 0 ? 'animate-pulse' : ''}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.8
                        }}
                    ></div>
                ))}
            </div>

            {/* THE METEOR (Stage 1-2) */}
            <div 
                className={`absolute top-[20%] right-[20%] w-64 h-2 pointer-events-none transition-all duration-1000 ${stage >= 1 && stage < 3 ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                    animation: stage >= 1 ? 'meteor 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' : 'none',
                    filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.8))'
                }}
            >
                {/* Meteor Head */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] z-10"></div>
                {/* Meteor Tail */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white via-cyan-400 to-transparent opacity-80 rounded-r-full"></div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[80%] h-4 bg-gradient-to-r from-purple-500 via-transparent to-transparent opacity-40 blur-md rounded-r-full"></div>
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                
                {/* Star Compass */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Outer Glow Ring */}
                    <div className={`absolute inset-[-10px] bg-purple-500/10 rounded-full blur-xl transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>

                    {/* Rotating Four-Point Star */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100 rotate-12' : 'scale-50 opacity-0 rotate-0'}`}>
                         <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500/30 animate-spin-slow">
                            <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0 Z" fill="currentColor" />
                         </svg>
                    </div>
                    
                    {/* Inner Pulsing Star */}
                    <div className={`absolute inset-12 flex items-center justify-center transition-all duration-700 delay-200 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                         <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse">
                            <path d="M50 0 C52 40 60 48 100 50 C60 52 52 60 50 100 C48 60 40 52 0 50 C40 48 48 40 50 0 Z" fill="currentColor" />
                         </svg>
                    </div>

                    {/* Central Spark */}
                    <div className={`absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white] transition-all duration-300 ${stage === 2 ? 'scale-[5] opacity-100' : 'scale-100 opacity-50'}`}></div>
                </div>

                {/* Text Status */}
                <div className="text-center space-y-2 h-20 transition-opacity duration-300">
                    <div className="text-lg md:text-2xl font-black font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 uppercase flex flex-col items-center gap-1">
                        {stage === 0 && ""}
                        {stage === 1 && t.collab_init}
                        {stage === 2 && (
                            <span className="animate-pulse">{t.collab_mem}</span>
                        )}
                        {stage === 3 && t.collab_sync}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-32 h-1 bg-purple-900/50 mx-auto rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 ease-linear shadow-[0_0_10px_currentColor]"
                            style={{ width: `${(stage / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Final Flash - Cyan/Purple/White Mix */}
            <div className={`absolute inset-0 bg-gradient-to-t from-purple-100 via-white to-cyan-100 pointer-events-none transition-opacity duration-1000 ease-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
      );
  }

  // --- Time Origin Theme Render (Cosmic/Gold/Purple) ---
  if (isTimeOriginTheme) {
      return (
        <div className="fixed inset-0 z-[99999] bg-[#0f0518] text-indigo-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-indigo-500/50 text-indigo-300 px-2 py-1 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
            >
                [JUMP_TO_ORIGIN]
            </button>

            {/* Background - Rotating Galaxy/Time spiral */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${stage > 0 ? 'opacity-30' : 'opacity-0'}`}>
                 <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0%,transparent_60%)] animate-spin-slow pointer-events-none"></div>
            </div>

            {/* Floating Gold Particles (Reversing Time - Moving Up) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-1 h-1 bg-amber-200 rounded-full animate-float-up-fast"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: '-10%',
                            animationDuration: `${2 + Math.random() * 3}s`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: Math.random()
                        }}
                    >
                    </div>
                ))}
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                
                {/* Complex Clock Structure */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Ring 1 - Outer Gold (Static but fades in) */}
                    <div className={`absolute inset-[-20px] border border-amber-500/30 rounded-full transition-all duration-[1500ms] ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}></div>
                    
                    {/* Ring 2 - Rotating Clock Ticks */}
                    <div className={`absolute inset-0 border-4 border-indigo-500/30 rounded-full border-dashed transition-all duration-[1500ms] animate-[spin_60s_linear_infinite] ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
                    
                    {/* Ring 3 - Counter Rotating Gold */}
                    <div className={`absolute inset-4 border border-amber-400/50 rounded-full transition-all duration-[1500ms] animate-[spin_40s_linear_infinite_reverse] ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}></div>

                    {/* Central Hands (Spinning Fast Backwards) */}
                    <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${stage === 2 ? 'scale-110' : 'scale-100'}`}>
                         {/* Hour Hand */}
                         <div className={`absolute w-1 h-20 bg-indigo-400 origin-bottom rounded-full top-[12px] transition-transform duration-[3000ms] ease-in-out ${stage >= 1 ? 'rotate-[-720deg]' : 'rotate-0'}`}></div>
                         {/* Minute Hand */}
                         <div className={`absolute w-0.5 h-28 bg-amber-200 origin-bottom rounded-full top-[-4px] transition-transform duration-[3000ms] ease-in-out ${stage >= 1 ? 'rotate-[-3600deg]' : 'rotate-0'}`}></div>
                         {/* Center Dot */}
                         <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                    </div>

                    {/* Central Icon Overlay (Stage 2) */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${stage === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                         <Hourglass size={48} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                </div>

                {/* Text Status */}
                <div className="text-center space-y-4 h-24 transition-opacity duration-300">
                    <div className="text-sm md:text-xl font-bold font-mono tracking-[0.3em] text-indigo-200 uppercase flex flex-col items-center gap-2">
                        {stage === 0 && ""}
                        {stage === 1 && (
                            <>
                                <span className="text-amber-400 animate-pulse">{t.time_init}</span>
                            </>
                        )}
                        {stage === 2 && (
                            <>
                                <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{t.time_mem}</span>
                            </>
                        )}
                        {stage === 3 && t.time_sync}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="w-48 h-0.5 bg-indigo-900/50 mx-auto overflow-hidden relative">
                        <div 
                            className="absolute inset-y-0 bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-300 ease-linear"
                            style={{ width: `${(stage / 3) * 100}%`, left: 0 }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Final Flash - Golden White */}
            <div className={`absolute inset-0 bg-[#fffbeb] pointer-events-none transition-opacity duration-1000 ease-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
      );
  }

  // --- Midnight Theme Render (Black & White / Grayscale) ---
  if (isMidnightTheme) {
      return (
        <div className="fixed inset-0 z-[99999] bg-black text-white overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Subtle TV Noise Overlay - Fixed Opacity to prevent flicker */}
             <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] animate-[shift_0.5s_infinite]"></div>
             
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-white/50 text-white/80 px-2 py-1 hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
                [ESCAPE_NULL]
            </button>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12 transition-opacity duration-500">
                
                {/* Clock / Moon Cycle - Pure Black & White */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Ring 1 - Static */}
                    <div className={`absolute inset-0 border border-white/20 rounded-full transition-all duration-[1500ms] ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-125 opacity-0'}`}></div>
                    
                    {/* Ring 2 - Rotating */}
                    <div className={`absolute inset-8 border-2 border-white rounded-full border-dashed transition-all duration-[1500ms] animate-[spin_30s_linear_infinite] ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}></div>
                    
                    {/* Center Icon */}
                    <div className="relative z-10 bg-black p-6 rounded-full border-2 border-white">
                        {stage < 2 ? (
                            <Moon size={64} className={`text-white transition-all duration-700 ${stage === 1 ? 'rotate-[-15deg] scale-110' : 'rotate-0 scale-100'}`} fill="white" />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-16 h-16 animate-fade-in">
                                <div className="text-3xl font-black tracking-tighter">00</div>
                                <div className="text-3xl font-black tracking-tighter leading-none">00</div>
                            </div>
                        )}
                    </div>

                    {/* Expanding White Circle for Transition (Stage 2->3) */}
                    <div className={`absolute inset-0 bg-white rounded-full z-0 transition-all duration-[1500ms] ease-in-out ${stage === 3 ? 'scale-[20] opacity-100' : 'scale-0 opacity-0'}`}></div>
                </div>

                {/* Text Status */}
                <div className={`text-center space-y-4 h-24 transition-opacity duration-300 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-sm md:text-xl font-bold font-mono tracking-[0.5em] text-white uppercase">
                        {stage === 0 && ""}
                        {stage === 1 && t.mid_init}
                        {stage === 2 && t.mid_mem}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="w-48 h-px bg-white/20 mx-auto overflow-hidden relative">
                        <div 
                            className="absolute inset-y-0 bg-white transition-all duration-300 ease-linear"
                            style={{ width: `${(stage / 3) * 100}%`, left: 0 }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Final Flash - Pure White Overlay for smooth exit */}
            <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 ease-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
      );
  }

  // --- Rain Theme Render ---
  if (isRainTheme) {
    return (
        <div className="fixed inset-0 z-[99999] bg-slate-950 text-cyan-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-cyan-400/30 text-cyan-400 px-2 py-1 hover:bg-cyan-400 hover:text-slate-900 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
                [SKIP_MEMORY]
            </button>

            {/* Background - Elegant Rain */}
            <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black transition-opacity duration-1000 ${stage > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
            
            {/* Elegant Rain Drops */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-data-rain"
                        style={{
                            height: `${30 + Math.random() * 50}px`,
                            left: `${Math.random() * 100}%`,
                            top: '-20%',
                            animationDuration: `${0.8 + Math.random() * 1.5}s`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    >
                    </div>
                ))}
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                
                {/* Icons Circle */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className={`absolute inset-0 border border-cyan-500/20 rounded-full transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100 rotate-180' : 'scale-50 opacity-0 rotate-0'}`}></div>
                    <div className={`absolute inset-4 border border-cyan-500/30 rounded-full border-dashed transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100 -rotate-180' : 'scale-90 opacity-0 rotate-0'}`}></div>
                    
                    <div className={`transition-all duration-700 absolute ${stage === 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <Clock size={48} className="text-cyan-400" />
                    </div>
                    <div className={`transition-all duration-700 absolute ${stage === 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <CloudRain size={56} className="text-cyan-200" />
                    </div>
                    <div className={`transition-all duration-700 absolute ${stage === 3 ? 'scale-125 opacity-100 blur-sm' : 'scale-50 opacity-0'}`}>
                         <Sparkle size={64} className="text-white fill-white/20" />
                    </div>
                </div>

                {/* Text Status */}
                <div className="text-center space-y-4 h-16">
                    <div className="text-xl md:text-2xl font-light tracking-[0.3em] text-cyan-100/90 font-serif italic">
                        {stage === 0 && ""}
                        {stage === 1 && t.rain_init}
                        {stage === 2 && t.rain_mem}
                        {stage === 3 && t.rain_sync}
                    </div>
                    <div className="w-32 h-[1px] bg-cyan-900/50 mx-auto overflow-hidden">
                        <div 
                            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300 ease-linear"
                            style={{ width: `${(stage / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

             <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 ease-in-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
  }

  // --- Variable Theme Render ---
  if (isVariableTheme) {
    return (
        <div className="fixed inset-0 z-[99999] bg-green-950 text-emerald-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-emerald-400/30 text-emerald-400 px-2 py-1 hover:bg-emerald-400 hover:text-black transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
                [SKIP_VAR]
            </button>

            {/* Background - Matrix Grid */}
            <div className={`absolute inset-0 bg-grid-hard opacity-20 transition-transform duration-[4000ms] ${stage > 0 ? 'scale-125' : 'scale-100'}`}></div>
            
            {/* Random Code Glitches */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute text-[10px] text-emerald-500 font-bold animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    >
                        {Math.random() > 0.5 ? '0x' + Math.random().toString(16).substring(2,6).toUpperCase() : 'ERR_NULL'}
                    </div>
                ))}
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                
                {/* Icons Circle - Tech/Green */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className={`absolute inset-0 border-2 border-emerald-500/30 rounded-none transition-all duration-300 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}></div>
                    <div className={`absolute inset-2 border border-emerald-500/20 rounded-full border-dashed transition-all duration-1000 animate-spin-slow`}></div>
                    
                    {/* Central Icon Switch */}
                    <div className={`transition-all duration-500 absolute ${stage === 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <Cpu size={48} className="text-emerald-400" />
                    </div>
                    <div className={`transition-all duration-500 absolute ${stage === 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <GitBranch size={56} className="text-emerald-200" />
                    </div>
                    <div className={`transition-all duration-500 absolute ${stage === 3 ? 'scale-125 opacity-100 blur-sm' : 'scale-50 opacity-0'}`}>
                         <Activity size={64} className="text-white" />
                    </div>
                </div>

                {/* Text Status - Terminal Style */}
                <div className="text-center space-y-4 h-16 w-full px-4">
                    <div className="text-sm md:text-xl font-bold font-mono tracking-widest text-emerald-300 break-words whitespace-pre-wrap">
                        {stage === 0 && "> INIT"}
                        {stage === 1 && t.var_init}
                        {stage === 2 && t.var_mem}
                        {stage === 3 && t.var_sync}
                        <span className="animate-[blink_1s_infinite]">_</span>
                    </div>
                    
                    {/* Blocky Progress Bar */}
                    <div className="w-48 h-4 bg-emerald-900/50 mx-auto border border-emerald-500/30 p-0.5">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-300 ease-steps(5)"
                            style={{ width: `${(stage / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

             <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ease-in-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
  }

  // --- Default Theme Render ---
  return (
    <div className="fixed inset-0 z-[99999] bg-ash-black text-ash-light overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
      
      {/* Abort Button */}
      <button 
        onClick={onComplete}
        className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-blue-400/30 text-blue-400 px-2 py-1 hover:bg-blue-400 hover:text-black transition-colors opacity-70 hover:opacity-100 cursor-pointer"
      >
        [SKIP_DIVE]
      </button>

      {/* Background Gradient - "Deep Sea" */}
      <div className={`absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black transition-opacity duration-1000 ${stage > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Data Rain (CSS Animation) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
            <div 
                key={i} 
                className="absolute top-[-100%] text-[10px] text-blue-500/50 writing-vertical-rl animate-data-rain"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`,
                    fontSize: `${10 + Math.random() * 8}px`
                }}
            >
                {Math.random() > 0.5 ? '010101' : 'A9F3C2'}
            </div>
        ))}
      </div>

      {/* Central Visuals */}
      <div className="relative z-10 flex flex-col items-center gap-8">
          
          {/* Icons Circle */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
              {/* Ripple Effect */}
              {stage >= 1 && (
                  <>
                    <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                  </>
              )}

              {/* Central Icon */}
              <div className={`transition-all duration-700 ${stage === 2 ? 'scale-125 text-white' : 'scale-100 text-blue-400'}`}>
                 {stage === 0 && <Database size={48} className="animate-pulse" />}
                 {stage === 1 && <Binary size={48} className="animate-bounce" />}
                 {stage >= 2 && <Brain size={64} />}
              </div>
          </div>

          {/* Text Status */}
          <div className="text-center space-y-2">
              <div className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-200">
                  {stage === 0 && t.accessing}
                  {stage === 1 && t.decompressing}
                  {stage >= 2 && t.syncing}
              </div>
              
              {/* Progress Bar */}
              <div className="w-48 md:w-64 h-1 bg-blue-900/50 mx-auto mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all duration-300 ease-linear"
                    style={{ width: `${(stage / 3) * 100}%` }}
                  ></div>
              </div>
              
              <div className="text-[10px] text-blue-500/60 font-mono mt-1">
                  SECTOR_MEM // {stage * 33}%
              </div>
          </div>
      </div>

      {/* Flash to White at end */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>

    </div>
  );
};

export default SideStoryEntryAnimation;
