
import React, { useState } from 'react';
import { SideStoryVolume, Language } from '../../types';
import { Folder, Lock, AlertTriangle, HardDrive, VenetianMask, Star, Sparkles, CloudRain, Cpu, Activity, Crown, Radio, Zap, History, Moon, Clock, X, FileWarning, GitBranch, Link } from 'lucide-react';
import Reveal from '../Reveal';
import { hasRead } from '../../utils/readStatus';

interface SideStoryVolumeListProps {
  volumes: SideStoryVolume[];
  onSelectVolume: (volume: SideStoryVolume) => void;
  onOpenCharModal: () => void;
  onOpenTerminal: () => void;
  language: Language;
  isLightTheme: boolean;
}

// Inline SVG for the specific Four Point Star requirement
const FourPointStarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0 Z" />
    </svg>
);

const SideStoryVolumeList: React.FC<SideStoryVolumeListProps> = ({ volumes, onSelectVolume, onOpenCharModal, onOpenTerminal, language, isLightTheme }) => {
  const [showPrereqModal, setShowPrereqModal] = useState(false);

  // Grouping Logic
  const groups = {
      // Current Timeline: PB (Midnight) is priority, then Daily
      current: volumes.filter(v => ['VOL_PB', 'VOL_DAILY'].includes(v.id)),
      // Main Story Expansion: Memories (Rain) + Collab Star
      expansion: volumes.filter(v => ['VOL_MEMORIES', 'VOL_COLLAB_STAR'].includes(v.id)),
      // Past Timeline
      past: volumes.filter(v => ['VOL_VARIABLE', 'VOL_TIME_ORIGIN'].includes(v.id)),
      unknown: volumes.filter(v => ['VOL_UNKNOWN'].includes(v.id))
  };

  // Helper to determine Priority Label
  const getPriorityLabel = (id: string, index: number) => {
      if (id === 'VOL_PB') return 'PR_00 [TOP]';
      if (id === 'VOL_DAILY') return 'PR_01';
      if (id === 'VOL_MEMORIES') return 'PR_SP [EXT]';
      if (id === 'VOL_COLLAB_STAR') return 'PR_SP [LINK]';
      if (id === 'VOL_VARIABLE') return 'PR_ARC_01';
      if (id === 'VOL_TIME_ORIGIN') return 'PR_ARC_02';
      return `PR_NULL`; 
  };

  // Helper for Badge Text translation
  const getBadgeText = (id: string, lang: Language) => {
      if (id === 'VOL_VARIABLE') {
          if (lang === 'zh-CN') return '以前的以前';
          if (lang === 'zh-TW') return '以前的以前';
          return 'BEFORE_THE_PAST';
      }
      if (id === 'VOL_MEMORIES') {
          if (lang === 'zh-CN') return '主线扩展';
          if (lang === 'zh-TW') return '主線擴展';
          return 'STORY_EXPANSION';
      }
      if (id === 'VOL_PB') {
          if (lang === 'zh-CN') return '主线联系章节';
          if (lang === 'zh-TW') return '主線聯繫章節';
          return 'MAIN_CONNECTION';
      }
      if (id === 'VOL_DAILY') {
          if (lang === 'zh-CN') return '信号不稳定';
          if (lang === 'zh-TW') return '信號不穩定';
          return 'SIGNAL_UNSTABLE';
      }
      if (id === 'VOL_TIME_ORIGIN') {
          if (lang === 'zh-CN') return '贯穿时域';
          if (lang === 'zh-TW') return '貫穿時域';
          return 'TRAVERSING_TIME';
      }
      if (id === 'VOL_COLLAB_STAR') {
          if (lang === 'zh-CN') return '联动收录';
          if (lang === 'zh-TW') return '聯動收錄';
          return 'COLLAB_EVENT';
      }
      return '';
  };

  // Helper to get decorative series letter
  const getSeriesLetter = (id: string) => {
      switch(id) {
          case 'VOL_DAILY': return 'X';
          case 'VOL_MEMORIES': return 'S';
          case 'VOL_VARIABLE': return 'F';
          case 'VOL_PB': return 'PB';
          case 'VOL_TIME_ORIGIN': return 'B';
          case 'VOL_COLLAB_STAR': return 'C';
          default: return '';
      }
  };

  // Check if A003 has been read using the new read status system
  const checkPrerequisite = () => {
      // Primary check: New independent cache
      if (hasRead('story-rematerialization')) return true;
      
      // Fallback check: Old history (in case user migrated but hasn't re-read)
      try {
          const history = JSON.parse(localStorage.getItem('nova_history') || '[]');
          return history.some((h: any) => h.chapterId === 'story-rematerialization');
      } catch {
          return false;
      }
  };

  const handleVolumeClick = (volume: SideStoryVolume) => {
      // PB Volume Prerequisite Check
      if (volume.id === 'VOL_PB') {
          if (!checkPrerequisite()) {
              setShowPrereqModal(true);
              return;
          }
      }
      onSelectVolume(volume);
  };

  const renderVolumeCard = (volume: SideStoryVolume, index: number) => {
      const isLocked = volume.status === 'locked';
      const isCorrupted = volume.status === 'corrupted';
      const isMemories = volume.id === 'VOL_MEMORIES';
      const isVariable = volume.id === 'VOL_VARIABLE';
      const isPB = volume.id === 'VOL_PB';
      const isTimeOrigin = volume.id === 'VOL_TIME_ORIGIN';
      const isDaily = volume.id === 'VOL_DAILY';
      const isCollabStar = volume.id === 'VOL_COLLAB_STAR';
      
      const priorityLabel = getPriorityLabel(volume.id, index);
      const badgeText = getBadgeText(volume.id, language);
      const seriesLetter = getSeriesLetter(volume.id);

      // Light theme specific styles for states
      const corruptedClass = isLightTheme 
          ? 'bg-red-50 border-red-300 text-red-700' 
          : 'bg-red-950/20 border-red-900 text-red-500';
      
      const lockedClass = isLightTheme
          ? 'bg-zinc-200 border-zinc-300 text-zinc-500'
          : 'bg-ash-dark/20 border-ash-dark text-ash-gray';

      const normalClass = isLightTheme
          ? 'bg-white border-zinc-300 text-zinc-800 hover:border-zinc-50 hover:shadow-lg'
          : 'bg-ash-black/90 border-ash-gray text-ash-light group-hover:border-ash-light group-hover:bg-ash-dark/80 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]';

      // Special Highlight Style (Cyan/Blue Theme for Memories)
      const memoriesClass = isLightTheme
          ? 'bg-sky-50 border-cyan-500 text-sky-900 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:-translate-y-2'
          : 'bg-cyan-950/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-900/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:-translate-y-2';

      // Special Highlight Style (Emerald/Green Theme for Variable)
      const variableClass = isLightTheme
          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-2'
          : 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-900/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-2';

      // NEW: Special Glitch/Amber Theme for Daily
      const dailyClass = isLightTheme
          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-2'
          : 'bg-amber-950/30 border-amber-600/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:bg-amber-900/40 hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:-translate-y-2';

      // Special Time Origin Theme (Indigo/Blue)
      const timeOriginClass = isLightTheme
          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:-translate-y-2'
          : 'bg-indigo-950/30 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:bg-indigo-900/40 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-2';

      // Special Collab Star Theme (Cyan-Purple Gradient)
      const collabStarClass = isLightTheme
          ? 'bg-gradient-to-br from-cyan-50 to-purple-50 border-purple-300 text-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-2'
          : 'bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-purple-500/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:from-cyan-900/30 hover:to-purple-900/30 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-2';

      // Special Card Theme for PB (Midnight)
      const pbClass = isLightTheme
          ? 'bg-white border-zinc-900 text-black shadow-[0_0_0_4px_#e4e4e7,0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-2'
          : 'bg-black border-white text-white shadow-[0_0_0_2px_#333,0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_2px_#555,0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-2';

      return (
          <Reveal key={volume.id} delay={index * 150} className={`w-full h-full`}> 
              <button
                  onClick={() => {
                      if (!isLocked && !isCorrupted) {
                          handleVolumeClick(volume);
                      }
                  }}
                  disabled={isLocked || isCorrupted}
                  className={`
                      w-full h-64 relative group transition-all duration-300 transform
                      flex flex-col text-left overflow-hidden
                      ${isCorrupted 
                          ? 'opacity-80' 
                          : isLocked
                              ? 'opacity-60'
                              : 'cursor-pointer'
                      }
                  `}
              >
                  {/* Background Series Letter Decoration */}
                  {seriesLetter && !isLocked && !isCorrupted && (
                      <div className={`absolute -right-4 -bottom-10 text-[140px] font-black font-mono pointer-events-none select-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 z-0 ${isLightTheme ? 'text-black opacity-[0.03]' : 'text-white opacity-[0.05]'}`}>
                          {seriesLetter}
                      </div>
                  )}

                  {/* Card Body */}
                  <div 
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
                      className={`
                          absolute inset-0 border-2 transition-colors duration-300
                          ${isCorrupted 
                              ? corruptedClass 
                              : isLocked
                                  ? lockedClass
                                  : isPB
                                      ? pbClass
                                      : isCollabStar
                                          ? collabStarClass
                                          : isMemories
                                              ? memoriesClass
                                              : isVariable
                                                  ? variableClass
                                                  : isDaily
                                                      ? dailyClass
                                                      : isTimeOrigin
                                                          ? timeOriginClass
                                                          : normalClass
                          }
                          ${isPB ? 'border-4' : ''}
                      `}
                  >
                      {/* PB Specific Inner Border */}
                      {isPB && (
                          <div className="absolute inset-2 border-2 border-current opacity-30"></div>
                      )}

                      {/* Locked Collab Star Overlay */}
                      {isCollabStar && isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-40">
                              <div className={`border border-purple-500/50 bg-purple-900/80 text-purple-200 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-1 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse`}>
                                  <Lock size={16} className="mb-1" />
                                  <span>LOCKED</span>
                                  <span className="text-[9px] opacity-70">
                                      {language === 'en' ? 'COMING IN FEB' : '二月更新'}
                                  </span>
                              </div>
                          </div>
                      )}

                      {/* Scanline Effect - Subtle in light mode */}
                      <div className={`absolute inset-0 bg-transparent bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none ${isLightTheme ? 'opacity-5' : 'opacity-20'}`}></div>
                      
                      {/* Memories Highlight Effect (Rain) */}
                      {isMemories && (
                          <>
                              {!isLightTheme && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none"></div>}
                              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                                  {Array.from({ length: 12 }).map((_, i) => (
                                      <div 
                                          key={i}
                                          className={`absolute w-[1.5px] bg-gradient-to-b from-transparent ${isLightTheme ? 'via-cyan-600' : 'via-cyan-300'} to-transparent`}
                                          style={{
                                              height: `${20 + Math.random() * 40}%`,
                                              left: `${Math.random() * 100}%`,
                                              top: '-20%',
                                              animation: `dataRainCard ${1.5 + Math.random() * 1.5}s linear infinite`,
                                              animationDelay: `${Math.random() * 2}s`,
                                              willChange: 'transform'
                                          }}
                                      />
                                  ))}
                              </div>
                          </>
                      )}

                      {/* Variable Highlight Effect (Matrix/Glitch) */}
                      {isVariable && (
                          <>
                              {!isLightTheme && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>}
                              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                                  {Array.from({ length: 8 }).map((_, i) => (
                                      <div 
                                          key={i}
                                          className={`absolute text-[8px] font-mono writing-vertical-rl ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}
                                          style={{
                                              left: `${10 + Math.random() * 80}%`,
                                              top: '-100%',
                                              animation: `dataRain ${2 + Math.random() * 3}s linear infinite`,
                                              animationDelay: `${Math.random() * 5}s`,
                                          }}
                                      >
                                          {Math.random() > 0.5 ? '0101' : 'NULL'}
                                      </div>
                                  ))}
                              </div>
                          </>
                      )}

                      {/* Daily Highlight Effect (Corruption/Noise/Glitch) */}
                      {isDaily && (
                          <>
                              {/* Heavy static overlay */}
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                              
                              {/* Random glitch bars */}
                              <div className="absolute top-1/4 left-0 w-full h-1 bg-current opacity-20 animate-[pulse_0.1s_infinite]"></div>
                              <div className="absolute bottom-1/3 right-0 w-1/2 h-4 bg-current opacity-10 animate-[pulse_0.3s_infinite]"></div>
                              <div className="absolute top-0 right-1/4 w-px h-full bg-current opacity-20 animate-[pulse_2s_infinite]"></div>
                              
                              {/* Occasional Flash */}
                              <div className="absolute inset-0 bg-current opacity-0 animate-[pulse_4s_infinite] mix-blend-overlay"></div>
                          </>
                      )}

                      {/* Time Origin Highlight Effect (Clock/Particles) */}
                      {isTimeOrigin && (
                          <>
                              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] border border-dashed border-current rounded-full animate-[spin_60s_linear_infinite]"></div>
                                  <div className="absolute top-[-30%] left-[-30%] w-[160%] h-[160%] border border-current rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                              </div>
                          </>
                      )}

                      {/* Collab Star Highlight Effect (Sparkles/Gradient) */}
                      {isCollabStar && (
                          <>
                              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full"></div>
                                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full"></div>
                                  {/* Add stars */}
                                  <div className="absolute top-1/4 left-1/4 text-white/40 animate-pulse text-xs">✦</div>
                                  <div className="absolute bottom-1/3 right-1/4 text-white/30 animate-pulse text-xs" style={{animationDelay: '1s'}}>✦</div>
                              </div>
                          </>
                      )}

                      {/* Special Labels */}
                      {isMemories && (
                          <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-cyan-100 text-cyan-700 border-cyan-200' : 'bg-cyan-950 text-cyan-400 border-cyan-500/50'}`}>
                              <Sparkles size={10} className="animate-pulse" />
                              {badgeText}
                          </div>
                      )}
                      {isVariable && (
                          <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-950 text-emerald-400 border-emerald-500/50'}`}>
                              <Crown size={10} className="animate-pulse" />
                              {badgeText}
                          </div>
                      )}
                      {isDaily && (
                          <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-950 text-amber-500 border-amber-600/50'}`}>
                              <AlertTriangle size={10} className="animate-shake-violent" />
                              <span className="animate-pulse">{badgeText}</span>
                          </div>
                      )}
                      {isTimeOrigin && (
                          <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-indigo-950 text-indigo-400 border-indigo-500/50'}`}>
                              <Clock size={10} className="animate-spin-slow" />
                              {badgeText}
                          </div>
                      )}
                      {isCollabStar && (
                          <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-950 text-purple-300 border-purple-500/50'}`}>
                              <Star size={10} className="animate-pulse" />
                              {badgeText}
                          </div>
                      )}
                      {isPB && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 text-[8px] font-black font-serif border-y border-current uppercase tracking-[0.3em] bg-current text-ash-black mix-blend-screen">
                              {badgeText}
                          </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6 h-full flex flex-col relative z-20">
                          <div className={`flex justify-between items-start mb-auto ${isPB ? 'justify-center mt-4' : ''}`}>
                              {isMemories ? (
                                  <div className="relative">
                                      <CloudRain size={32} strokeWidth={1} className="text-cyan-500 relative z-10" />
                                      <Star size={16} className="text-cyan-300 absolute -top-1 -right-1 animate-spin-slow" />
                                  </div>
                              ) : isVariable ? (
                                  <div className="relative">
                                      <Cpu size={32} strokeWidth={1} className="text-emerald-500 relative z-10" />
                                      <Activity size={16} className="text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
                                  </div>
                              ) : isDaily ? (
                                  <div className="relative">
                                      <Radio size={32} strokeWidth={1} className="text-amber-500 relative z-10 animate-[shakeViolent_2s_infinite]" />
                                      <Zap size={16} className="text-amber-300 absolute -top-2 -right-2 animate-pulse" />
                                  </div>
                              ) : isTimeOrigin ? (
                                  <div className="relative">
                                      <History size={32} strokeWidth={1} className="text-indigo-500 relative z-10" />
                                      <Clock size={16} className="text-indigo-300 absolute -top-1 -right-1 animate-spin-slow" />
                                  </div>
                              ) : isCollabStar ? (
                                  <div className="relative">
                                      <FourPointStarIcon className={`w-8 h-8 relative z-10 ${isLightTheme ? 'text-purple-600' : 'text-purple-400'}`} />
                                      <Star size={12} className="text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
                                  </div>
                              ) : isPB ? (
                                  <div className="relative p-2 border-2 border-current rounded-full">
                                      <Moon size={32} strokeWidth={1} className={isLightTheme ? 'text-black' : 'text-white'} />
                                      <Clock size={16} className="absolute -bottom-1 -right-1 fill-current" />
                                  </div>
                              ) : (
                                  <Folder size={32} strokeWidth={1} className={isCorrupted ? 'animate-pulse' : ''} />
                              )}
                              
                              {!isPB && (
                                  <div className={`text-[10px] font-mono border border-current px-1 ${isVariable ? 'font-black opacity-100 bg-emerald-500/20' : isDaily ? 'font-black opacity-100 bg-amber-500/20 animate-pulse' : isTimeOrigin ? 'font-black opacity-100 bg-indigo-500/20' : isCollabStar ? 'font-black opacity-100 bg-purple-500/20' : 'opacity-70'}`}>
                                      {priorityLabel}
                                  </div>
                              )}
                          </div>

                          <div className={`space-y-1 mt-4 ${isPB ? 'text-center' : ''}`}>
                              <h3 className={`font-black text-xl md:text-2xl font-mono uppercase tracking-tight leading-none ${isCorrupted ? 'blur-[1px]' : ''} ${isDaily ? 'glitch-text-heavy' : ''} ${isMemories ? (isLightTheme ? 'text-cyan-700' : 'text-cyan-100 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]') : isVariable ? (isLightTheme ? 'text-emerald-700' : 'text-emerald-100 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]') : isDaily ? (isLightTheme ? 'text-amber-700' : 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]') : isTimeOrigin ? (isLightTheme ? 'text-indigo-700' : 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]') : isCollabStar ? (isLightTheme ? 'text-purple-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-[0_0_5px_rgba(168,85,247,0.6)]') : ''}`} data-text={language === 'en' ? volume.titleEn : volume.title}>
                                  {language === 'en' ? volume.titleEn : volume.title}
                              </h3>
                              <div className={`text-[10px] font-mono uppercase tracking-widest ${isMemories || isVariable || isPB || isDaily || isTimeOrigin || isCollabStar ? 'opacity-80' : 'opacity-50'}`}>
                                  {volume.titleEn}
                              </div>
                          </div>

                          {/* Footer Metadata */}
                          <div className={`mt-6 pt-4 border-t border-dashed border-current/30 flex justify-between items-end text-[10px] font-mono ${isPB ? 'border-t-2 border-solid' : ''}`}>
                              {isPB ? (
                                  <div className="w-full flex justify-between items-center opacity-80">
                                      <span>{priorityLabel}</span>
                                      <span>No. {index + 1}</span>
                                  </div>
                              ) : (
                                  <>
                                      <div className="flex flex-col gap-1">
                                          <span>SIZE: {volume.chapters.length * 128}KB</span>
                                          <span className="flex items-center gap-1">
                                              STATUS: 
                                              {isCorrupted 
                                                  ? 'ERR' 
                                                  : isLocked 
                                                      ? (isCollabStar ? 'PRE_LOAD' : 'LCK')
                                                      : isDaily 
                                                          ? <span className="animate-pulse">UNSTABLE</span> 
                                                          : 'RDY'
                                              }
                                          </span>
                                      </div>
                                      {isCorrupted ? <AlertTriangle size={16} /> : isLocked ? <Lock size={16} /> : <div className="w-16 h-2 bg-current opacity-20 relative"><div className="absolute left-0 top-0 h-full bg-current w-1/2"></div></div>}
                                  </>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Hover Corners (Visual Flair) */}
                  {!isLocked && !isCorrupted && !isPB && (
                      <>
                          <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMemories ? 'border-cyan-400' : isVariable ? 'border-emerald-400' : isDaily ? 'border-amber-500' : isTimeOrigin ? 'border-indigo-500' : isCollabStar ? 'border-purple-400' : (isLightTheme ? 'border-zinc-800' : 'border-ash-light')}`}></div>
                          <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMemories ? 'border-cyan-400' : isVariable ? 'border-emerald-400' : isDaily ? 'border-amber-500' : isTimeOrigin ? 'border-indigo-500' : isCollabStar ? 'border-purple-400' : (isLightTheme ? 'border-zinc-800' : 'border-ash-light')}`}></div>
                      </>
                  )}
              </button>
          </Reveal>
      );
  };

  const SectionHeader = ({ title, sub, icon: Icon, colorClass }: { title: string, sub: string, icon: any, colorClass: string }) => (
      <div className={`w-full flex items-center gap-4 mb-6 mt-8 border-b pb-2 ${isLightTheme ? 'border-zinc-300' : 'border-ash-gray/20'}`}>
          <div className={`p-1.5 rounded-sm border ${colorClass}`}>
              <Icon size={16} />
          </div>
          <div>
              <div className={`text-xs font-black uppercase tracking-widest ${isLightTheme ? 'text-zinc-800' : 'text-ash-light'}`}>
                  {title}
              </div>
              <div className={`text-[9px] font-mono opacity-60 uppercase ${isLightTheme ? 'text-zinc-500' : 'text-ash-gray'}`}>
                  {sub}
              </div>
          </div>
      </div>
  );

  return (
        <div className="h-full bg-halftone overflow-y-auto p-4 md:p-12 relative flex flex-col items-center">
            {/* Background Tech Lines */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
                <div className="absolute top-1/4 left-0 w-full h-px bg-ash-gray/50"></div>
                <div className="absolute bottom-1/4 left-0 w-full h-px bg-ash-gray/50"></div>
                <div className="absolute top-0 left-1/4 h-full w-px bg-ash-gray/50"></div>
                <div className="absolute top-0 right-1/4 h-full w-px bg-ash-gray/50"></div>
            </div>

            {/* Giant Glowing Four-Pointed Star Background */}
            <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-0 transition-opacity duration-1000 ${isLightTheme ? 'opacity-[0.03] text-zinc-400' : 'opacity-[0.08] text-ash-light'}`}>
                 <div className="relative w-[140vmin] h-[140vmin] animate-[spin_60s_linear_infinite]">
                     {/* Glow Layer */}
                     <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full blur-3xl animate-pulse">
                         <path d="M100 0 C105 85 115 95 200 100 C115 105 105 115 100 200 C95 115 85 105 0 100 C85 95 95 85 100 0 Z" fill="currentColor" />
                     </svg>
                     {/* Shape Layer */}
                     <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                         <path d="M100 0 C102 90 110 98 200 100 C110 102 102 110 100 200 C98 110 90 102 0 100 C90 98 98 90 100 0 Z" fill="currentColor" />
                     </svg>
                     {/* Decorative Center Ring */}
                     <div className="absolute inset-0 m-auto w-[25%] h-[25%] border border-current rounded-full opacity-30"></div>
                     <div className="absolute inset-0 m-auto w-[40%] h-[40%] border border-dashed border-current rounded-full opacity-20 animate-spin-reverse-slow"></div>
                 </div>
            </div>

            {/* Floating Char Modal Button */}
            <button 
                onClick={onOpenCharModal}
                className="fixed bottom-24 right-4 md:absolute md:top-4 md:right-4 z-50 bg-ash-black border border-ash-gray p-3 text-ash-gray hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-all shadow-hard group"
                title="Personnel Archive"
            >
                <VenetianMask size={20} />
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-ash-dark text-ash-light text-[10px] font-mono px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-ash-gray hidden md:block">
                    PERSONNEL_DB
                </span>
            </button>

            <header className="relative z-10 mb-8 text-center w-full max-w-2xl mx-auto mt-8 md:mt-4">
                <div className="flex flex-col items-center gap-3">
                    <HardDrive size={40} className="text-ash-light" strokeWidth={1} />
                    <h1 className="text-3xl md:text-5xl font-black text-ash-light uppercase tracking-tighter glitch-text-heavy" data-text={language === 'en' ? 'SIDE_ARCHIVES' : '支线档案库'}>
                        {language === 'en' ? 'SIDE_ARCHIVES' : '支线档案库'}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-ash-gray border border-ash-gray/50 px-2 py-1 bg-ash-black/80">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         STATUS: MOUNTED
                         <span className="mx-1">|</span>
                         /VAR/LIB/MEMORIES/SIDE_STORIES
                    </div>
                </div>
            </header>

            <div className="w-full max-w-6xl relative z-10 px-2 md:px-4 pb-20">
                
                {/* SECTION 1: Current Timeline (Including PB and Daily) */}
                <SectionHeader 
                    title={language === 'en' ? 'CURRENT TIMELINE // EXTENSIONS' : '本篇 // 支线扩展'} 
                    sub={language === 'en' ? 'ST.1_DAILY_RECORDS' : 'ST.1 日常记录'}
                    icon={GitBranch}
                    colorClass="border-amber-500 text-amber-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {groups.current.map((volume, idx) => renderVolumeCard(volume, idx))}
                </div>

                {/* SECTION 2: Main Story Expansion / Collab */}
                <SectionHeader 
                    title={language === 'en' ? 'MAIN STORY EXPANSION // SPECIAL' : '主线扩展 // 特别收录'} 
                    sub={language === 'en' ? 'CROSS_DIMENSIONAL_DATA' : '跨维度数据与外传'}
                    icon={Link}
                    colorClass="border-purple-500 text-purple-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {groups.expansion.map((volume, idx) => renderVolumeCard(volume, idx))}
                </div>

                {/* SECTION 3: Past Timeline */}
                <SectionHeader 
                    title={language === 'en' ? 'ARCHIVE: BEFORE // PREVIOUS ERA' : '档案：以前的以前 // 前置世界线'} 
                    sub={language === 'en' ? 'ST.0_ORIGIN_DATA' : 'ST.0 起源数据'}
                    icon={History}
                    colorClass="border-indigo-500 text-indigo-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {groups.past.map((volume, idx) => renderVolumeCard(volume, idx))}
                </div>

                {/* SECTION 4: Unknown (Only if populated) */}
                {groups.unknown.length > 0 && (
                    <>
                        <SectionHeader 
                            title={language === 'en' ? 'CORRUPTED SECTORS' : '损坏扇区'} 
                            sub="FATAL_ERROR"
                            icon={FileWarning}
                            colorClass="border-red-500 text-red-500"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {groups.unknown.map((volume, idx) => renderVolumeCard(volume, idx))}
                        </div>
                    </>
                )}

            </div>

            {/* Prerequisite Warning Modal */}
            {showPrereqModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in" onClick={() => setShowPrereqModal(false)}>
                    <div className="max-w-md w-full border-4 border-red-600 bg-black p-8 relative shadow-[0_0_50px_rgba(220,38,38,0.5)]" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.05)_10px,rgba(255,0,0,0.05)_20px)] pointer-events-none"></div>
                        
                        <FileWarning size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
                        
                        <h2 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-widest mb-4 glitch-text-heavy" data-text="ACCESS DENIED">
                            {language === 'en' ? 'ACCESS DENIED' : '访问拒绝'}
                        </h2>
                        
                        <div className="text-red-200 font-mono text-sm md:text-base leading-relaxed mb-8 space-y-4">
                            <p className="border-b border-red-800 pb-2">
                                {language === 'en' ? 'MISSING PREREQUISITE DATA' : '缺少前置数据节点'}
                            </p>
                            <p className="opacity-80">
                                {language === 'en' 
                                    ? 'To access the "Midnight 12:00" arc, you must first complete Main Story Chapter [A-003].' 
                                    : '为确保时空连续性，您必须先阅读主线章节 [A-003 边境特训] 方可解锁此区域。'}
                            </p>
                            <div className="bg-red-900/30 p-2 border border-red-800 text-[10px] font-bold">
                                ERROR_CODE: TIMELINE_DEPENDENCY_MISSING
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowPrereqModal(false)}
                            className="w-full py-3 border-2 border-red-500 text-red-500 font-bold uppercase hover:bg-red-500 hover:text-black transition-all"
                        >
                            {language === 'en' ? 'ACKNOWLEDGE' : '确认'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideStoryVolumeList;
