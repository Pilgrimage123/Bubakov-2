/**
 * Sprite-Baking Atlas for Common Bubáks (Atlas běžných strašidel)
 *
 * Pre-renders key animation frames of high-frequency wave mobs into offscreen
 * bitmap canvases, enabling fast blitting via ctx.drawImage in real gameplay
 * without losing authentic Josef Lada styling.
 *
 * ADR 0017, ADR 0029
 */

import { Lada } from './ladaRenderer';

export type BakedBubakId =
  | 'rarach'
  | 'mysak'
  | 'bludicka'
  | 'hejkal'
  | 'divozenka'
  | 'certik'
  | 'skeleton'
  | 'kostlivec'
  | 'vrana'
  | 'zmrzlik'
  | 'tajici_snehulak'
  | 'vodnicek'
  | 'skodnik'
  | 'topivec'
  | 'plivnik'
  | 'sotek'
  | 'zaba'
  | 'kostlivec_kosa'
  | 'umrlec'
  | 'pisar'
  | 'hrobnik'
  | 'bubak'
  | 'hromotluk'
  | 'stodolnik'
  | 'cerny_pes'
  | 'hastrman'
  | 'blatouch'
  | 'meluzina'
  | 'mrazik'
  | 'severak'
  | 'vanicka'
  | 'polednice'
  | 'klekanice'
  | 'drevorubec'
  | 'ohnivy_muz'
  | 'drab'
  | 'zbojnik'
  | 'jiskrivec'
  | 'ohnivy_pes'
  | 'bila_pani'
  | 'zbrojnos'
  | 'nocni_mura'
  | 'jezinka_mraziva'
  | 'mrazivy_obr'
  | 'zkazena_kraslice'
  | 'carodejnice_koste'
  | 'rehtackar'
  | 'beranek'
  | 'carodejnice_stara'
  | 'vrchni_carodejnice'
  | 'rusalka'
  | 'ohnivy_sudlicka'
  | 'svatojansky_vladce'
  | 'chroust'
  | 'pampeliska_chmyri'
  | 'pampeliska_chmyricko'
  | 'roj_polnich_mysaku'
  | 'pekelny_roj_sazovniku'
  | 'rak_ricni'
  | 'boruvkovy_diblik'
  | 'ohniva_kobyla'
  | 'mrazovy_skritek'
  | 'snehulak'
  | 'carodejnice_zaspalka'
  | 'ledovi_muzi'
  | 'cert_sekac'
  | 'kralovsky_vele_rak'
  | 'kralovska_polednice'
  | 'polni_krecek'
  | 'zitna_baba'
  | 'kulovy_blesk'
  | 'krecek_obilnik'
  | 'zitna_matka'
  | 'hromotluk_marketa'
  | 'bezhlavy_rytir'
  | 'drak'
  | 'srpnove_cmelak'
  | 'zlatohlavek'
  | 'polni_mysice'
  | 'kralovsky_cmelak'
  | 'zlatohlavek_zrout'
  | 'dozinkovy_chasnik'
  | 'netopyr_usatec'
  | 'vyr_velky'
  | 'svestkovy_srsen'
  | 'kralovsky_srsen'
  | 'povidlovy_cert'
  | 'posvicensky_hospodar'
  | 'kvilici_meluzina'
  | 'bramborova_mandelinka'
  | 'podzimni_strasak'
  | 'kralovsky_havran'
  | 'hastrman_podzimni'
  | 'drak_vetrnik'
  | 'dusickova_bludicka'
  | 'cert_rybnikar'
  | 'vele_stika'
  | 'svatomartinska_husa'
  | 'divoky_kanec'
  | 'lesni_pytlak'
  | 'kralovska_husa'
  | 'martinsky_jezdec'
  | 'listopadovy_mrazivec'
  | 'mlzny_prizrak'
  | 'cerny_myslivec'
  | 'kanec_knour'
  | 'ledovy_rampousik'
  | 'snehova_jezinka'
  | 'cert_s_pytlem'
  | 'maskarni_kozel'
  | 'mikulassky_cert'
  | 'mraziva_sova'
  | 'jezdec_meluziny'
  | 'kral_mrazik'
  | 'zimni_vrabec'
  | 'kluk_na_sankach'
  | 'ledovy_skritek'
  | 'trikralovy_kolednik'
  | 'chumelenice'
  | 'nocni_zavejnik'
  | 'mrazivy_havran'
  | 'obri_snehulak'
  | 'trikralovy_jezdec'
  | 'vladce_chumelenice'
  | 'ledova_klekanice'
  | 'kostlivec_s_kosou'
  | 'perchta_s_nozem'
  | 'masopustni_laufr'
  | 'baba_s_nusi'
  | 'masopustni_kominik'
  | 'koblihovy_rarach'
  | 'masopustni_krasojezdec'
  | 'masopustni_medved'
  | 'slamennik_obr'
  | 'rychtar_masek'
  | 'nocni_smrtak'
  | 'smutecni_maskara'
  | 'masopustni_basa'
  | 'plivnik_uhlik'
  | 'nocni_kobold'
  | 'umrlec_basista'
  | 'bakchus_s_pivnim_soudkem';

