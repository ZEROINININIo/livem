
import React, { useState } from 'react';
import { sideCharacters } from '../../data/sideCharacters';
import { Language, SideCharacterData } from '../../types';
import { Folder, FolderOpen, Lock, ShieldAlert, X, Hash, Star } from 'lucide-react';

interface SideCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isLightTheme: boolean;
}

const SideCharacterModal: React.FC<SideCharacterModalProps> = ({ isOpen, onClose, language, isLightTheme }) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(sideCharacters[0].id);
  
  if (!isOpen) return null;

  // Group characters for tree view
  const groupedCharacters = sideCharacters.reduce((acc, char) => {
    if (!acc[char.group]) acc[char.group] = [];
    acc[char.group].push(char);
    return acc;
  }, {} as Record<string, SideCharacterData[]>);

  const char = sideCharacters.find(c => c.id === selectedCharId) || sideCharacters[0];
  const t = char?.translations[language] || char?.translations['zh-CN'];
    
  if (!char) return null;

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div 
                className={`w-full max-w-3xl border-2 shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh] md:h-auto md:max-h-[85vh] ${isLightTheme ? 'bg-white border-zinc-300' : 'bg-ash-black border-ash-dark'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Close Button (Top Right Absolute) */}
                <button 
                    onClick={onClose} 
                    className={`absolute top-2 right-2 p-2 md:hidden z-50 ${isLightTheme ? 'text-zinc-500 hover:text-black' : 'text-ash-gray hover:text-ash-light'}`}
                >
                    <X size={24} />
                </button>

                {/* Sidebar (Character List) */}
                <div className={`w-full md:w-56 lg:w-64 border-b-2 md:border-b-0 md:border-r-2 p-4 flex flex-col gap-2 overflow-y-auto shrink-0 no-scrollbar max-h-48 md:max-h-full ${isLightTheme ? 'bg-zinc-50 border-zinc-200' : 'bg-ash-dark border-ash-gray/30'}`}>
                     <div className={`text-[10px] font-mono uppercase mb-4 pb-2 border-b flex items-center gap-2 sticky top-0 z-10 ${isLightTheme ? 'text-zinc-500 border-zinc-200 bg-zinc-50' : 'text-ash-gray border-ash-gray/30 bg-ash-dark'}`}>
                        <FolderOpen size={12} /> ROOT/PERSONNEL_DB
                     </div>
                     
                     {Object.entries(groupedCharacters).map(([groupName, groupChars]) => (
                         <div key={groupName} className="mb-2">
                             <div className={`flex items-center gap-2 text-[10px] font-bold mb-1 px-1 ${isLightTheme ? 'text-zinc-600' : 'text-ash-light/70'}`}>
                                <span className="opacity-50">├─</span>
                                <Folder size={10} className="opacity-50" />
                                {groupName}
                             </div>
                             
                             <div className={`flex flex-col border-l border-dashed ml-3 pl-2 gap-1 py-1 ${isLightTheme ? 'border-zinc-300' : 'border-ash-gray/20'}`}>
                                {(groupChars as SideCharacterData[]).map(c => {
                                    const cName = c.translations[language].name;
                                    const isSelected = selectedCharId === c.id;
                                    
                                    // Item styling based on theme
                                    let btnClass = "";
                                    if (isLightTheme) {
                                        btnClass = isSelected 
                                            ? 'text-black bg-zinc-200 font-bold pl-3' 
                                            : 'text-zinc-500 hover:text-black hover:bg-zinc-100 hover:pl-3';
                                    } else {
                                        btnClass = isSelected 
                                            ? 'text-ash-light bg-ash-gray/20 font-bold pl-3' 
                                            : 'text-ash-gray hover:text-ash-light hover:bg-ash-gray/10 hover:pl-3';
                                    }

                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCharId(c.id)}
                                            className={`text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-all duration-200 relative group/item ${btnClass}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.isLocked ? 'bg-red-500/50' : 'bg-green-500/50'} ${isSelected ? 'animate-pulse' : ''}`} />
                                            <span className="truncate">{cName}</span>
                                            {c.isLocked && <Lock size={8} className="ml-auto opacity-50" />}
                                            
                                            {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isLightTheme ? 'bg-black' : 'bg-ash-light'}`}></div>}
                                        </button>
                                    );
                                })}
                             </div>
                         </div>
                     ))}
                </div>

                {/* Main Content */}
                <div className={`flex-1 overflow-y-auto p-6 md:p-8 relative ${isLightTheme ? 'bg-white' : 'bg-ash-black'}`}>
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Hash size={200} strokeWidth={1} />
                     </div>
                     
                     <button onClick={onClose} className={`absolute top-2 right-2 p-2 hidden md:block z-20 ${isLightTheme ? 'text-zinc-400 hover:text-zinc-900' : 'text-ash-gray hover:text-ash-light'}`}>
                        <X size={20} />
                     </button>

                     {char.isLocked ? (
                         <div className="h-full flex flex-col items-center justify-center text-center opacity-80 min-h-[200px] relative">
                             {/* Special Theme Background Preview for Yuyuko (Purple) */}
                             {char.id === 'collab-yuyuko' && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30 blur-3xl opacity-50"></div>
                                    <div className="absolute top-10 left-10 text-purple-400/50 text-xs animate-pulse">✦</div>
                                    <div className="absolute bottom-20 right-20 text-cyan-400/50 text-xs animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
                                    <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-ping"></div>
                                </div>
                             )}

                             {/* Dynamic Color Logic */}
                             {(() => {
                                 // Default Red Theme
                                 let borderColor = isLightTheme ? 'border-red-200' : 'border-red-900/50';
                                 let bgColor = isLightTheme ? 'bg-red-50' : 'bg-red-950/10';
                                 let cornerColor = 'border-red-800';
                                 let iconColor = 'text-red-800';
                                 let titleColor = 'text-red-700';
                                 let subColor = 'text-red-900';
                                 let mainIcon = <ShieldAlert size={48} className={`${iconColor} mx-auto mb-4 animate-pulse`} />;
                                 let titleText = 'ACCESS DENIED';
                                 let subText = 'Encrypted File // Auth Missing';

                                 // Special Theme for Yuyuko
                                 if (char.id === 'collab-yuyuko') {
                                     borderColor = isLightTheme ? 'border-purple-200' : 'border-purple-500/50';
                                     bgColor = isLightTheme ? 'bg-purple-50/50' : 'bg-purple-950/20';
                                     cornerColor = 'border-purple-500';
                                     iconColor = 'text-purple-400';
                                     titleColor = 'text-purple-400';
                                     subColor = 'text-purple-300';
                                     mainIcon = <Star size={48} className={`${iconColor} mx-auto mb-4 animate-pulse`} />;
                                     titleText = 'COMING SOON';
                                     subText = language === 'en' ? 'Feb. Update // Signal Incoming' : '二月更新 // 信号接收中...';
                                 }

                                 return (
                                     <div className={`border p-8 max-w-xs relative z-10 backdrop-blur-sm ${borderColor} ${bgColor}`}>
                                         <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${cornerColor}`}></div>
                                         <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${cornerColor}`}></div>
                                         <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${cornerColor}`}></div>
                                         <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${cornerColor}`}></div>
                                         
                                         {mainIcon}
                                         
                                         <h2 className={`text-xl font-black uppercase tracking-widest mb-1 ${titleColor}`}>
                                             {titleText}
                                         </h2>
                                         <p className={`text-[10px] font-mono uppercase ${subColor}`}>
                                             {subText}
                                         </p>
                                     </div>
                                 );
                             })()}
                             
                             <div className={`mt-8 font-mono text-xs z-10 ${isLightTheme ? 'text-zinc-400' : 'text-ash-gray/50'}`}>
                                 {'>'} ID: {char.id.toUpperCase()}<br/>
                                 {'>'} STATUS: {char.themeColor ? 'PREVIEW_MODE' : 'LOCKED'}
                             </div>
                         </div>
                     ) : (
                        <div className="relative z-10 space-y-6 animate-fade-in pt-4 md:pt-0">
                            <div className={`border-b pb-4 ${isLightTheme ? 'border-zinc-200' : 'border-ash-gray/30'}`}>
                                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter mb-1 ${isLightTheme ? 'text-zinc-900' : 'text-ash-light'}`}>
                                    {t.name}
                                </h2>
                                <div className={`flex flex-wrap items-center gap-2 text-xs font-mono ${isLightTheme ? 'text-zinc-500' : 'text-ash-gray'}`}>
                                    <span className={`px-1 border ${isLightTheme ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'text-ash-light bg-ash-dark border-ash-gray/50'}`}>{t.enName}</span>
                                    <span>// {t.role}</span>
                                    <span className="ml-auto opacity-50">ID: {char.id.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {t.tags.map(tag => (
                                    <span key={tag} className={`px-2 py-1 border rounded-full text-[10px] font-mono ${isLightTheme ? 'border-zinc-300 text-zinc-600' : 'border-ash-gray/50 text-ash-gray'}`}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            
                            {t.quote && (
                                <div className={`border-l-2 pl-3 py-1 text-sm italic font-serif ${isLightTheme ? 'border-zinc-400 text-zinc-600' : 'border-ash-light text-ash-light/80'}`}>
                                    "{t.quote}"
                                </div>
                            )}

                            <div className={`space-y-4 text-sm font-mono leading-relaxed border-t border-dashed pt-4 pb-8 md:pb-0 ${isLightTheme ? 'text-zinc-700 border-zinc-200' : 'text-ash-gray/90 border-ash-gray/30'}`}>
                                {t.description.map((para, i) => {
                                    const parts = para.split('**');
                                    return (
                                        <div key={i} className={para.startsWith('•') || para.startsWith('> ') ? "pl-4" : ""}>
                                            {parts.map((part, idx) => 
                                                idx % 2 === 1 
                                                ? <span key={idx} className={`font-bold px-1 ${isLightTheme ? 'bg-zinc-200 text-black' : 'text-ash-light bg-ash-dark/50'}`}>{part}</span> 
                                                : part
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default SideCharacterModal;
