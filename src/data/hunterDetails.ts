export type HunterDetailKey = 'wanderer' | 'shepherd' | 'korenarka' | 'watchman' | 'sexton' | 'granny';

export interface HunterDetail {
  name: string;
  title: string;
  maxHp: number;
  speed: number;
  pickupRadius: number;
  luck: number;
  weapon: string;
  passive: string;
  ability: string;
  cooldownSeconds: number;
  playstyle: string;
}

export const HUNTER_DETAILS: Record<HunterDetailKey, HunterDetail> = {
  wanderer: {
    name: 'Poutník (Tulák)',
    title: 'Vesnický poutník z Hrusic',
    maxHp: 200,
    speed: 165,
    pickupRadius: 75,
    luck: 100,
    weapon: 'Osikový prut – automatické obloukové údery na blízké bubáky.',
    passive: 'Tulácký instinkt: +35 % poškození všech zbraní.',
    ability: 'Pověstná sukovice: otočka zasáhne blízké bubáky v okruhu 260 px za 185 poškození a silně je odhodí. Ve vnějším dosahu až 600 px způsobí 55 poškození; přeživší mohou být vystrašeni až na 4 s.',
    cooldownSeconds: 21,
    playstyle: 'Nejvyšší základní Kuráž a výrazné poškození; magnet na sběr je kratší, proto se vyplatí pohybovat se přes kořist.',
  },
  shepherd: {
    name: 'Pasáček',
    title: 'Hbitý chlapec z pastvin',
    maxHp: 110,
    speed: 220,
    pickupRadius: 160,
    luck: 105,
    weapon: 'Povidlové buchty – automaticky házená svačina zraňuje a může bubáky zaměstnat mlsáním.',
    passive: 'Nejvyšší základní rychlost pohybu (220) a mimořádný magnet na krejcary, perníčky a další sbíratelné dobroty (160 px).',
    ability: 'Dusot stáda: přivolá 22 běžících beranů. Zásah v dosahu přibližně 560 px způsobí 140 fyzického poškození a silné odhození. Scénka trvá přibližně 3,6 s.',
    cooldownSeconds: 30,
    playstyle: 'Rychlý sběrač s menší Kuráží. Udržuj pohyb a využívej široký dosah sběru.',
  },
  korenarka: {
    name: 'Bába kořenářka',
    title: 'Moudrá ranhojička z lesní chaloupky',
    maxHp: 125,
    speed: 180,
    pickupRadius: 26,
    luck: 85,
    weapon: 'Devatery kvítí – bylinná zbraň, která automaticky odhání dotírající bubáky.',
    passive: 'Bylinný záblesk jednou za 9 s vyléčí až 18 % maximální Kuráže (léčení nepřekročí maximum) a na 3 s zvýší dosah magnetu i rychlost přitahování dropů na pětinásobek a udělí nezranitelnost. Základní dosah magnetu je trvale snížen o 75 % (přibližně 26 px před bonusy vesnice a usnadnění).',
    ability: 'Očistné kadidlo: obnoví až 55 Kuráže, přidá 30 bodů dočasného štítu a na 1,8 s poskytne nezranitelnost. V okruhu 480 px způsobí 120 přírodního poškození, nasákne a zpomalí bubáky na 4,5 s.',
    cooldownSeconds: 30,
    playstyle: 'Léčivá a kontrolní postava. Sbírání kořisti je běžně krátkodosahové, ale každých 9 s získá bezpečné časové okno s pětinásobným magnetem a rychlostí přitahování.',
  },
  watchman: {
    name: 'Ponocný',
    title: 'Legendární strážce noci s Voříškem',
    maxHp: 140,
    speed: 175,
    pickupRadius: 115,
    luck: 90,
    weapon: 'Kovaná halapartna – automatické údery těžkou zbraní.',
    passive: 'Svatá aura lucerny průběžně pálí blízká strašidla svatým poškozením (16 poškození za sekundu).',
    ability: 'Noční roh a poplach: zatroubením způsobí 110 fyzického poškození a zažene nepřátele do paniky až na 5 s; odpor vůle může dobu paniky zkrátit.',
    cooldownSeconds: 30,
    playstyle: 'Vyvážený strážce s průběžným poškozením z aury a plošným nouzovým poplachem.',
  },
  sexton: {
    name: 'Pobožný kostelník',
    title: 'Zvoník a správce farního kostela',
    maxHp: 135,
    speed: 170,
    pickupRadius: 110,
    luck: 100,
    weapon: 'Svěcená kropenka – svaté útoky účinné proti nemrtvým a pekelným nepřátelům.',
    passive: 'Svěcená výzbroj těží z odlišných odolností nepřátel; svaté zásahy jsou zvláště účinné proti nemrtvým a démonům.',
    ability: 'Farní požehnání: zasáhne oblast o poloměru 650 px. Běžní nemrtví a démoni dostanou silné svaté poškození; bossové utrpí zásah odpovídající 25 % maximální Kuráže.',
    cooldownSeconds: 35,
    playstyle: 'Specialista na nemrtvé a démony, nejsilnější při velkých vlnách nebo proti bossům.',
  },
  granny: {
    name: 'Babička a Barunka',
    title: 'Vlídná babička z Ratibořic a její vnučka',
    maxHp: 130,
    speed: 165,
    pickupRadius: 125,
    luck: 120,
    weapon: 'Kynutý koláč – automaticky házený koláč a jeho vylepšené varianty.',
    passive: 'Laskavost a práce s jídlem: její schopnosti rozlišují, zda je na bubáka účinnější jídlo, nebo svaté působení.',
    ability: 'Chléb se solí a vlídné slovo: zastaví čas pro scénku a poté každého zasaženého nepřítele ovlivní typem (Food/Holy), vůči kterému má menší odolnost. U běžných bubáků může vést k okamžitému zklidnění/odchodu; bossové mohou utrpět až 25 % maximální Kuráže.',
    cooldownSeconds: 45,
    playstyle: 'Pomalejší podpůrná postava se silnou kontrolou velké části bojiště.',
  },
};
