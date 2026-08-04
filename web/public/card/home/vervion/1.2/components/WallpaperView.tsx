import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import { ASPECT_OPTIONS, WALLPAPER_DB } from '../constants.ts';
import { DayKey } from '../types.ts';

interface WallpaperViewProps {
  onBack: () => void;
  playSound: (type: 'click' | 'flip' | 'magic' | 'success') => void;
}

type Step = 'day' | 'aspect' | 'result';

const DAY_BUTTONS: { key: DayKey; label: string; icon: string; styleClass: string; isNew?: boolean }[] = [
  { key: 'sunday', label: 'อาทิตย์', icon: '☀️', styleClass: 'bg-gradient-to-br from-red-800/40 to-red-950/60 text-red-300 border-red-500/30' },
  { key: 'monday', label: 'จันทร์', icon: '🌕', styleClass: 'bg-gradient-to-br from-yellow-700/40 to-yellow-950/60 text-yellow-300 border-yellow-500/30' },
  { key: 'tuesday', label: 'อังคาร', icon: '🌸', styleClass: 'bg-gradient-to-br from-pink-800/40 to-pink-950/60 text-pink-300 border-pink-500/30' },
  { key: 'wednesday_day', label: 'พุธกลางวัน', icon: '🌳', styleClass: 'bg-gradient-to-br from-emerald-800/40 to-emerald-950/60 text-emerald-300 border-emerald-500/30' },
  { key: 'wednesday_night', label: 'พุธกลางคืน', icon: '🌑', styleClass: 'bg-gradient-to-br from-slate-700/40 to-slate-900/60 text-slate-300 border-slate-500/30' },
  { key: 'thursday', label: 'พฤหัสบดี', icon: '🧘', styleClass: 'bg-gradient-to-br from-orange-800/40 to-orange-950/60 text-orange-300 border-orange-500/30' },
  { key: 'friday', label: 'ศุกร์', icon: '💎', styleClass: 'bg-gradient-to-br from-blue-800/40 to-blue-950/60 text-blue-300 border-blue-500/30' },
  { key: 'saturday', label: 'เสาร์', icon: '🔥', styleClass: 'bg-gradient-to-br from-purple-800/40 to-purple-950/60 text-purple-300 border-purple-500/30' },
  { key: 'anyday', label: 'ใช้ได้ทุกวัน', icon: '✨', styleClass: 'bg-white/5 text-white border-white/20 col-span-2 justify-center', isNew: true },
];

