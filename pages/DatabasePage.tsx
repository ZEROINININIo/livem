
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { novelData } from '../data/novelData';
import { Globe, Box, Cpu, Users, FolderOpen, Image as ImageIcon, BookOpen, Network, Database as DbIcon, Move, X, Search, Map as MapIcon, CornerDownRight, FileWarning, Skull, AlertTriangle, RefreshCw, Bug, Ghost, Binary, Zap } from 'lucide-react';
import Reveal from '../components/Reveal';
import { Language } from '../types';
import VirtualJoystick from '../components/VirtualJoystick';
import { MAP_CONFIG } from '../config/constants';
import { databasePageTranslations, nodeLabels } from '../data/uiTranslations';

interface DatabasePageProps {
  language: Language;
  nickname?: string;
}

// --- Types & Constants ---

type CategoryType = 'All' | 'World' | 'Organization' | 'Technology' | 'Society' | 'Setting';
type NodeType = 'Category' | 'Corruption';

interface MapNode {
    id: string;
    type: NodeType;
    category?: CategoryType;
    x: number;
    y: number;
    icon: any;
    color: string;
    // Visual randomizers for glitch effect
    rotation?: number;
    scale?: number;
    glitchSpeed?: string;
    labelOverride?: string;
}

// Standard Functional Nodes
const STANDARD_NODES: MapNode[] = [
    { id: 'All', type: 'Category', category: 'All', x: 0, y: 0, icon: Box, color: 'text-ash-light' },
    { id: 'World', type: 'Category', category: 'World', x: -300, y: -150, icon: Globe, color: 'text-cyan-400' },
    { id: 'Organization', type: 'Category', category: 'Organization', x: 300, y: -150, icon: Users, color: 'text-fuchsia-400' },
    { id: 'Technology', type: 'Category', category: 'Technology', x: 300, y: 150, icon: Cpu, color: 'text-emerald-400' },
    { id: 'Society', type: 'Category', category: 'Society', x: -300, y: 150, icon: Network, color: 'text-amber-400' },
    { id: 'Setting', type: 'Category', category: 'Setting', x: 0, y: 350, icon: BookOpen, color: 'text-red-400' },
];

