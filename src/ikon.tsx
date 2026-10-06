// Ders ve rozet simgeleri.
import { Languages, Calculator, Triangle, Atom, FlaskConical, Dna, Landmark, Globe, Brain, BookOpen, Footprints, Flame, CalendarCheck, Target, Trophy, Crosshair, ShieldCheck, Layers, Award, type LucideIcon } from 'lucide-react';

const DERS: Record<string, LucideIcon> = { tr: Languages, mat: Calculator, geo: Triangle, fiz: Atom, kim: FlaskConical, biy: Dna, tar: Landmark, cog: Globe, fel: Brain, din: BookOpen };
export function DersIkon({ id, size = 22 }: { id: string; size?: number }) {
  const I = DERS[id] ?? BookOpen;
  return <I size={size} />;
}

const ROZET: Record<string, LucideIcon> = { ilk: Footprints, seri3: Flame, seri7: CalendarCheck, soru50: Target, konu: Trophy, avci: Crosshair, emin: ShieldCheck, uc: Layers };
export function RozetIkon({ id, size = 26 }: { id: string; size?: number }) {
  const I = ROZET[id] ?? Award;
  return <I size={size} />;
}
