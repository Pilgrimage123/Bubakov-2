export type GrandfatherEffect =
  | { type: 'speed'; amount: number }
  | { type: 'pickup_radius'; amount: number }
  | { type: 'damage_multiplier'; amount: number }
  | { type: 'max_hp'; amount: number }
  | { type: 'luck'; amount: number }
  | { type: 'regen'; amount: number }
  | { type: 'cooldown'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'weapon'; weaponId: string };

export interface GrandfatherItemDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  maxStacks?: number;
  luckWeight?: number;
  isWeapon?: boolean;
  weaponId?: string;
  effect: GrandfatherEffect;
}

export const GRANDFATHER_ITEMS: GrandfatherItemDef[] = [
  // --- Původní stálé dobroty dědečkovy nůše ---
  { id: 'sedmimile_krpce', name: 'Sedmimílové krpce', icon: '🥾', description: '+20 rychlost pohybu', baseCost: 35, maxStacks: 5, luckWeight: 1, effect: { type: 'speed', amount: 20 } },
  { id: 'certovske_pirko', name: 'Čertovské pírko', icon: '🪶', description: '+10 % poškození všech útoků', baseCost: 45, maxStacks: 5, luckWeight: 1, effect: { type: 'damage_multiplier', amount: 0.10 } },
  { id: 'pytlacka_lucerna', name: 'Pytlácká lucerna', icon: '🏮', description: '+30 dosahu sběru', baseCost: 35, maxStacks: 5, luckWeight: 1.1, effect: { type: 'pickup_radius', amount: 30 } },
  { id: 'zaplacovany_kabat', name: 'Záplatovaný kabát', icon: '🧥', description: '+25 maximální Kuráž', baseCost: 45, maxStacks: 5, luckWeight: 0.9, effect: { type: 'max_hp', amount: 25 } },
  { id: 'krajac_na_podmasli', name: 'Kráječ na podmáslí', icon: '🥣', description: '+0,6 regenerace / s', baseCost: 50, maxStacks: 4, luckWeight: 0.8, effect: { type: 'regen', amount: 0.6 } },
  { id: 'podkova_pro_stesti', name: 'Podkova pro štěstí', icon: '🧲', description: '+1 ŠTĚSTÍ', baseCost: 50, maxStacks: 5, luckWeight: 0.8, effect: { type: 'luck', amount: 1 } },
  { id: 'bylinkova_fajfka', name: 'Bylinková fajfka', icon: '🚬', description: '+1,2 regenerace / s', baseCost: 60, maxStacks: 4, luckWeight: 0.7, effect: { type: 'regen', amount: 1.2 } },
  { id: 'rehtacka', name: 'Řehtačka', icon: '🪇', description: '+15 % poškození', baseCost: 65, maxStacks: 4, luckWeight: 0.65, effect: { type: 'damage_multiplier', amount: 0.15 } },

  // --- Předchozí level up pasivní upgrady a posílení ---
  { id: 'krvave_jelito', name: 'Krvavé jelito', icon: 'krvave_jelito', description: '+15 % trvalé zranění všech úderů a zbraní', baseCost: 50, maxStacks: 5, luckWeight: 1.0, effect: { type: 'damage_multiplier', amount: 0.15 } },
  { id: 'opravdova_kava', name: 'Opravdová káva', icon: 'opravdova_kava', description: '-10 % doba přípravy útoků (svižnější zbraně)', baseCost: 50, maxStacks: 5, luckWeight: 0.9, effect: { type: 'cooldown', amount: 0.1111111111 } },
  { id: 'medvedi_mast', name: 'Medvědí mast', icon: 'medvedi_mast', description: '+30 maximální Kuráž i okamžité zhojení', baseCost: 45, maxStacks: 5, luckWeight: 0.95, effect: { type: 'max_hp', amount: 30 } },
  { id: 'vesela_mysl', name: 'Veselá mysl a písnička', icon: '🎵', description: '+3 Kuráž doplňováno každých 5 s (+0,6 reg/s)', baseCost: 45, maxStacks: 5, luckWeight: 0.85, effect: { type: 'regen', amount: 0.6 } },
  { id: 'toulave_boty', name: 'Toulavé boty sedmimílové', icon: '👢', description: '+20 rychlost pohybu při obcházení strašidel', baseCost: 40, maxStacks: 5, luckWeight: 1.0, effect: { type: 'speed', amount: 20 } },
  { id: 'magneticky_mesec', name: 'Magnetický měšec', icon: '🧲', description: '+30 dosah sběru krejcarů a perníčků', baseCost: 35, maxStacks: 5, luckWeight: 1.0, effect: { type: 'pickup_radius', amount: 30 } },
  { id: 'zabijackova_jitrnice', name: 'Zabijačková jitrnice', icon: 'jitrnice', description: '+40 okamžité doplnění Kuráže', baseCost: 25, maxStacks: 10, luckWeight: 1.1, effect: { type: 'heal', amount: 40 } },
  { id: 'povidlova_buchta_snack', name: 'Povidlová buchta na cestu', icon: 'czech_buchta', description: '+50 okamžité doplnění Kuráže sladkou svačinou', baseCost: 30, maxStacks: 10, luckWeight: 1.1, effect: { type: 'heal', amount: 50 } },
  { id: 'kynuty_kolac_perk', name: 'Kynutý koláč z pece', icon: 'kynuty_kolac', description: '+25 maximální Kuráž i okamžité posílení', baseCost: 40, maxStacks: 5, luckWeight: 0.9, effect: { type: 'max_hp', amount: 25 } },

  // --- Zbraně (vždy garantována alespoň jedna v nůši) ---
  { id: 'wp_cane', name: 'Osikový prut', icon: 'osikovy_prut', description: 'Rychlý sečný oblouk odhání dotěrné skřítky a zloděje.', baseCost: 55, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'cane', effect: { type: 'weapon', weaponId: 'cane' } },
  { id: 'wp_cesnekova-topinka', name: 'Česneková topinka', icon: 'cesnekova_topinka', description: 'Smradlavá aura z česnekové topinky s brutálním odhozením.', baseCost: 40, maxStacks: 8, luckWeight: 1.2, isWeapon: true, weaponId: 'cesnekova-topinka', effect: { type: 'weapon', weaponId: 'cesnekova-topinka' } },
  { id: 'wp_valecnice', name: 'Válečnice', icon: 'valecnice', description: 'Rázná paní s válečkem obíhající kolem lovce.', baseCost: 45, maxStacks: 8, luckWeight: 1.2, isWeapon: true, weaponId: 'valecnice', effect: { type: 'weapon', weaponId: 'valecnice' } },
  { id: 'wp_kysela-okurka', name: 'Kyselá okurka', icon: 'kysela_okurka', description: 'Střílí kyselé okurky. Bubáci zeslábnou a dostávají větší rány.', baseCost: 55, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'kysela-okurka', effect: { type: 'weapon', weaponId: 'kysela-okurka' } },
  { id: 'wp_buns', name: 'Povidlové buchty', icon: 'czech_buchta', description: 'Zlatavé buchty pečené v pekáči. Bubáci mlsají na místě.', baseCost: 45, maxStacks: 8, luckWeight: 1.1, isWeapon: true, weaponId: 'buns', effect: { type: 'weapon', weaponId: 'buns' } },
  { id: 'wp_pitchfork', name: 'Kovářské vidle', icon: '🔱', description: 'Třízubé kované vidle prorážejí řady strašidel bodnutím vpřed.', baseCost: 50, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'pitchfork', effect: { type: 'weapon', weaponId: 'pitchfork' } },
  { id: 'wp_halberd', name: 'Kovaná halapartna', icon: '🪓', description: 'Těžká zbraň ponocných. Široký rázný švih zažene celé houfy.', baseCost: 60, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'halberd', effect: { type: 'weapon', weaponId: 'halberd' } },
  { id: 'wp_flail', name: 'Dřevěný cep na obilí', icon: '🌾', description: 'Drtivý dopad do země vyvolá rázovou vlnu a odhodí nepřátele.', baseCost: 65, maxStacks: 8, luckWeight: 0.85, isWeapon: true, weaponId: 'flail', effect: { type: 'weapon', weaponId: 'flail' } },
  { id: 'wp_herbs', name: 'Devatery kvítí', icon: '🌿', description: 'Voňavý ochranný věnec bylin v kruhu zahání nečisté síly.', baseCost: 45, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'herbs', effect: { type: 'weapon', weaponId: 'herbs' } },
  { id: 'wp_snowball', name: 'Sněhová koule', icon: '❄️', description: 'Tuhá ledová koule ze sněhu, chlad zpomalí každé strašidlo.', baseCost: 45, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'snowball', effect: { type: 'weapon', weaponId: 'snowball' } },
  { id: 'wp_kolac', name: 'Kynutý koláč', icon: 'kynuty_kolac', description: 'Tradiční koláč se odráží mezi bubáky a přiměje je mlsat.', baseCost: 50, maxStacks: 8, luckWeight: 0.95, isWeapon: true, weaponId: 'kolac', effect: { type: 'weapon', weaponId: 'kolac' } },
  { id: 'wp_potato', name: 'Horký brambor z popela', icon: '🥔', description: 'Brambor z popela popálí bubáky a zanechá kouřící ohnisko.', baseCost: 50, maxStacks: 8, luckWeight: 0.95, isWeapon: true, weaponId: 'potato', effect: { type: 'weapon', weaponId: 'potato' } },
  { id: 'wp_bees', name: 'Včelí roj z úlu', icon: '🐝', description: 'Bzučící včely samy vyhledávají nejbližší strašidla.', baseCost: 50, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'bees', effect: { type: 'weapon', weaponId: 'bees' } },
  { id: 'wp_hromnicka', name: 'Hromnička', icon: '🕯️', description: 'Posvěcená svíce pulzuje posvátným zraněním a odpuzuje bubáky.', baseCost: 50, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'hromnicka', effect: { type: 'weapon', weaponId: 'hromnicka' } },
  { id: 'wp_holywater', name: 'Kropenka se svěcenou vodou', icon: '✨', description: 'Svěcená voda z kapličky kropí široký vějíř posvátných kapek.', baseCost: 55, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'holywater', effect: { type: 'weapon', weaponId: 'holywater' } },
];

export function getGrandfatherItem(id: string): GrandfatherItemDef | undefined {
  return GRANDFATHER_ITEMS.find((item) => item.id === id);
}
