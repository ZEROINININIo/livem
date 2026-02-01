
import React, { useState } from 'react';
import { Globe, Monitor, Volume2, ArrowRight, ShieldAlert, ChevronLeft, User, AlertCircle, Info } from 'lucide-react';
import { Language, ReadingMode } from '../types';
import ThemeToggle from './ThemeToggle';
import CRTToggle from './CRTToggle';
import BackgroundMusic from './BackgroundMusic';
import FullscreenToggle from './FullscreenToggle';
import FontSelector from './fonts/FontSelector';
import ReadingModeToggle from './ReadingModeToggle';
import { ReaderFont, getFontClass } from './fonts/fontConfig';

// Local translations to remove dependency on deleted data folder
const initialSetupTranslations = {
  'zh-CN': {
    safeMode: "安全模式启动",
    title: "系统初始化",
    subtitle: "检测到初次访问，请配置终端环境",
    langSelect: "语言选择 / LANGUAGE",
    visuals: "视觉设置",
    audio: "音频设置",
    identity: "身份登记",
    nickPlaceholder: "输入代号...",
    nickRequired: "必须输入代号才能继续",
    nickDesc: "此代号将显示在您的终端界面上。",
    nickPrivacy: "代号仅存储在本地浏览器中，用于界面显示。",
    back: "返回",
    reboot: "重启系统",
    rebooting: "正在重启系统内核..."
  },
  'zh-TW': {
    safeMode: "安全模式啟動",
    title: "系統初始化",
    subtitle: "檢測到初次訪問，請配置終端環境",
    langSelect: "語言選擇 / LANGUAGE",
    visuals: "視覺設置",
    audio: "音頻設置",
    identity: "身份登記",
    nickPlaceholder: "輸入代號...",
    nickRequired: "必須輸入代號才能繼續",
    nickDesc: "此代號將顯示在您的終端界面上。",
    nickPrivacy: "代號僅存儲在本地瀏覽器中，用於界面顯示。",
    back: "返回",
    reboot: "重啟系統",
    rebooting: "正在重啟系統內核..."
  },
  'en': {
    safeMode: "SAFE MODE INITIATED",
    title: "SYSTEM INITIALIZATION",
    subtitle: "FIRST TIME ACCESS DETECTED. CONFIGURE TERMINAL.",
    langSelect: "LANGUAGE SELECT",
    visuals: "VISUAL SETTINGS",
    audio: "AUDIO SETTINGS",
    identity: "IDENTITY REGISTRATION",
    nickPlaceholder: "ENTER CODENAME...",
    nickRequired: "CODENAME REQUIRED TO PROCEED",
    nickDesc: "This codename will be displayed on your HUD.",
    nickPrivacy: "Codename is stored locally for display purposes only.",
    back: "BACK",
    reboot: "REBOOT SYSTEM",
    rebooting: "REBOOTING SYSTEM KERNEL..."
  }
};

