
import React from 'react';
import { exitModalData } from '../../data/navigationData';
import { Language } from '../../types';

interface ExitModalProps {
  step: 0 | 1 | 2;
  onClose: () => void;
  onConfirm: () => void;
  onMistake: () => void;
  language: Language;
}

const ExitModal: React.FC<ExitModalProps> = ({ step, onClose, onConfirm, onMistake, language }) => {
  if (step === 0) return null;

  const tModal = exitModalData[language];

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="w-full max-w-lg bg-black border-2 border-emerald-500 p-6 md:p-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-slide-in relative"
          onClick={e => e.stopPropagation()}
        >
            <div className="mb-6 flex items-start gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-emerald-950/20 border border-emerald-500/50 p-1">
                    <img src="https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/d19ea972df034757/byq.jpg" alt="Byaki" className="w-full h-full object-cover filter contrast-125" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-black text-emerald-400 mb-1 uppercase tracking-widest border-b border-emerald-500/30 pb-1">{tModal.speaker}</div>
                    <p className="text-sm md:text-base text-emerald-600/80 font-custom-02 leading-relaxed">
                        {step === 1 ? tModal.message : tModal.msg2}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {step === 1 ? (
                    <>
                      <button 
                          onClick={onConfirm}
                          className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm"
                      >
                          {tModal.opt1}
                      </button>
                      <button 
                          onClick={onMistake}
                          className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm"
                      >
                          {tModal.opt2}
                      </button>
                    </>
                ) : (
                    <button 
                          onClick={onClose}
                          className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm italic opacity-70"
                      >
                          {tModal.opt3}
                      </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default ExitModal;
