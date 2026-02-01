
import React, { useState, useEffect, useRef } from 'react';
import { Play, Database, GitBranch, Command, Hexagon, Terminal } from 'lucide-react';
import { Language } from '../types';
import { introQuotes } from '../data/introQuotes';
import { updateLogs } from '../data/updateLogs';
import { homePageTranslations } from '../data/uiTranslations';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  nickname?: string;
  isLightTheme?: boolean;
}

// --- Utility: Random Character Decoder Effect ---
const DecryptText = ({ text, className, revealDelay = 0 }: { text: string, className?: string, revealDelay?: number }) => {
    const [display, setDisplay] = useState('');
    const [started, setStarted] = useState(false);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

    useEffect(() => {
        const startTimer = setTimeout(() => setStarted(true), revealDelay);
        return () => clearTimeout(startTimer);
    }, [revealDelay, text]);

    useEffect(() => {
        if (!started) return;
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text.split('').map((char, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('')
            );
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 2; // Speed
        }, 30);
        return () => clearInterval(interval);
    }, [text, started]);

    return <span className={className}>{display}</span>;
};

// --- Background Component: Perspective Grid & Particles ---
const DigitalHorizon = ({ isLightTheme }: { isLightTheme: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        let frame = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        const particles: {x: number, y: number, z: number, speed: number}[] = [];
        for(let i=0; i<120; i++) {
            particles.push({
                x: (Math.random() - 0.5) * w * 3,
                y: (Math.random() - 0.5) * h,
                z: Math.random() * 2000,
                speed: 1 + Math.random() * 4
            });
        }

        const draw = () => {
            // Theme Colors
            const bg = isLightTheme ? '#f4f4f5' : '#09090b';
            const gridColor = isLightTheme ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
            const horizonColor = isLightTheme ? 'rgba(255,255,255,0.8)' : 'rgba(16,185,129,0.1)'; 
            const particleColor = isLightTheme ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
            
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const fov = 300;

            // Horizon Haze
            const gradient = ctx.createLinearGradient(0, cy - 50, 0, cy + 100);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(0.5, horizonColor);
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, cy - 50, w, 150);

            // Draw Perspective Grid (Floor)
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            // Moving Horizontal Lines
            const gridSize = 100;
            const speed = 1.5;
            const offset = (frame * speed) % gridSize;
            
            // Floor
            for (let z = 0; z < 2000; z += gridSize) {
                const pz = z - offset;
                if (pz <= 0) continue;
                const scale = fov / (fov + pz);
                const x1 = cx - (w) * scale * 2;
                const x2 = cx + (w) * scale * 2;
                const y = cy + 150 * scale; 
                
                ctx.globalAlpha = Math.min(1, pz / 1000); 
                
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
            }
            
            // Vertical Lines (Perspective)
            for (let x = -w; x < w; x += gridSize * 1.5) {
                 const scale1 = fov / (fov + 0);
                 const scale2 = fov / (fov + 2000);
                 const x1 = cx + x * scale1;
                 const y1 = cy + 150 * scale1;
                 const x2 = cx + x * scale2;
                 const y2 = cy + 150 * scale2;
                 
                 ctx.moveTo(x1, y1);
                 ctx.lineTo(x2, y2);
            }
            ctx.globalAlpha = 1;
            ctx.stroke();

            // Draw Particles
            particles.forEach(p => {
                p.z -= p.speed;
                if (p.z <= 0) {
                    p.z = 2000;
                    p.x = (Math.random() - 0.5) * w * 3;
                }
                
                const scale = fov / (fov + p.z);
                const px = cx + p.x * scale;
                const py = cy + p.y * scale;
                
                const size = (1 - p.z / 2000) * 2.5;
                
                ctx.fillStyle = particleColor;
                ctx.globalAlpha = 1 - p.z / 2000;
                ctx.beginPath();
                ctx.arc(px, py, Math.max(0, size), 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            frame++;
            requestAnimationFrame(draw);
        };
        
        const animationId = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [isLightTheme]);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

const HomePage: React.FC<HomePageProps> = ({ onNavigate, language, setLanguage, nickname, isLightTheme = false }) => {
    const [quote, setQuote] = useState(introQuotes[0]);
    const [currentTime, setCurrentTime] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);

    // Dynamic Version from Logs
    const currentVersion = updateLogs[0]?.version || "UNKNOWN_VER";

    useEffect(() => {
        setMounted(true);
        const randomQuote = introQuotes[Math.floor(Math.random() * introQuotes.length)];
        setQuote(randomQuote);

        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 60;
        const y = (e.clientY - rect.top - rect.height / 2) / 60;
        setMousePos({ x, y });
    };

    const t = homePageTranslations(language);

    const parallaxStyle = {
        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) rotateX(${-mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
    };

    const themeColors = isLightTheme ? {
        text: 'text-zinc-800',
        textMuted: 'text-zinc-500',
        border: 'border-zinc-300',
        accent: 'text-zinc-900',
        bg: 'bg-white/90',
        glass: 'bg-white/60',
        decor: 'border-zinc-200'
    } : {
        text: 'text-ash-light',
        textMuted: 'text-ash-gray',
        border: 'border-ash-light/30',
        accent: 'text-emerald-400',
        bg: 'bg-ash-black/80',
        glass: 'bg-ash-black/40',
        decor: 'border-ash-light/10'
    };

    return (
        <div 
            className={`min-h-full relative overflow-x-hidden flex flex-col items-center perspective-1000 pb-24 md:pb-0 ${isLightTheme ? 'bg-zinc-100' : 'bg-[#09090b]'}`}
            onMouseMove={handleMouseMove}
        >
            <DigitalHorizon isLightTheme={isLightTheme} />
            
            {/* Background Vignette & Scanlines */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)] z-0"></div>
            <div className={`fixed inset-0 pointer-events-none bg-[length:100%_3px] bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.15)_50%)] z-0 opacity-30`}></div>

            {/* === HUD ELEMENTS (Corners) === */}
            
            {/* Top Left: System Status */}
            <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-20 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className={`flex items-center gap-2 md:gap-3 ${themeColors.text} font-mono text-xs uppercase tracking-widest`}>
                    <div className="w-6 h-6 md:w-8 md:h-8 border border-current flex items-center justify-center animate-spin-slow">
                        <Hexagon size={14} className="md:w-4 md:h-4" />
                    </div>
                    <div className="hidden md:block">
                        <div className="font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            {t.system}
                        </div>
                        <div className={`text-[9px] ${themeColors.textMuted}`}>CORE: {currentVersion}</div>
                    </div>
                </div>
            </div>

            {/* Top Right: Clock & User */}
            <div className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 text-right transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className={`font-black text-lg md:text-2xl font-mono ${themeColors.text} tracking-tighter`}>
                    {currentTime || "00:00:00"}
                </div>
                <div className={`text-[9px] md:text-[10px] font-mono ${themeColors.textMuted} uppercase`}>
                    OP: {nickname || 'GUEST'}
                </div>
            </div>

            {/* Bottom Left: Decor Data (Hidden on mobile) */}
            <div className={`hidden md:block absolute bottom-6 left-6 z-20 font-mono text-[9px] ${themeColors.textMuted} transition-all duration-1000 delay-700 ${mounted ? 'opacity-50' : 'opacity-0'}`}>
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()} :: SYNC_OK</div>
                ))}
            </div>

            {/* === MAIN CONTAINER (Parallax) === */}
            <div 
                ref={containerRef}
                className="relative z-10 w-full max-w-5xl p-4 md:p-12 transition-transform duration-100 ease-out my-auto"
                style={typeof window !== 'undefined' && window.innerWidth > 768 ? parallaxStyle : {}}
            >
                <div className="flex flex-col items-center gap-6 md:gap-16 py-12 md:py-0">
                    
                    {/* 1. Header Section */}
                    <div className={`text-center space-y-4 md:space-y-6 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90 blur-sm'}`}>
                        {/* Logo Container */}
                        <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto group">
                            {/* Spinning Brackets */}
                            <div className={`absolute inset-[-8px] md:inset-[-20px] border-t border-b ${themeColors.border} rounded-full animate-spin-reverse-slow opacity-50`}></div>
                            <div className={`absolute inset-[-4px] md:inset-[-10px] border-l border-r ${themeColors.border} rounded-full animate-spin-slow opacity-50`}></div>
                            
                            {/* Main Logo Box */}
                            <div className={`absolute inset-0 border-2 ${themeColors.border} ${themeColors.glass} backdrop-blur-sm rotate-45 transition-transform duration-700 group-hover:rotate-0`}></div>
                            <div className={`absolute inset-1.5 md:inset-2 border ${isLightTheme ? 'border-zinc-400' : 'border-ash-gray'} rotate-45 transition-transform duration-700 group-hover:rotate-0`}></div>
                            
                            <img 
                                src="https://cdn.imgos.cn/vip/2026/01/02/6957e8e22304e.png" 
                                alt="Logo" 
                                className={`absolute inset-0 w-full h-full object-contain p-4 md:p-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ${isLightTheme ? 'filter invert brightness-50' : ''}`}
                            />
                        </div>

                        <div>
                            <h1 className={`text-3xl md:text-7xl font-black tracking-tighter uppercase mb-2 ${themeColors.text} glitch-text-heavy`} data-text="NOVA LABS">
                                <DecryptText text="NOVA LABS" revealDelay={500} />
                            </h1>
                            <div className={`flex items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-mono font-bold tracking-[0.2em] md:tracking-[0.5em] ${themeColors.textMuted} uppercase`}>
                                <span className="w-4 md:w-8 h-px bg-current"></span>
                                <DecryptText text={t.subtitle} revealDelay={1200} />
                                <span className="w-4 md:w-8 h-px bg-current"></span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Navigation Grid - Optimized for Mobile (1 col stacked) and Desktop (3 cols) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-sm md:max-w-4xl">
                        
                        {/* Central Button: Reader */}
                        <div className={`col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <button 
                                onClick={() => onNavigate('reader')}
                                className={`
                                    w-full h-24 md:aspect-[4/3] md:h-auto relative group overflow-hidden
                                    border-2 ${themeColors.border} ${themeColors.bg} backdrop-blur-md
                                    flex flex-col items-center justify-center gap-2 md:gap-4
                                    hover:scale-[1.02] md:hover:scale-105 transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]
                                `}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.1)_50%,transparent_60%)] bg-[length:200%_200%] bg-right-bottom group-hover:bg-left-top transition-[background-position] duration-700"></div>
                                <div className="absolute inset-0 bg-grid-hard opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                
                                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-current opacity-50"></div>
                                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-current opacity-50"></div>
                                
                                <div className={`p-2 md:p-4 rounded-full border border-current group-hover:bg-emerald-500 group-hover:text-black transition-colors ${isLightTheme ? 'text-zinc-800' : 'text-ash-light'}`}>
                                    <Play size={24} className="fill-current md:w-8 md:h-8" />
                                </div>
                                <span className={`font-black font-mono tracking-widest uppercase text-xs md:text-sm ${themeColors.text} group-hover:text-emerald-500`}>
                                    {t.start}
                                </span>
                                <div className="text-[8px] md:text-[9px] font-mono opacity-50">INIT_MAIN_SEQUENCE</div>
                            </button>
                        </div>

                        {/* Left Button: Database */}
                        <div className={`col-span-1 md:col-start-1 md:row-start-1 flex flex-col justify-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <button 
                                onClick={() => onNavigate('database')}
                                className={`
                                    w-full h-20 md:h-40 relative group overflow-hidden
                                    border ${themeColors.border} ${themeColors.bg} backdrop-blur-sm
                                    flex flex-col items-center justify-center gap-1 md:gap-2
                                    hover:-translate-y-1 transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]
                                `}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                <Database size={18} className={`${themeColors.textMuted} group-hover:text-cyan-500 transition-colors md:w-6 md:h-6`} />
                                <span className={`font-bold font-mono tracking-widest uppercase text-[10px] md:text-xs ${themeColors.text} group-hover:text-cyan-500`}>{t.database}</span>
                                <div className="hidden md:block text-[8px] font-mono opacity-40">ARCHIVE_ACCESS</div>
                            </button>
                        </div>

                        {/* Right Button: Side Stories */}
                        <div className={`col-span-1 md:col-start-3 md:row-start-1 flex flex-col justify-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                            <button 
                                onClick={() => onNavigate('sidestories')}
                                className={`
                                    w-full h-20 md:h-40 relative group overflow-hidden
                                    border ${themeColors.border} ${themeColors.bg} backdrop-blur-sm
                                    flex flex-col items-center justify-center gap-1 md:gap-2
                                    hover:-translate-y-1 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(192,38,211,0.2)]
                                `}
                            >
                                <div className="absolute top-0 right-0 w-full h-1 bg-fuchsia-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300"></div>
                                <GitBranch size={18} className={`${themeColors.textMuted} group-hover:text-fuchsia-500 transition-colors md:w-6 md:h-6`} />
                                <span className={`font-bold font-mono tracking-widest uppercase text-[10px] md:text-xs ${themeColors.text} group-hover:text-fuchsia-500`}>{t.sidestory}</span>
                                <div className="hidden md:block text-[8px] font-mono opacity-40">FRAGMENT_LOAD</div>
                            </button>
                        </div>

                    </div>

                    {/* 3. Footer Quote */}
                    <div className={`w-full max-w-xs md:max-w-md mx-auto transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className={`
                            relative p-3 md:p-4 border-l-2 ${isLightTheme ? 'border-zinc-400 bg-zinc-100/50' : 'border-emerald-500/50 bg-emerald-950/10'}
                            backdrop-blur-sm overflow-hidden
                        `}>
                            <div className="absolute top-2 right-2 opacity-20"><Command size={14} /></div>
                            <div className="text-[10px] md:text-xs font-mono mb-1 md:mb-2 flex items-center gap-2 font-bold opacity-70">
                                <Terminal size={10} />
                                [{quote.speaker}]:
                            </div>
                            <div className={`text-xs md:text-sm font-mono leading-relaxed ${themeColors.text}`}>
                                <DecryptText text={quote.text[language]} revealDelay={1500} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Copyright */}
            <div className={`absolute bottom-24 md:bottom-2 w-full text-center text-[8px] font-mono ${themeColors.textMuted} opacity-30 z-20`}>
                TIMELINE © 2026 // ALL RIGHTS RESERVED
            </div>
        </div>
    );
};

export default HomePage;
