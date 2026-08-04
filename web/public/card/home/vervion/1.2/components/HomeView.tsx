import React from 'react';
import { Eye, Smartphone, ChevronRight } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface HomeViewProps {
  onNavigate: (view: 'fortune' | 'wallpaper') => void;
  playSound: (type: 'click') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, playSound }) => {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="mystic-panel p-8 text-center relative overflow-hidden group border border-yellow-500/20 rounded-2xl bg-black/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-56 h-56 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-100 mb-2 font-cinzel">ยินดีต้อนรับสู่ MEEMON</h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed">ดวงชะตาฟ้าลิขิต หรือจิตท่านกำหนด</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => {
            playSound('click');
            onNavigate('fortune');
          }}
          className="btn-mystic w-full p-5 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-black/40 border border-purple-500/30 p-3 rounded-lg">
              <Eye className="text-purple-300 w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-yellow-50">ทำนายดวงชะตา</h3>
              <p className="text-[10px] text-purple-200/60">Pick a Card</p>
            </div>
          </div>
          <ChevronRight className="text-purple-500/50 group-hover:text-yellow-400 transition-colors" />
        </button>

        <button
          onClick={() => {
            playSound('click');
            onNavigate('wallpaper');
          }}
          className="btn-mystic w-full p-5 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-black/40 border border-teal-500/30 p-3 rounded-lg">
              <Smartphone className="text-teal-300 w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-yellow-50">ยันต์วอลเปเปอร์</h3>
              <p className="text-[10px] text-teal-200/60">Sacred Wallpaper</p>
            </div>
          </div>
          <ChevronRight className="text-teal-500/50 group-hover:text-yellow-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default HomeView;