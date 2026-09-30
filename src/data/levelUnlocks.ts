import { GameLevelId, MetaProgression } from '../types';
import { GAME_LEVELS } from './levels';

export interface LevelTargetEnemyInfo {
  id: string;
  name: string;
  icon: string;
}

export interface LevelUnlockMilestone {
  minPercent: number; // 0, 25, 50, 75, 100
  tierLevel: 0 | 1 | 2 | 3 | 4;
  spoiledName: string;
  spoiledShortTitle: string;
  spoiledSubtitle: string;
  spoiledDesc: string;
  spoiledLore: string;
  spoiledBossHint: string;
  spoiledWeatherHint: string;
  spoiledEnemiesHint: string;
  spoiledIcon: string;
  spoiledBadge: string;
  clueTag: string;
}

export interface LevelUnlockDef {
  id: GameLevelId;
  realName: string;
  realShortTitle: string;
  realSubtitle: string;
  realIcon: string;
  realBadge: string;
  defaultUnlocked: boolean;
  challengeTitle: string;
  challengeShortDesc: string;
  challengeLongDesc: string;
  bossDefeatRequirement: string;
  targetEnemies: LevelTargetEnemyInfo[];
  maxCount: number;
  milestones: LevelUnlockMilestone[];
}

export interface LevelProgress {
  id: GameLevelId;
  isUnlocked: boolean;
  canUnlock: boolean;
  isQueued: boolean;
  requiredLevelName?: string;
  curCount: number;
  maxCount: number;
  percent: number;
  tier: 0 | 1 | 2 | 3 | 4;
  spoiledName: string;
  spoiledShortTitle: string;
  spoiledSubtitle: string;
  spoiledDesc: string;
  spoiledLore: string;
  spoiledBossHint: string;
  spoiledWeatherHint: string;
  spoiledEnemiesHint: string;
  spoiledIcon: string;
  spoiledBadge: string;
  clueTag: string;
  enemiesBreakdown: { id: string; name: string; icon: string; count: number }[];
  bossDefeated: boolean;
}

export const LEVEL_ORDER: GameLevelId[] = [1, 2, 3, 4, 5, 6];

export function getPreviousLevel(id: GameLevelId): GameLevelId | null {
  const idx = LEVEL_ORDER.indexOf(id);
  if (idx <= 0) return null;
  return LEVEL_ORDER[idx - 1];
}

export function isLevelFullyUnlocked(id: GameLevelId, meta: MetaProgression): boolean {
  if (id === 1) return true;
  if ((meta.highestLevelUnlocked || 1) >= id) return true;
  if (meta.completedLevels && meta.completedLevels[id]) return true;

  // Backward compatibility with boss bestiary kills
  if (id === 2 && ((meta.bestiaryKills?.cert || 0) >= 1 || !!meta.completedLevels?.[1])) return true;
  if (id === 3 && ((meta.bestiaryKills?.hejkal || 0) >= 1 || !!meta.completedLevels?.[2])) return true;
  if (id === 4 && ((meta.bestiaryKills?.obr || 0) >= 1 || !!meta.completedLevels?.[3])) return true;
  if (id === 5 && ((meta.bestiaryKills?.mlynar || 0) >= 1 || !!meta.completedLevels?.[4])) return true;
  if (id === 6 && ((meta.bestiaryKills?.bezhlavy_rytir || 0) >= 1 || !!meta.completedLevels?.[5])) return true;

  return false;
}

export function canLevelUnlock(id: GameLevelId, meta: MetaProgression): boolean {
  if (id === 1) return true;
  const prev = getPreviousLevel(id);
  return !prev || isLevelFullyUnlocked(prev, meta);
}

export function getActiveUnlockingLevel(meta: MetaProgression): GameLevelId | null {
  for (let i = 0; i < LEVEL_ORDER.length; i++) {
    const id = LEVEL_ORDER[i];
    if (!isLevelFullyUnlocked(id, meta)) {
      if (canLevelUnlock(id, meta)) {
        return id;
      }
      return null;
    }
  }
  return null;
}

