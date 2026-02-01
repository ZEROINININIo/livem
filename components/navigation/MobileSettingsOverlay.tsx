
import React, { useState } from 'react';
import { Settings, User, Share2, FileText, ArrowRight, ImageIcon, ExternalLink, Headphones, Globe, AlertTriangle, Heart, AlertCircle } from 'lucide-react';
import { Language, ReadingMode } from '../../types';
import { ReaderFont } from '../fonts/fontConfig';
import { NavigationTranslation } from '../../data/navigationData';
import ReadingModeToggle from '../ReadingModeToggle';
import FontSelector from '../fonts/FontSelector';
import CRTToggle from '../CRTToggle';
import FullscreenToggle from '../FullscreenToggle';
import ThemeToggle from '../ThemeToggle';
import { updateLogs } from '../../data/updateLogs';

interface MobileSettingsOverlayProps {
  show: boolean;
  onClose: () => void;
  language: Language;
  t: NavigationTranslation;
  nickname?: string;
  setNickname?: (name: string) => void;
  onCopySyncLink: () => void;
  copySuccess: boolean;
  onOpenExporter: () => void;
  onOpenCredits: () => void; // Added
  onExternalLink: (e: React.MouseEvent, url: string) => void;
  onCycleLanguage: () => void;
  langLabel: string;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;
  onFactoryReset: () => void;
  onOpenUpdateLog: () => void;
}

const MobileSettingsOverlay: React.FC<MobileSettingsOverlayProps> = ({
  show, onClose, language, t, nickname, setNickname, onCopySyncLink, copySuccess,
  onOpenExporter, onOpenCredits, onExternalLink, onCycleLanguage, langLabel,
  readingMode, setReadingMode, readerFont, setReaderFont, crtEnabled, setCrtEnabled,
  isLightTheme, setIsLightTheme, onFactoryReset, onOpenUpdateLog
}) => {
  const [error, setError] = useState(false);

  if (!show) return null;

  const currentVersion = updateLogs[0]?.version || "UNKNOWN_VER";

  const handleClose = () => {
      // Validate nickname before closing
      if (nickname !== undefined && !nickname.trim()) {
          setError(true);
          return;
      }
      setError(false);
      onClose();
  };

  const handleNicknameChange = (val: string) => {
      if (setNickname) {
          setNickname(val);
          if (val.trim()) setError(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-[2px]" onClick={handleClose}>
        <div 
            className="absolute bottom-[90px] left-4 right-4 bg-ash-black border-2 border-ash-light p-5 shadow-hard animate-slide-in z-50 max-h-[70vh] overflow-y-auto landscape:bottom-12 landscape:p-3"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4 border-b-2 border-ash-gray/30 pb-2">
                <div className="flex items-center gap-2">
                    <Settings size={16} className="text-ash-light" />
                    <span className="text-xs font-bold text-ash-light font-mono uppercase tracking-wider">{t.config}</span>
                </div>
                <button 
                    onClick={() => { onOpenUpdateLog(); handleClose(); }}
                    className="text-[10px] text-ash-gray font-mono cursor-help hover:text-ash-light transition-colors"
                >
                    {currentVersion}
                </button>
            </div>
            
            <div className="flex flex-col gap-3 landscape:grid landscape:grid-cols-2">
                {/* Nickname Input */}
                {nickname !== undefined && setNickname && (
                    <div className="w-full col-span-full mb-2">
                        <label className="text-[10px] font-mono text-ash-gray uppercase flex items-center gap-2 mb-1">
                            <User size={12} /> ID_TAG
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={nickname}
                                onChange={(e) => handleNicknameChange(e.target.value)}
                                maxLength={10}
                                className={`flex-1 bg-ash-dark border-b px-2 py-1 text-ash-light font-mono text-xs focus:outline-none transition-colors ${error ? 'border-red-500 animate-shake-violent' : 'border-ash-gray focus:border-ash-light'}`}
                                placeholder={language === 'en' ? 'REQUIRED' : '必填'}
                            />
                            <button 
                                onClick={onCopySyncLink}
                                className="px-2 py-1 bg-ash-dark border border-ash-gray text-ash-gray hover:text-ash-light"
                                title="Copy Sync Link"
                            >
                                {copySuccess ? <span className="text-green-500 font-bold text-[10px]">OK</span> : <Share2 size={12} />}
                            </button>
                        </div>
                        {error && (
                            <div className="text-[9px] text-red-500 font-bold flex items-center gap-1 animate-pulse mt-1">
                                <AlertCircle size={10} /> {language === 'en' ? 'ID REQUIRED' : '必须设置代号'}
                            </div>
                        )}
                    </div>
                )}

                <button 
                  onClick={() => { onOpenExporter(); handleClose(); }}
                  className="flex items-center justify-between w-full px-3 py-3 border-2 border-blue-900/50 bg-blue-950/20 text-blue-400 hover:bg-blue-900/40 transition-all group shadow-hard-sm"
                >
                   <div className="flex items-center gap-3">
                      <FileText size={16} />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{language === 'en' ? 'EXPORT PDF' : '导出全书'}</span>
                   </div>
                   <ArrowRight size={14} className="opacity-50" />
                </button>

                <button 
                  onClick={() => { onOpenCredits(); handleClose(); }}
                  className="flex items-center justify-between w-full px-3 py-3 border-2 border-rose-900/50 bg-rose-950/10 text-rose-500 hover:bg-rose-900/20 transition-all group shadow-hard-sm"
                >
                   <div className="flex items-center gap-3">
                      <Heart size={16} />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.credits}</span>
                   </div>
                   <ArrowRight size={14} className="opacity-50" />
                </button>

                <button 
                  onClick={(e) => onExternalLink(e, "https://pic.zeroxv.cn/")}
                  className="flex items-center justify-between w-full px-3 py-3 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black transition-all group shadow-hard-sm"
                >
                   <div className="flex items-center gap-3">
                      <ImageIcon size={16} />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.gallery}</span>
                   </div>
                   <ExternalLink size={14} className="opacity-50" />
                </button>

                <button 
                  onClick={(e) => onExternalLink(e, "https://ost.zeroxv.cn")}
                  className="flex items-center justify-between w-full px-3 py-3 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black transition-all group shadow-hard-sm"
                >
                   <div className="flex items-center gap-3">
                      <Headphones size={16} />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.ost}</span>
                   </div>
                   <ExternalLink size={14} className="opacity-50" />
                </button>

                <button 
                  onClick={onCycleLanguage}
                  className="flex items-center justify-between w-full px-3 py-3 border-2 transition-all duration-300 shadow-hard bg-ash-black text-ash-gray border-ash-gray/50 active:border-ash-light active:text-ash-light group"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={16} />
                    <span className="text-[10px] font-mono font-bold uppercase">Language</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{langLabel}</span>
                </button>
                <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} />
                <FontSelector value={readerFont} onChange={setReaderFont} language={language} />
                <CRTToggle value={crtEnabled} onChange={setCrtEnabled} language={language} />
                <FullscreenToggle language={language} />
                <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} />
                
                <button 
                    onClick={onFactoryReset}
                    className="flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-red-900/50 bg-red-950/20 text-red-600 hover:bg-red-900/40 hover:text-red-500 transition-all font-mono font-bold text-[10px] mt-2 col-span-full"
                >
                    <AlertTriangle size={12} />
                    {language === 'en' ? 'RESET SYSTEM' : '重置系统依赖'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default MobileSettingsOverlay;
