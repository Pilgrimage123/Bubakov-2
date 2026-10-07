export type GrandfatherEffect =
  | { type: 'speed'; amount: number }
  | { type: 'pickup_radius'; amount: number }
  | { type: 'damage_multiplier'; amount: number }
  | { type: 'max_hp'; amount: number }
  | { type: 'luck'; amount: number }
  | { type: 'regen'; amount: number };

export interface GrandfatherItemDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  maxStacks?: number;
  luckWeight?: number;
  effect: GrandfatherEffect;
}

export const GRANDFATHER_ITEMS: GrandfatherItemDef[] = [
  { id: 'sedmimile_krpce', name: 'Sedmimílové krpce', icon: '🥾', description: '+20 rychlost pohybu', baseCost: 80, maxStacks: 3, luckWeight: 1, effect: { type: 'speed', amount: 20 } },
  { id: 'certovske_pirko', name: 'Čertovské pírko', icon: '🪶', description: '+10 % poškození', baseCost: 95, maxStacks: 3, luckWeight: 1, effect: { type: 'damage_multiplier', amount: 0.10 } },
  { id: 'pytlacka_lucerna', name: 'Pytlácká lucerna', icon: '🏮', description: '+30 dosahu sběru', baseCost: 90, maxStacks: 3, luckWeight: 1.1, effect: { type: 'pickup_radius', amount: 30 } },
  { id: 'zaplacovany_kabat', name: 'Záplatovaný kabát', icon: '🧥', description: '+20 maximální Kuráž', baseCost: 110, maxStacks: 3, luckWeight: 0.9, effect: { type: 'max_hp', amount: 20 } },
  { id: 'krajac_na_podmasli', name: 'Kráječ na podmáslí', icon: '🥣', description: '+0,5 regenerace / s', baseCost: 120, maxStacks: 2, luckWeight: 0.8, effect: { type: 'regen', amount: 0.5 } },
  { id: 'podkova_pro_stesti', name: 'Podkova pro štěstí', icon: '🧲', description: '+1 ŠTĚSTÍ', baseCost: 125, maxStacks: 5, luckWeight: 0.8, effect: { type: 'luck', amount: 1 } },
  { id: 'bylinkova_fajfka', name: 'Bylinková fajfka', icon: '🚬', description: '+1 regenerace / s', baseCost: 145, maxStacks: 2, luckWeight: 0.7, effect: { type: 'regen', amount: 1 } },
  { id: 'rehtacka', name: 'Řehtačka', icon: '🪇', description: '+15 % poškození', baseCost: 155, maxStacks: 2, luckWeight: 0.65, effect: { type: 'damage_multiplier', amount: 0.15 } },
];

export function getGrandfatherItem(id: string): GrandfatherItemDef | undefined {
  return GRANDFATHER_ITEMS.find((item) => item.id === id);
}