function makeSequentialUnlock(id: 4 | 5 | 6, targetEnemies: LevelTargetEnemyInfo[]): LevelUnlockDef {
  const level = GAME_LEVELS[id];
  const previous = GAME_LEVELS[(id - 1) as GameLevelId];
  const locked = (percent: number, tierLevel: 0 | 1 | 2 | 3 | 4): LevelUnlockMilestone => ({
    minPercent: percent, tierLevel,
    spoiledName: percent === 100 ? level.name : `${id}. ??? [ZAMČENÁ VÝPRAVA]`,
    spoiledShortTitle: percent === 100 ? level.shortTitle : 'Neznámá končina',
    spoiledSubtitle: percent >= 50 ? level.subtitle : 'Zatím jen útržky pověstí a vzdálené výkřiky',
    spoiledDesc: percent >= 50 ? level.description : `Cesta se odhalí po průzkumu ${previous.shortTitle}.`,
    spoiledLore: percent >= 75 ? level.lore : 'Kronikář zatím sbírá jen kusé zprávy.',
    spoiledBossHint: percent >= 75 ? `👑 Hlavní boss: ${level.finalBoss.name}` : '👑 Hlavní boss: ???',
    spoiledWeatherHint: percent >= 50 ? `Počasí: ${level.subtitle}` : 'Počasí: neznámé',
    spoiledEnemiesHint: percent >= 50 ? targetEnemies.map((enemy) => enemy.name).join(', ') : 'Nepřátelé: skryto',
    spoiledIcon: percent >= 50 ? level.icon : '🔒', spoiledBadge: percent === 100 ? level.badge : `🔒 ${id}. úroveň (${percent} %)`,
    clueTag: percent === 100 ? '✅ Plně odemčeno!' : `🔒 ${percent} %: pokračuj v předchozí výpravě`,
  });
  return {
    id, realName: level.name, realShortTitle: level.shortTitle, realSubtitle: level.subtitle, realIcon: level.icon, realBadge: level.badge,
    defaultUnlocked: false, challengeTitle: `Průzkum: ${level.shortTitle}`,
    challengeShortDesc: `Poražte ${previous.finalBoss.name} nebo zažeňte potvory z předchozí výpravy.`,
    challengeLongDesc: `Dokončete výpravu „${previous.shortTitle}“. Vítězství nad jejím hlavním bossem otevře cestu do oblasti „${level.shortTitle}“.`,
    bossDefeatRequirement: `Porazit ${previous.finalBoss.name}`,
    targetEnemies, maxCount: 100, milestones: [locked(0, 0), locked(25, 1), locked(50, 2), locked(75, 3), locked(100, 4)],
  };
}

