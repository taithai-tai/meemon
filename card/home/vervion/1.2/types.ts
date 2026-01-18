export interface FortuneCard {
  name: string;
  icon: string;
  meaning: string;
  lucky: string;
}

export type DayKey = 
  | 'sunday' 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday_day' 
  | 'wednesday_night' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'anyday';

export type AspectKey = 
  | 'wealth' 
  | 'love' 
  | 'work' 
  | 'health' 
  | 'power' 
  | 'trade' 
  | 'education' 
  | 'mercy' 
  | 'luck'
  | 'success'
  | 'protection'
  | 'prestige'
  | 'harmony'
  | 'beginnings';

export interface AspectOption {
  id: AspectKey;
  label: string;
  icon: string;
  sub: string;
  colorClass: string; // Used for custom gradients in Tailwind
  bgPattern?: string; // CSS background pattern
}

export interface WallpaperDB {
  [key: string]: {
    [key in AspectKey]?: string;
  };
}