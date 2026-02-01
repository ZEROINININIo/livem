
import React, { useState, useMemo } from 'react';
import { updateLogs } from '../data/updateLogs';
import { Language } from '../types';
import { X, Terminal, AlertCircle, Calendar, ChevronRight, Clock } from 'lucide-react';

interface UpdateLogOverlayProps {
  onClose: () => void;
  language: Language;
}

const UpdateLogOverlay: React.FC<UpdateLogOverlayProps> = ({ onClose, language }) => {
  const isSimplifiedChinese = language === 'zh-CN';

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof updateLogs> = {};
    updateLogs.forEach(log => {
      // Assuming date format is YYYY-MM-DD or compatible string
      if (!groups[log.date]) {
        groups[log.date] = [];
      }
      groups[log.date].push(log);
    });
    return groups;
  }, []);

  // Get unique dates sorted descending (Newest first)
  const dates = useMemo(() => {
    return Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedLogs]);

  // Default to newest date
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  const displayedLogs = groupedLogs[selectedDate] || [];

  const warningMessage = language === 'zh-TW' 
    ? "請切換到簡體中文來觀看更新日誌。" 
    : "Please switch to Simplified Chinese to view update logs.";

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#0a0a0a] border border-ash-gray/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-ash-gray/20 bg-ash-dark/50 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-ash-gray">
                <Terminal size={14} />
                <span>DEV_LOG // PYO_NOTES.txt</span>
            </div>
            <button 
                onClick={onClose}
                className="text-ash-gray hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>

        {/* Date Timeline Selector */}
        {isSimplifiedChinese && dates.length > 0 && (
            <div className="w-full overflow-x-auto border-b border-ash-gray/10 bg-[#0f0f0f] shrink-0 no-scrollbar">
                <div className="flex px-4 py-2 gap-2 min-w-max">
                    <div className="text-[10px] font-mono font-bold uppercase py-1 px-2 flex items-center gap-2 text-ash-gray">
                        <Calendar size={12} /> TIMELINE:
                    </div>
                    {dates.map((date) => {
                        const isActive = selectedDate === date;
                        return (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`
                                    text-[10px] font-mono font-bold px-3 py-1 border transition-all uppercase whitespace-nowrap flex items-center gap-2
                                    ${isActive 
                                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                        : 'bg-transparent text-ash-gray border-ash-gray/20 hover:text-ash-light hover:border-ash-gray/50'
                                    }
                                `}
                            >
                                <span>{date}</span>
                                {isActive && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs md:text-sm leading-relaxed text-ash-light/80 custom-scrollbar relative">
            {!isSimplifiedChinese ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4 opacity-80">
                    <AlertCircle size={48} className="text-amber-500 animate-pulse" />
                    <p className="font-bold text-ash-light text-sm md:text-base">
                        {warningMessage}
                    </p>
                    <div className="text-[10px] text-ash-gray font-mono border border-ash-gray/30 p-2 bg-ash-dark/30">
                        System Logic: Logs are archived in source language [zh-CN] only.
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in" key={selectedDate}>
                    {/* Date Header inside content */}
                    <div className="flex items-center gap-2 text-emerald-500/50 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-dashed border-emerald-500/20 pb-2">
                        <Clock size={12} />
                        LOGS_FOR_DATE // {selectedDate}
                    </div>

                    {displayedLogs.map((log, index) => (
                        <div key={`${log.version}-${index}`} className="relative pl-4 border-l-2 border-ash-gray/20 group hover:border-emerald-500/50 transition-colors">
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-ash-gray/50 rounded-full group-hover:bg-emerald-500 group-hover:scale-125 transition-all"></div>
                            <div className="flex items-baseline gap-4 mb-2 opacity-60">
                                <span className="font-bold text-emerald-500 font-mono tracking-wider">{log.version}</span>
                            </div>
                            <div className="whitespace-pre-wrap opacity-90 group-hover:opacity-100 transition-opacity leading-relaxed">
                                {log.content}
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-8 opacity-30 text-[10px] text-center border-t border-dashed border-ash-gray/20 mt-8">
                        -- END OF DAY RECORD --
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UpdateLogOverlay;
