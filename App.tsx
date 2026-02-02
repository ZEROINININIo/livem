
import React, { useState, useEffect } from 'react';

// Stream Mode Only Components
import CustomCursor from './components/CustomCursor';
import StreamOverlay from './components/StreamOverlay';
import { Language, ReadingMode, AppConfig } from './types';
import { ReaderFont, getFontClass } from './components/fonts/fontConfig';
import { unlockGlobalAudio } from './components/BackgroundMusic';
import { CONFIG_STORAGE_KEY, DEFAULT_CONFIG } from './config/constants';

const App: React.FC = () => {
  // 1. Load config from localStorage
  const loadConfig = (): AppConfig => {
    let config = DEFAULT_CONFIG;
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load config", e);
    }
    return config;
  };

  const initialConfig = loadConfig();

  // Global Preference State
  const [language, setLanguage] = useState<Language>(initialConfig.language);
  const [crtEnabled, setCrtEnabled] = useState(initialConfig.crtEnabled);
  const [isLightTheme, setIsLightTheme] = useState(initialConfig.isLightTheme);
  const [setupCompleted, setSetupCompleted] = useState(initialConfig.setupCompleted);
  const [readerFont, setReaderFont] = useState<ReaderFont>(initialConfig.readerFont);
  const [readingMode, setReadingMode] = useState<ReadingMode>(initialConfig.readingMode || 'standard');
  const [nickname, setNickname] = useState<string>(initialConfig.nickname);
  
  // BGM State
  const [bgmPlaying, setBgmPlaying] = useState(initialConfig.bgmPlaying);
  const [bgmVolume, setBgmVolume] = useState(initialConfig.bgmVolume);

  // Remove Loader immediately
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
        loader.style.transition = 'opacity 0.5s';
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
    // Attempt audio unlock (may be blocked by browser until interaction)
    unlockGlobalAudio();
  }, []);

  // Persist settings
  useEffect(() => {
    const config: AppConfig = {
      language,
      crtEnabled,
      isLightTheme,
      setupCompleted,
      bgmPlaying,
      bgmVolume,
      readerFont,
      readingMode,
      nickname
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [language, crtEnabled, isLightTheme, setupCompleted, bgmPlaying, bgmVolume, readerFont, readingMode, nickname]);

  return (
    <>
      <CustomCursor />

      <div className={`h-screen w-screen bg-transparent overflow-hidden ${getFontClass(readerFont)}`}>
        <div className="noise-overlay"></div>
        <StreamOverlay 
            language={language}
            isLightTheme={isLightTheme}
            nickname={nickname}
        />
      </div>
    </>
  );
};

export default App;
