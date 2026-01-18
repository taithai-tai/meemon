import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import { ASPECT_OPTIONS, WALLPAPER_DB } from '../constants';
import { DayKey, AspectKey } from '../types';

interface WallpaperViewProps {
  onBack: () => void;
  playSound: (type: 'click' | 'flip' | 'magic' | 'success') => void;
}

type Step = 'day' | 'aspect' | 'result';

const DAY_BUTTONS: { key: DayKey; label: string; icon: string; styleClass: string }[] = [
  { key: 'sunday', label: 'อาทิตย์', icon: '☀️', styleClass: 'bg-gradient-to-br from-red-800/40 to-red-950/60 text-red-300 border-red-500/30' },
  { key: 'monday', label: 'จันทร์', icon: '🌕', styleClass: 'bg-gradient-to-br from-yellow-700/40 to-yellow-950/60 text-yellow-300 border-yellow-500/30' },
  { key: 'tuesday', label: 'อังคาร', icon: '🌸', styleClass: 'bg-gradient-to-br from-pink-800/40 to-pink-950/60 text-pink-300 border-pink-500/30' },
  { key: 'wednesday_day', label: 'พุธกลางวัน', icon: '🌳', styleClass: 'bg-gradient-to-br from-emerald-800/40 to-emerald-950/60 text-emerald-300 border-emerald-500/30' },
  { key: 'wednesday_night', label: 'พุธกลางคืน', icon: '🌑', styleClass: 'bg-gradient-to-br from-slate-700/40 to-slate-900/60 text-slate-300 border-slate-500/30' },
  { key: 'thursday', label: 'พฤหัสบดี', icon: '🧘', styleClass: 'bg-gradient-to-br from-orange-800/40 to-orange-950/60 text-orange-300 border-orange-500/30' },
  { key: 'friday', label: 'ศุกร์', icon: '💎', styleClass: 'bg-gradient-to-br from-blue-800/40 to-blue-950/60 text-blue-300 border-blue-500/30' },
  { key: 'saturday', label: 'เสาร์', icon: '🔥', styleClass: 'bg-gradient-to-br from-purple-800/40 to-purple-950/60 text-purple-300 border-purple-500/30' },
  { key: 'anyday', label: 'ใช้ได้ทุกวัน', icon: '✨', styleClass: 'bg-white/5 text-white border-white/20 col-span-2 justify-center' },
];