export interface BakedFrame {
  canvas: any;
  ctx: any;
  flippedCanvas: any;
  flippedCtx: any;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

interface MobConfig {
  size: number;
  drawFn: (ctx: any, x: number, y: number, time: number, vx: number, panicked: boolean) => void;
}

const PALETTE_FILTERS: Record<string, string> = {
  crimson: 'sepia(0.85) saturate(4.5) hue-rotate(320deg) brightness(0.92)',
  soot: 'brightness(0.48) contrast(1.4) drop-shadow(0 0 2px #EA580C)',
  bog: 'sepia(0.8) hue-rotate(65deg) saturate(2.4) brightness(0.85)',
  steel: 'grayscale(0.85) contrast(1.3) brightness(1.1)',
};

export const MOB_CONFIGS: Record<BakedBubakId, MobConfig> = {
  rarach: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawRarach(c, x, y, t, v, p) },
  mysak: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawMysak(c, x, y, t, v, p) },
  bludicka: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawBludicka(c, x, y, t, v, p) },
  hejkal: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHejkal(c, x, y, t, v, p) },
  divozenka: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawDivozenka(c, x, y, t, v, p) },
  certik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawCertik(c, x, y, t, v, p) },
  skeleton: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawSkeleton(c, x, y, t, v, p) },
  kostlivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawSkeleton(c, x, y, t, v, p) },
  vrana: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawStageCrow(c, x, y, t, v, p) },
  zmrzlik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawZmrzlik(c, x, y, t, v, p) },
  tajici_snehulak: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawMeltingSnowman(c, x, y, t, v, p) },
  vodnicek: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawVodnicek(c, x, y, t, v, p) },
  skodnik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawSkodnik(c, x, y, t, v, p) },
  topivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawTopivec(c, x, y, t, v, p) },
  plivnik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawPlivnik(c, x, y, t, v, p) },
  sotek: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawSotek(c, x, y, t, v, p) },
  zaba: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawZaba(c, x, y, t, v, p) },
  kostlivec_kosa: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawSkeletonScythe(c, x, y, t, v, p) },
  umrlec: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawUmrlec(c, x, y, t, v, p) },
  pisar: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawPisar(c, x, y, t, v, p) },
  hrobnik: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHrobnik(c, x, y, t, v, p) },
  bubak: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawBubak(c, x, y, t, v, p) },
  hromotluk: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawHromotluk(c, x, y, t, v, p) },
  stodolnik: { size: 136, drawFn: (c, x, y, t, v, p) => Lada.drawStodolnik(c, x, y, t, v, p) },
  cerny_pes: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawCernyPes(c, x, y, t, v, p) },
  hastrman: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHastrman(c, x, y, t, v, p) },
  blatouch: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawBlatouch(c, x, y, t, v, p) },
  meluzina: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawMeluzina(c, x, y, t, v, p) },
  mrazik: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawMrazik(c, x, y, t, v, p) },
  severak: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawSeverak(c, x, y, t, v, p) },
  vanicka: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawVanicka(c, x, y, t, v, p) },
  polednice: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawPolednice(c, x, y, t, v, p) },
  klekanice: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawKlekanice(c, x, y, t, v, p) },
  drevorubec: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawDrevorubec(c, x, y, t, v, p) },
  ohnivy_muz: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawOhnivyMuz(c, x, y, t, v, p) },
  drab: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawDrab(c, x, y, t, v, p) },
  zbojnik: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawZbojnik(c, x, y, t, v, p) },
  jiskrivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawJiskrivec(c, x, y, t, v, p) },
  ohnivy_pes: { size: 136, drawFn: (c, x, y, t, v, p) => Lada.drawOhnivyPes(c, x, y, t, v, p) },
  bila_pani: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawBilaPani(c, x, y, t, v, p) },
  zbrojnos: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawZbrojnos(c, x, y, t, v, p) },
  nocni_mura: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawNocniMura(c, x, y, t, v, p) },
  jezinka_mraziva: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawFrostJezinka(c, x, y, t, v, p) },
  mrazivy_obr: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawFrostGiant(c, x, y, t, v, p) },
  zkazena_kraslice: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawZkazenaKraslice(c, x, y, t, v, p) },
  carodejnice_koste: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawBroomWitch(c, x, y, t, v, p) },
  rehtackar: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawRehtackar(c, x, y, t, v, p) },
  beranek: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawBeranek(c, x, y, t, v, p) },
  carodejnice_stara: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawOldWitch(c, x, y, t, v, p) },
  vrchni_carodejnice: { size: 180, drawFn: (c, x, y, t, v, p) => Lada.drawSupremeWitch(c, x, y, t, v, p) },
  rusalka: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawRusalka(c, x, y, t, v, p) },
  ohnivy_sudlicka: { size: 160, drawFn: (c, x, y, t, v, p) => (Lada as any).drawOhnivySudlicka(c, x, y, t, v, p) },
  svatojansky_vladce: { size: 184, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSvatojanskyVladce(c, x, y, t, v, p) },
  chroust: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawChroust(c, x, y, t, v, p) },
  pampeliska_chmyri: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawDandelionSprite(c, x, y, t, v, p) },
  pampeliska_chmyricko: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawDandelionSprite(c, x, y, t, v, p) },
  roj_polnich_mysaku: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawRojPolnichMysaku(c, x, y, t, v, p) },
  pekelny_roj_sazovniku: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawPekelnyRojSazovniku(c, x, y, t, v, p) },
  rak_ricni: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawRakRicni(c, x, y, t, v, p) },
  boruvkovy_diblik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawBoruvkovyDiblik(c, x, y, t, v, p) },
  ohniva_kobyla: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawOhnivaKobyla(c, x, y, t, v, p) },
  mrazovy_skritek: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawFrostling(c, x, y, t, v, p, true) },
  snehulak: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawSnehulak(c, x, y, t, v, p, false) },
  carodejnice_zaspalka: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawBroomWitchZaspalka(c, x, y, t, v, p) },
  ledovi_muzi: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawLedoviMuzi(c, x, y, t, v, p) },
  cert_sekac: { size: 168, drawFn: (c, x, y, t, v, p) => Lada.drawCertSekac(c, x, y, t, v, p) },
  kralovsky_vele_rak: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawKralovskyVeleRak(c, x, y, t, v, p) },
  kralovska_polednice: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawKralovskaPolednice(c, x, y, t, v, p) },
  polni_krecek: { size: 96, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPolniKrecek(c, x, y, t, v, p) },
  zitna_baba: { size: 136, drawFn: (c, x, y, t, v, p) => (Lada as any).drawZitnaBaba(c, x, y, t, v, p) },
  kulovy_blesk: { size: 112, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKulovyBlesk(c, x, y, t, v, p) },
  krecek_obilnik: { size: 152, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKrecekObilnik(c, x, y, t, v, p) },
  zitna_matka: { size: 164, drawFn: (c, x, y, t, v, p) => (Lada as any).drawZitnaMatka(c, x, y, t, v, p) },
  hromotluk_marketa: { size: 184, drawFn: (c, x, y, t, v, p) => (Lada as any).drawHromotlukMarketa(c, x, y, t, v, p) },
  bezhlavy_rytir: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawBezhlavyRytir(c, x, y, t, v, p) },
  drak: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawDrak(c, x, y, t, v, p) },
  srpnove_cmelak: { size: 104, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSrpnoveCmelak(c, x, y, t, v, p) },
  zlatohlavek: { size: 112, drawFn: (c, x, y, t, v, p) => (Lada as any).drawZlatohlavek(c, x, y, t, v, p) },
  polni_mysice: { size: 96, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPolniMysice(c, x, y, t, v, p) },
  kralovsky_cmelak: { size: 152, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKralovskyCmelak(c, x, y, t, v, p) },
  zlatohlavek_zrout: { size: 164, drawFn: (c, x, y, t, v, p) => (Lada as any).drawZlatohlavekZrout(c, x, y, t, v, p) },
  dozinkovy_chasnik: { size: 184, drawFn: (c, x, y, t, v, p) => (Lada as any).drawDozinkovyChasnik(c, x, y, t, v, p) },
  netopyr_usatec: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawNetopyrUsatec(c, x, y, t, v, p) },
  vyr_velky: { size: 192, drawFn: (c, x, y, t, v, p) => (Lada as any).drawVyrVelky(c, x, y, t, v, p) },
  svestkovy_srsen: { size: 108, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSvestkovySrsen(c, x, y, t, v, p) },
  kralovsky_srsen: { size: 156, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKralovskySrsen(c, x, y, t, v, p) },
  povidlovy_cert: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPovidlovyCert(c, x, y, t, v, p) },
  posvicensky_hospodar: { size: 188, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPosvicenskyHospodar(c, x, y, t, v, p) },
  kvilici_meluzina: { size: 188, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKviliciMeluzina(c, x, y, t, v, p) },
  bramborova_mandelinka: { size: 96, drawFn: (c, x, y, t, v, p) => (Lada as any).drawBramborovaMandelinka(c, x, y, t, v, p) },
  podzimni_strasak: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPodzimniStrasak(c, x, y, t, v, p) },
  kralovsky_havran: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKralovskyHavran(c, x, y, t, v, p) },
  hastrman_podzimni: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawHastrmanPodzimni(c, x, y, t, v, p) },
  drak_vetrnik: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawDrakVetrnik(c, x, y, t, v, p) },
  dusickova_bludicka: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawDusickovaBludicka(c, x, y, t, v, p) },
  cert_rybnikar: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawCertRybnikar(c, x, y, t, v, p) },
  vele_stika: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawVeleStika(c, x, y, t, v, p) },
  svatomartinska_husa: { size: 128, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSvatomartinskaHusa(c, x, y, t, v, p) },
  divoky_kanec: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawDivokyKanec(c, x, y, t, v, p) },
  lesni_pytlak: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawLesniPytlak(c, x, y, t, v, p) },
  kralovska_husa: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKralovskaHusa(c, x, y, t, v, p) },
  martinsky_jezdec: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMartinskyJezdec(c, x, y, t, v, p) },
  listopadovy_mrazivec: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawListopadovyMrazivec(c, x, y, t, v, p) },
  mlzny_prizrak: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMlznyPrizrak(c, x, y, t, v, p) },
  cerny_myslivec: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawCernyMyslivec(c, x, y, t, v, p) },
  kanec_knour: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKanecKnour(c, x, y, t, v, p) },
  ledovy_rampousik: { size: 96, drawFn: (c, x, y, t, v, p) => (Lada as any).drawLedovyRampousik(c, x, y, t, v, p) },
  snehova_jezinka: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSnehovaJezinka(c, x, y, t, v, p) },
  cert_s_pytlem: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawCertSPytlem(c, x, y, t, v, p) },
  maskarni_kozel: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMaskarniKozel(c, x, y, t, v, p) },
  mikulassky_cert: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMikulasskyCert(c, x, y, t, v, p) },
  mraziva_sova: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMrazivaSova(c, x, y, t, v, p) },
  jezdec_meluziny: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawJezdecMeluziny(c, x, y, t, v, p) },
  kral_mrazik: { size: 200, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKralMrazik(c, x, y, t, v, p) },
  zimni_vrabec: { size: 96, drawFn: (c, x, y, t, v, p) => (Lada as any).drawZimniVrabec(c, x, y, t, v, p) },
  kluk_na_sankach: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKlukNaSankach(c, x, y, t, v, p) },
  ledovy_skritek: { size: 112, drawFn: (c, x, y, t, v, p) => (Lada as any).drawLedovySkritek(c, x, y, t, v, p) },
  trikralovy_kolednik: { size: 156, drawFn: (c, x, y, t, v, p) => (Lada as any).drawTrikralovyKolednik(c, x, y, t, v, p) },
  chumelenice: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawChumelenice(c, x, y, t, v, p) },
  nocni_zavejnik: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawNocniZavejnik(c, x, y, t, v, p) },
  mrazivy_havran: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMrazivyHavran(c, x, y, t, v, p) },
  obri_snehulak: { size: 188, drawFn: (c, x, y, t, v, p) => (Lada as any).drawObriSnehulak(c, x, y, t, v, p) },
  trikralovy_jezdec: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawTrikralovyJezdec(c, x, y, t, v, p) },
  vladce_chumelenice: { size: 200, drawFn: (c, x, y, t, v, p) => (Lada as any).drawVladceChumelenice(c, x, y, t, v, p) },
  ledova_klekanice: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawLedovaKlekanice(c, x, y, t, v, p) },
  kostlivec_s_kosou: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKostlivecSKosou(c, x, y, t, v, p) },
  perchta_s_nozem: { size: 200, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPerchtaSNozem(c, x, y, t, v, p) },
  masopustni_laufr: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMasopustniLaufr(c, x, y, t, v, p) },
  baba_s_nusi: { size: 180, drawFn: (c, x, y, t, v, p) => (Lada as any).drawBabaSNusi(c, x, y, t, v, p) },
  masopustni_kominik: { size: 156, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMasopustniKominik(c, x, y, t, v, p) },
  koblihovy_rarach: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawKoblihovyRarach(c, x, y, t, v, p) },
  masopustni_krasojezdec: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMasopustniKrasojezdec(c, x, y, t, v, p) },
  masopustni_medved: { size: 196, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMasopustniMedved(c, x, y, t, v, p) },
  slamennik_obr: { size: 200, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSlamennikObr(c, x, y, t, v, p) },
  rychtar_masek: { size: 208, drawFn: (c, x, y, t, v, p) => (Lada as any).drawRychtarMasek(c, x, y, t, v, p) },
  nocni_smrtak: { size: 176, drawFn: (c, x, y, t, v, p) => (Lada as any).drawNocniSmrtak(c, x, y, t, v, p) },
  smutecni_maskara: { size: 168, drawFn: (c, x, y, t, v, p) => (Lada as any).drawSmutecniMaskara(c, x, y, t, v, p) },
  masopustni_basa: { size: 184, drawFn: (c, x, y, t, v, p) => (Lada as any).drawMasopustniBasa(c, x, y, t, v, p) },
  plivnik_uhlik: { size: 148, drawFn: (c, x, y, t, v, p) => (Lada as any).drawPlivnikUhlik(c, x, y, t, v, p) },
  nocni_kobold: { size: 192, drawFn: (c, x, y, t, v, p) => (Lada as any).drawNocniKobold(c, x, y, t, v, p) },
  umrlec_basista: { size: 200, drawFn: (c, x, y, t, v, p) => (Lada as any).drawUmrlecBasista(c, x, y, t, v, p) },
  bakchus_s_pivnim_soudkem: { size: 212, drawFn: (c, x, y, t, v, p) => (Lada as any).drawBakchusSPivnimSoudkem(c, x, y, t, v, p) },
};

