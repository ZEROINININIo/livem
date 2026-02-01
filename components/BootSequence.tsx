
import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface BootSequenceProps {
  onComplete: () => void;
  isNormalBoot?: boolean;
  language: Language;
}

// Reusable Star Component for consistent branding
const FourPointStar = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style}>
    <path d="M50 0 C52 40 60 48 100 50 C60 52 52 60 50 100 C48 60 40 52 0 50 C40 48 48 40 50 0 Z" fill="currentColor" />
  </svg>
);

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, isNormalBoot = false, language }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<'INIT' | 'LOADING' | 'READY' | 'ENTER'>('INIT');
  const [progress, setProgress] = useState(0);
  
  // Audio unlock helper
  const handleInteraction = () => {
      if (phase === 'READY') {
          setPhase('ENTER');
          setTimeout(onComplete, 1200); // Wait for exit animation
      }
  };

  // Boot Logic
  useEffect(() => {
    // Phase 1: INIT (Immediate)
    setPhase('LOADING');
    
    const bootSteps = [
        { msg: "BIOS_CHECK...", time: 200 },
        { msg: "LOADING_KERNEL...", time: 500 },
        { msg: "MOUNTING_VFS...", time: 800 },
        { msg: "DECRYPTING_ASSETS...", time: 1200 },
        { msg: "SYNC_TIMELINE...", time: 1600 },
        { msg: "PREPARING_INTERFACE...", time: 2000 },
        { msg: "SYSTEM_READY.", time: 2400 }
    ];

    let timer: number;
    let currentStep = 0;

    const runStep = () => {
        if (currentStep >= bootSteps.length) {
            setPhase('READY');
            return;
        }
        
        const step = bootSteps[currentStep];
        setLogs(prev => [...prev, `> ${step.msg}`].slice(-5)); // Keep last 5 lines
        setProgress(((currentStep + 1) / bootSteps.length) * 100);
        
        currentStep++;
        if (currentStep < bootSteps.length) {
            timer = window.setTimeout(runStep, bootSteps[currentStep].time - (bootSteps[currentStep-1]?.time || 0));
        } else {
            setPhase('READY');
        }
    };

    timer = window.setTimeout(runStep, 200);

    return () => window.clearTimeout(timer);
  }, []);

  const t = {
      ready: language === 'en' ? 'ESTABLISH LINK' : '建立链接',
      sub: language === 'en' ? 'CLICK TO INITIALIZE' : '点击接入系统',
      loading: 'SYSTEM_BOOT_SEQUENCE'
  };

  return (
    <div 
        className={`fixed inset-0 z-[100] bg-ash-black text-ash-light overflow-hidden flex flex-col items-center justify-center font-mono select-none cursor-pointer transition-colors duration-1000 ${phase === 'ENTER' ? 'bg-ash-white' : ''}`}
        onClick={handleInteraction}
    >
        {/* Background Grid */}
        <div className={`absolute inset-0 bg-grid-hard opacity-20 pointer-events-none transition-transform duration-[2000ms] ${phase === 'ENTER' ? 'scale-150 opacity-0' : 'scale-100'}`}></div>
        
        {/* === CENTRAL VISUAL: THE STAR CORE === */}
        <div className={`relative z-10 transition-all duration-700 ${phase === 'ENTER' ? 'scale-[20] opacity-0' : 'scale-100 opacity-100'}`}>
            <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                
                {/* Orbit Rings (Loading State) */}
                <div className={`absolute inset-0 border border-ash-gray/20 rounded-full transition-all duration-700 ${phase === 'READY' ? 'scale-110 border-emerald-500/30' : 'animate-spin-slow'}`}></div>
                <div className={`absolute inset-8 border border-ash-gray/30 rounded-full border-dashed transition-all duration-700 ${phase === 'READY' ? 'scale-90 border-emerald-500/30' : 'animate-spin-reverse-slow'}`}></div>
                
                {/* The Star (Logo) */}
                <div className={`relative z-20 transition-all duration-500 ${phase === 'READY' ? 'scale-100' : 'scale-50 opacity-50 grayscale'}`}>
                    <FourPointStar className={`w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)] ${phase === 'READY' ? 'text-emerald-400 animate-pulse' : 'text-ash-gray'}`} />
                    
                    {/* Inner Glitch Effect on Hover/Ready */}
                    {phase === 'READY' && (
                        <div className="absolute inset-0 text-emerald-300 mix-blend-overlay animate-shake-violent opacity-50">
                            <FourPointStar className="w-full h-full" />
                        </div>
                    )}
                </div>

                {/* Progress Ring (SVG Stroke) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1"
                        className="text-emerald-500/50"
                        strokeDasharray="300"
                        strokeDashoffset={300 - (progress / 100) * 300}
                        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                    />
                </svg>

                {/* Center Text Overlay (When Ready) */}
                {phase === 'READY' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center w-full animate-fade-in">
                        <div className="text-xl md:text-3xl font-black text-white mix-blend-difference tracking-widest uppercase glitch-text-heavy" data-text="LINK START">
                            {t.ready}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* === BOTTOM LOGS === */}
        <div className={`absolute bottom-12 left-0 right-0 text-center transition-opacity duration-500 ${phase === 'ENTER' ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col justify-end items-center gap-1 font-mono text-[10px] md:text-xs text-ash-gray/60 min-h-[100px]">
                {phase !== 'READY' ? (
                    logs.map((log, i) => (
                        <div key={i} className={`tracking-wider ${i === logs.length - 1 ? 'text-emerald-500/80 font-bold' : 'opacity-50'}`}>
                            {log}
                        </div>
                    ))
                ) : (
                    <div className="text-emerald-500 animate-bounce tracking-widest uppercase">
                        {t.sub}
                    </div>
                )}
            </div>
        </div>

        {/* === CORNER DECOR === */}
        <div className={`absolute top-4 left-4 text-[10px] font-mono text-ash-gray/30 transition-opacity duration-500 ${phase === 'ENTER' ? 'opacity-0' : 'opacity-100'}`}>
            NOVA_OS // BOOTLOADER
        </div>
        <div className={`absolute top-4 right-4 text-[10px] font-mono text-ash-gray/30 text-right transition-opacity duration-500 ${phase === 'ENTER' ? 'opacity-0' : 'opacity-100'}`}>
            VER: LIVE_CLIENT<br/>
            MEM: OK
        </div>

        {/* Flash Overlay */}
        <div className={`fixed inset-0 bg-white pointer-events-none transition-opacity duration-1000 z-[110] ${phase === 'ENTER' ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

export default BootSequence;
