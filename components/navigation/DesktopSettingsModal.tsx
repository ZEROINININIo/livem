
import React, { useState } from 'react';
import { Settings, X, User, Share2, FileText, ArrowRight, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Language, ReadingMode } from '../../types';
import { ReaderFont } from '../fonts/fontConfig';
import { NavigationTranslation } from '../../data/navigationData';
import ReadingModeToggle from '../ReadingModeToggle';
import FontSelector from '../fonts/FontSelector';
import CRTToggle from '../CRTToggle';
import FullscreenToggle from '../FullscreenToggle';
import ThemeToggle from '../ThemeToggle';
import { updateLogs } from '../../data/updateLogs';

interface DesktopSettingsModalProps {
  show: boolean;
  onClose: () => void;
  language: Language;
  t: NavigationTranslation;
  nickname?: string;
  setNickname?: (name: string) => void;
  onCopySyncLink: () => void;
  copySuccess: boolean;
  onCycleLanguage: () => void;
  langLabel: string;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;
  onOpenExporter: () => void;
  onFactoryReset: () => void;
  onOpenUpdateLog: () => void;
}

const DesktopSettingsModal: React.FC<DesktopSettingsModalProps> = ({
  show, onClose, language, t, nickname, setNickname, onCopySyncLink, copySuccess,
  onCycleLanguage, langLabel, readerFont, setReaderFont, readingMode, setReadingMode,
  crtEnabled, setCrtEnabled, isLightTheme, setIsLightTheme, onOpenExporter, onFactoryReset, onOpenUpdateLog
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
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={handleClose}>
        <div 
            className="w-full max-w-xl bg-ash-black border-2 border-ash-light p-8 shadow-hard relative overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Settings size={120} />
            </div>

            <div className="flex items-center justify-between mb-8 border-b-2 border-ash-gray pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Settings size={24} className="text-ash-light" />
                    <h2 className="text-xl font-black text-ash-light uppercase tracking-[0.2em]">{t.settingsTitle}</h2>
                </div>
                <button onClick={handleClose} className="text-ash-gray hover:text-ash-light transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-6">
                    {nickname !== undefined && setNickname && (
                        <div className="space-y-1">
                            <div className="text-[10px] text-ash-gray font-mono uppercase flex items-center gap-2">
                                <User size={12} /> OPERATOR_ID
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => handleNicknameChange(e.target.value)}
                                    maxLength={10}
                                    className={`w-full bg-ash-dark border-2 px-3 py-2 text-ash-light font-mono text-sm focus:outline-none focus:bg-ash-black transition-colors ${error ? 'border-red-500 animate-shake-violent' : 'border-ash-gray/30 focus:border-ash-light'}`}
                                    placeholder={language === 'en' ? 'REQUIRED' : '必填'}
                                />
                                <button 
                                    onClick={onCopySyncLink}
                                    className="px-3 bg-ash-dark border-2 border-ash-gray/30 text-ash-gray hover:text-ash-light hover:border-ash-light transition-colors relative group"
                                    title={language === 'en' ? "Copy Sync Link" : "复制同步链接"}
                                >
                                    {copySuccess ? <div className="text-green-500 font-bold">OK</div> : <Share2 size={16} />}
                                </button>
                            </div>
                            {error && (
                                <div className="text-[9px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                    <AlertCircle size={10} /> {language === 'en' ? 'ID REQUIRED' : '必须设置代号'}
                                </div>
                            )}
                            {copySuccess && <div className="text-[8px] text-green-500 font-mono mt-1 animate-pulse">LINK COPIED TO CLIPBOARD</div>}
                        </div>
                    )}

                    <div className="space-y-1">
                        <div className="text-[10px] text-ash-gray font-mono uppercase">{t.uiLanguage}</div>
                        <button 
                            onClick={onCycleLanguage}
                            className="w-full flex items-center justify-between px-4 py-3 border-2 border-ash-gray/30 bg-ash-dark/30 text-ash-gray hover:border-ash-light hover:text-ash-light transition-all shadow-hard-sm"
                        >
                            <span className="text-sm font-bold font-mono tracking-widest">LANGUAGE</span>
                            <span className="text-sm font-bold font-mono">{langLabel}</span>
                        </button>
                    </div>
                    
                    <div className="space-y-1">
                         <FontSelector value={readerFont} onChange={setReaderFont} language={language} />
                    </div>

                    <div className="space-y-1">
                         <div className="text-[10px] text-ash-gray font-mono uppercase">{t.readingMode}</div>
                         <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] text-ash-gray font-mono uppercase">{t.displayFx}</div>
                    <CRTToggle value={crtEnabled} onChange={setCrtEnabled} language={language} />
                    <FullscreenToggle language={language} />
                    <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} />
                    
                    <button 
                        onClick={() => { onOpenExporter(); handleClose(); }}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-blue-900/50 bg-blue-950/10 text-blue-400 hover:bg-blue-950/30 hover:text-blue-300 hover:border-blue-500/50 transition-all group mt-2"
                    >
                        <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                            <FileText size={12} />
                            {language === 'en' ? 'EXPORT_ARCHIVE_PDF' : '导出全书 (PDF)'}
                        </span>
                        <ArrowRight size={14} />
                    </button>

                    <button 
                        onClick={onFactoryReset}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-red-900/50 bg-red-950/10 text-red-700 hover:bg-red-950/30 hover:text-red-500 hover:border-red-500/50 transition-all group mt-2"
                    >
                        <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                            <AlertTriangle size={12} />
                            {language === 'en' ? 'FACTORY_RESET' : '重置系统依赖'}
                        </span>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-dashed border-ash-gray/30 flex justify-between items-center relative z-10">
                <div className="text-[10px] font-mono text-ash-gray">
                    SYSTEM_BUILD: 2026.01.10<br/>
                    <button 
                        onClick={() => { onOpenUpdateLog(); handleClose(); }}
                        className="hover:text-ash-light transition-colors cursor-help"
                    >
                        ARCHIVE_VER: {currentVersion}
                    </button>
                </div>
                <button 
                    onClick={handleClose}
                    className="px-8 py-2 bg-ash-light text-ash-black font-black text-sm uppercase shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    {t.apply}
                </button>
            </div>
        </div>
    </div>
  );
};

export default DesktopSettingsModal;
