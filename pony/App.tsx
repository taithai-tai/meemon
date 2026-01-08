
import React, { useState, useMemo } from 'react';
import { CHANTS } from './constants';
import { ChantContent } from './types';
import { ChantModal } from './components/ChantModal';

// Component to generate stars
const StarsBackground: React.FC = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
      maxOpacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration,
            '--delay': star.delay,
            '--max-opacity': star.maxOpacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [selectedChant, setSelectedChant] = useState<ChantContent | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#0a0a0a] pb-20 px-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Twinkling Stars Layer */}
      <StarsBackground />

      <header className="relative z-10 w-full max-w-md pt-12 pb-10 text-center fade-in">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 mb-2">
          คาถาอัศวินพาหนะ
        </h1>
        <p className="text-zinc-500 text-sm tracking-widest uppercase">
          ศาสตร์แห่งการเชื่อมต่อพลังจักรวาล
        </p>
        <div className="mt-6 flex justify-center space-x-4">
           <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50 self-center" />
           <span className="text-amber-500/70 text-xs font-light">ม้า = พาหนะ | คาถา = คำสั่ง</span>
           <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50 self-center" />
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md space-y-6">
        <section className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 mb-8 text-center italic text-sm text-zinc-400 backdrop-blur-sm">
           "เวลาสวดไม่ต้องเสียงดัง แต่ต้อง ชัด-ช้า-นิ่ง เพราะม้าเป็นพลังเร็ว ถ้าจิตไม่นิ่ง พลังจะไม่เกาะ"
        </section>

        <div className="grid grid-cols-1 gap-5">
          {CHANTS.map((chant, index) => (
            <button
              key={chant.id}
              onClick={() => setSelectedChant(chant)}
              style={{ animationDelay: `${index * 150}ms` }}
              className="group relative flex items-center overflow-hidden bg-zinc-900/80 border border-zinc-800 rounded-[2rem] p-5 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.98] shadow-lg fade-in"
            >
              {/* Subtle accent glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: chant.themeColor }}
              />

              {/* Horse Avatar with new Image */}
              <div className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-inner overflow-hidden ${chant.id === 'white' ? 'bg-white/5' : 'bg-black/40'}`}>
                <div 
                  className="absolute inset-0 opacity-10 blur-xl" 
                  style={{ backgroundColor: chant.themeColor }}
                />
                <img 
                  src={chant.iconUrl} 
                  alt={chant.title}
                  className="w-full h-full object-cover rounded-xl transform transition-transform group-hover:scale-110 duration-500"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: chant.themeColor }} 
                  />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    {chant.element}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {chant.title}
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-0.5">
                  {chant.subtitle}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {chant.power.slice(0, 2).map((p, i) => (
                    <span key={i} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-zinc-500">
                      {p}
                    </span>
                  ))}
                  <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-zinc-500">
                    +{chant.power.length - 2}
                  </span>
                </div>
              </div>

              <div className="relative z-10 ml-2 opacity-20 group-hover:opacity-100 group-hover:text-amber-400 transition-all duration-300 transform group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-md mt-16 text-center text-zinc-700 text-[10px] tracking-[0.2em] uppercase">
        <p>© ๒๕๖๘ พลังม้าพาหนะเทวา</p>
        <p className="mt-1 opacity-40">ศาสตร์ความเชื่อเพื่อพลังงานที่ดี</p>
      </footer>

      {selectedChant && (
        <ChantModal 
          chant={selectedChant} 
          onClose={() => setSelectedChant(null)} 
        />
      )}
    </div>
  );
};

export default App;
