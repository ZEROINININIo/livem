
import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { creditsData } from '../data/credits';
import { Heart, Star, ArrowRight, User, Award, ShieldCheck, Crown } from 'lucide-react';
import Reveal from '../components/Reveal';
import { updateLogs } from '../data/updateLogs';

interface CreditsPageProps {
  language: Language;
  onBack: () => void;
  isLightTheme: boolean;
}

// --- Golden Nebula Canvas Effect ---
const GoldenNebula = ({ isLightTheme }: { isLightTheme: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        let animationFrame: number;

        const particles: {x: number, y: number, r: number, speed: number, alpha: number}[] = [];
        const count = 80;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        const draw = () => {
            // Background Clear with Trail
            const bgFill = isLightTheme ? 'rgba(255, 252, 240, 0.2)' : 'rgba(5, 2, 10, 0.2)'; 
            ctx.fillStyle = bgFill;
            ctx.fillRect(0, 0, w, h);

            // Particles
            particles.forEach(p => {
                p.y -= p.speed;
                if (p.y < -10) {
                    p.y = h + 10;
                    p.x = Math.random() * w;
                }

                ctx.beginPath();
                // Gold / Amber Gradient
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                if (isLightTheme) {
                    gradient.addColorStop(0, `rgba(217, 119, 6, ${p.alpha})`); // Amber-600
                    gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
                } else {
                    gradient.addColorStop(0, `rgba(251, 191, 36, ${p.alpha})`); // Amber-400
                    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
                }
                
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrame = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [isLightTheme]);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

const CreditsPage: React.FC<CreditsPageProps> = ({ language, onBack, isLightTheme }) => {
  const t = {
    title: language === 'en' ? 'HALL OF FAME' : '特别鸣谢 // 荣耀殿堂',
    subtitle: language === 'en' ? 'THOSE WHO LIGHT THE STARS' : '那些和开发团队一起，点亮星空的人',
    back: language === 'en' ? 'RETURN' : '返回',
    thanks: language === 'en' 
        ? "Thank you for traversing this unknown timeline with us. Your observation is the coordinate of our reality."
        : "感谢您与我们共同探索这片未知的时域。您的观测，即是现实的坐标。",
    sysVer: updateLogs[0]?.version || "V1.0",
  };

  const themeColors = isLightTheme ? {
      text: 'text-amber-900',
      border: 'border-amber-200',
      bg: 'bg-white/80',
      accent: 'text-amber-600'
  } : {
      text: 'text-amber-100',
      border: 'border-amber-500/30',
      bg: 'bg-[#0f0a15]/80',
      accent: 'text-amber-400'
  };

  const formatContributionWithZC = (text: string) => {
      // Regex to find amount associated with RMB markers
      // Matches: "40元", "40 元", "¥40", "RMB 40"
      const rmbRegex = /(?:(\d+(?:\.\d+)?)\s*(?:元|RMB|CNY))|(?:(?:¥|RMB|CNY)\s*(\d+(?:\.\d+)?))/i;
      const match = text.match(rmbRegex);

      if (match) {
          const amountStr = match[1] || match[2];
          const amount = parseFloat(amountStr);
          if (!isNaN(amount)) {
              // Rate: 0.02 RMB = 1 ZC => 1 RMB = 50 ZC
              const zc = Math.floor(amount * 50); 
              return (
                  <span>
                      {text}
                      <span className={`opacity-60 ml-2 text-[10px] font-normal ${isLightTheme ? 'text-amber-700' : 'text-amber-300'}`}>
                          (≈ {zc.toLocaleString()} ZC)
                      </span>
                  </span>
              );
          }
      }
      return text;
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col animate-fade-in overflow-hidden ${isLightTheme ? 'bg-orange-50' : 'bg-black'}`}>
        
        {/* Dynamic Background */}
        <GoldenNebula isLightTheme={isLightTheme} />
        
        {/* Header */}
        <div className={`p-6 border-b border-amber-500/20 flex justify-between items-center shrink-0 backdrop-blur-md relative z-10 ${isLightTheme ? 'bg-white/60' : 'bg-black/40'}`}>
            <div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3 ${themeColors.text} drop-shadow-md`}>
                    <Crown className="text-amber-500 fill-amber-500/20 animate-pulse" size={28} />
                    {t.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] opacity-70 ${themeColors.text}`}>{t.subtitle}</p>
                </div>
            </div>
            <button 
                onClick={onBack}
                className={`px-6 py-2 border transition-all font-mono text-xs font-bold uppercase flex items-center gap-2 group ${themeColors.border} ${themeColors.text} hover:bg-amber-500 hover:text-white`}
            >
                {t.back} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 relative custom-scrollbar z-10">
            <div className="max-w-6xl mx-auto pb-24">
                
                {/* Intro Text */}
                <div className="mb-16 text-center relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                    <p className={`relative font-serif text-lg md:text-xl italic opacity-90 ${themeColors.text}`}>
                        "{t.thanks}"
                    </p>
                    <div className={`w-16 h-px mx-auto mt-6 ${isLightTheme ? 'bg-amber-900/20' : 'bg-amber-100/20'}`}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {creditsData.map((entry, index) => {
                        const isOriginal = entry.tags.includes('Original Fan') || entry.tags.includes('Founder');
                        
                        return (
                            <Reveal key={entry.id} delay={index * 100} className={isOriginal ? 'md:col-span-2 lg:col-span-2' : ''}>
                                <div className={`
                                    relative p-6 md:p-8 border transition-all duration-500 group hover:-translate-y-1 overflow-hidden h-full flex flex-col
                                    ${isOriginal ? 'border-2' : 'border'}
                                    ${themeColors.bg} ${themeColors.border} 
                                    hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)] hover:border-amber-400
                                `}>
                                    {/* Golden Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    {/* Decoration for Original Fans */}
                                    {isOriginal && (
                                        <>
                                            <div className="absolute top-0 right-0 p-3 opacity-80 group-hover:scale-110 transition-transform duration-500">
                                                <Award size={32} className="text-amber-500 drop-shadow-md" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300"></div>
                                        </>
                                    )}

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${isLightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/30 border-amber-500/30'}`}>
                                            <User size={24} className={isOriginal ? 'text-amber-500' : 'opacity-50 text-amber-200'} />
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-xl md:text-2xl uppercase tracking-tight ${themeColors.text}`}>{entry.name}</h3>
                                            <div className={`text-[10px] font-mono mt-1 opacity-60 ${themeColors.text}`}>{entry.date} // ID: {entry.id}</div>
                                        </div>
                                    </div>

                                    <div className={`text-sm md:text-base font-bold font-mono mb-4 flex items-center gap-2 ${themeColors.accent} border-b border-dashed border-amber-500/20 pb-4`}>
                                        <Star size={14} fill="currentColor" />
                                        {formatContributionWithZC(entry.contribution[language] || entry.contribution['en'])}
                                    </div>

                                    {entry.message && (
                                        <p className={`text-sm font-serif italic leading-relaxed opacity-80 mb-6 flex-1 ${themeColors.text}`}>
                                            "{entry.message}"
                                        </p>
                                    )}

                                    <div className="mt-auto flex flex-wrap gap-2">
                                        {entry.tags.map(tag => (
                                            <span key={tag} className={`text-[9px] px-2 py-1 border uppercase tracking-wider font-bold ${
                                                tag === 'Original Fan' || tag === 'Founder'
                                                ? 'border-amber-500 text-amber-600 bg-amber-500/10'
                                                : (isLightTheme ? 'border-amber-200 text-amber-800' : 'border-amber-800 text-amber-200/60')
                                            }`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>

                <div className="mt-24 flex flex-col items-center gap-6">
                    <div className={`inline-flex items-center gap-3 px-6 py-2 border rounded-full text-[10px] font-mono uppercase tracking-widest ${isLightTheme ? 'border-amber-200 text-amber-800 bg-white' : 'border-amber-900 text-amber-500 bg-black/50'}`}>
                        <ShieldCheck size={12} />
                        ARCHIVE_SYSTEM_VER: {t.sysVer}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CreditsPage;