export const LEVEL_UNLOCKS: Record<GameLevelId, LevelUnlockDef> = {
  1: {
    id: 1,
    realName: '1. Náves a rybník Brčálník',
    realShortTitle: 'Náves a rybník',
    realSubtitle: 'Zlatavý podzim, skotačivá havěť a rybniční rejdy',
    realIcon: '🍂',
    realBadge: '1. Úroveň',
    defaultUnlocked: true,
    challengeTitle: 'Výchozí venkovská výprava',
    challengeShortDesc: 'Přístupná pro každého odvážného poutníka od samého počátku.',
    challengeLongDesc: 'Projděte se po hrusické návsi a kolem rybníka Brčálníku. Naučte se čelit raráškům, hastrmanům a Pekelnému Čertovi!',
    bossDefeatRequirement: 'Žádné – výchozí úroveň',
    targetEnemies: [],
    maxCount: 0,
    milestones: [
      {
        minPercent: 0,
        tierLevel: 4,
        spoiledName: '1. Náves a rybník Brčálník',
        spoiledShortTitle: 'Náves a rybník',
        spoiledSubtitle: 'Zlatavý podzim, skotačivá havěť a rybniční rejdy',
        spoiledDesc: 'Slunce ozařuje hrusické doškové střechy. Na mezích šmejdí rarášci a z rybníka Brčálníku vylézají nenechaví vodníci.',
        spoiledLore: 'Klidné venkovské odpoledne narušily divoké rejdy. Zažeňte polní a rybniční potvory a vykažte z hospodské návsi samotného Pekelného Čerta!',
        spoiledBossHint: '👑 Hlavní boss: Pekelný Čert s vidlemi (150 s)',
        spoiledWeatherHint: 'Počasí: Zlatavé podzimní listí a slunce',
        spoiledEnemiesHint: 'Rarášek, Rybniční žabka, Vodníček, Polednice, Hastrman',
        spoiledIcon: '🍂',
        spoiledBadge: '1. Úroveň',
        clueTag: '✅ Připraveno k výpravě',
      },
    ],
  },

  2: {
    id: 2,
    realName: '2. Starý hřbitov a Hrusický hvozd',
    realShortTitle: 'Hřbitov a hvozd',
    realSubtitle: 'Sychravá mlha, náhrobky, noční stíny a Půlnoční Hejkal',
    realIcon: '🪦',
    realBadge: '2. Úroveň',
    defaultUnlocked: false,
    challengeTitle: '🪦 Průzkum stezky za hřbitovní zeď',
    challengeShortDesc: 'Zažeň 60 potvor z návsi a rybníka NEBO poraž Pekelného Čerta v 1. úrovni.',
    challengeLongDesc:
      'Za vsí se rozkládá staré pohřebiště s márnicí a hluboký hvozd, kam se nikdo neodváží. Zažeňte 60 polních a vodních potvor v 1. úrovni, nebo rovnou skolte Pekelného Čerta, a stará kovaná brána se vám otevře!',
    bossDefeatRequirement: 'Porazit Pekelného Čerta v 1. úrovni',
    targetEnemies: [
      { id: 'rarach', name: 'Rarášek', icon: '👺' },
      { id: 'zaba', name: 'Rybniční žabka', icon: '🐸' },
      { id: 'vodnicek', name: 'Mladý vodníček', icon: '💧' },
      { id: 'polednice', name: 'Polednice se srpem', icon: '☀️' },
      { id: 'hastrman', name: 'Hastrman z Brčálníku', icon: '🎩' },
      { id: 'cert', name: 'Pekelný Čert s vidlemi', icon: '👹' },
    ],
    maxCount: 60,
    milestones: [
      // 0% - 24%
      {
        minPercent: 0,
        tierLevel: 0,
        spoiledName: '2. ??? [ZAMČENÁ ÚROVEŇ]',
        spoiledShortTitle: '??? [Neznámá končina]',
        spoiledSubtitle: 'Hustá mlha, neprostupné stíny a neznámý děs za vsí',
        spoiledDesc:
          'Za vesnickou zdí leží temný hvozd a opuštěná místa, o kterých staří lidé mluví jen šeptem. Cesta je zatím zavátá mlhou a hlídána pekelnou mocí.',
        spoiledLore:
          'Nikdo se zatím neodvážil překročit hranici vsi. Obyvatelé jen varují před podivnými zvuky linoucími se z noční dálky za márnicí.',
        spoiledBossHint: '👑 Hlavní boss: Zahalen v neproniknutelné temnotě (???)',
        spoiledWeatherHint: 'Počasí a atmosféra: Neznámo (zahalená mlhou)',
        spoiledEnemiesHint: 'Běsi a přízraky: Skryto v husté mlze (???)',
        spoiledIcon: '🔒',
        spoiledBadge: '🔒 2. Úroveň (0 %)',
        clueTag: '🔒 0 %: Zcela utajeno – zažeň 25 % škůdců z 1. úrovně pro první stopu',
      },
      // 25% - 49%
      {
        minPercent: 25,
        tierLevel: 1,
        spoiledName: '2. S _ _ _ ý   h _ _ _ _ _ v',
        spoiledShortTitle: 'S...ý hřb...ov',
        spoiledSubtitle: 'Sychravá mlha, opuštěné kříže a chladné hroby',
        spoiledDesc:
          'V mlze se rýsují staré kamenné náhrobky a rozpadlá hřbitovní zeď. Poutníci z dálky hlásí klepání kostí a táhlé noční zvonění z márnice.',
        spoiledLore:
          'Z mlhy vystupují první náhrobní kameny a staré duby. Mezi hroby se prý za soumraku prochází postava se zvoncem a kostlivci vstávají ze spánku.',
        spoiledBossHint: '👑 Hlavní boss: P _ _ _ _ _ _ í   H _ _ _ _ l',
        spoiledWeatherHint: 'Počasí: Sychravá hřbitovní mlha a podzimní šero',
        spoiledEnemiesHint: '💀 Odhaleni: Kostlivci a noční stíny',
        spoiledIcon: '🌫️',
        spoiledBadge: '🔍 2. Úroveň (25 %)',
        clueTag: '🔍 25 %: První stopa! Odhalena mlha, hřbitovní zeď a kostlivci',
      },
      // 50% - 74%
      {
        minPercent: 50,
        tierLevel: 2,
        spoiledName: '2. S t a r ý   h ř b _ _ _ v',
        spoiledShortTitle: 'Tajemný hvozd',
        spoiledSubtitle: 'Náhrobky, řinčení řetězů, Večerní přízraky a Pekelný dráb',
        spoiledDesc:
          'Cesta za hřbitovní zeď je zřetelná! V hvozdu obchází Klekánice se zvoncem a Pekelný dráb s karabáčem. Ze země lezou umrlci a z lesa vyjí černí psi.',
        spoiledLore:
          'Už víte, co vás za hřbitovní zdí čeká – sychravé podzimní šero, kde svěcená voda a vrbový prut budou mít plné ruce práce proti nočním umrlcům.',
        spoiledBossHint: '👑 Hlavní boss: P ů l n o č n í   H _ _ _ a l',
        spoiledWeatherHint: 'Počasí: Hustá podzimní mlha a chladný vítr v korunách',
        spoiledEnemiesHint: '💀 Kostlivec, Černý pes, Klekánice a Pekelný dráb',
        spoiledIcon: '⚰️',
        spoiledBadge: '🔎 2. Úroveň (50 %)',
        clueTag: '🔎 50 %: Znáš náhrobky, Klekánici, Pekelného drába i počasí!',
      },
      // 75% - 99%
      {
        minPercent: 75,
        tierLevel: 3,
        spoiledName: '2. S t a r ý   h ř b i t o v   a   h _ _ _ d',
        spoiledShortTitle: 'Starý hřbitov & hvozd',
        spoiledSubtitle: 'Sychravá mlha, náhrobky, noční stíny a Půlnoční Hejkal',
        spoiledDesc:
          'Brána starého hřbitova skřípe v pantech! Už zbývá jen málo, aby se cesta do Hrusického hvozdu otevřela dokořán. Připravte se na Hejkalovo volání!',
        spoiledLore:
          'Všechny stopy jsou složeny! Půlnoční Hejkal už vyhlíží odvážlivce z korun prastarých dubů. Zažeňte poslední potvory nebo poražte Pekelného Čerta!',
        spoiledBossHint: '👑 Hlavní boss: 🌲 P ů l n o č n í   H e j k a l',
        spoiledWeatherHint: 'Počasí: Plíživá mlha a noční temnota mezi staletými duby',
        spoiledEnemiesHint: '💀 Kostlivec, Černý pes, Bubák ze stodoly, Klekánice, Hejkal',
        spoiledIcon: '🪦',
        spoiledBadge: '⚡ 2. Úroveň (75 %)',
        clueTag: '⚡ 75 %: Téměř odemčeno! Zbývá už jen krůček k otevření hřbitova!',
      },
      // 100%
      {
        minPercent: 100,
        tierLevel: 4,
        spoiledName: '2. Starý hřbitov a Hrusický hvozd',
        spoiledShortTitle: 'Hřbitov a hvozd',
        spoiledSubtitle: 'Sychravá mlha, náhrobky, noční stíny a Půlnoční Hejkal',
        spoiledDesc:
          'Za vesnickou zdí šumí staré duby a hřbitovní kříže pohlcuje chladná podzimní mlha. Ze země vystupují umrlci a z lesa hejká prastarý běs.',
        spoiledLore:
          'V hlubokém hvozdu za márnicí se ztratil nejeden chasník. Připravte své vrbové pruty a postavte se nočním kostlivcům i obávanému Hejkalovi!',
        spoiledBossHint: '👑 Hlavní boss: 🌲 Půlnoční Hejkal z hvozdů',
        spoiledWeatherHint: 'Počasí: Sychravá podzimní mlha',
        spoiledEnemiesHint: 'Kostlivec, Černý pes, Bubák, Klekánice, Hejkal',
        spoiledIcon: '🪦',
        spoiledBadge: '2. Úroveň',
        clueTag: '✅ Plně odemčeno!',
      },
    ],
  },

  3: {
    id: 3,
    realName: '3. Ladovská zima na Melechově',
    realShortTitle: 'Ladovská zima',
    realSubtitle: 'Třeskutý mráz, sněžná vánice a Skalní obr ze Sázavy',
    realIcon: '❄️',
    realBadge: '3. Úroveň',
    defaultUnlocked: false,
    challengeTitle: '❄️ Cesta do zasněžených hor na Melechov',
    challengeShortDesc: 'Zažeň 60 hřbitovních monster NEBO poraž Půlnočního Hejkala ve 2. úrovni.',
    challengeLongDesc:
      'Vysoko na kopcích za hvozdem vládne mráz, vánice a hluboké závěje. Zažeňte 60 hřbitovních umrlců a stínů ve 2. úrovni, nebo skolte obávaného Hejkala, a horská stezka se vám uvolní!',
    bossDefeatRequirement: 'Porazit Půlnočního Hejkala ve 2. úrovni',
    targetEnemies: [
      { id: 'skeleton', name: 'Kostlivec', icon: '💀' },
      { id: 'cerny_pes', name: 'Černý pes', icon: '🐕' },
      { id: 'bubak', name: 'Bubák ze stodoly', icon: '👻' },
      { id: 'klekanice', name: 'Večerní Klekánice', icon: '🔔' },
      { id: 'drab', name: 'Pekelný dráb', icon: '⛓️' },
      { id: 'hejkal', name: 'Půlnoční Hejkal', icon: '🌲' },
    ],
    maxCount: 60,
    milestones: [
      // 0% - 24%
      {
        minPercent: 0,
        tierLevel: 0,
        spoiledName: '3. ??? [ZAMČENÁ ÚROVEŇ]',
        spoiledShortTitle: '??? [Daleké končiny]',
        spoiledSubtitle: 'Tajemné závěje, ledový vichr a spící titán pod horou',
        spoiledDesc:
          'Vysoko na kopcích za hvozdem vládne třeskutý mráz a ticho. O této nejnáročnější pouti kolují legendy o obrovi, který spí pod sněhem a ledem.',
        spoiledLore:
          'Tato úroveň je zatím uzamčena a čeká na pokoření předchozí úrovně. Nejprve musíte otevřít a zvládnout 2. úroveň!',
        spoiledBossHint: '👑 Hlavní boss: Zahaleno v sněhové vánici (???)',
        spoiledWeatherHint: 'Počasí a nálada: Neznámo (vzdálený ledový opar)',
        spoiledEnemiesHint: 'Mrazivé běsy: Skryto pod hlubokým sněhem (???)',
        spoiledIcon: '🔒',
        spoiledBadge: '🔒 3. Úroveň (0 %)',
        clueTag: '🔒 0 %: Zcela utajeno – zažeň 25 % běsů z hřbitova pro první stopu',
      },
      // 25% - 49%
      {
        minPercent: 25,
        tierLevel: 1,
        spoiledName: '3. L _ _ _ _ _ _ á   z _ _ a',
        spoiledShortTitle: 'L...ská zima',
        spoiledSubtitle: 'Sněhové závěje, třeskutý mráz a vánice',
        spoiledDesc:
          'Z dálky se ozývá vytí větru v komínech a padají první sněhové vločky. Na doškových střechách rostou rampouchy a ze sněhu vykukují první sněhuláci.',
        spoiledLore:
          'První stopa odhaluje mrazivou zimu! Mráz zalézá za nehty a vánice skučí v korunách zasněžených stromů pod horou.',
        spoiledBossHint: '👑 Hlavní boss: S _ _ _ _ í   o _ r',
        spoiledWeatherHint: 'Počasí: Hustá sněhová vánice a padající vločky',
        spoiledEnemiesHint: '🧊 Odhaleni: Rampouchoví Zmrzlíci a divoká Meluzína',
        spoiledIcon: '🌨️',
        spoiledBadge: '🔍 3. Úroveň (25 %)',
        clueTag: '🔍 25 %: První vločky! Odhalena mrazivá zima a sněhové závěje',
      },
      // 50% - 74%
      {
        minPercent: 50,
        tierLevel: 2,
        spoiledName: '3. L a d o v _ _ á   z i m a',
        spoiledShortTitle: 'Zasněžené vrchy',
        spoiledSubtitle: 'Rampouchy, Ohnivý rarach a Větrná Meluzína',
        spoiledDesc:
          'Cesta na zasněžený vrch je zasypaná sněhem! Vánici ovládá Meluzína, z vyhřátých pecí vyskakují ohniví raraši a ze země se zvedá kamenný obr.',
        spoiledLore:
          'Bílé závěje přikryly chalupy. Proti mrazu budete potřebovat horké pečené brambory a ohnivou sílu kovářských zbraní!',
        spoiledBossHint: '👑 Hlavní boss: S k a l n í   o _ _',
        spoiledWeatherHint: 'Počasí: Třeskutý mráz (-15 °C) a skučí vichřice',
        spoiledEnemiesHint: '🧊 Zmrzlík, Meluzína, Ohnivý rarach a Hromotluk',
        spoiledIcon: '☃️',
        spoiledBadge: '🔎 3. Úroveň (50 %)',
        clueTag: '🔎 50 %: Znáš zasněžený vrch, Meluzínu, Ohnivého raracha i mráz!',
      },
      // 75% - 99%
      {
        minPercent: 75,
        tierLevel: 3,
        spoiledName: '3. L a d o v s k á   z i m a   n a   M _ _ _ _ _ _ v ě',
        spoiledShortTitle: 'Ladovská zima',
        spoiledSubtitle: 'Třeskutý mráz, sněžná vánice a Skalní obr ze Sázavy',
        spoiledDesc:
          'Závěje na horském vrchu se rozestupují! Vánice sílí a pod horou se probouzí obrovský kamenný titán. Už chybí jen krok k vrcholné výpravě!',
        spoiledLore:
          'Vrcholná 3. úroveň Bubákova je téměř odhalena! Získejte poslední zářezy ve hvozdě nebo poražte Půlnočního Hejkala.',
        spoiledBossHint: '👑 Hlavní boss: 🗿 S k a l n í   o b r',
        spoiledWeatherHint: 'Počasí: Hrstě sněhu, bílá tma a ledový vítr',
        spoiledEnemiesHint: '🧊 Zmrzlík z okapu, Meluzína, Ohnivý rarach, Hromotluk, Skalní obr',
        spoiledIcon: '❄️',
        spoiledBadge: '⚡ 3. Úroveň (75 %)',
        clueTag: '⚡ 75 %: Téměř odemčeno! Obří titán už dupe ve sněhu!',
      },
      // 100%
      {
        minPercent: 100,
        tierLevel: 4,
        spoiledName: '3. Ladovská zima na Melechově',
        spoiledShortTitle: 'Ladovská zima',
        spoiledSubtitle: 'Třeskutý mráz, sněžná vánice a Skalní obr ze Sázavy',
        spoiledDesc:
          'Bílé závěje přikryly chalupy, z okapů visí rampouchy a vánice skučí v komínech. Pod vrcholem Melechova se probouzí kamenný obr!',
        spoiledLore:
          'Pravá Ladovská zima v plné síle! Mráz svírá pole a pekelný žár ohnivého muže taje rampouchy. Čelte větru i lavinám skalního titána!',
        spoiledBossHint: '👑 Hlavní boss: 🗿 Skalní obr ze Sázavy',
        spoiledWeatherHint: 'Počasí: Třeskutý mráz a vánice',
        spoiledEnemiesHint: 'Zmrzlík, Meluzína, Ohnivý rarach, Hromotluk, Skalní obr',
        spoiledIcon: '❄️',
        spoiledBadge: '3. Úroveň',
        clueTag: '✅ Plně odemčeno!',
      },
    ],
  },
  4: makeSequentialUnlock(4, [{ id: 'zbojnik', name: 'Zbojník', icon: '🗡️' }, { id: 'jiskrivec', name: 'Jiskřivec', icon: '✨' }, { id: 'mlynar', name: 'Mlynář', icon: '🌊' }]),
  5: makeSequentialUnlock(5, [{ id: 'bila_pani', name: 'Bílá paní', icon: '👻' }, { id: 'zbrojnos', name: 'Zbrojnoš', icon: '🛡️' }, { id: 'bezhlavy_rytir', name: 'Bezhlavý rytíř', icon: '🗡️' }]),
  6: makeSequentialUnlock(6, [{ id: 'snehulak', name: 'Sněhulák', icon: '☃️' }, { id: 'nocni_mura', name: 'Noční můra', icon: '🌑' }, { id: 'drak', name: 'Drak', icon: '🐉' }]),
};

