import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FORTUNE_CARDS, LOGO_URL } from '../constants';

interface FortuneViewProps {
  onBack: () => void;
  playSound: (type: 'click' | 'flip') => void;
}

const FortuneView: React.FC<FortuneViewProps> = ({ onBack, playSound }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardData, setCardData] = useState(FORTUNE_CARDS[0]); // Default init
  const [animating, setAnimating] = useState(false);

  const flipCard = () => {
    if (isFlipped || animating) return;
    
    setAnimating(true);
    playSound('flip');
    
    // Select random card
    const randomCard = FORTUNE_CARDS[Math.floor(Math.random() * FORTUNE_CARDS.length)];
    setCardData(randomCard);
    
    setIsFlipped(true);
    setTimeout(() => setAnimating(false), 800);
  };

  const resetCard = () => {
    if (animating) return;
    setAnimating(true);
    playSound('flip');
    setIsFlipped(false);
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button 
        onClick={() => { playSound('click'); onBack(); }}
        className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div 
        className="perspective-1000 w-64 h-96 cursor-pointer group mb-4" 
        onClick={flipCard}
      >
        <div className={`card-inner w-full h-full relative text-center transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="card-front absolute w-full h-full backface-hidden bg-[#1a1a1a] border-2 border-[#d4af37] rounded-xl flex items-center justify-center shadow-2xl">
             <div className="w-[80%] h-[80%] border border-yellow-500/50 flex items-center justify-center relative">
               {/* Diamond shape overlay effect handled in CSS or simplified here */}
               <div className="absolute w-[70%] h-[70%] border border-yellow-500/30 rotate-45"></div>
               
                <div className="text-center transform translate-y-2 z-10">
                    <img src={LOGO_URL} className="w-32 h-32 mx-auto mb-4 object-contain opacity-90 drop-shadow-md" alt="Back" />
                    <span className="font-cinzel text-yellow-600/80 font-bold tracking-[0.3em] text-2xl block">FATE</span>
                    <div className="mt-4 w-20 h-[2px] bg-yellow-600/30 mx-auto"></div>
                </div>
             </div>
          </div>

          {/* Back */}
          <div className="card-back absolute w-full h-full backface-hidden bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] text-[#1e1b4b] rounded-xl flex flex-col items-center justify-between p-6 border-4 border-double border-[#d4af37] shadow-2xl rotate-y-180">
            <div className="w-full text-center border-b border-yellow-200 pb-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">The Oracle Says</div>
                <h3 className="text-xl font-bold text-slate-800 font-cinzel">{cardData.name}</h3>
            </div>
            <div className="text-5xl my-2 opacity-90">{cardData.icon}</div>
            <div className="text-center px-1 flex-grow flex items-center">
              <p className="text-sm text-slate-600 leading-7 font-light">{cardData.meaning}</p>
            </div>
            <div className="w-full border-t border-yellow-200 pt-2 flex justify-between items-center px-4">
              <span className="text-[10px] text-gray-400">Lucky No.</span>
              <span className="text-lg font-bold text-yellow-700">{cardData.lucky}</span>
            </div>
          </div>
        </div>
      </div>

      <p className={`text-xs text-purple-300/50 mb-6 italic transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
        แตะที่ไพ่เพื่อเปิดคำทำนาย
      </p>

      <button 
        onClick={resetCard} 
        disabled={!isFlipped}
        className={`btn-mystic px-8 py-3 rounded-full text-sm font-bold text-yellow-100 border border-yellow-500/30 transition-all duration-300 ${!isFlipped ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        สุ่มชะตาใหม่
      </button>
    </div>
  );
};

export default FortuneView;