export class BakedBubakAtlas {
  private frames: Map<string, BakedFrame> = new Map();
  private bakedMobs: Set<string> = new Set();
  private initialized = false;
  private readonly frameSteps = 12; // 12 evenly spaced walk-cycle phases (~23 FPS playback, zero aliasing)

  public init(): void {
    this.initialized = true;
  }

  public ensureMobBaked(mobId: string, palette?: string): void {
    const resolvedId = (mobId === 'skeleton' ? 'kostlivec' : mobId) as BakedBubakId;
    const paletteSuffix = palette && PALETTE_FILTERS[palette] ? `_${palette}` : '';
    const bakeKey = `${resolvedId}${paletteSuffix}`;
    if (this.bakedMobs.has(bakeKey)) return;

    const cfg = MOB_CONFIGS[resolvedId];
    if (!cfg) return;

    this.bakedMobs.add(bakeKey);
    if (resolvedId === 'kostlivec') {
      this.bakedMobs.add(`skeleton${paletteSuffix}`);
    }

    const canvasSize = cfg.size;
    const originX = canvasSize / 2;
    const originY = canvasSize / 2;
    const filterStr = palette ? PALETTE_FILTERS[palette] : undefined;

    // Pre-bake both normal and panicked states across discrete animation steps with pre-flipped left/right canvases
    for (const panicked of [false, true]) {
      const cyclePeriod = (Math.PI * 2) / (panicked ? 20 : 12);
      for (let step = 0; step < this.frameSteps; step++) {
        const animTime = (step / this.frameSteps) * cyclePeriod;
        const { canvas, ctx } = this.createFrameCanvas(canvasSize, canvasSize);

        ctx.save();
        if (filterStr) {
          ctx.filter = filterStr;
        }
        ctx.translate(originX, originY);
        const prevRole = (Lada as any).currentRole;
        (Lada as any).currentRole = 'enemy';
        try {
          cfg.drawFn(ctx, 0, 0, animTime, 1, panicked);
        } finally {
          (Lada as any).currentRole = prevRole;
        }
        ctx.restore();

        const { canvas: flippedCanvas, ctx: flippedCtx } = this.createFrameCanvas(canvasSize, canvasSize);
        flippedCtx.save();
        flippedCtx.translate(canvasSize, 0);
        flippedCtx.scale(-1, 1);
        flippedCtx.drawImage(canvas, 0, 0);
        flippedCtx.restore();

        const frameObj: BakedFrame = {
          canvas,
          ctx,
          flippedCanvas,
          flippedCtx,
          width: canvasSize,
          height: canvasSize,
          originX,
          originY,
        };

        // Standard key
        const key = `${bakeKey}_${step}_${panicked ? 1 : 0}`;
        this.frames.set(key, frameObj);
        if (resolvedId === 'kostlivec') {
          this.frames.set(`skeleton${paletteSuffix}_${step}_${panicked ? 1 : 0}`, frameObj);
        }

        // Also set legacy key for backward compatibility with pilot tests
        if (!panicked && !paletteSuffix) {
          this.frames.set(`${resolvedId}_${step}`, frameObj);
          if (resolvedId === 'kostlivec') {
            this.frames.set(`skeleton_${step}`, frameObj);
          }
        }
      }
    }
  }

