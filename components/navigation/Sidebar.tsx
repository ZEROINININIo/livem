
import React from 'react';
import { Home, Users, Database, Book, GitBranch, Settings, ArrowRight, ExternalLink, ImageIcon, Headphones, Heart } from 'lucide-react';
import { NavigationTranslation } from '../../data/navigationData';
import BackgroundMusic from '../BackgroundMusic';
import GuestbookPage from '../GuestbookPage'; 
import { updateLogs } from '../../data/updateLogs';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showMobileSettings: boolean;
  setShowMobileSettings: (val: boolean) => void;
  showDesktopSettings: boolean;
  setShowDesktopSettings: (val: boolean) => void;
  navItems: Array<{ id: string; label: string; mobileLabel: string; icon: any }>;
  t: NavigationTranslation;
  onOpenCredits: () => void; // Added
  onOpenUpdateLog: () => void;
  onExternalLink: (e: React.MouseEvent, url: string) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
  audioSources: string[];
  trackTitle: string;
  trackComposer: string;
  language?: any; 
  nickname?: string;
  isLightTheme?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, showMobileSettings, setShowMobileSettings,
  showDesktopSettings, setShowDesktopSettings, navItems, t,
  onOpenCredits, onOpenUpdateLog, onExternalLink,
  bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume, audioSources, trackTitle, trackComposer,
  language = 'zh-CN', nickname = 'GUEST', isLightTheme = false
}) => {
  const currentVersion = updateLogs[0]?.version || "UNKNOWN_VER";

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:static lg:w-72 lg:h-full bg-ash-black border-t-2 lg:border-t-0 lg:border-r-2 border-ash-light/20 z-50 flex lg:flex-col justify-between p-2 lg:p-6 shadow-2xl transition-colors duration-300 lg:overflow-y-auto no-scrollbar landscape:p-1">
        <div className="hidden lg:block mb-8 border-b-2 border-ash-light/20 pb-6 shrink-0">
          <div className="flex items-center gap-4 mb-4">
               <div className="relative w-12 h-12 bg-ash-black border border-ash-gray/50 p-1 shadow-hard group">
                   <img 
                      src="https://cdn.imgos.cn/vip/2026/01/02/6957e8e22304e.png" 
                      alt="Nova Labs"
                      className="w-full h-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                   />
              </div>
              <div className="flex flex-col gap-1">
                  <div className="w-2 h-2 bg-ash-light animate-pulse"></div>
                  <div className="w-2 h-2 bg-ash-gray"></div>
              </div>
          </div>
          <h1 className="text-4xl font-black text-ash-light tracking-tighter uppercase mb-1" style={{ textShadow: '2px 2px 0 #333' }}>
            NOVA<br/>LABS
          </h1>
          
          <div className="flex flex-col gap-2">
              <button 
                onClick={onOpenUpdateLog}
                className="text-[10px] text-ash-gray bg-ash-dark p-1 inline-block border border-ash-gray cursor-help hover:text-ash-light hover:border-ash-light transition-colors text-left"
                title="View System Log"
              >
                ARCHIVE_SYS // {currentVersion}
              </button>
              
              <GuestbookPage 
                  language={language} 
                  nickname={nickname} 
                  isLightTheme={isLightTheme}
                  isWidget={true}
                  className="mt-3" 
              />
          </div>
        </div>

        <div className="flex lg:flex-col justify-between lg:justify-start w-full gap-1 lg:gap-3 lg:mb-auto shrink-0 landscape:gap-1 md:max-w-2xl md:mx-auto lg:max-w-none lg:mx-0">
          {navItems.map((item, index) => {
            const isReader = item.id === 'reader';
            const isSide = item.id === 'sidestories';
            const isStoryItem = isReader || isSide;
            const showSeparator = index === 3;

            return (
              <React.Fragment key={item.id}>
                {showSeparator && (
                    <div className="hidden lg:flex items-center gap-2 my-2 opacity-50">
                        <div className="h-px bg-ash-gray flex-1"></div>
                        <div className="text-[9px] text-ash-gray">{t.archives}</div>
                        <div className="h-px bg-ash-gray flex-1"></div>
                    </div>
                )}
                
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileSettings(false);
                  }}
                  className={`flex-1 lg:w-full lg:flex-none flex flex-col lg:flex-row items-center justify-center lg:justify-start transition-all duration-300 group relative overflow-hidden landscape:py-1 
                    ${isStoryItem ? 'lg:py-6 lg:px-6 lg:my-1 lg:border-l-4 border-2 lg:border-y-0 lg:border-r-0' : 'py-2 lg:px-4 lg:py-4 border-2'}
                    ${item.id === 'reader' ? 'ml-1 lg:ml-0' : ''}
                    
                    ${activeTab === item.id 
                        ? (isSide 
                            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                            : 'bg-ash-light text-ash-black border-ash-light shadow-hard')
                        : (isSide
                            ? 'bg-cyan-950/10 text-cyan-600 border-cyan-900/40 hover:bg-cyan-950/30 hover:text-cyan-400 hover:border-cyan-500'
                            : isReader 
                                ? 'bg-ash-light/5 text-ash-light/80 border-ash-light/20 hover:bg-ash-light/10 hover:border-ash-light hover:text-ash-light'
                                : 'bg-ash-black text-ash-gray border-ash-gray/30 hover:border-ash-light hover:text-ash-light')
                    }
                  `}
                >
                  {activeTab === item.id && (
                      <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
                  )}
                  
                  <item.icon 
                    size={isStoryItem ? 22 : 18} 
                    className={`mb-1 lg:mb-0 lg:mr-3 z-10 transition-transform landscape:mb-0.5 landscape:size-4 md:size-6 ${isStoryItem && activeTab !== item.id ? 'group-hover:scale-110' : ''}`} 
                    strokeWidth={isStoryItem ? 2.5 : 2} 
                  />
                  
                  <span className={`hidden lg:inline font-bold tracking-widest z-10 whitespace-normal text-left ${isStoryItem ? 'text-lg uppercase font-black' : 'text-sm'}`}>
                    {item.label}
                  </span>
                  
                  <span className="lg:hidden text-[10px] md:text-xs font-bold tracking-widest z-10 whitespace-nowrap landscape:text-[8px]">{item.mobileLabel}</span>
                  
                  {isStoryItem && (
                    <div className={`absolute top-1 right-1 lg:top-1/2 lg:-translate-y-1/2 lg:right-4 w-1.5 h-1.5 opacity-50 rounded-full lg:rounded-none lg:w-1 lg:h-8 ${isSide ? 'bg-cyan-500' : 'bg-ash-light'}`}></div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
          
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className={`flex-1 lg:hidden flex flex-col items-center justify-center py-2 border-2 transition-all duration-300 group relative overflow-hidden landscape:py-1 ml-1 ${
              showMobileSettings
                ? 'bg-ash-light text-ash-black border-ash-light shadow-hard'
                : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
            }`}
          >
            {showMobileSettings && (
                <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
            )}
            <Settings size={18} className="mb-1 z-10 landscape:mb-0.5 landscape:size-4 md:size-6" strokeWidth={2.5} />
            <span className="text-[10px] md:text-xs font-bold tracking-widest z-10 landscape:text-[8px]">{t.cfg}</span>
          </button>
        </div>

        <div className="hidden lg:flex flex-col gap-3 mt-8 pt-6 border-t-2 border-dashed border-ash-gray/30 shrink-0">
          <button 
            onClick={onOpenCredits}
            className="flex items-center justify-between px-4 py-4 border-2 border-rose-900/50 bg-rose-950/10 text-rose-500 hover:bg-rose-900/20 hover:border-rose-600 transition-all group relative overflow-hidden shadow-hard-sm w-full text-left"
          >
             <div className="flex items-center gap-3 z-10">
                <Heart size={20} className="group-hover:animate-ping" />
                <span className="font-black tracking-widest text-sm uppercase">{t.credits}</span>
             </div>
             <ArrowRight size={14} className="z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500 to-transparent group-hover:opacity-20 transition-opacity"></div>
          </button>

          <button 
            onClick={(e) => onExternalLink(e, "https://pic.zeroxv.cn/")}
            className="flex items-center justify-between px-4 py-4 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-all group relative overflow-hidden shadow-hard-sm w-full text-left"
          >
             <div className="flex items-center gap-3 z-10">
                <ImageIcon size={20} className="group-hover:animate-bounce" />
                <span className="font-black tracking-widest text-sm">{t.gallery}</span>
             </div>
             <ExternalLink size={14} className="z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ash-light to-transparent group-hover:opacity-20 transition-opacity"></div>
          </button>

          <button 
            onClick={(e) => onExternalLink(e, "https://ost.zeroxv.cn")}
            className="flex items-center justify-between px-4 py-4 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-all group relative overflow-hidden shadow-hard-sm w-full text-left"
          >
             <div className="flex items-center gap-3 z-10">
                <Headphones size={20} className="group-hover:animate-bounce" />
                <span className="font-black tracking-widest text-sm">{t.ost}</span>
             </div>
             <ExternalLink size={14} className="z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ash-light to-transparent group-hover:opacity-20 transition-opacity"></div>
          </button>

          <BackgroundMusic 
              isPlaying={bgmPlaying} 
              onToggle={() => setBgmPlaying(!bgmPlaying)}
              volume={bgmVolume}
              onVolumeChange={setBgmVolume}
              audioSources={audioSources}
              trackTitle={trackTitle}
              trackComposer={trackComposer}
          />

          <div className="mt-2">
            <div className="text-[10px] text-ash-gray mb-1 uppercase px-1">{t.system}</div>
            <button
                onClick={() => setShowDesktopSettings(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-2 transition-all duration-300 group shadow-hard ${
                    showDesktopSettings
                    ? 'bg-ash-light text-ash-black border-ash-light'
                    : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
                }`}
            >
                <Settings size={18} className={`transition-transform duration-700 ${showDesktopSettings ? 'rotate-180' : ''}`} />
                <span className="text-sm font-bold tracking-widest uppercase">{t.config}</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:block mt-6 pt-4 border-t-2 border-dashed border-ash-gray/30 text-ash-gray text-[10px] leading-tight shrink-0">
          <p>&gt; ENCRYPTION: STATIC</p>
          <div className="w-full bg-ash-dark h-2 border border-ash-gray mb-1">
              <div className="bg-ash-light h-full w-[98%] animate-pulse"></div>
          </div>
          <p>&gt; PING: 0.04ms</p>
        </div>
    </nav>
  );
};

export default Sidebar;
