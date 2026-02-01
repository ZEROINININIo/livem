
import React, { useState } from 'react';
import { Database, Book, Users, Home, GitBranch, Cast } from 'lucide-react';
import BackgroundMusic from './BackgroundMusic';
import { Language, ReadingMode } from '../types';
import { ReaderFont } from './fonts/fontConfig';
import ScriptExporter from './ScriptExporter';
import UpdateLogOverlay from './UpdateLogOverlay';
import CreditsPage from '../pages/CreditsPage'; 
import { navigationData } from '../data/navigationData';

// Modular Components
import ExitModal from './navigation/ExitModal';
import MobileSettingsOverlay from './navigation/MobileSettingsOverlay';
import DesktopSettingsModal from './navigation/DesktopSettingsModal';
import Sidebar from './navigation/Sidebar';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  nickname?: string;
  setNickname?: (name: string) => void;
  // Audio Props
  audioSources: string[];
  trackTitle: string;
  trackComposer: string;
  // Terminal Handlers
  onTerminalOpen?: () => void;
  onTerminalClose?: () => void;
  // Stream Mode
  onToggleStreamMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
    activeTab, setActiveTab, language, setLanguage,
    crtEnabled, setCrtEnabled, isLightTheme, setIsLightTheme,
    bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume,
    readerFont, setReaderFont, readingMode, setReadingMode,
    nickname, setNickname,
    audioSources, trackTitle, trackComposer,
    onTerminalOpen, onTerminalClose,
    onToggleStreamMode
}) => {
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showDesktopSettings, setShowDesktopSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(false);
  
  const [exitModalStep, setExitModalStep] = useState<0 | 1 | 2>(0);
  const [exitTargetUrl, setExitTargetUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const t = navigationData[language];

  const navItems = [
    { id: 'home', label: t.home, mobileLabel: t.mobileHome, icon: Home },
    { id: 'characters', label: t.characters, mobileLabel: t.mobileChars, icon: Users },
    { id: 'database', label: t.database, mobileLabel: t.mobileData, icon: Database },
    { id: 'reader', label: t.reader, mobileLabel: t.mobileRead, icon: Book },
    { id: 'sidestories', label: t.sidestories, mobileLabel: t.mobileSide, icon: GitBranch },
  ];

  const cycleLanguage = () => {
    if (language === 'zh-CN') setLanguage('zh-TW');
    else if (language === 'zh-TW') setLanguage('en');
    else setLanguage('zh-CN');
  };

  const getLangLabel = () => {
    if (language === 'zh-CN') return '简';
    if (language === 'zh-TW') return '繁';
    return 'EN';
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
      e.preventDefault();
      let target = url;
      if (nickname) {
          try {
              const urlObj = new URL(url);
              urlObj.searchParams.set('nickname', nickname);
              target = urlObj.toString();
          } catch (err) {
              const separator = url.includes('?') ? '&' : '?';
              target = `${url}${separator}nickname=${encodeURIComponent(nickname)}`;
          }
      }
      setExitTargetUrl(target);
      setExitModalStep(1); 
  };

  const confirmExit = () => {
      if (exitTargetUrl) {
          window.open(exitTargetUrl, "_blank");
      }
      setExitModalStep(0);
      setExitTargetUrl("");
  };

  const handleMistake = () => {
      setExitModalStep(2); 
  };

  const handleFactoryReset = () => {
      const msg = language === 'en' 
        ? "WARNING: This will wipe all local data, history, and settings. The system will reboot. Confirm?" 
        : "警告：此操作将清除所有本地数据、历史记录和设置，系统将重新启动。确定吗？";
      
      if (window.confirm(msg)) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const copySyncLink = () => {
      const url = new URL(window.location.href);
      if (nickname) {
          url.searchParams.set('nickname', nickname);
      }
      navigator.clipboard.writeText(url.toString()).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
      });
  };

  return (
    <>
      {showUpdateLog && (
          <UpdateLogOverlay onClose={() => setShowUpdateLog(false)} language={language} />
      )}

      {showExporter && (
          <ScriptExporter language={language} onClose={() => setShowExporter(false)} />
      )}

      {showCredits && (
          <CreditsPage 
            language={language} 
            isLightTheme={isLightTheme} 
            onBack={() => setShowCredits(false)} 
          />
      )}

      {/* Mobile Floating BGM */}
      <div className="lg:hidden">
          <BackgroundMusic 
              floating
              isPlaying={bgmPlaying} 
              onToggle={() => setBgmPlaying(!bgmPlaying)}
              volume={bgmVolume}
              onVolumeChange={setBgmVolume}
              audioSources={audioSources}
              trackTitle={trackTitle}
              trackComposer={trackComposer}
              className="opacity-90 scale-90 origin-top-right"
          />
      </div>

      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showMobileSettings={showMobileSettings}
        setShowMobileSettings={setShowMobileSettings}
        showDesktopSettings={showDesktopSettings}
        setShowDesktopSettings={setShowDesktopSettings}
        navItems={navItems}
        t={t}
        onOpenCredits={() => setShowCredits(true)} 
        onOpenUpdateLog={() => setShowUpdateLog(true)}
        onExternalLink={handleExternalLink}
        bgmPlaying={bgmPlaying}
        setBgmPlaying={setBgmPlaying}
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolume}
        audioSources={audioSources}
        trackTitle={trackTitle}
        trackComposer={trackComposer}
        language={language}
        nickname={nickname}
        isLightTheme={isLightTheme}
      />

      {/* Desktop Stream Toggle (Hidden in mobile sidebar, handled in settings) */}
      <div className="hidden lg:block fixed bottom-6 left-6 z-[60]">
          <button 
            onClick={onToggleStreamMode}
            className="flex items-center gap-2 px-3 py-1.5 border border-ash-gray/30 text-ash-gray bg-ash-dark hover:bg-emerald-950/30 hover:text-emerald-500 hover:border-emerald-500/50 transition-all text-[10px] font-mono font-bold uppercase"
            title="Switch to Stream Overlay Mode"
          >
              <Cast size={12} />
              STREAM_WIDGET
          </button>
      </div>

      <MobileSettingsOverlay
        show={showMobileSettings}
        onClose={() => setShowMobileSettings(false)}
        language={language}
        t={t}
        nickname={nickname}
        setNickname={setNickname}
        onCopySyncLink={copySyncLink}
        copySuccess={copySuccess}
        onOpenExporter={() => setShowExporter(true)}
        onOpenCredits={() => setShowCredits(true)} 
        onExternalLink={handleExternalLink}
        onCycleLanguage={cycleLanguage}
        langLabel={getLangLabel()}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        readerFont={readerFont}
        setReaderFont={setReaderFont}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        isLightTheme={isLightTheme}
        setIsLightTheme={setIsLightTheme}
        onFactoryReset={handleFactoryReset}
        onOpenUpdateLog={() => setShowUpdateLog(true)}
      />

      <DesktopSettingsModal
        show={showDesktopSettings}
        onClose={() => setShowDesktopSettings(false)}
        language={language}
        t={t}
        nickname={nickname}
        setNickname={setNickname}
        onCopySyncLink={copySyncLink}
        copySuccess={copySuccess}
        onCycleLanguage={cycleLanguage}
        langLabel={getLangLabel()}
        readerFont={readerFont}
        setReaderFont={setReaderFont}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        isLightTheme={isLightTheme}
        setIsLightTheme={setIsLightTheme}
        onOpenExporter={() => setShowExporter(true)}
        onFactoryReset={handleFactoryReset}
        onOpenUpdateLog={() => setShowUpdateLog(true)}
      />

      <ExitModal 
        step={exitModalStep}
        onClose={() => setExitModalStep(0)}
        onConfirm={confirmExit}
        onMistake={handleMistake}
        language={language}
      />
    </>
  );
};

export default Navigation;
