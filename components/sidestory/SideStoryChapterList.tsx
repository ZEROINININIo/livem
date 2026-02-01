
import React, { useState, useEffect } from 'react';
import { SideStoryVolume, Language } from '../../types';
import { ArrowLeft, Cpu, Lock, FileText, ChevronRight, AlertTriangle, Star, XCircle, Loader2, Database, GitCommit, Sparkle, Terminal, CornerDownRight, GitGraph, List, Clock, ChevronsDown, X, History, Globe, EyeOff, ShieldAlert } from 'lucide-react';
import Reveal from '../Reveal';
import { TIMELINE_GROUPS } from '../../data/timelineData';

interface SideStoryChapterListProps {
  volume: SideStoryVolume;
  onBack: () => void;
  onSelectChapter: (index: number) => void;
  onEnterExtra?: () => void; 
  onOpenTerminal?: (scriptId: string) => void;
  language: Language;
  isLightTheme: boolean;
}

const SideStoryChapterList: React.FC<SideStoryChapterListProps> = ({ volume, onBack, onSelectChapter, onEnterExtra, onOpenTerminal, language, isLightTheme }) => {
  const isDailyVolume = volume.id === 'VOL_DAILY';
  const isTimeOriginVolume = volume.id === 'VOL_TIME_ORIGIN'; // New volume check

  // Default to timeline if it's the Daily volume, otherwise list
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>(isDailyVolume ? 'timeline' : 'list');
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [spoilerWarning, setSpoilerWarning] = useState<string | null>(null); // Track spoiler warning state

  // Ensure view resets to timeline when entering Daily volume (if component is reused)
  useEffect(() => {
      if (isDailyVolume) {
          setViewMode('timeline');
          setActivePhase(null);
      } else {
          setViewMode('list');
      }
  }, [volume.id, isDailyVolume]);

  const isVariableVolume = volume.id === 'VOL_VARIABLE';
  const isMemoriesVolume = volume.id === 'VOL_MEMORIES';
  
  // Separate main chapters from extra chapters (IDs that represent extra/secret content)
  const mainChapters = isVariableVolume 
    ? volume.chapters.filter(c => c.id !== 'story-byaki-diary')
    : volume.chapters;
  
  const hasExtra = isVariableVolume && volume.chapters.some(c => c.id === 'story-byaki-diary');

  const extraTitle = {
    'zh-CN': '秘密日记',
    'zh-TW': '秘密日記',
    'en': 'SECRET_DIARY'
  }[language];

  const extraSummary = {
    'zh-CN': '▞▞▞ ▞▞▞ 0x76 0x6F 0x69 0x64 ▞▞▞ ▞▞▞',
    'zh-TW': '▞▞▞ ▞▞▞ 0x76 0x6F 0x69 0x64 ▞▞▞ ▞▞▞',
    'en': '▞▞▞ ▞▞▞ ERROR_RESIDUAL ▞▞▞ ▞▞▞'
  }[language];

  // Helper to determine World Line
  const getWorldLineInfo = (volId: string) => {
      if (volId === 'VOL_TIME_ORIGIN' || volId === 'VOL_VARIABLE') {
          return { label: 'ST.0', colorClass: isLightTheme ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30' };
      }
      return { label: 'ST.1', colorClass: isLightTheme ? 'text-zinc-500 border-zinc-200 bg-zinc-50' : 'text-ash-gray border-ash-gray/30 bg-ash-dark/30' };
  };

  const handlePhaseSelect = (groupId: string) => {
      // Configuration for phases that require spoiler warnings
      const SPOILER_PHASES = ['phase-2'];

      if (SPOILER_PHASES.includes(groupId)) {
          // Check local storage for existing acknowledgement
          const cacheKey = `nova_spoiler_ack_${groupId}`;
          const hasAck = localStorage.getItem(cacheKey);
          
          if (!hasAck) {
              setSpoilerWarning(groupId);
              return;
          }
      }
      
      // Proceed if no warning needed or already acknowledged
      setActivePhase(groupId);
  };

  const confirmSpoiler = () => {
      if (spoilerWarning) {
          // Save acknowledgement to local storage
          localStorage.setItem(`nova_spoiler_ack_${spoilerWarning}`, 'true');
          
          setActivePhase(spoilerWarning);
          setSpoilerWarning(null);
      }
  };

  // Helper to render a chapter button
  const renderChapterButton = (chapterId: string, index: number, isTimelineNode = false) => {
      // Find the actual chapter object and its original index
      const realIndex = volume.chapters.findIndex(c => c.id === chapterId);
      if (realIndex === -1) return null;
      
      const chapter = volume.chapters[realIndex];
      const isLocked = chapter.status === 'locked';
      const t = chapter.translations[language] || chapter.translations['zh-CN'];
      const isLegacy = chapter.id === 'special-legacy-dusk';
      const isGarbled = t.title.includes('▞');
      const isConstructing = chapter.id === 'F_ERR';
      const isTerminalNode = chapter.id === 'special-terminal-discovery';
      
      // Extract series letter from date string (e.g., "档案记录: X-001" -> "X")
      const seriesMatch = chapter.date.match(/([A-Z]+)-\d+/);
      const seriesLetter = seriesMatch ? seriesMatch[1] : null;
      
      // X-009 Special Check: Time Retrace / Memory Construction
      const isTimeTrace = chapter.id === 'story-daily-missing-second';

      // Check if this node should be connected to the previous one (Sub-chapter logic - only for List View)
      // In Timeline view, we handle connections differently
      const prevChapter = index > 0 ? mainChapters[index - 1] : null;
      const isConnectedSubChapter = !isTimelineNode && isTerminalNode && prevChapter?.id === 'story-variable-home';

      // World Line Info
      const worldLineInfo = getWorldLineInfo(volume.id);

      let itemClass = "";
      if (isTerminalNode) {
            itemClass = isLightTheme 
            ? 'bg-gradient-to-r from-emerald-50 to-fuchsia-50 border-emerald-500 text-emerald-800 shadow-md border-dashed'
            : 'bg-gradient-to-r from-emerald-950/40 to-fuchsia-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-dashed hover:border-fuchsia-500/50 hover:text-fuchsia-300 transition-all';
      } else if (isTimeTrace) {
            itemClass = isLightTheme
            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-[0_0_10px_rgba(99,102,241,0.2)] border-dashed hover:border-indigo-500'
            : 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)] border-dashed hover:border-indigo-400 hover:bg-indigo-900/50';
      } else if (isLegacy) {
            itemClass = isLightTheme
            ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-[0_0_15px_rgba(37,99,235,0.4)] border-dashed skew-x-2'
            : 'bg-blue-950/30 border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)] border-dashed -skew-x-1';
      } else if (isConstructing) {
            itemClass = 'bg-emerald-950/20 border-emerald-900 text-emerald-600 animate-pulse border-dashed border-2 cursor-progress';
      } else if (isGarbled) {
            itemClass = 'bg-red-950/20 border-red-900 text-red-700 opacity-80 cursor-not-allowed animate-pulse border-dotted border-4 scale-[0.98] origin-center rotate-[0.5deg]';
      } else if (isLocked) {
        itemClass = isLightTheme 
            ? 'bg-zinc-100 border-zinc-300 text-zinc-400 opacity-60 cursor-not-allowed'
            : 'bg-ash-dark/20 border-ash-dark/50 text-ash-gray opacity-60 cursor-not-allowed';
      } else {
        // Special styling for TIME_ORIGIN items in standard list
        if (isTimeOriginVolume) {
             itemClass = isLightTheme
                ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 hover:border-indigo-400 shadow-sm'
                : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-950/30 shadow-hard-sm';
        } else {
             itemClass = isLightTheme
                ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-500 shadow-sm'
                : 'bg-ash-black/80 border-ash-dark/50 text-ash-light hover:border-ash-light hover:bg-ash-dark/40 shadow-hard-sm';
        }
      }

      // Timeline Specific Overrides
      if (isTimelineNode) {
          // In timeline modal, we want slightly more compact but distinct items
          if (!isLocked && !isConstructing && !isGarbled && !isTerminalNode && !isLegacy && !isTimeTrace) {
             itemClass = isLightTheme
                ? 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50'
                : 'bg-black/60 border-ash-gray/30 text-ash-light hover:border-ash-light hover:bg-ash-light/10';
          }
      }

      const content = (
        <button
            onClick={() => {
                if (!isLocked || isConstructing) {
                    onSelectChapter(realIndex);
                }
            }}
            disabled={isLocked && !isConstructing}
            className={`
                flex items-center gap-4 p-4 border transition-all duration-300 group relative overflow-hidden
                ${isTimelineNode ? 'w-full text-left rounded-sm' : (isConnectedSubChapter ? 'ml-12 w-[calc(100%-3rem)]' : 'w-full')}
                ${itemClass}
            `}
        >
            {/* Background Series Letter Decoration */}
            {seriesLetter && (
                <div className="absolute -right-2 -bottom-6 text-[80px] font-black font-mono opacity-[0.06] pointer-events-none select-none transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12 z-0">
                    {seriesLetter}
                </div>
            )}

            {/* Index/Icon Box */}
            <div className={`shrink-0 w-8 text-center font-mono text-xs relative z-10 ${isTerminalNode ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-fuchsia-400 font-black animate-pulse' : isLegacy ? 'text-blue-500 font-bold' : isConstructing ? 'text-emerald-500 font-bold animate-pulse' : isGarbled ? 'text-red-800 font-black animate-glitch' : isTimeTrace ? 'text-indigo-400 font-black' : isTimeOriginVolume ? 'text-indigo-500 font-bold' : 'opacity-50'}`}>
                {isTerminalNode ? 'T-01' : isLegacy ? '!!' : isConstructing ? '>>' : isGarbled ? 'ERR' : isTimeTrace ? '<<' : String(realIndex + 1).padStart(2, '0')}
            </div>
            
            <div className={`shrink-0 p-2 border transition-colors relative z-10 ${isTerminalNode ? 'bg-black/20 border-emerald-500 text-fuchsia-400' : isLegacy ? 'bg-blue-950 border-blue-500 text-blue-500 animate-pulse' : isConstructing ? 'bg-emerald-950/50 border-emerald-600 text-emerald-500 animate-[spin_3s_linear_infinite]' : isGarbled ? 'bg-red-950 border-red-800 text-red-600 animate-[spin_2s_linear_infinite]' : isTimeTrace ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : isLocked ? 'bg-transparent border-current opacity-50' : isTimeOriginVolume ? (isLightTheme ? 'bg-indigo-100 border-indigo-300 group-hover:bg-indigo-200' : 'bg-indigo-950/30 border-indigo-500/50 group-hover:border-indigo-400') : isLightTheme ? 'bg-zinc-100 border-zinc-200 group-hover:bg-zinc-800 group-hover:text-white group-hover:border-zinc-800' : 'bg-ash-dark/50 border-ash-gray/30 group-hover:border-ash-light group-hover:bg-ash-light group-hover:text-ash-black'}`}>
                {isTerminalNode ? <Sparkle size={16} className="animate-spin-slow" /> : isLegacy ? <Star size={16} fill="currentColor" /> : isConstructing ? <Loader2 size={16} /> : isGarbled ? <XCircle size={16} /> : isTimeTrace ? <History size={16} /> : isLocked ? <Lock size={16} /> : isTimeOriginVolume ? <Clock size={16} /> : <FileText size={16} />}
            </div>
            
            <div className="flex-1 text-left relative overflow-hidden z-10">
                <div className={`font-bold font-mono text-sm md:text-base uppercase truncate ${isTerminalNode ? 'tracking-widest' : isLegacy ? 'glitch-text-heavy tracking-widest opacity-80' : isConstructing ? 'text-emerald-500 glitch-text-heavy' : isGarbled ? 'glitch-text-heavy text-red-500' : isTimeTrace ? 'italic tracking-wider' : ''}`} data-text={t.title}>{t.title}</div>
                <div className={`text-[10px] font-mono flex items-center gap-2 ${isTerminalNode ? 'text-emerald-600 font-bold' : isLegacy ? 'text-blue-500/70' : isConstructing ? 'text-emerald-600 font-bold' : isGarbled ? 'text-red-700 font-bold' : isTimeTrace ? 'text-indigo-500/80 font-bold' : isTimeOriginVolume ? 'text-indigo-400/80' : 'opacity-50'}`}>
                    <span>{chapter.date}</span>
                    
                    {/* World Line Tag */}
                    {!isLocked && !isGarbled && !isConstructing && (
                        <span className={`px-1 rounded-sm border font-bold text-[8px] tracking-wider ${worldLineInfo.colorClass}`}>
                            {worldLineInfo.label}
                        </span>
                    )}

                    {isTerminalNode && <span className="font-bold border border-emerald-500/50 px-1 bg-gradient-to-r from-emerald-950/30 to-fuchsia-950/30 text-emerald-500">INTERACTIVE // SPECIAL</span>}
                    {isLegacy && <span className="font-bold border border-blue-500/50 px-1 bg-blue-950/30">LEGACY // CORRUPTED</span>}
                    {isConstructing && <span className="font-bold border border-emerald-500/50 px-1 bg-emerald-950/30 animate-pulse">BUILDING...</span>}
                    {isGarbled && !isConstructing && <span className="font-bold border border-red-500/50 px-1 bg-red-950/30 animate-pulse">CRITICAL_FAILURE</span>}
                    {isTimeTrace && <span className="font-bold border border-indigo-500/50 px-1 bg-indigo-950/30 text-indigo-400 animate-pulse">TIME_RETRACE // MEMORY</span>}
                </div>
            </div>
            {!isLocked && <div className="opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"><ChevronRight size={16} /></div>}
        </button>
      );

      if (isTimelineNode) return content;

      // Normal List View Wrapper
      return (
        <React.Fragment key={chapter.id}>
            {isConnectedSubChapter && (
                <Reveal delay={index * 50}>
                    <div className="flex items-end h-6 ml-6 -mt-3 mb-0 relative z-0">
                        <div className="w-px h-full bg-emerald-500/30 border-l-2 border-dashed border-emerald-500/30"></div>
                        <div className="w-6 h-px bg-emerald-500/30 border-t-2 border-dashed border-emerald-500/30 mb-3"></div>
                        <CornerDownRight size={14} className="text-emerald-500/50 mb-1.5 -ml-1" />
                    </div>
                </Reveal>
            )}
            <Reveal delay={index * 50}>
                {content}
            </Reveal>
        </React.Fragment>
      );
  };

  const getActiveGroup = () => TIMELINE_GROUPS.find(g => g.id === activePhase);

  // Background Container Logic
  const containerBg = isDailyVolume && viewMode === 'timeline' 
    ? (isLightTheme ? 'bg-slate-50' : 'bg-[#080810]') 
    : isTimeOriginVolume
        ? 'bg-transparent' // Let fixed background show
        : 'bg-halftone';

  return (
        <div className={`h-full overflow-y-auto p-4 md:p-12 relative flex flex-col items-center custom-scrollbar pb-32 transition-colors duration-500 ${containerBg}`}>
             
             {/* Background for Timeline Mode (Daily) */}
             {isDailyVolume && viewMode === 'timeline' && (
                 <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                     {/* Space Texture */}
                     <div className={`absolute inset-0 opacity-20 ${isLightTheme ? 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] invert' : 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'}`}></div>
                     
                     {/* Central Time Stream Spine */}
                     <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent -translate-x-1/2"></div>
                     
                     {/* Floating Particles */}
                     <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse"></div>
                     <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                 </div>
             )}

             {/* Background for Time Origin Volume */}
             {isTimeOriginVolume && (
                 <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                     {/* Deep Time Gradient */}
                     <div className={`absolute inset-0 opacity-30 ${isLightTheme ? 'bg-indigo-50' : 'bg-[#050510]'}`}></div>
                     
                     {/* Giant Rotating Clock Faces / Time Rings */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] opacity-10 text-indigo-500">
                        <div className="absolute inset-0 border border-current rounded-full animate-[spin_60s_linear_infinite]"></div>
                        <div className="absolute inset-12 border border-dashed border-current rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-24 border-2 border-current rounded-full animate-[spin_100s_linear_infinite]"></div>
                     </div>

                     {/* Floating Time Motes */}
                     <div className="absolute top-0 left-0 w-full h-full">
                        {/* CSS-only particles */}
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
                        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></div>
                     </div>
                     
                     {/* Central Beam */}
                     <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent -translate-x-1/2"></div>
                 </div>
             )}

             <div className="w-full max-w-4xl relative z-10 animate-fade-in mt-8 md:mt-0">
                {/* Header / Breadcrumb */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-ash-gray/30 pb-4 gap-4 backdrop-blur-sm bg-ash-black/5 rounded-lg p-4">
                     <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="p-2 border border-ash-gray text-ash-gray hover:text-ash-light hover:border-ash-light hover:bg-ash-dark transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="text-[10px] font-mono text-ash-gray uppercase">ROOT / {volume.id}</div>
                            <h2 className="text-2xl font-black text-ash-light uppercase tracking-tight">{language === 'en' ? volume.titleEn : volume.title}</h2>
                        </div>
                     </div>

                     {/* View Toggle for Daily Volume */}
                     {isDailyVolume && (
                         <div className="flex bg-ash-dark/30 border border-ash-gray/30 p-1 gap-1 self-start md:self-center rounded-sm">
                             <button 
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all ${viewMode === 'list' ? 'bg-ash-light text-ash-black shadow-sm' : 'text-ash-gray hover:text-ash-light'}`}
                             >
                                 <List size={14} />
                                 {language === 'en' ? 'LIST' : '列表'}
                             </button>
                             <button 
                                onClick={() => setViewMode('timeline')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-all ${viewMode === 'timeline' ? 'bg-ash-light text-ash-black shadow-sm' : 'text-ash-gray hover:text-ash-light'}`}
                             >
                                 <GitGraph size={14} />
                                 {language === 'en' ? 'TIMELINE' : '时间线'}
                             </button>
                         </div>
                     )}

                     <div className="hidden md:block">
                         <Cpu size={24} className="text-ash-dark animate-pulse" />
                     </div>
                </div>

                {/* Relationship Notice for Memories Volume */}
                {isMemoriesVolume && (
                    <Reveal>
                        <div className={`mb-6 p-3 border-l-4 text-xs md:text-sm font-bold flex items-start gap-3 ${isLightTheme ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-amber-950/20 border-amber-500 text-amber-500'}`}>
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>
                                {language === 'en' 
                                    ? "OFFICIAL_NOTE: Dusk and Point are NOT lovers! It's a sibling-like bond. Don't get the wrong idea!" 
                                    : language === 'zh-TW'
                                        ? "官方提示：暮雨和零點不是戀人關係！是類似於兄妹的關係，不要想到那邊去啊！"
                                        : "官方提示：暮雨和零点不是恋人关系！是类似于兄妹的关系，不要想到那边去啊！"
                                }
                            </span>
                        </div>
                    </Reveal>
                )}

                {/* === TIMELINE VIEW (Daily Volume Only) === */}
                {isDailyVolume && viewMode === 'timeline' ? (
                    <div className="relative py-8 max-w-4xl mx-auto flex flex-col gap-16 md:gap-24">
                        
                        {/* Interactive Phase Nodes */}
                        {TIMELINE_GROUPS.map((group, groupIndex) => {
                            const isLeft = groupIndex % 2 === 0;
                            return (
                                <Reveal key={group.id} delay={groupIndex * 150} className={`relative flex items-center ${isLeft ? 'md:justify-start' : 'md:justify-end'} pl-16 md:pl-0`}>
                                    
                                    {/* Timeline Node Icon (Centered on Spine) */}
                                    <button 
                                        onClick={() => handlePhaseSelect(group.id)}
                                        className={`
                                            absolute left-8 md:left-1/2 -translate-x-1/2 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 transition-all duration-300 group/node
                                            flex items-center justify-center bg-ash-black
                                            ${group.borderColor} ${group.color} hover:scale-110 hover:shadow-[0_0_30px_currentColor]
                                        `}
                                    >
                                        <group.icon size={24} className="group-hover/node:animate-pulse" />
                                        {/* Pulse Ring */}
                                        <div className={`absolute inset-0 rounded-full border border-current opacity-30 animate-ping`}></div>
                                    </button>

                                    {/* Connector Line */}
                                    <div className={`absolute top-1/2 h-0.5 bg-current opacity-30 w-8 md:w-24 ${isLeft ? 'left-8 md:left-[50%]' : 'left-8 md:right-[50%] md:left-auto'} ${group.color}`}></div>

                                    {/* Card Content */}
                                    <button 
                                        onClick={() => handlePhaseSelect(group.id)}
                                        className={`
                                            w-full md:w-[42%] text-left relative overflow-hidden group/card
                                            p-6 border-l-4 ${group.borderColor}
                                            bg-gradient-to-r ${group.bgGradient} to-transparent
                                            backdrop-blur-md shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl
                                            ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover/card:scale-150 transition-transform duration-700">
                                            <group.icon size={100} />
                                        </div>

                                        <div className={`text-xs font-black uppercase tracking-widest mb-1 opacity-70 ${group.color}`}>
                                            PHASE_0{groupIndex + 1}
                                        </div>
                                        <h3 className={`text-lg md:text-2xl font-black font-mono uppercase tracking-tight mb-2 ${isLightTheme ? 'text-zinc-800' : 'text-ash-light'} group-hover/card:text-white transition-colors`}>
                                            {group.label[language] || group.label['en']}
                                        </h3>
                                        <p className="text-xs md:text-sm font-mono opacity-60 flex items-center gap-2">
                                            <CornerDownRight size={12} />
                                            {group.subLabel[language] || group.subLabel['en']}
                                        </p>
                                        <div className="mt-4 text-[10px] font-bold border border-current px-2 py-1 inline-block opacity-50 group-hover/card:opacity-100 transition-opacity uppercase">
                                            {group.chapterIds.length} RECORDS DETECTED
                                        </div>
                                    </button>
                                </Reveal>
                            );
                        })}

                        {/* Bottom Anchor */}
                        <div className="absolute -bottom-12 left-8 md:left-1/2 -translate-x-1/2 text-ash-gray/20 animate-bounce">
                            <ChevronsDown size={24} />
                        </div>

                        {/* === SUSPENDED MODAL (CHAPTER LIST) === */}
                        {activePhase && getActiveGroup() && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActivePhase(null)}>
                                <div 
                                    className={`
                                        w-full max-w-2xl max-h-[80vh] flex flex-col relative overflow-hidden shadow-2xl animate-zoom-in-fast
                                        ${isLightTheme ? 'bg-white/90 border-zinc-200' : 'bg-[#0a0a0a]/90 border-ash-gray/20'}
                                        border-2 backdrop-blur-md
                                    `}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className={`p-6 border-b flex justify-between items-start shrink-0 ${isLightTheme ? 'border-zinc-200 bg-zinc-50/50' : 'border-ash-gray/20 bg-ash-dark/50'}`}>
                                        <div>
                                            <div className={`text-xs font-black uppercase tracking-widest mb-1 opacity-70 ${getActiveGroup()?.color}`}>
                                                TIMELINE_NODE // {activePhase.toUpperCase()}
                                            </div>
                                            <h2 className={`text-xl md:text-2xl font-black font-mono uppercase ${isLightTheme ? 'text-zinc-900' : 'text-ash-light'}`}>
                                                {getActiveGroup()?.label[language] || getActiveGroup()?.label['en']}
                                            </h2>
                                        </div>
                                        <button 
                                            onClick={() => setActivePhase(null)}
                                            className={`p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${getActiveGroup()?.color}`}
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    {/* Modal Content (Chapters) */}
                                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-3 bg-halftone">
                                        {getActiveGroup()?.chapterIds.map((chapterId, idx) => (
                                            <div key={chapterId} className="animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                                {renderChapterButton(chapterId, idx, true)}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className={`p-3 text-[10px] font-mono text-center opacity-50 uppercase ${isLightTheme ? 'bg-zinc-100 text-zinc-500' : 'bg-black text-ash-gray'}`}>
                                        SECURE_CONNECTION // {getActiveGroup()?.id}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === SPOILER WARNING MODAL === */}
                        {spoilerWarning && (
                            <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in" onClick={() => setSpoilerWarning(null)}>
                                <div className="max-w-md w-full border-4 border-red-600 bg-black p-8 relative shadow-[0_0_50px_rgba(220,38,38,0.5)]" onClick={e => e.stopPropagation()}>
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.05)_10px,rgba(255,0,0,0.05)_20px)] pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-600"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-600"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-600"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-600"></div>

                                    <ShieldAlert size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
                                    
                                    <h2 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-widest mb-4 glitch-text-heavy" data-text="SPOILER WARNING">
                                        {language === 'en' ? 'SPOILER WARNING' : '严重剧透警告'}
                                    </h2>
                                    
                                    <div className="text-red-200 font-mono text-sm md:text-base leading-relaxed mb-8 space-y-4">
                                        <p>
                                            {language === 'en' 
                                              ? 'This section (P-02) contains major spoilers for the "Midnight 12:00" arc.' 
                                              : language === 'zh-TW'
                                                  ? '該階段 (P-02) 包含「午夜十二時」支線的核心劇透。'
                                                  : '该阶段 (P-02) 包含“午夜十二时”支线的核心剧透。'}
                                        </p>
                                        <p className="font-bold bg-red-900/30 p-2 border border-red-800 flex items-center justify-center gap-2">
                                            <EyeOff size={16} />
                                            {language === 'en' 
                                              ? 'Strongly recommended to read "Midnight 12:00" (PB Series) first.' 
                                              : language === 'zh-TW'
                                                  ? '強烈建議先閱讀 [午夜十二時] (PB系列) 章節。'
                                                  : '强烈建议先阅读 [午夜十二时] (PB系列) 章节。'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 relative z-10">
                                        <button 
                                            onClick={() => setSpoilerWarning(null)}
                                            className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold uppercase hover:bg-red-500 hover:text-black transition-all"
                                        >
                                            {language === 'en' ? 'RETURN' : '返回'}
                                        </button>
                                        <button 
                                            onClick={confirmSpoiler}
                                            className="flex-1 py-3 bg-red-900/50 border-2 border-red-800 text-red-400 font-bold uppercase hover:bg-red-800 hover:text-white transition-all text-xs"
                                        >
                                            {language === 'en' ? 'I HAVE READ IT / PROCEED' : '我已阅读 / 继续'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    /* === LIST VIEW (Standard) === */
                    <div className="space-y-3">
                        {mainChapters.map((chapter, index) => renderChapterButton(chapter.id, index))}
                    </div>
                )}

                {/* Independent Extra Entry Point */}
                {hasExtra && (
                    <div className="mt-16 animate-slide-in">
                        <div className="flex items-center gap-2 mb-6 opacity-60">
                             <div className="h-px bg-ash-gray flex-1"></div>
                             <div className="text-[10px] font-black font-mono text-ash-gray uppercase tracking-[0.3em] flex items-center gap-2">
                                <div className="flex -space-x-1">
                                    <AlertTriangle size={14} className="text-fuchsia-600 animate-pulse" />
                                    <Sparkle size={14} className="text-emerald-600 animate-ping" />
                                </div>
                                DUALITY_SECTOR // FUSION
                             </div>
                             <div className="h-px bg-ash-gray flex-1"></div>
                        </div>

                        <Reveal>
                            <button
                                onClick={onEnterExtra}
                                className={`
                                    w-full flex items-center gap-6 p-6 border-2 transition-all duration-500 group relative overflow-hidden
                                    ${isLightTheme 
                                        ? 'bg-fuchsia-50/50 border-fuchsia-200 text-fuchsia-900 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/50' 
                                        : 'bg-fuchsia-950/10 border-fuchsia-900/50 text-fuchsia-200 shadow-lg hover:border-emerald-500 hover:bg-emerald-950/20'
                                    }
                                `}
                            >
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHRleHQgeD0iMCIgeT0iMjAiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iY3VycmVudENvbG9yIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBvcGFjaXR5PSIwLjMiPkVSUk9SPC90ZXh0Pjwvc3ZnPg==')]"></div>

                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-600 to-emerald-600 animate-pulse"></div>
                                
                                <div className="shrink-0 relative">
                                    <Database size={32} strokeWidth={1} className="text-fuchsia-800 group-hover:text-emerald-500 transition-colors" />
                                    <GitCommit size={14} className="absolute -top-1 -right-1 text-emerald-500 animate-pulse" />
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="text-[9px] font-black font-mono text-fuchsia-500 mb-1 tracking-tighter uppercase flex items-center gap-1">
                                        <span className="animate-pulse">[ACCESS_ST.1_FRAGMENTS]</span>
                                        <span className="text-emerald-500">// SYNC: EVOLVING</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-ash-light drop-shadow-[0_0_8px_rgba(192,38,211,0.2)] group-hover:translate-x-1 transition-transform group-hover:text-emerald-400">
                                        {extraTitle}
                                    </h3>
                                    <p className="text-[10px] md:text-xs font-mono opacity-60 mt-1 italic">
                                        {extraSummary}
                                    </p>
                                </div>

                                <div className="shrink-0 flex items-center justify-center p-2 border border-fuchsia-500/30 group-hover:border-emerald-500/80 transition-all">
                                    <ChevronRight size={20} className="text-fuchsia-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </Reveal>
                        
                        <div className="mt-8 text-center">
                             <p className="text-[8px] font-mono text-ash-gray uppercase tracking-widest opacity-40">
                                Warning: st.1 data interference detected. Do not interfere with origin timeline.
                             </p>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

export default SideStoryChapterList;