  private createFrameCanvas(width: number, height: number): { canvas: any; ctx: any } {
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      return { canvas, ctx };
    }

    // Vitest / Node headless fallback
    const ctx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      setTransform: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      ellipse: () => {},
      rect: () => {},
      roundRect: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: (text: string) => ({ width: text.length * 8 }),
      filter: '',
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      globalAlpha: 1,
      font: '',
    };
    const canvas = { width, height, getContext: () => ctx };
    return { canvas, ctx };
  }

  public getFrame(mobId: string, animTime: number, panicked = false, palette?: string): BakedFrame | undefined {
    if (!this.initialized) this.init();
    const resolvedId = mobId === 'skeleton' ? 'kostlivec' : mobId;
    const paletteSuffix = palette && PALETTE_FILTERS[palette] ? `_${palette}` : '';
    const bakeKey = `${resolvedId}${paletteSuffix}`;
    if (!this.bakedMobs.has(bakeKey)) {
      this.ensureMobBaked(resolvedId, palette);
    }
    const cyclePeriod = (Math.PI * 2) / (panicked ? 20 : 12);
    const step = Math.floor(((Math.abs(animTime) / cyclePeriod) * this.frameSteps) % this.frameSteps);
    return (
      this.frames.get(`${bakeKey}_${step}_${panicked ? 1 : 0}`) ||
      this.frames.get(`${resolvedId}_${step}_${panicked ? 1 : 0}`) ||
      this.frames.get(`${resolvedId}_${step}`) ||
      this.frames.get(`${mobId}_${step}_${panicked ? 1 : 0}`) ||
      this.frames.get(`${mobId}_${step}`)
    );
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    mobId: string,
    x: number,
    y: number,
    animTime: number,
    vx = 1,
    panicked = false,
    palette?: string
  ): boolean {
    const frame = this.getFrame(mobId, animTime, panicked, palette);
    if (!frame || typeof ctx.drawImage !== 'function') return false;

    const srcCanvas = vx < 0 ? (frame.flippedCanvas || frame.canvas) : frame.canvas;
    ctx.drawImage(
      srcCanvas,
      Math.round(x - frame.originX),
      Math.round(y - frame.originY)
    );
    return true;
  }
}

let globalBakedBubakAtlas: BakedBubakAtlas | null = null;

export function getGlobalBakedBubakAtlas(): BakedBubakAtlas {
  if (!globalBakedBubakAtlas) {
    globalBakedBubakAtlas = new BakedBubakAtlas();
    globalBakedBubakAtlas.init();
  }
  return globalBakedBubakAtlas;
}

export function resetGlobalBakedBubakAtlas(): void {
  globalBakedBubakAtlas = null;
}