/**
 * Calculates progressive reveal information and unlock status for a game level
 */
export function getLevelProgress(id: GameLevelId, meta: MetaProgression): LevelProgress {
  const def = LEVEL_UNLOCKS[id];
  const lvlOriginal = GAME_LEVELS[id];

  // Default fallback if level not found
  if (!def || !lvlOriginal) {
    return {
      id,
      isUnlocked: true,
      canUnlock: true,
      isQueued: false,
      curCount: 0,
      maxCount: 0,
      percent: 100,
      tier: 4,
      spoiledName: `Úroveň ${id}`,
      spoiledShortTitle: `Úroveň ${id}`,
      spoiledSubtitle: '',
      spoiledDesc: '',
      spoiledLore: '',
      spoiledBossHint: '',
      spoiledWeatherHint: '',
      spoiledEnemiesHint: '',
      spoiledIcon: '🗺️',
      spoiledBadge: `${id}. Úroveň`,
      clueTag: '✅ Odemčeno',
      enemiesBreakdown: [],
      bossDefeated: true,
    };
  }

  // Level 1 is always unlocked
  if (def.defaultUnlocked) {
    const m = def.milestones[0];
    return {
      id,
      isUnlocked: true,
      canUnlock: true,
      isQueued: false,
      curCount: 0,
      maxCount: 0,
      percent: 100,
      tier: 4,
      spoiledName: def.realName,
      spoiledShortTitle: def.realShortTitle,
      spoiledSubtitle: def.realSubtitle,
      spoiledDesc: lvlOriginal.description,
      spoiledLore: lvlOriginal.lore,
      spoiledBossHint: m.spoiledBossHint,
      spoiledWeatherHint: m.spoiledWeatherHint,
      spoiledEnemiesHint: m.spoiledEnemiesHint,
      spoiledIcon: def.realIcon,
      spoiledBadge: def.realBadge,
      clueTag: m.clueTag,
      enemiesBreakdown: [],
      bossDefeated: true,
    };
  }

  // Check if explicitly unlocked or completed in meta
  const isFullyUnlocked = isLevelFullyUnlocked(id, meta);
  if (isFullyUnlocked) {
    const lastMilestone = def.milestones[def.milestones.length - 1];
    return {
      id,
      isUnlocked: true,
      canUnlock: true,
      isQueued: false,
      curCount: def.maxCount,
      maxCount: def.maxCount,
      percent: 100,
      tier: 4,
      spoiledName: def.realName,
      spoiledShortTitle: def.realShortTitle,
      spoiledSubtitle: def.realSubtitle,
      spoiledDesc: lvlOriginal.description,
      spoiledLore: lvlOriginal.lore,
      spoiledBossHint: `👑 Hlavní boss: ${lvlOriginal.finalBoss.name}`,
      spoiledWeatherHint: lastMilestone.spoiledWeatherHint,
      spoiledEnemiesHint: lastMilestone.spoiledEnemiesHint,
      spoiledIcon: def.realIcon,
      spoiledBadge: def.realBadge,
      clueTag: '✅ Plně odemčeno!',
      enemiesBreakdown: def.targetEnemies.map((e) => ({
        id: e.id,
        name: e.name,
        icon: e.icon,
        count: (meta.levelKillCounts?.[id]?.[e.id] ?? meta.bestiaryKills?.[e.id]) ?? def.maxCount,
      })),
      bossDefeated: true,
    };
  }

  // Check sequential dependency: level cannot start unlocking until predecessor is unlocked!
  const prevId = getPreviousLevel(id);
  const eligible = canLevelUnlock(id, meta);

  if (!eligible && prevId) {
    const m0 = def.milestones[0];
    return {
      id,
      isUnlocked: false,
      canUnlock: false,
      isQueued: true,
      requiredLevelName: 'Předchozí úroveň',
      curCount: 0,
      maxCount: def.maxCount,
      percent: 0,
      tier: 0,
      spoiledName: m0.spoiledName,
      spoiledShortTitle: m0.spoiledShortTitle,
      spoiledSubtitle: m0.spoiledSubtitle,
      spoiledDesc: 'Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň v pořadí.',
      spoiledLore: m0.spoiledLore,
      spoiledBossHint: m0.spoiledBossHint,
      spoiledWeatherHint: m0.spoiledWeatherHint,
      spoiledEnemiesHint: m0.spoiledEnemiesHint,
      spoiledIcon: m0.spoiledIcon,
      spoiledBadge: m0.spoiledBadge,
      clueTag: '🔒 Čeká na odemčení předchozí úrovně',
      enemiesBreakdown: def.targetEnemies.map((e) => ({
        id: e.id,
        name: e.name,
        icon: e.icon,
        count: 0,
      })),
      bossDefeated: false,
    };
  }

  // Active level progression: count kills from target enemies
  const levelKills = meta.levelKillCounts?.[id] || meta.bestiaryKills || {};
  let curCount = 0;
  const enemiesBreakdown = def.targetEnemies.map((e) => {
    const cnt = levelKills[e.id] || 0;
    curCount += cnt;
    return {
      id: e.id,
      name: e.name,
      icon: e.icon,
      count: cnt,
    };
  });

  // Check if required boss was defeated (instant 100%)
  const bossId = id === 2 ? 'cert' : id === 3 ? 'hejkal' : '';
  const bossDefeated = bossId ? (meta.bestiaryKills?.[bossId] || 0) >= 1 : false;

  let percent = 0;
  if (bossDefeated) {
    curCount = def.maxCount;
    percent = 100;
  } else {
    percent = Math.min(100, Math.floor((curCount / def.maxCount) * 100));
  }

  const isUnlocked = percent >= 100;

  // Determine tier: 0 (0-24%), 1 (25-49%), 2 (50-74%), 3 (75-99%), 4 (100%)
  let tier: 0 | 1 | 2 | 3 | 4 = 0;
  if (isUnlocked || percent >= 100) {
    tier = 4;
  } else if (percent >= 75) {
    tier = 3;
  } else if (percent >= 50) {
    tier = 2;
  } else if (percent >= 25) {
    tier = 1;
  } else {
    tier = 0;
  }

  const milestone =
    def.milestones.find((m) => m.tierLevel === tier) || def.milestones[0];

  return {
    id,
    isUnlocked,
    canUnlock: true,
    isQueued: false,
    curCount: Math.min(def.maxCount, curCount),
    maxCount: def.maxCount,
    percent,
    tier,
    spoiledName: milestone.spoiledName,
    spoiledShortTitle: milestone.spoiledShortTitle,
    spoiledSubtitle: milestone.spoiledSubtitle,
    spoiledDesc: milestone.spoiledDesc,
    spoiledLore: milestone.spoiledLore,
    spoiledBossHint: milestone.spoiledBossHint,
    spoiledWeatherHint: milestone.spoiledWeatherHint,
    spoiledEnemiesHint: milestone.spoiledEnemiesHint,
    spoiledIcon: milestone.spoiledIcon,
    spoiledBadge: milestone.spoiledBadge,
    clueTag: milestone.clueTag,
    enemiesBreakdown,
    bossDefeated,
  };
}
