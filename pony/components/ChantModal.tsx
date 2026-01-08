
import React, { useState, useEffect } from 'react';
import { ChantContent } from '../types';

interface ChantModalProps {
  chant: ChantContent;
  onClose: () => void;
}

export const ChantModal: React.FC<ChantModalProps> = ({ chant, onClose }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNextRound = () => {
    if (currentRound < chant.rounds) {
      setCurrentRound(prev => prev + 1);
    }
  };

  const isCompleted = currentRound >= chant.rounds;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div 
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col transition-transform duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
      >
        {/* Header with gradient line */}
        <div className={`h-1 w-full bg-gradient-to-r ${chant.id === 'white' ? 'from-slate-200 to-slate-400' : chant.id === 'red' ? 'from-red-600 to-red-900' : 'from-amber-600 to-amber-900'}`} />
        
        <div className="p-6 sm:p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="text-center mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${chant.id === 'white' ? 'bg-white text-black' : 'bg-white/10 text-white'}`} style={{ color: chant.id !== 'white' ? chant.themeColor : undefined }}>
              {chant.element}
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">{chant.title}</h2>
            <p className="text-sm text-zinc-400 italic">{chant.subtitle}</p>
          </div>

          <div className="space-y-6">
            {/* Preparation Section */}
            <section className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-amber-400 font-bold mb-3 flex items-center text-sm uppercase tracking-wider">
                <span className="mr-2">✨</span> วิธีเตรียมก่อนสวด
              </h3>
              <ul className="space-y-2 text-zinc-300 text-sm">
                {chant.preparation.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-amber-500/50">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Chanting Section */}
            <section className="text-center">
               <div className="mb-4">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">สไตล์การสวด</span>
                  <span className="text-white font-medium px-4 py-1 rounded-full bg-white/5 border border-white/10 italic">
                    "{chant.audioInstruction}"
                  </span>
               </div>
               
               <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                  <div className="space-y-4">
                    {chant.chantText.map((line, i) => (
                      <p key={i} className={`thai-serif text-lg leading-relaxed ${i === 0 ? 'font-bold text-amber-400' : 'text-zinc-200'}`}>
                        {line}
                      </p>
                    ))}
                  </div>
               </div>
            </section>

            {/* Counter Section */}
            <div className="flex flex-col items-center py-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
                จำนวนรอบ: {currentRound} / {chant.rounds}
              </div>
              
              <div className="flex space-x-2 mb-6">
                {Array.from({ length: chant.rounds }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-8 rounded-full transition-all duration-300 ${i < currentRound ? 'bg-amber-400' : 'bg-zinc-800'}`}
                  />
                ))}
              </div>

              {!isCompleted ? (
                <button 
                  onClick={handleNextRound}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  สวดจบ 1 จบ
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-lg transition-all"
                >
                  อนุโมทนา สาธุ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
