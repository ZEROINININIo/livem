
import React, { useState, useEffect, useRef } from 'react';
import { Chapter, Language, VNNode } from '../types';
import { parseChapterToVN } from '../utils/vnParser';
import { Play, Pause, RotateCcw, ArrowRight, X, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import Reveal from '../components/Reveal';
import MaskedText from '../components/MaskedText';
import { VNTheme, detectChapterTheme, getThemeStyles, getCharacterTheme } from '../utils/vnTheme';
import { markAsRead } from '../utils/readStatus';

interface VisualNovelPageProps {
  chapter: Chapter;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onExit: () => void;
  language: Language;
  isLightTheme: boolean;
}

// Helper: Remove outer quotes from dialogue
const cleanDialogueText = (text: string) => {
    let clean = text.trim();
    // Recursively remove outer quotes until clean, handling mixed types
    while (
        (clean.startsWith('“') && clean.endsWith('”')) || 
        (clean.startsWith('"') && clean.endsWith('"')) ||
        (clean.startsWith('「') && clean.endsWith('」'))
    ) {
        clean = clean.slice(1, -1).trim();
    }
    return clean;
};

const CharacterSprite = ({ id, isActive, emotion, isLightTheme, vnTheme }: { id: string, isActive: boolean, emotion?: string, isLightTheme: boolean, vnTheme: VNTheme }) => {
    const theme = getCharacterTheme(id, isLightTheme, vnTheme);
    
    return (
        <div 
            className={`
                transition-all duration-500 transform
                ${isActive ? 'scale-110 opacity-100 grayscale-0 translate-y-0' : 'scale-90 opacity-40 grayscale translate-y-4'}
                flex flex-col items-center
                ${vnTheme === 'bw' ? 'grayscale brightness-125 contrast-125' : ''} 
            `}
        >
            {/* Avatar Circle */}
            <div className={`
                w-32 h-32 md:w-48 md:h-48 rounded-full border-4 flex items-center justify-center backdrop-blur-md relative overflow-hidden
                ${theme.text} ${theme.border} ${theme.bg}
                ${isActive && emotion === 'shocked' ? 'animate-shake-violent' : ''}
                ${isActive && emotion === 'happy' ? 'animate-bounce' : ''}
            `}>
                <div className="text-4xl md:text-6xl font-black font-mono tracking-tighter opacity-80 select-none">
                    {theme.initials}
                </div>
                {/* Scanline overlay on char */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
            </div>
            
            {/* Stand Base */}
            <div className={`mt-4 w-24 h-2 bg-current opacity-50 rounded-full blur-[2px] ${theme.text}`}></div>
        </div>
    );
};

const VisualNovelPage: React.FC<VisualNovelPageProps> = ({ chapter, onNextChapter, onPrevChapter, onExit, language, isLightTheme }) => {
  const [nodes, setNodes] = useState<VNNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [history, setHistory] = useState<VNNode[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const autoPlayTimerRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);
  const handleNextRef = useRef<() => void>(() => {});

  if (!chapter) {
      return (
          <div className="flex items-center justify-center h-full text-red-500 font-mono">
              ERROR: NO_CHAPTER_DATA
          </div>
      );
  }

  const t = chapter.translations[language] || chapter.translations['zh-CN'];
  const vnTheme = detectChapterTheme(chapter.id);
  const themeStyles = getThemeStyles(vnTheme, isLightTheme);

  // Initialize
  useEffect(() => {
    const parsed = parseChapterToVN(t.content);
    // Fallback for empty content (like Terminal trigger chapters) to prevent hanging
    if (parsed.length === 0) {
        setNodes([{
            id: 'sys-wait',
            type: 'system',
            text: 'TERMINAL_LINK_ESTABLISHED...',
            emotion: 'neutral'
        }]);
    } else {
        setNodes(parsed);
    }
    setCurrentIndex(0);
    setHistory([]);
    setAutoPlay(false);
    setShowEndModal(false);
    
    // Mark as read when starting VN
    markAsRead(chapter.id);
  }, [chapter, language]);

  const currentNode = nodes[currentIndex];

  // Typing Effect
  useEffect(() => {
    if (!currentNode) return;

    let textToDisplay = currentNode.text;
    if (currentNode.type === 'dialogue') {
        textToDisplay = cleanDialogueText(textToDisplay);
    }

    // Handle Image Nodes: Auto skip typing, display immediately
    if (currentNode.type === 'image') {
        setDisplayedText(currentNode.text);
        setIsTyping(false);
        return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let charIdx = 0;
    const speed = 30; // ms per char

    if (textTimerRef.current) clearInterval(textTimerRef.current);

    // Skip typewriter for rich text to avoid broken tags during rendering
    if (currentNode.text.includes('[[')) {
        setDisplayedText(currentNode.text); // Use original for rich text parsing (parser handles removal)
        setIsTyping(false);
        if (autoPlay) {
            autoPlayTimerRef.current = window.setTimeout(() => {
                handleNext();
            }, 2000 + currentNode.text.length * 20);
        }
        return;
    }

    textTimerRef.current = window.setInterval(() => {
        if (charIdx < textToDisplay.length) {
            setDisplayedText(textToDisplay.substring(0, charIdx + 1));
            charIdx++;
        } else {
            setIsTyping(false);
            if (textTimerRef.current) clearInterval(textTimerRef.current);
            
            // Auto Play Logic
            if (autoPlay) {
                autoPlayTimerRef.current = window.setTimeout(() => {
                    handleNext();
                }, 1500 + textToDisplay.length * 20);
            }
        }
    }, speed);

    return () => {
        if (textTimerRef.current) clearInterval(textTimerRef.current);
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [currentIndex, currentNode, autoPlay]);

  const handleNext = () => {
      if (showEndModal) return;

      if (isTyping) {
          // Complete immediately
          let textToDisplay = currentNode.text;
          if (currentNode.type === 'dialogue') {
             textToDisplay = cleanDialogueText(textToDisplay);
          }
          setDisplayedText(textToDisplay);
          setIsTyping(false);
          if (textTimerRef.current) clearInterval(textTimerRef.current);
          return;
      }

      if (currentIndex < nodes.length - 1) {
          setHistory(prev => [...prev, currentNode]);
          setCurrentIndex(prev => prev + 1);
      } else {
          // End of Chapter Reached
          setAutoPlay(false);
          setShowEndModal(true);
      }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
      handleNextRef.current = handleNext;
  });

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (showHistory) return;
          // Z, Space, Enter trigger next
          if ([' ', 'z', 'Z', 'Enter'].includes(e.key)) {
              e.preventDefault();
              handleNextRef.current();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory]);

  const handleFinishChapter = () => {
      setShowEndModal(false);
      onNextChapter();
  };

  const toggleAuto = () => {
      if (autoPlay) {
          setAutoPlay(false);
          if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      } else {
          setAutoPlay(true);
          if (!isTyping) handleNext();
      }
  };

  // --- Rich Text Parser (Theme Aware) ---
  const parseRichText = (text: string) => {
    // Regex includes VOID_VISION
    const parts = text.split(/(\[\[(?:MASK|GLITCH_GREEN|GREEN|VOID|DANGER|BLUE|WHITE|VOID_VISION)::.*?\]\])/g);
    return parts.map((part, index) => {
        if (part.startsWith('[[MASK::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            return <MaskedText key={index}>{content}</MaskedText>;
        }
        
        // Helper for colored spans
        const createSpan = (content: string, colorClass: string, extraClass: string = "") => (
            <span key={index} className={`${colorClass} ${extraClass}`}>
                {content}
            </span>
        );

        // Force colors to white/black in BW mode
        if (vnTheme === 'bw') {
             if (part.startsWith('[[DANGER::')) {
                 const content = part.slice(10, -2);
                 return createSpan(content, 'text-white', 'font-black bg-black border border-white px-1');
             }
             if (part.startsWith('[[VOID_VISION::')) {
                 const content = part.slice(15, -2);
                 return (
                    <div key={index} className="my-2 p-2 border-l-4 border-white font-mono text-sm text-white bg-black/50 animate-pulse">
                        {content}
                    </div>
                 );
             }
             if (part.startsWith('[[BLUE::') || part.startsWith('[[GREEN::') || part.startsWith('[[VOID::')) {
                 // In BW mode, colored text becomes emphasized white text with a glitch or highlight
                 const content = part.replace(/^\[\[.*?::/, '').slice(0, -2);
                 return createSpan(content, 'text-white', 'font-bold bg-white/20 px-1 border-b border-white');
             }
             if (part.startsWith('[[GLITCH_GREEN::')) {
                 const content = part.slice(16, -2);
                 return (
                    <span key={index} className="text-white font-black tracking-widest bg-black border border-white inline-block animate-pulse relative px-1">
                        <span className="relative z-10">{content}</span>
                    </span>
                 );
             }
             // Fallback for any other tags in BW
             if (part.startsWith('[[') && part.endsWith(']]')) {
                 const content = part.replace(/^\[\[.*?::/, '').slice(0, -2);
                 return createSpan(content, 'text-white', 'font-bold underline decoration-dotted');
             }
             return part;
        }

        if (part.startsWith('[[GLITCH_GREEN::') && part.endsWith(']]')) {
            const content = part.slice(16, -2);
            const color = isLightTheme ? 'text-emerald-600' : 'text-emerald-400';
            const shadow = isLightTheme ? '' : 'drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]';
            return (
                <span key={index} className={`${color} font-black tracking-widest ${shadow} inline-block animate-pulse relative px-1`}>
                    {!isLightTheme && <span className="absolute inset-0 animate-ping opacity-30 blur-sm bg-emerald-500/20 rounded-full"></span>}
                    <span className="relative z-10">{content}</span>
                </span>
            );
        }
        if (part.startsWith('[[GREEN::') && part.endsWith(']]')) {
            const content = part.slice(9, -2);
            return createSpan(content, isLightTheme ? 'text-emerald-700' : 'text-emerald-500', 'font-mono font-bold tracking-wide');
        }
        if (part.startsWith('[[VOID::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            const color = isLightTheme ? 'text-fuchsia-700' : 'text-fuchsia-500';
            return (
                <span key={index} className={`${color} font-black tracking-widest inline-block animate-pulse relative px-1`}>
                    <span className="relative z-10">{content}</span>
                </span>
            );
        }
        if (part.startsWith('[[DANGER::') && part.endsWith(']]')) {
            const content = part.slice(10, -2);
            return createSpan(content, 'text-red-600', 'font-black animate-crash origin-left inline-block px-1');
        }
        if (part.startsWith('[[BLUE::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            // Ensure BLUE text stands out in Light Mode against Zinc-50 background
            return createSpan(content, isLightTheme ? 'text-blue-700' : 'text-blue-400', 'font-bold px-1');
        }
        if (part.startsWith('[[WHITE::') && part.endsWith(']]')) {
            const content = part.slice(9, -2);
            // In light theme, WHITE text needs to be black or dark
            const color = isLightTheme ? 'text-black font-black' : 'text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]';
            return createSpan(content, color, 'animate-pulse');
        }
        if (part.startsWith('[[VOID_VISION::') && part.endsWith(']]')) {
            const content = part.slice(15, -2);
            const color = isLightTheme ? 'text-purple-900 bg-purple-100 border-purple-300' : 'text-fuchsia-300 bg-fuchsia-950/50 border-fuchsia-500/50';
            return (
                <div key={index} className={`my-2 p-2 border-l-4 font-mono text-sm ${color} animate-pulse`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                        <AlertTriangle size={12} /> SYSTEM_INTERCEPT
                    </div>
                    {content}
                </div>
            );
        }
        return part;
    });
  };

  const activeSpeakerId = currentNode?.type === 'dialogue' ? currentNode.speaker : 'unknown';
  const speakerTheme = getCharacterTheme(activeSpeakerId || 'unknown', isLightTheme, vnTheme);

  if (!currentNode) return <div className="flex items-center justify-center h-full">LOADING_SCRIPT...</div>;

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden font-mono select-none ${themeStyles.bg}`}>
        
        {/* Background Grid Animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className={`w-full h-full bg-[size:50px_50px] ${themeStyles.grid}`}></div>
        </div>

        {/* Midnight Theme Specific Static Noise Overlay */}
        {vnTheme === 'bw' && (
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] animate-[shift_0.2s_infinite]"></div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
            <div className="flex gap-2">
                <button onClick={onExit} className="p-2 border border-current hover:bg-current hover:text-black transition-colors" title="Exit Game Mode">
                    <X size={16} />
                </button>
                <div className="px-3 py-2 border border-current text-xs font-bold flex items-center gap-2">
                    <themeStyles.icon size={14} />
                    <span>{chapter.id.toUpperCase()}</span>
                </div>
            </div>
            <div className="text-xs font-bold opacity-50">
                FRAME: {currentIndex + 1} / {nodes.length}
            </div>
        </div>

        {/* Stage Area (Character Visuals or Image) */}
        <div className="flex-1 relative flex items-center justify-center z-10" onClick={handleNext}>
            {currentNode?.type === 'dialogue' && currentNode.speaker && (
                <CharacterSprite 
                    id={currentNode.speaker} 
                    isActive={true} 
                    emotion={currentNode.emotion}
                    isLightTheme={isLightTheme}
                    vnTheme={vnTheme}
                />
            )}
            {currentNode.type === 'narration' && (
                <div className="text-4xl opacity-10 animate-pulse">...</div>
            )}
            {currentNode.type === 'image' && (
                <div className={`relative max-w-[90%] max-h-[60%] border-4 border-current p-2 shadow-hard animate-zoom-in-fast ${vnTheme === 'bw' ? 'bg-black grayscale' : 'bg-black/20'}`}>
                    {/* Parse src and caption from stored text (src::caption) */}
                    {(() => {
                        const parts = currentNode.text.split('::');
                        const src = parts[0];
                        const caption = parts.length > 1 ? parts.slice(1).join('::') : '';
                        return (
                            <>
                                <img src={src} alt="Scene" className="max-h-[50vh] object-contain block" />
                                {caption && (
                                    <div className={`absolute bottom-4 right-4 px-2 py-1 text-xs font-bold border flex items-center gap-2 ${vnTheme === 'bw' ? 'bg-white text-black border-black' : 'bg-black text-white border-white'}`}>
                                        <ImageIcon size={12} /> {caption}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>

        {/* Text Box Area */}
        <div className={`relative z-30 p-4 md:p-8 md:pb-12 shrink-0 transition-all duration-300 ${themeStyles.textBox} border-t-4`}>
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
                
                {/* Speaker Label */}
                <div className="h-8 flex items-end">
                    {currentNode.type === 'dialogue' && (
                        <div className={`
                            px-4 py-1 text-sm font-black uppercase tracking-widest transform ${vnTheme === 'bw' ? 'skew-x-0 border-2' : '-skew-x-12 border'} origin-bottom-left
                            ${speakerTheme.labelBg} ${speakerTheme.labelTx} border-transparent
                        `}>
                            {vnTheme === 'bw' ? (
                                <span className="flex items-center gap-2">
                                    /// {currentNode.speakerName.toUpperCase()} ///
                                </span>
                            ) : (
                                currentNode.speakerName
                            )}
                        </div>
                    )}
                    {currentNode.type === 'system' && (
                        <div className={`px-4 py-1 text-sm font-black uppercase tracking-widest border ${vnTheme === 'bw' ? 'bg-white text-black border-black' : 'text-red-500 border-red-500 bg-red-950/20'}`}>
                            SYSTEM_ALERT
                        </div>
                    )}
                    {currentNode.type === 'image' && (
                        <div className={`px-4 py-1 text-sm font-black uppercase tracking-widest border ${vnTheme === 'bw' ? 'bg-white text-black border-black' : 'text-blue-500 border-blue-500 bg-blue-950/20'}`}>
                            VISUAL_DATA
                        </div>
                    )}
                </div>

                {/* Main Text */}
                <div 
                    className={`
                        min-h-[100px] md:min-h-[120px] text-base md:text-xl leading-relaxed cursor-pointer p-4 border-2
                        ${currentNode.type === 'system' ? (vnTheme === 'bw' ? 'text-white border-white border-dashed' : 'text-red-500 border-red-900/30') : ''}
                        ${currentNode.type === 'narration' ? 'italic border-transparent opacity-80' : ''}
                        ${currentNode.type === 'dialogue' ? `${speakerTheme.border} ${speakerTheme.bg} ${speakerTheme.text}` : isLightTheme ? 'bg-zinc-50 border-zinc-200' : 'bg-ash-dark/30 border-ash-gray/20'}
                        ${currentNode.type === 'image' ? 'text-center flex items-center justify-center font-bold opacity-70' : ''}
                    `}
                    onClick={handleNext}
                >
                    {currentNode.type === 'image' ? (
                        <span>[ SCENE VISUALIZATION ]</span>
                    ) : (
                        <>
                            {parseRichText(displayedText)}
                            {isTyping && <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse align-middle"></span>}
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-4">
                        <button onClick={() => setShowHistory(!showHistory)} className="text-xs font-bold hover:underline opacity-70 hover:opacity-100 flex items-center gap-1">
                            <RotateCcw size={14} /> LOG
                        </button>
                        <button onClick={toggleAuto} className={`text-xs font-bold hover:underline flex items-center gap-1 ${autoPlay ? 'text-green-500' : 'opacity-70 hover:opacity-100'}`}>
                            {autoPlay ? <Pause size={14} /> : <Play size={14} />} AUTO
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onPrevChapter} className="p-2 border border-current opacity-50 hover:opacity-100 hover:text-ash-light" title="Previous Chapter">
                            <RotateCcw size={16} />
                        </button>
                        
                        <button onClick={handleNext} className="px-6 py-2 bg-current text-black font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2">
                            NEXT <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* End Chapter Transition Modal */}
        {showEndModal && (
            <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className={`w-full max-w-md border-2 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative ${isLightTheme ? 'bg-white border-zinc-400' : 'bg-ash-black border-ash-light'}`}>
                    <div className="text-center space-y-2">
                        <CheckCircle size={48} className={`mx-auto mb-4 ${isLightTheme ? 'text-zinc-800' : 'text-ash-light'}`} />
                        <h2 className="text-xl font-black uppercase tracking-widest">
                            {language === 'en' ? 'CHAPTER COMPLETE' : '本章閱讀完畢'}
                        </h2>
                        <div className={`text-xs font-mono border-b pb-4 mb-4 ${isLightTheme ? 'border-zinc-300 text-zinc-500' : 'border-ash-gray/30 text-ash-gray'}`}>
                            {t.title}
                        </div>
                        <p className={`text-sm font-mono ${isLightTheme ? 'text-zinc-600' : 'text-ash-gray'}`}>
                            {language === 'en' ? 'Proceed to the next data node?' : '是否跳轉至下一節點？'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleFinishChapter}
                            className={`w-full py-4 border-2 font-black uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${isLightTheme ? 'bg-zinc-800 text-white border-zinc-800 hover:bg-zinc-700' : 'bg-ash-light text-ash-black border-ash-light hover:bg-white'}`}
                        >
                            {language === 'en' ? 'NEXT CHAPTER' : '跳轉下一章'} <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={onExit}
                            className={`w-full py-3 border-2 font-bold uppercase tracking-wide transition-all hover:scale-[1.02] ${isLightTheme ? 'border-zinc-300 text-zinc-600 hover:border-zinc-800 hover:text-black' : 'border-ash-gray/50 text-ash-gray hover:border-ash-light hover:text-ash-light'}`}
                        >
                            {language === 'en' ? 'RETURN TO MENU' : '返回目錄'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* History Modal */}
        {showHistory && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-8 overflow-y-auto animate-fade-in" onClick={() => setShowHistory(false)}>
                <div className="max-w-3xl mx-auto space-y-6" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-black border-b border-ash-gray pb-4 mb-8 sticky top-0 bg-black/90 pt-4 text-ash-light">BACKLOG</h2>
                    {history.map((node) => (
                        <div key={node.id} className="flex flex-col gap-1 border-l-2 border-ash-dark pl-4 opacity-70 hover:opacity-100 transition-opacity text-ash-light">
                            {node.speakerName && <div className="text-xs font-bold opacity-50">{node.speakerName}</div>}
                            <div className="text-sm">{node.type === 'image' ? '[IMAGE]' : parseRichText(node.text)}</div>
                        </div>
                    ))}
                    <div className="h-20"></div>
                </div>
            </div>
        )}

    </div>
  );
};

export default VisualNovelPage;
