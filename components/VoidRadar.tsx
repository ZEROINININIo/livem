
import React from 'react';
import { Message } from '../types';

interface VoidRadarProps {
  messages: Message[];
  onSelectMessage: (msg: Message | null) => void;
  isLightTheme: boolean;
}

// Helper to parse message type from raw string
const parseMessageContent = (raw: string) => {
    // 1. Slash Commands
    const slashMatch = raw.match(/^(\/(alert|radio|secret|log|root))\s+(.*)/);
    if (slashMatch) {
        return { type: slashMatch[2] as 'alert' | 'radio' | 'secret' | 'log' | 'root', content: slashMatch[3] };
    }

    // 2. Bracket Tags
    const bracketMatch = raw.match(/^\[\[(RADIO|ALERT|LOG|ROOT)::(.*?)\]\]$/i);
    if (bracketMatch) {
        const tag = bracketMatch[1].toUpperCase();
        if (tag === 'RADIO') return { type: 'radio', content: bracketMatch[2] };
        if (tag === 'ALERT') return { type: 'alert', content: bracketMatch[2] };
        if (tag === 'LOG') return { type: 'log', content: bracketMatch[2] };
        if (tag === 'ROOT') return { type: 'root', content: bracketMatch[2] };
    }

    return { type: 'text', content: raw };
};

// Helper to calculate signal position for Radar
const getSignalPosition = (msg: Message, allMessages: Message[]) => {
    if (allMessages.length === 0) return { r: 50, theta: 0 };

    let hash = 0;
    for (let i = 0; i < msg.sender.length; i++) {
        hash = msg.sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    const theta = Math.abs(hash) % 360;

    const now = Date.now();
    // Normalize time to radius (Newer = Closer to center)
    // We take a window of e.g. 7 days or just relative to oldest message
    const timestamps = allMessages.map(m => m.timestamp);
    const maxTs = Math.max(...timestamps, now); 
    const minTs = Math.min(...timestamps);
    
    // Fallback if only 1 message
    const timeRange = Math.max(maxTs - minTs, 1000 * 60 * 60); // Min 1 hour range

    // Relative Age: 0 (Now) to 1 (Oldest)
    const age = (now - msg.timestamp) / timeRange;
    
    // Map age to radius: 10% (Center) to 90% (Edge)
    // Newer messages are closer to center (10%)
    // But let's invert for effect: Signal Source (Center) is target?
    // Let's stick to: Center = You/Now. Edge = Distant/Past.
    // However, for a "Radar", usually center is player.
    // Let's put newer messages closer to center.
    // Max radius 100%. Keep within 90%.
    // r = 10 + age * 80;
    
    // Actually, let's randomize slightly to avoid overlap if timestamps are close
    const noise = (msg.timestamp % 100) / 100 * 5; 
    
    let r = 15 + (age * 75) + noise;
    if (r > 95) r = 95;

    return { r, theta };
};

// Strip tags for clean preview
const stripTags = (raw: string) => {
    const { content } = parseMessageContent(raw);
    return content.replace(/\[\[SECRET::(.*?)\]\]/g, '***');
};

const VoidRadar: React.FC<VoidRadarProps> = ({ messages, onSelectMessage, isLightTheme }) => {
  return (
    <div className="h-full w-full relative overflow-hidden flex items-center justify-center bg-[#050505]">
        {/* Radar Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border rounded-full border-emerald-500"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border rounded-full border-emerald-500"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border rounded-full border-emerald-500"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-emerald-500"></div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-emerald-500"></div>
        </div>
        
        {/* Scanning Line */}
        <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] origin-top-left bg-gradient-to-r from-transparent to-emerald-500/20 animate-[spin_4s_linear_infinite] pointer-events-none" style={{ borderRadius: '0 0 100% 0' }}></div>

        {/* Signals */}
        {messages.map((msg) => {
            const { r, theta } = getSignalPosition(msg, messages);
            // Convert polar to cartesian for CSS % positioning
            // Center is 50, 50
            const rad = (theta * Math.PI) / 180;
            // r is percentage 0-100 relative to center-to-edge
            // But in CSS `top/left`, 50% is center. 100% is edge? No, 100% is full width.
            // Distance from center in % of width = r / 2.
            const dist = r / 2; 
            
            const x = 50 + dist * Math.cos(rad);
            const y = 50 + dist * Math.sin(rad);
            
            const { type } = parseMessageContent(msg.content);
            const cleanText = stripTags(msg.content);
            
            let dotColor = 'bg-emerald-400';
            if (msg.isAdmin) dotColor = 'bg-red-500';
            if (type === 'radio') dotColor = 'bg-cyan-400';
            if (type === 'alert') dotColor = 'bg-red-500';
            if (type === 'root') dotColor = 'bg-amber-500';

            return (
                <button
                    key={msg.id}
                    onClick={() => onSelectMessage(msg)}
                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 group z-10 hover:z-50 focus:outline-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                >
                    <div className={`w-full h-full rounded-full ${dotColor} shadow-[0_0_5px_currentColor] animate-pulse`}></div>
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block animate-fade-in pointer-events-none z-50">
                        <div className="bg-black/90 border border-emerald-500/50 p-2 text-[10px] text-emerald-100 shadow-xl">
                            <div className="flex justify-between items-center mb-1 text-emerald-500 opacity-70">
                                <span className="font-bold uppercase truncate max-w-[80px]">{msg.sender}</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="line-clamp-2 opacity-90 break-words font-mono text-left">
                                {cleanText}
                            </div>
                        </div>
                        {/* Connecting Line to Dot */}
                        <div className="w-px h-2 bg-emerald-500/50 mx-auto"></div>
                    </div>
                </button>
            );
        })}
        
        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-500/50 pointer-events-none">
            RADAR_ACTIVE // SCANNING...
        </div>
    </div>
  );
};

export default VoidRadar;