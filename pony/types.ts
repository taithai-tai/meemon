
export type HorseColor = 'red' | 'beige' | 'white';

export interface ChantContent {
  id: HorseColor;
  title: string;
  subtitle: string;
  element: string;
  power: string[];
  suitableFor: string[];
  preparation: string[];
  chantText: string[];
  rounds: number;
  audioInstruction: string;
  themeColor: string;
  gradient: string;
  iconUrl: string;
}