interface InitialSetupProps {
  onComplete: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  crtEnabled: boolean;
  setCrtEnabled: (enabled: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (isLight: boolean) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  readingMode?: ReadingMode;
  setReadingMode?: (mode: ReadingMode) => void;
  nickname: string;
  setNickname: (name: string) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ 
    onComplete, language, setLanguage, crtEnabled, setCrtEnabled, isLightTheme, setIsLightTheme,
    bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume, readerFont, setReaderFont,
    readingMode, setReadingMode, nickname, setNickname
}) => {
  
  const [step, setStep] = useState(0); // 0: Lang, 1: Config, 2: Ready
  const [isRebooting, setIsRebooting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nickError, setNickError] = useState(false);

  const t = initialSetupTranslations[language];

  const handleReboot = () => {
    if (!nickname.trim()) {
        setNickError(true);
        return;
    }
    
    setIsRebooting(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
        currentProgress += Math.random() * 5;
        if (currentProgress > 100) {
            currentProgress = 100;
            clearInterval(interval);
            setTimeout(onComplete, 500); // Small delay at 100% before switch
        }
        setProgress(currentProgress);
    }, 100);
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-amber-500 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden ${getFontClass(readerFont)}`}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="max-w-3xl w-full border-2 border-amber-600/50 bg-black/80 backdrop-blur-sm p-6 md:p-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] relative animate-slide-in landscape:max-h-[90vh] landscape:overflow-y-auto landscape:p-4">
            <div className="absolute -top-3 left-4 bg-black px-2 text-amber-500 font-bold border border-amber-600/50 flex items-center gap-2 text-[10px] md:text-xs">
                <ShieldAlert size={14} className="animate-pulse" />
                {t.safeMode}
            </div>

            <header className="mb-6 md:mb-10 text-center border-b border-dashed border-amber-800 pb-4 md:pb-6">
                <h1 className="text-xl md:text-3xl font-black tracking-tighter mb-1 text-amber-500 glitch-text-heavy" data-text={t.title}>
                    {t.title}
                </h1>
                <p className="text-amber-700 text-[8px] md:text-sm uppercase tracking-widest">{t.subtitle}</p>
            </header>

            {!isRebooting ? (
                <div className="space-y-6 md:space-y-8">
                    <div className={`transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-50 blur-[1px] pointer-events-none'}`}>
                        <label className="block text-[10px] font-bold text-amber-600 mb-2 md:mb-4 uppercase flex items-center gap-2">
                            <Globe size={14} /> {t.langSelect}
                        </label>
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            {(['zh-CN', 'zh-TW', 'en'] as Language[]).map(l => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        setLanguage(l);
                                        setStep(1);
                                    }}
                                    className={`py-2 md:py-4 border-2 font-bold text-xs md:text-lg transition-all ${
                                        language === l 
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                                        : 'border-amber-900/50 text-amber-800 hover:border-amber-700 hover:text-amber-600'
                                    }`}
                                >
                                    {l === 'en' ? 'EN' : l === 'zh-CN' ? '简' : '繁'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {step >= 1 && (
                        <div className="animate-fade-in space-y-6 landscape:space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6 landscape:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase flex items-center gap-2">
                                        <Monitor size={14} /> {t.visuals}
                                    </label>
                                    <FontSelector value={readerFont} onChange={setReaderFont} language={language} isSetupMode />
                                    <CRTToggle value={crtEnabled} onChange={setCrtEnabled} isSetupMode language={language} />
                                    <FullscreenToggle isSetupMode language={language} />
                                    <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} isSetupMode />
                                    {readingMode && setReadingMode && (
                                        <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} isSetupMode />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase flex items-center gap-2">
                                        <Volume2 size={14} /> {t.audio}
                                    </label>
                                    <BackgroundMusic 
                                        isSetupMode 
                                        isPlaying={bgmPlaying}
                                        onToggle={() => setBgmPlaying(!bgmPlaying)}
                                        volume={bgmVolume}
                                        onVolumeChange={setBgmVolume}
                                    />
                                    
                                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase flex items-center gap-2 mt-4">
                                        <User size={14} /> {t.identity}
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={nickname}
                                            onChange={(e) => {
                                                setNickname(e.target.value);
                                                if(nickError) setNickError(false);
                                            }}
                                            maxLength={10}
                                            placeholder={t.nickPlaceholder}
                                            className={`w-full bg-amber-950/20 border-b-2 font-inherit py-2 px-1 focus:outline-none transition-colors placeholder-amber-900/50 ${nickError ? 'border-red-500 text-red-400' : 'border-amber-700 text-amber-400 focus:border-amber-400'}`}
                                        />
                                        <div className={`absolute right-0 top-2 text-[10px] ${nickError ? 'text-red-500 animate-pulse' : 'text-amber-700'}`}>
                                            {nickError ? <AlertCircle size={14} /> : `${nickname.length}/10`}
                                        </div>
                                    </div>
                                    {nickError ? (
                                        <p className="text-[9px] text-red-500 mt-1 leading-tight font-bold animate-pulse">
                                            {t.nickRequired}
                                        </p>
                                    ) : (
                                        <p className="text-[9px] text-amber-800 mt-1 leading-tight">
                                            {t.nickDesc}
                                        </p>
                                    )}
                                    
                                    {/* Privacy Disclaimer Box */}
                                    <div className="mt-2 p-2 border border-amber-800/30 bg-amber-900/10 flex gap-2 items-start text-[9px] text-amber-700/80 leading-snug">
                                        <Info size={12} className="shrink-0 mt-0.5" />
                                        <span>{t.nickPrivacy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-dashed border-amber-800 flex justify-between items-center landscape:mt-2">
                                <button
                                    onClick={() => setStep(0)}
                                    className="px-4 py-2 text-amber-800 hover:text-amber-500 font-bold text-xs uppercase flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    {t.back}
                                </button>

                                <button
                                    onClick={handleReboot}
                                    className={`px-6 md:px-8 py-2 md:py-3 font-bold uppercase tracking-wider transition-colors text-xs md:text-base flex items-center gap-2 ${nickError ? 'bg-red-900/20 text-red-500 border border-red-500 cursor-not-allowed' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                                >
                                    {t.reboot} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in py-8 md:py-12 flex flex-col items-center justify-center w-full">
                    <div className="w-full max-w-md space-y-2 mb-8">
                         <div className="flex justify-between text-xs uppercase text-amber-500/80">
                             <span>{t.rebooting}</span>
                             <span>{Math.floor(progress)}%</span>
                         </div>
                         <div className="h-4 bg-amber-900/30 border border-amber-800 p-0.5">
                             <div 
                                className="h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                                style={{ width: `${progress}%` }}
                             ></div>
                         </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 right-2 text-[8px] md:text-[10px] text-amber-900">
                LIVE_CLIENT_V1
            </div>
        </div>
    </div>
  );
};

export default InitialSetup;