const WallpaperView: React.FC<WallpaperViewProps> = ({ onBack, playSound }) => {
  const [step, setStep] = useState<Step>('day');
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isConsecrating, setIsConsecrating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Derive available aspects based on day
  const aspects = useMemo(() => {
    if (!selectedDay) return [];
    if (selectedDay === 'anyday') {
      return Object.values(ASPECT_OPTIONS); // All options
    }
    // Limited set for specific days based on original logic
    return [
      ASPECT_OPTIONS.wealth,
      ASPECT_OPTIONS.love,
      ASPECT_OPTIONS.work,
      ASPECT_OPTIONS.health
    ];
  }, [selectedDay]);

  const handleDaySelect = (day: DayKey) => {
    playSound('click');
    setSelectedDay(day);
    setActiveCardIndex(0);
    setStep('aspect');
  };

  const handleNextCard = () => {
    playSound('flip');
    setActiveCardIndex((prev) => (prev + 1) % aspects.length);
  };

  const handlePrevCard = () => {
    playSound('flip');
    setActiveCardIndex((prev) => (prev - 1 + aspects.length) % aspects.length);
  };

  const handleConsecrate = () => {
    if (isConsecrating) return;
    playSound('magic');
    setIsConsecrating(true);

    const aspect = aspects[activeCardIndex];
    const url = WALLPAPER_DB[selectedDay!]?.[aspect.id] || "https://via.placeholder.com/1080x1920?text=No+Image";

    // Simulate animation time
    setTimeout(() => {
      setGeneratedImageUrl(url);
      playSound('success');
      setShowToast(true);
      setStep('result');
      setIsConsecrating(false);
      
      // Hide toast after 3s
      setTimeout(() => setShowToast(false), 3000);
    }, 1600);
  };

  const downloadImage = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `meemon-${selectedDay}.jpg`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const link = document.createElement('a');
      link.download = `meemon-${selectedDay}.jpg`;
      link.href = generatedImageUrl;
      link.target = "_blank";
      link.click();
    }
  };

  // --- Render Steps ---

  if (step === 'day') {
    return (
      <div className="w-full flex flex-col items-center animate-fade-in">
        <button onClick={() => { playSound('click'); onBack(); }} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
        
        <div className="mystic-panel w-full p-6 mb-6 border border-yellow-500/20 bg-black/40">
          <label className="block text-center text-sm text-yellow-100/90 uppercase tracking-wider mb-4 font-bold">เลือกวันเกิดของท่าน</label>
          <div className="day-grid grid grid-cols-2 gap-3">
            {DAY_BUTTONS.map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleDaySelect(btn.key)}
                className={`day-card-btn relative h-16 rounded-xl border flex items-center px-4 gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${btn.styleClass}`}
              >
                <span className="text-2xl drop-shadow-md">{btn.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wide">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'aspect') {
    return (
      <div className="w-full flex flex-col items-center animate-fade-in relative">
        <button 
            onClick={() => { playSound('click'); setStep('day'); }} 
            className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"
        >
            <ArrowLeft className="w-3 h-3 mr-1" /> เลือกวันใหม่
        </button>

        {/* Carousel Header */}
        <div className="flex items-center justify-between w-full max-w-xs mb-2 z-20">
            <button onClick={handlePrevCard} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 hover:bg-white/10 hover:text-yellow-400 transition-all active:scale-90"><ChevronLeft /></button>
            <h3 className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 font-bold text-lg tracking-widest">เลือกไพ่ที่ปรารถนา</h3>
            <button onClick={handleNextCard} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 hover:bg-white/10 hover:text-yellow-400 transition-all active:scale-90"><ChevronRight /></button>
        </div>

        {/* Stack Container */}
        <div className="stack-container relative w-[260px] h-[380px] my-6 z-10">
          {aspects.map((aspect, index) => {
             let className = "stack-card absolute w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden cursor-pointer shadow-2xl bg-[#1a1a1a] ";
             
             // Calculate position
             const offset = (index - activeCardIndex + aspects.length) % aspects.length;
             let zIndex = 0;
             let transform = '';
             let opacity = 1;
             let filter = '';
             let pointerEvents = 'none';

             if (offset === 0) {
                 // Active
                 zIndex = 20;
                 transform = 'translateY(0) scale(1)';
                 pointerEvents = 'auto';
                 className += " active shadow-[0_0_35px_rgba(255,255,255,0.25)]";
                 if (isConsecrating) className += " animate-consecrate";
             } else if (offset === 1) {
                 // Next
                 zIndex = 10;
                 transform = 'translateY(30px) scale(0.92)';
                 filter = 'brightness(0.5)';
             } else if (offset === aspects.length - 1) {
                 // Prev
                 zIndex = 5;
                 transform = 'translateY(50px) scale(0.85)';
                 filter = 'brightness(0.3)';
                 pointerEvents = 'auto'; // allow click to go back
             } else {
                 // Hidden
                 zIndex = 0;
                 transform = 'translateY(50px) scale(0.85)';
                 opacity = 0;
             }

             return (
                 <div
                    key={aspect.id}
                    className={`${className} ${aspect.colorClass}`}
                    style={{ 
                        zIndex, 
                        transform, 
                        opacity, 
                        filter, 
                        pointerEvents: pointerEvents as any,
                        background: aspect.bgPattern
                    }}
                    onClick={() => {
                        if (offset === 0) return; // Already active
                        if (offset === 1) handleNextCard();
                        else if (offset === aspects.length - 1) handlePrevCard();
                        else {
                            setActiveCardIndex(index);
                            playSound('flip');
                        }
                    }}
                 >
                    {/* Front Face Content */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center">
                        <div className="absolute inset-2 border-2 border-white/40 rounded-xl pointer-events-none"></div>
                        <div className="text-6xl mb-4 drop-shadow-md">{aspect.icon}</div>
                        <h3 className="font-bold text-2xl text-white tracking-wider drop-shadow-md font-cinzel">{aspect.label}</h3>
                        <div className="w-12 h-[1px] bg-white/30 my-3"></div>
                        <p className="text-xs text-white/50 uppercase tracking-[0.3em] font-sans">{aspect.sub}</p>
                    </div>

                    {/* Back Face (Image placeholder for animation) */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-black border-2 border-[#d4af37] rounded-2xl overflow-hidden">
                        {isConsecrating && generatedImageUrl && (
                             <img src={generatedImageUrl} className="w-full h-full object-cover" alt="Result" />
                        )}
                    </div>

                    {/* Flash Effect Overlay */}
                     {offset === 0 && isConsecrating && (
                        <div className="absolute inset-0 bg-white mix-blend-overlay animate-pulse"></div>
                     )}
                 </div>
             );
          })}
        </div>

        <div className="text-xs text-white/40 mb-4 animate-pulse">แตะที่ไพ่ใบหลังเพื่อเปลี่ยน</div>

        {/* Action Button */}
        <button 
            onClick={handleConsecrate}
            disabled={isConsecrating}
            className="mt-2 w-full max-w-xs bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-4 rounded-full shadow-lg shadow-yellow-900/40 transition-all border border-yellow-400/30 active:scale-95 flex items-center justify-center gap-2 group z-20"
        >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>{isConsecrating ? 'กำลังปลุกเสก...' : 'ปลุกเสกวอลเปเปอร์'}</span>
        </button>

        {/* Overlay for Magic Effect */}
        <div className={`fixed inset-0 z-40 bg-white/20 mix-blend-overlay transition-opacity duration-500 pointer-events-none ${isConsecrating ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    );
  }

  // Result Step
  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-10">
      {/* Toast */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#333] text-white px-6 py-4 rounded-xl border border-yellow-500 shadow-2xl flex items-center gap-3 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <CheckCircle className="text-green-400 w-6 h-6" />
          <div className="text-center">
            <p className="font-bold text-yellow-400 text-sm">ปลุกเสกสำเร็จ!</p>
            <p className="text-xs text-gray-400">กดที่รูปภาพค้างไว้เพื่อดาวน์โหลด</p>
          </div>
      </div>

      <button onClick={() => { playSound('click'); setStep('aspect'); }} className="self-start mb-4 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> เปลี่ยนคำขอ</button>
      
      <div className="relative w-2/3 group mb-4 cursor-pointer" onClick={downloadImage}>
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          {generatedImageUrl && (
            <img src={generatedImageUrl} className="relative w-full rounded-xl shadow-2xl border border-white/10" alt="Sacred Wallpaper" />
          )}
      </div>
      
      <div className="text-center space-y-1">
          <p className="text-xs text-yellow-200/80">แตะค้างที่รูปเพื่อดาวน์โหลด</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sacred Image Generated</p>
      </div>
    </div>
  );
};

export default WallpaperView;