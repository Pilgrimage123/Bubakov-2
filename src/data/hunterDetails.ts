import type { WeaponId } from '../types';

export type HunterDetailKey = 'wanderer' | 'shepherd' | 'korenarka' | 'watchman' | 'sexton' | 'granny';

export interface HunterDetail {
  name: string;
  title: string;
  maxHp: number;
  speed: number;
  pickupRadius: number;
  luck: number;
  weaponId: WeaponId;
  /** Short display label retained for consumers that need a text-only equipment summary. */
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
    weaponId: 'osikovy_prut',
    weapon: 'Osikový prut – rychlý široký sečný oblouk.',
    passive: 'Tulácký instinkt: +35 % poškození všech zbraní. Bonus posiluje i Pověstnou sukovici.',
    ability: 'Pověstná sukovice (21 s): do 260 px způsobí základních 185 fyzických poškození, silně odhodí bubáky a vynuluje jejich postoj. Ve vnější zóně do 600 px způsobí 55 fyzického poškození a odhodí je. Obě zóny vyvolají paniku až na 4 s; Vůle ji zkracuje. Poškození se dále násobí aktivními bonusy.',
    cooldownSeconds: 21,
    playstyle: 'Nejvyšší základní Kuráž a výrazné poškození; magnet na sběr je kratší, proto se vyplatí pohybovat se přes kořist.',
  },
  shepherd: {
    name: 'Pasáček',
    title: 'Hbitý chlapec z pastvin',
    maxHp: 55,
    speed: 220,
    pickupRadius: 160,
    luck: 105,
    weaponId: 'povidlove_buchty',
    weapon: 'Povidlové buchty – házená svačina s oblakem povidlové vůně.',
    passive: 'Pastýřský úhyb: má 35% šanci zcela se vyhnout zásahu. Po zásahu na blízko získává 0,6 s nezranitelnosti. Základní Kuráž je 55.',
    ability: 'Dusot stáda (30 s): vyběhne 22 beranů. Úvodní zásah do 560 px způsobí 140 fyzického poškození, silně odhodí a vynuluje postoj. Po dobu 3,6 s následuje každých 0,25 s dalších 35 fyzických poškození v dosahu 520 px. Čísla se násobí bonusy poškození.',
    cooldownSeconds: 30,
    playstyle: 'Velmi rychlý sběrač s poloviční Kuráží, 35% šancí na úhyb a delším oknem nezranitelnosti po zásahu zblízka. Udržuj pohyb a využívej široký dosah sběru.',
  },
  korenarka: {
    name: 'Bába kořenářka',
    title: 'Moudrá ranhojička z lesní chaloupky',
    maxHp: 125,
    speed: 180,
    pickupRadius: 26.25,
    luck: 85,
    weaponId: 'devatero_kviti',
    weapon: 'Devatero kvítí – počáteční věnec pěti bylin.',
    passive: 'Bylinný záblesk každých 9 s obnoví až 18 % maximální Kuráže. Na 3 s také násobí magnet i rychlost přitahování kořisti hodnotou 5 a udělí 3 s nezranitelnosti. Základní magnet je snížen o 75 %: 26,25 px před dalšími bonusy.',
    ability: 'Očistné kadidlo (30 s): obnoví až 55 Kuráže, přidá 30 štítu a dá 1,8 s nezranitelnosti. Výbuch do 480 px způsobí 120 přírodního poškození, nasákne a zpomalí bubáky na 4,5 s. Sanctuarium trvá 4,8 s; každých 0,75 s léčí až 6 Kuráže a způsobí 25 přírodního poškození do 420 px. Poškození podléhá bonusům a odolnostem.',
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
    weaponId: 'kovana_halapartna',
    weapon: 'Kovaná halapartna – těžké, široké údery.',
    passive: 'Aura lucerny zasahuje blízké bubáky v okruhu 85 px každých 0,25 s za 4 svaté poškození (základně 16 za sekundu). Svaté bonusy a odolnosti výsledek mění.',
    ability: 'Noční roh a poplach (30 s): v okruhu 900 px způsobí 110 fyzického poškození a vyvolá paniku až na 5 s. Skutečné trvání se snižuje podle Vůle nepřítele. Poškození se násobí aktivními bonusy.',
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
    weaponId: 'svecena_kropenka',
    weapon: 'Svěcená kropenka – široký vějíř svěcených kapek.',
    passive: 'Nemá samostatný časovaný pasiv. Jeho počáteční kropenka působí svaté poškození, které je zvlášť účinné proti nemrtvým a pekelným nepřátelům.',
    ability: 'Farní požehnání (35 s): zasáhne do 650 px. Běžným nečistým cílům způsobí téměř smrtící svaté poškození; bossům ubere 25 % maximální Kuráže (svatý násobič může účinek zvýšit až na 1,5×). Ostatní cíle dostanou 45 svatého poškození. Odolnosti ovlivní poškození i odhoz.',
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
    weaponId: 'kynuty_kolac',
    weapon: 'Kynutý koláč – odrážející se jídlo, které může bubáky přimět k mlsání.',
    passive: 'Nemá samostatný časovaný bojový pasiv. Má základní Štěstí 120; Kynutý koláč může zasažené bubáky přimět k mlsání a dočasně přerušit jejich útoky.',
    ability: 'Chléb se solí a vlídné slovo (45 s): zastaví čas pro scénku a zasáhne do 1 100 px. Pro každého bubáka zvolí typ Food/Holy s nižší odolností. U běžných cílů má zvolený účinek 75% šanci na mimořádně silný zásah; jinak je zklidní až na 8 s. Bossům udělí zklidnění na 10 s a 25 % max. Kuráže, násobené příslušným odporem/účinkem. Kamenní a snack-imunní bubáci mohou odolat potravinové větvi.',
    cooldownSeconds: 45,
    playstyle: 'Pomalejší podpůrná postava se silnou kontrolou velké části bojiště.',
  },
};