const DatabasePage: React.FC<DatabasePageProps> = ({ language, nickname = "TEA" }) => {
  // Game Loop State (Visuals are now Ref-driven for performance)
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);
  
  // UI Refs (Direct DOM manipulation to prevent React re-renders during movement)
  const coordsRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [crashState, setCrashState] = useState<'NONE' | 'WARNING' | 'CRASHED'>('NONE');
  const [crashLogs, setCrashLogs] = useState<string[]>([]);
  
  // Input Refs (Mutable to avoid re-renders in loop)
  const keysPressed = useRef<Record<string, boolean>>({});
  const joystickVector = useRef({ x: 0, y: 0 });
  const playerPosRef = useRef({ x: 0, y: 200 });
  const loopRef = useRef<number | null>(null);
  
  // CRITICAL FIX: Need a Ref for the player element specifically to update it in loop
  const mapLayerRef = useRef<HTMLDivElement>(null);
  const playerNodeRef = useRef<HTMLDivElement>(null);
  
  const activeNodeRef = useRef<MapNode | null>(null); // Ref to track active node inside loop without closure staleness
  
  // Frame counter for throttling UI updates
  const frameCountRef = useRef(0);
  
  // Generate Procedural Glitch Nodes (Memoized to stay constant during session)
  const allNodes = useMemo(() => {
      const glitchIcons = [Skull, FileWarning, Bug, Ghost, Binary, Zap, AlertTriangle];
      const glitchColors = ['text-red-600', 'text-fuchsia-600', 'text-emerald-500', 'text-white'];
      const glitchLabels = ["0xERR", "N̷U̷L̷L̷", "D̷E̷A̷D̷", "F̴A̴T̴A̴L̴", "⚠", "???", "VOID_LEAK"];

      const generatedCorruptions: MapNode[] = Array.from({ length: 12 }).map((_, i) => {
          // Random scatter logic, avoiding 0,0 center
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * 600; // Keep them somewhat away from center
          return {
              id: `CORRUPT_${i}`,
              type: 'Corruption',
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              icon: glitchIcons[Math.floor(Math.random() * glitchIcons.length)],
              color: glitchColors[Math.floor(Math.random() * glitchColors.length)],
              rotation: Math.random() * 360,
              scale: 0.8 + Math.random() * 1.5,
              labelOverride: glitchLabels[Math.floor(Math.random() * glitchLabels.length)],
              glitchSpeed: Math.random() > 0.5 ? 'animate-pulse' : 'animate-bounce' // Just for class selection
          };
      });

      return [...STANDARD_NODES, ...generatedCorruptions];
  }, []);

  const t = databasePageTranslations[language];

  // --- Input Handlers ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Use callback to stabilize reference and prevent VirtualJoystick re-renders
  const handleJoystickMove = useCallback((x: number, y: number) => {
      joystickVector.current = { x, y };
  }, []);

  // --- Game Loop (Optimized for Mobile) ---

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
        const delta = Math.min((time - lastTime) / 16.67, 3); // Capped delta for smoother catch-up
        lastTime = time;

        if (selectedCategory || crashState !== 'NONE') {
            // Pause loop if reading or crashing
            loopRef.current = requestAnimationFrame(loop);
            return;
        }

        // 1. Calculate Input Vector
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) dy -= 1;
        if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) dy += 1;
        if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) dx -= 1;
        if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) dx += 1;

        // Joystick Override (if active)
        if (joystickVector.current.x !== 0 || joystickVector.current.y !== 0) {
            dx = joystickVector.current.x;
            dy = joystickVector.current.y;
        }

        // Normalize Diagonal
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 1) {
            dx /= len;
            dy /= len;
        }

        // 2. Update Position Logic with Boundaries
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            let nextX = playerPosRef.current.x + dx * MAP_CONFIG.speed * delta;
            let nextY = playerPosRef.current.y + dy * MAP_CONFIG.speed * delta;

            // Clamp values within bounds
            if (nextX < MAP_CONFIG.bounds.minX) nextX = MAP_CONFIG.bounds.minX;
            if (nextX > MAP_CONFIG.bounds.maxX) nextX = MAP_CONFIG.bounds.maxX;
            if (nextY < MAP_CONFIG.bounds.minY) nextY = MAP_CONFIG.bounds.minY;
            if (nextY > MAP_CONFIG.bounds.maxY) nextY = MAP_CONFIG.bounds.maxY;

            playerPosRef.current.x = nextX;
            playerPosRef.current.y = nextY;
        }

        // 3. Direct DOM Manipulation (Bypasses React Render Cycle)
        
        // A. Move the "Camera" (Map Layer) to keep player centered
        if (mapLayerRef.current) {
            mapLayerRef.current.style.transform = `translate3d(calc(50% - ${playerPosRef.current.x}px), calc(50% - ${playerPosRef.current.y}px), 0)`;
        }

        // B. Move the "Player Icon" to the correct world coordinates inside the map
        // IMPORTANT: Because we use Refs, the React render cycle doesn't update the style automatically.
        // We must manually update the player's position in the DOM.
        if (playerNodeRef.current) {
            playerNodeRef.current.style.transform = `translate3d(${playerPosRef.current.x}px, ${playerPosRef.current.y}px, 0) translate(-50%, -50%)`;
        }

        // 4. Update Coordinates Text Directly via Ref (No State Update = No Re-render)
        frameCountRef.current++;
        if (frameCountRef.current % 5 === 0 && coordsRef.current) {
             const xStr = Math.round(playerPosRef.current.x).toString();
             const yStr = Math.round(playerPosRef.current.y).toString();
             coordsRef.current.innerText = `POS: [${xStr}, ${yStr}]`;
        }

        // 5. Collision / Proximity Check
        let nearestNode: MapNode | null = null;
        let minDist = Infinity;

        allNodes.forEach(node => {
            const dist = Math.sqrt(
                Math.pow(node.x - playerPosRef.current.x, 2) + 
                Math.pow(node.y - playerPosRef.current.y, 2)
            );
            if (dist < MAP_CONFIG.interactionDist) {
                if (dist < minDist) {
                    minDist = dist;
                    nearestNode = node;
                }
            }
        });

        // Only trigger React update if active node changes (Low frequency event)
        if (activeNodeRef.current?.id !== nearestNode?.id) {
            activeNodeRef.current = nearestNode;
            setActiveNode(nearestNode);
        }

        loopRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = requestAnimationFrame(loop);
    return () => {
        if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [selectedCategory, crashState, allNodes]); 

  // --- Crash Effect Loop ---
  useEffect(() => {
      if (crashState === 'CRASHED') {
          const codes = ["0x000000FF", "SEGMENTATION_FAULT", "CORE_DUMPED", "BUFFER_OVERFLOW", "NaN", "0xDEADBEEF", "FATAL_EXCEPTION", "STACK_TRACE_LOST"];
          
          const interval = setInterval(() => {
              const newLogs = Array.from({length: 3}, () => {
                  const code = codes[Math.floor(Math.random() * codes.length)];
                  const addr = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(8, '0');
                  return `[${performance.now().toFixed(2)}] ERROR @ 0x${addr} : ${code}`;
              });
              setCrashLogs(prev => [...newLogs, ...prev].slice(0, 30));
          }, 100);
          
          return () => clearInterval(interval);
      }
  }, [crashState]);

  // --- Interaction ---

  const handleAccess = () => {
      if (activeNode) {
          if (activeNode.type === 'Corruption') {
              setCrashState('WARNING');
          } else if (activeNode.category) {
              setSelectedCategory(activeNode.category);
          }
      }
  };

  const handleCloseModal = () => {
      setSelectedCategory(null);
  };

  const handleTriggerCrash = () => {
      setCrashState('CRASHED');
  };

  const handleCancelCrash = () => {
      setCrashState('NONE');
      // Push player away slightly to avoid instant re-trigger
      playerPosRef.current.x += 20; 
      playerPosRef.current.y += 20;
      // Manually update text immediately
      if (coordsRef.current) {
          coordsRef.current.innerText = `POS: [${Math.round(playerPosRef.current.x)}, ${Math.round(playerPosRef.current.y)}]`;
      }
      if (mapLayerRef.current) {
          mapLayerRef.current.style.transform = `translate3d(calc(50% - ${playerPosRef.current.x}px), calc(50% - ${playerPosRef.current.y}px), 0)`;
      }
      if (playerNodeRef.current) {
          playerNodeRef.current.style.transform = `translate3d(${playerPosRef.current.x}px, ${playerPosRef.current.y}px, 0) translate(-50%, -50%)`;
      }
  };

  const handleReboot = () => {
      window.location.reload();
  };

  // --- Render Helpers ---

  // Filter content
  const filteredLore = selectedCategory && selectedCategory !== 'All'
    ? novelData.lore.filter(l => l.category === selectedCategory)
    : novelData.lore;

  // --- Crash Screen Render ---
  if (crashState === 'CRASHED') {
      return (
          <div className="fixed inset-0 z-[99999] bg-blue-900 text-white font-mono p-8 overflow-hidden flex flex-col">
              <div className="text-4xl md:text-6xl font-black mb-8 animate-pulse">:(</div>
              <h1 className="text-xl md:text-3xl font-bold mb-4">{t.crashHeader}</h1>
              <p className="mb-8 text-sm md:text-base">
                  A problem has been detected and the Nova Archives has been shut down to prevent damage to your cognitive processor.
              </p>
              
              <div className="flex-1 overflow-hidden font-mono text-xs md:text-sm text-blue-200/80 mb-8 font-bold leading-tight">
                  {crashLogs.map((log, i) => (
                      <div key={i}>{log}</div>
                  ))}
              </div>

              <div className="mt-auto pt-8 border-t border-white/30">
                  <p className="text-xs mb-4">STOP CODE: CRITICAL_PROCESS_DIED</p>
                  <button 
                    onClick={handleReboot}
                    className="bg-white text-blue-900 px-6 py-3 font-bold uppercase hover:bg-blue-100 transition-colors flex items-center gap-2 w-fit"
                  >
                      <RefreshCw size={16} /> {t.crashReboot}
                  </button>
              </div>

              {/* Glitch Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-20"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-white/50 animate-[scanline_0.1s_linear_infinite] opacity-10"></div>
          </div>
      );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-ash-black select-none font-mono">
        
        {/* === MAP LAYER (Optimized) === */}
        <div 
            ref={mapLayerRef}
            className="absolute inset-0 will-change-transform backface-hidden"
            style={{
                // Initial transform
                transform: `translate3d(calc(50% - ${playerPosRef.current.x}px), calc(50% - ${playerPosRef.current.y}px), 0)`,
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Infinite Grid Background Effect */}
            <div 
                className="absolute top-[-2000px] left-[-2000px] w-[4000px] h-[4000px] bg-grid-hard opacity-20 pointer-events-none translate-z-0"
                style={{
                    backgroundPosition: 'center'
                }}
            ></div>

            {/* Boundary Visuals (Dashed Lines) */}
            <div 
                className="absolute border-2 border-dashed border-red-500/30 pointer-events-none"
                style={{
                    left: MAP_CONFIG.bounds.minX,
                    top: MAP_CONFIG.bounds.minY,
                    width: MAP_CONFIG.bounds.maxX - MAP_CONFIG.bounds.minX,
                    height: MAP_CONFIG.bounds.maxY - MAP_CONFIG.bounds.minY,
                }}
            >
                <div className="absolute -top-6 left-0 text-red-500/50 text-[10px] font-black tracking-widest">BOUNDARY_LIMIT // {MAP_CONFIG.bounds.minY}</div>
                <div className="absolute -bottom-6 right-0 text-red-500/50 text-[10px] font-black tracking-widest">BOUNDARY_LIMIT // {MAP_CONFIG.bounds.maxY}</div>
            </div>

            {/* Connecting Lines (Decor) */}
            <svg className="absolute top-[-2000px] left-[-2000px] w-[4000px] h-[4000px] pointer-events-none opacity-20 overflow-visible translate-z-0">
                <defs>
                    <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
                        <circle cx="2" cy="2" r="2" fill="currentColor" className="text-ash-gray" />
                    </marker>
                </defs>
                {allNodes.map((node, i) => {
                    // Only connect Categories
                    if (node.type !== 'Category' || node.id === 'All') return null;
                    return (
                        <line 
                            key={`line-${i}`}
                            x1={2000 + 0} y1={2000 + 0} // Hub offset
                            x2={2000 + node.x} y2={2000 + node.y}
                            stroke="currentColor" 
                            strokeWidth="1" 
                            strokeDasharray="5,5"
                            className="text-ash-gray"
                            markerEnd="url(#dot)"
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {allNodes.map(node => {
                const isActive = activeNode?.id === node.id;
                const isCorrupt = node.type === 'Corruption';
                
                // Determine Label
                const label = isCorrupt 
                    ? node.labelOverride 
                    : (nodeLabels[node.id] ? nodeLabels[node.id][language] : node.id);

                if (isCorrupt) {
                    // --- Render Corrupted Node (Broken Style) ---
                    return (
                        <div 
                            key={node.id}
                            className={`absolute flex flex-col items-center justify-center transition-opacity duration-300 ${isActive ? 'z-20' : 'z-10'}`}
                            style={{ 
                                left: node.x, 
                                top: node.y, 
                                transform: `translate(-50%, -50%) rotate(${node.rotation}deg) scale(${isActive ? (node.scale || 1) * 1.2 : (node.scale || 1)})`,
                            }}
                        >
                            {/* Glitchy Icon Container */}
                            <div className={`
                                w-16 h-16 flex items-center justify-center relative mix-blend-exclusion
                                ${isActive ? 'animate-shake-violent' : ''}
                            `}>
                                <div className="absolute inset-0 bg-current opacity-20" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}></div>
                                <div className={`absolute inset-0 border-2 border-dashed ${node.color} opacity-50 animate-spin-slow`}></div>
                                
                                <node.icon size={32} strokeWidth={2} className={`${node.color} ${isActive ? 'animate-ping' : ''}`} />
                            </div>

                            {/* Broken Label */}
                            <div className={`
                                mt-2 px-1 py-0.5 text-[8px] font-black font-mono uppercase tracking-widest bg-black text-white
                                ${isActive ? 'glitch-text-heavy' : ''}
                            `} 
                            style={{ transform: `rotate(-${node.rotation}deg)` }} // Counter-rotate label to be readable-ish
                            data-text={label}>
                                {label}
                            </div>
                        </div>
                    );
                }

                // --- Render Standard Node ---
                return (
                    <div 
                        key={node.id}
                        className={`absolute flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'z-20 scale-110' : 'z-10 scale-100'}`}
                        style={{ 
                            left: node.x, 
                            top: node.y, 
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {/* Node Pulse Ring */}
                        {isActive && (
                            <div className={`absolute inset-0 rounded-full border-2 border-dashed ${node.color} w-32 h-32 -m-8 animate-spin-slow opacity-50`}></div>
                        )}
                        
                        {/* Node Icon */}
                        <div className={`
                            w-16 h-16 rounded-full border-2 flex items-center justify-center bg-ash-black shadow-hard
                            ${isActive ? `border-white text-white ${node.color.replace('text-', 'bg-').replace('400','900').replace('600', '900')}/50` : `border-ash-gray text-ash-gray`}
                        `}>
                            <node.icon size={32} strokeWidth={1.5} />
                        </div>

                        {/* Label */}
                        <div className={`
                            mt-4 px-2 py-1 text-[10px] font-bold uppercase tracking-widest border bg-ash-black whitespace-nowrap
                            ${isActive ? `border-white text-white` : `border-ash-gray text-ash-gray`}
                        `}>
                            {label}
                        </div>
                    </div>
                );
            })}

            {/* Player Character (Stylized 4-Pointed Star) */}
            <div 
                ref={playerNodeRef}
                className="absolute z-30 flex flex-col items-center justify-center pointer-events-none will-change-transform"
                style={{ 
                    // Initial position logic, updated via loop
                    transform: `translate3d(${playerPosRef.current.x}px, ${playerPosRef.current.y}px, 0) translate(-50%, -50%)`
                }}
            >
                <div className="relative w-16 h-16 flex items-center justify-center">
                    {/* Outer Rotating Ring */}
                    <div className="absolute inset-0 border border-ash-gray/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
                    <div className="absolute inset-2 border border-dashed border-ash-light/20 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                    
                    {/* Core Glow */}
                    <div className="absolute inset-0 bg-ash-light blur-xl opacity-20 scale-50 animate-pulse"></div>

                    {/* 4-Pointed Star Shape (SVG) */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-ash-light drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[spin_4s_linear_infinite]">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
                    </svg>
                </div>
                
                {/* Custom Nickname Label */}
                <div className="mt-2 text-[8px] font-mono font-black text-rose-600 bg-ash-light/95 px-2 py-0.5 tracking-widest border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)] backdrop-blur-[1px]">
                    {nickname}
                </div>
            </div>

        </div>

        {/* === HUD LAYER === */}
        
        {/* Top Info - High Z-Index to stay above joystick touch area */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-[60]">
            <div className="bg-ash-black/80 border border-ash-gray p-2 text-[10px] text-ash-gray backdrop-blur-sm pointer-events-auto">
                <div className="font-bold text-ash-light flex items-center gap-2">
                    <DbIcon size={12} /> {t.dbTitle}
                </div>
                <div className="mt-1" ref={coordsRef}>POS: [0, 200]</div>
            </div>
            
            <div className="hidden md:block bg-ash-black/80 border border-ash-gray p-2 text-[10px] text-ash-gray backdrop-blur-sm">
                {t.guide}
            </div>
        </div>

        {/* Interaction Prompt (Bottom Center) - High Z-Index to allow clicks */}
        {activeNode && !selectedCategory && crashState === 'NONE' && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-[60]">
                <button 
                    onClick={handleAccess}
                    className={`
                        pointer-events-auto px-8 py-3 font-black text-lg uppercase tracking-widest border-2 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-2 hover:scale-105 transition-transform
                        ${activeNode.type === 'Corruption' 
                            ? 'bg-red-600 text-white border-red-400 animate-shake-violent' 
                            : 'bg-ash-light text-ash-black border-white animate-bounce'}
                    `}
                >
                    {activeNode.type === 'Corruption' ? <Bug size={20} /> : <CornerDownRight size={20} />}
                    {activeNode.type === 'Corruption' ? t.inspect : t.access}
                </button>
            </div>
        )}

        {/* Dynamic Joystick - Lower z-index but above map */}
        <VirtualJoystick onMove={handleJoystickMove} />

        {/* === WARNING MODAL (Crash State) === */}
        {crashState === 'WARNING' && (
            <div className="fixed inset-0 z-[100] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-crash">
                <div className="max-w-md w-full bg-black border-4 border-red-600 p-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3 text-red-500 mb-4 border-b-2 border-red-900 pb-2">
                        <AlertTriangle size={32} className="animate-pulse" />
                        <h2 className="text-xl font-black uppercase tracking-widest">{t.crashTitle}</h2>
                    </div>
                    
                    <div className="space-y-4 mb-8 text-red-100 font-mono text-sm leading-relaxed">
                        <p className="font-bold text-red-400">{t.crashWarn}</p>
                        <p>{t.crashWarn2}</p>
                        <div className="p-2 bg-red-900/20 border border-red-800 text-[10px] text-red-300">
                            ERROR_CODE: 0xBAD_ACCESS_VIOLATION<br/>
                            NODE_INTEGRITY: 0%
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleTriggerCrash}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-wider transition-colors border-2 border-red-600 hover:border-red-400"
                        >
                            {t.crashProceed}
                        </button>
                        <button 
                            onClick={handleCancelCrash}
                            className="w-full py-3 bg-black hover:bg-red-950 text-red-500 font-bold uppercase tracking-wider transition-colors border-2 border-red-900 hover:border-red-600"
                        >
                            {t.crashCancel}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* === CATEGORY MODAL (Normal Details) === */}
        {selectedCategory && (
            <div className="fixed inset-0 z-[100] bg-ash-black/95 backdrop-blur-md flex flex-col animate-fade-in">
                {/* Modal Header */}
                <div className="p-4 border-b border-ash-gray flex items-center justify-between bg-ash-black shrink-0">
                    <div className="flex items-center gap-3">
                        <FolderOpen size={24} className="text-ash-light" />
                        <div>
                            <div className="text-[10px] text-ash-gray uppercase">DATABASE // {selectedCategory}</div>
                            <h2 className="text-xl font-black text-ash-light uppercase tracking-tighter">
                                {nodeLabels[selectedCategory] ? nodeLabels[selectedCategory][language] : selectedCategory}
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="p-2 border border-ash-gray text-ash-gray hover:text-white hover:border-white hover:bg-ash-dark transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {filteredLore.map((entry, index) => {
                            const tLore = entry.translations[language] || entry.translations['zh-CN'];
                            return (
                                <Reveal key={entry.id} delay={index * 100}>
                                <div className="bg-ash-black border-2 border-ash-gray p-4 md:p-8 hover:border-ash-light transition-colors relative group">
                                    {/* Corner Markers */}
                                    <div className="absolute top-0 left-0 w-3 md:w-4 h-3 md:h-4 border-t-2 border-l-2 border-ash-gray group-hover:border-ash-light"></div>
                                    <div className="absolute top-0 right-0 w-3 md:w-4 h-3 md:h-4 border-t-2 border-r-2 border-ash-gray group-hover:border-ash-light"></div>
                                    <div className="absolute bottom-0 left-0 w-3 md:w-4 h-3 md:h-4 border-b-2 border-l-2 border-ash-gray group-hover:border-ash-light"></div>
                                    <div className="absolute bottom-0 right-0 w-3 md:w-4 h-3 md:h-4 border-b-2 border-r-2 border-ash-gray group-hover:border-ash-light"></div>

                                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 md:mb-6 border-b border-dashed border-ash-gray pb-4 gap-2 md:gap-0">
                                    <h3 className="text-lg md:text-xl font-bold text-ash-light font-mono uppercase leading-tight">{tLore.title}</h3>
                                    <span className="self-start text-[10px] font-mono text-ash-black bg-ash-gray px-2 py-1 font-bold">
                                        TYPE: {entry.category.toUpperCase()}
                                    </span>
                                    </div>
                                    
                                    <div className="space-y-4 text-ash-gray font-mono text-xs md:text-sm leading-6 md:leading-7">
                                    {tLore.content.map((para, idx) => {
                                        const trimmed = para.trim();
                                        const imageMatch = trimmed.match(/^\[\[IMAGE::(.*?)\]\]$/);
                                        
                                        if (imageMatch) {
                                            const content = imageMatch[1];
                                            const [src, ...captionParts] = content.split('::');
                                            const caption = captionParts.join('::');
                                            return (
                                            <div key={idx} className="my-6">
                                                <div className="relative border-2 border-ash-gray p-2 bg-ash-dark/30 inline-block max-w-full">
                                                    <img 
                                                        src={src} 
                                                        alt={caption}
                                                        className="max-w-full h-auto max-h-64 object-contain mx-auto block grayscale-[20%] hover:grayscale-0 transition-all"
                                                    />
                                                    <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-2 bg-ash-dark border border-ash-gray px-2 py-0.5 z-10">
                                                        <div className="text-[10px] font-mono text-ash-light flex items-center gap-2 uppercase font-bold">
                                                            <ImageIcon size={10} />
                                                            {caption}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        }

                                        const parts = para.split('**');
                                        return (
                                            <p key={idx}>
                                                {parts.map((part, i) => 
                                                    i % 2 === 1 
                                                    ? <strong key={i} className="text-ash-light bg-ash-dark px-1 border border-ash-gray/50">{part}</strong> 
                                                    : part
                                                )}
                                            </p>
                                        )
                                    })}
                                    </div>
                                </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default DatabasePage;