const WallpaperView: React.FC<WallpaperViewProps> = ({ onBack, playSound }) => {
  const [step, setStep] = useState<Step>('day');
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isConsecrating, setIsConsecrating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const aspects = useMemo(() => {
    if (!selectedDay) return [];
    return selectedDay === 'anyday' 
      ? Object.values(ASPECT_OPTIONS) 
      : [ASPECT_OPTIONS.wealth, ASPECT_OPTIONS.love, ASPECT_OPTIONS.work, ASPECT_OPTIONS.health];
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
    const url = WALLPAPER_DB[selectedDay!]?.[aspect.id] || WALLPAPER_DB.anyday[aspect.id] || "https://via.placeholder.com/1080x1920?text=No+Image";

    setTimeout(() => {
      setGeneratedImageUrl(url);
      playSound('success');
      setShowToast(true);
      setStep('result');
      setIsConsecrating(false);
      setTimeout(() => setShowToast(false), 3000);
    }, 1600);
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    window.open(generatedImageUrl, '_blank');
  };

  if (step === 'day') {
    return (
      <div className="w-full flex flex-col items-center animate-fade-in px-2">
        <button onClick={() => { playSound('click'); onBack(); }} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
        <div className="mystic-panel w-full p-6 mb-6 border border-yellow-500/20 bg-black/40 rounded-2xl">
          <label className="block text-center text-sm text-yellow-100/90 uppercase mb-4 font-bold">เลือกวันเกิดของท่าน</label>
          <div className="day-grid grid grid-cols-2 gap-3">
            {DAY_BUTTONS.map((btn) => (
              <button key={btn.key} onClick={() => handleDaySelect(btn.key)} className={`relative h-16 rounded-xl border flex items-center px-4 gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${btn.styleClass}`}>
                <span className="text-2xl drop-shadow-md">{btn.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wide">{btn.label}</span>
                {btn.isNew && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold shadow-lg badge-pulse z-10">ใหม่</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'aspect') {
    return (
      <div className="w-full flex flex-col items-center animate-fade-in relative px-2">
        <button onClick={() => setStep('day')} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> เลือกวันใหม่</button>
        <div className="flex items-center justify-between w-full max-w-xs mb-2 z-20">
            <button onClick={handlePrevCard} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 active:scale-90 transition-all"><ChevronLeft className="w-6 h-6" /></button>
            <h3 className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 font-bold text-lg tracking-widest text-center">เลือกความปรารถนา</h3>
            <button onClick={handleNextCard} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 active:scale-90 transition-all"><ChevronRight className="w-6 h-6" /></button>
        </div>
        <div className="stack-container relative w-[260px] h-[380px] my-6 z-10">
          {aspects.map((aspect, index) => {
             const offset = (index - activeCardIndex + aspects.length) % aspects.length;
             let zIndex = offset === 0 ? 20 : 10 - offset;
             let transform = offset === 0 ? 'translateY(0) scale(1)' : offset === 1 ? 'translateY(30px) scale(0.92)' : 'translateY(50px) scale(0.85)';
             let opacity = offset === 0 ? 1 : offset === 1 || offset === aspects.length - 1 ? 0.6 : 0;
             return (
                 <div key={aspect.id} className={`stack-card absolute w-full h-full rounded-2xl border-2 overflow-hidden shadow-2xl flex flex-col items-center justify-center ${aspect.colorClass} ${offset === 0 && isConsecrating ? 'animate-consecrate' : ''}`} style={{ zIndex, transform, opacity, background: aspect.bgPattern }}>
                    <div className="absolute inset-2 border-2 border-white/20 rounded-xl pointer-events-none"></div>
                    <div className="text-6xl mb-4 drop-shadow-md">{aspect.icon}</div>
                    <h3 className="font-bold text-2xl text-white tracking-wider drop-shadow-md font-cinzel text-center px-4">{aspect.label}</h3>
                    <p className="text-xs text-white/50 uppercase tracking-[0.3em] font-sans mt-2">{aspect.sub}</p>
                    
                    {/* NEW RIBBON FOR NEW ASPECTS */}
                    {aspect.isNew && (
                      <div className="new-ribbon badge-pulse">NEW</div>
                    )}
                 </div>
             );
          })}
        </div>
        <button onClick={handleConsecrate} disabled={isConsecrating} className="mt-2 w-full max-w-xs bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group z-20">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>{isConsecrating ? 'กำลังปลุกเสก...' : 'ปลุกเสกวอลเปเปอร์'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-10 px-2">
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#333] text-white px-6 py-4 rounded-xl border border-yellow-500 shadow-2xl flex items-center gap-3 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <CheckCircle className="text-green-400 w-6 h-6" /> ปลุกเสกสำเร็จ!
      </div>
      <button onClick={() => setStep('aspect')} className="self-start mb-4 flex items-center text-xs text-yellow-500/70 uppercase tracking-widest transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> เปลี่ยนคำขอ</button>
      <div className="relative w-full max-w-[280px] group mb-4 cursor-pointer" onClick={downloadImage}>
          <img src={generatedImageUrl!} className="relative w-full rounded-xl shadow-2xl border border-white/10" alt="Sacred Wallpaper" />
      </div>
      <p className="text-xs text-yellow-200/80 text-center">แตะที่รูปเพื่อดูภาพขนาดเต็มและดาวน์โหลด</p>
    </div>
  );
};

export default WallpaperView;
