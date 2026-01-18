import React, { useState, useEffect, useRef } from 'react';
import StarBackground from './components/StarBackground';
import HomeView from './components/HomeView';
import FortuneView from './components/FortuneView';
import WallpaperView from './components/WallpaperView';
import { SOUNDS, LOGO_URL } from './constants';

type View = 'home' | 'fortune' | 'wallpaper';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  
  // Audio Refs
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      soundsRef.current[key] = new Audio(url);
    });
  }, []);

  const playSound = (type: 'click' | 'flip' | 'magic' | 'success') => {
    const audio = soundsRef.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio blocked:', e));
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 min-h-screen relative z-0">
      <StarBackground />
      
      {/* Header */}
      <header className="w-full text-center py-6 z-10">
        <div className="inline-flex items-center gap-3 mb-2">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain drop-shadow-md" />
            <h1 className="text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] drop-shadow-md mt-2 font-cinzel">MEEMON</h1>
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain drop-shadow-md" />
        </div>
        <div className="flex items-center justify-center gap-2 opacity-60">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <p className="text-[10px] tracking-[0.2em] text-yellow-100 uppercase font-light">Destiny & Faith</p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-yellow-500"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md flex-grow flex flex-col items-center justify-center relative z-10">
        {currentView === 'home' && (
          <HomeView onNavigate={setCurrentView} playSound={playSound} />
        )}
        {currentView === 'fortune' && (
          <FortuneView onBack={() => setCurrentView('home')} playSound={playSound} />
        )}
        {currentView === 'wallpaper' && (
          <WallpaperView onBack={() => setCurrentView('home')} playSound={playSound} />
        )}
      </main>

      <footer className="mt-8 text-center pb-4 z-10">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-sans">MEEMON Card</p>
      </footer>
    </div>
  );
}

export default App;