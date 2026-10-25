import React from 'react';
import { KrejcarIcon } from './KrejcarIcon';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { JitrniceIcon } from './JitrniceIcon';
import { OsikovyPrutIcon } from './OsikovyPrutIcon';
import { HruskaIcon } from './HruskaIcon';
import { KynutyKolacIcon } from './KynutyKolacIcon';
import { OpravdovaKurazIcon } from './OpravdovaKurazIcon';
import { MedvediMastIcon } from './MedvediMastIcon';
import { OpravdovaKavaIcon } from './OpravdovaKavaIcon';
import { KrvaveJelitoIcon } from './KrvaveJelitoIcon';
import { ValecniceIcon } from './ValecniceIcon';
import { CesnekovaTopinkaIcon } from './CesnekovaTopinkaIcon';
import { KyselaOkurkaIcon } from './KyselaOkurkaIcon';
import { HunterConsumableIcon } from './HunterConsumableIcon';
import { PekelnyPokladIcon } from './PekelnyPokladIcon';
import { PomerancIcon } from './PomerancIcon';
import { PernikoveSrdceIcon } from './PernikoveSrdceIcon';
import { PernicekIcon } from './PernicekIcon';
import { HalapartnaIcon } from './HalapartnaIcon';
import { FajfkaIcon } from './FajfkaIcon';
import {
  LadaSettingsCogIcon,
  LadaCombatTextIcon,
  LadaPadlockIcon,
  LadaOpenPadlockIcon,
  LadaMagnifierIcon,
  LadaPlackaIcon,
  LadaBootsIcon,
  LadaDucatPouchIcon,
  LadaBeerMugIcon,
  LadaCrownIcon,
  LadaTrophyIcon,
  LadaCelebrationRibbonIcon,
  LadaBroomIcon,
  LadaRoosterIcon,
  LadaHorseshoeIcon,
  LadaCuckooClockIcon,
  LadaShieldIcon,
  LadaSwordIcon,
  LadaHearthFireIcon,
  LadaSnowflakeIcon,
  LadaLightningIcon,
  LadaWindGustIcon,
  LadaImpactBurstIcon,
  LadaBirchLogIcon,
  LadaChapelBellIcon,
  LadaRosemaryIcon,
  LadaFolkSkullIcon,
  LadaFolkHeartIcon,
  LadaRyeBreadIcon,
  LadaCroissantIcon,
  LadaCheeseWheelIcon,
  LadaGraniteStoneIcon,
  LadaWickerBasketIcon,
  LadaCandleIcon,
  LadaAxeIcon,
  LadaHuntingBowIcon,
  LadaCarnivalTargetIcon,
  LadaHornIcon,
  LadaFiddleMusicIcon,
  LadaPuppetToyIcon,
  LadaCottageIcon,
  LadaChurchSpireIcon,
  LadaStarGlintIcon,
  LadaFourLeafCloverIcon,
  LadaPineappleIcon,
  LadaRoastedPotatoIcon,
  LadaGrannyIcon,
  LadaGrandpaIcon,
  LadaDevilIcon,
  LadaWaterWaveIcon,
  LadaPawPrintIcon,
  LadaVillageGooseIcon,
  LadaSpruceTreeIcon,
  LadaFolkSheepIcon,
  LadaFarmOxIcon,
  LadaPondFrogIcon,
  LadaFairgroundMirrorIcon,
  LadaHempRopeIcon,
  LadaStoneWallIcon,
  LadaHoneyPotIcon,
  LadaWoolSockIcon,
  LadaBoneDiceIcon,
  LadaWarningSignIcon,
  LadaCheckmarkIcon,
  LadaCrossCancelIcon,
  LadaTavernArrowIcon,
  LadaQuestionMarkIcon,
  LadaLanternSparkIcon,
  LadaFoldedMapIcon,
  LadaKnapsackIcon,
  LadaStorageCrateIcon,
  LadaClayAmphoraIcon,
  LadaCompassIcon,
  LadaWatermillTurnIcon,
  LadaAshBucketIcon,
  LadaBalanceScalesIcon,
  LadaPainterPaletteIcon,
  LadaSlivovitzFlaskIcon,
  LadaPuppetBoothIcon,
  LadaShepherdsPipeIcon,
  LadaSmokedHamIcon,
  LadaMouseIcon,
  LadaHammerIcon,
  LadaPitchforkIcon,
  LadaGrainFlailIcon,
  LadaBeeSwarmIcon,
  LadaSoupBowlIcon,
  LadaPatchedCoatIcon,
  LadaHolyChalkIcon,
  LadaHorseradishRootIcon,
  LadaRehtackaIcon,
  LadaBoneButtonIcon,
  LadaBarunkaIcon,
  LadaBookIcon,
  LadaChestIcon,
  LadaSeedlingIcon,
  LadaAutumnLeafIcon,
  LadaTombstoneIcon,
  LadaDragonIcon,
  LadaCrowIcon,
  LadaLionIcon,
  LadaMoonIcon,
  LadaSleepIcon,
  LadaPauseIcon,
  LadaStatsLedgerIcon,
  LadaCastleRuinsIcon,
  LadaGhostIcon,
  LadaSnowmanIcon,
  LadaVillageDogIcon,
  LadaWatermanHatIcon,
  LadaMeadowFlowerIcon,
  LadaVillageSunIcon,
  LadaPasacekIcon,
  LadaKostelnikIcon,
} from './LadaCustomIcons';

export interface GameIconProps {
  icon: any;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * Self-contained Zero-Lag GPU CSS Keyframes (transform & opacity only)
 * for all traditional Czech village (Ladovská vesnice) multi-layer SVG icons.
 */
export const LADA_VILLAGE_ICON_KEYFRAMES = `
  @keyframes ladaFoodBob {
    0%, 100% {
      transform: translateY(0px) rotate(-1.5deg);
    }
    50% {
      transform: translateY(-2px) rotate(2deg);
    }
  }
  @keyframes ladaSteam {
    0% {
      transform: translateY(1.5px) scale(0.85);
      opacity: 0;
    }
    45% {
      transform: translateY(-2.5px) scale(1.04);
      opacity: 0.92;
    }
    100% {
      transform: translateY(-6.5px) scale(1.18);
      opacity: 0;
    }
  }
  @keyframes ladaMeleeSwing {
    0%, 100% {
      transform: rotate(-6deg);
    }
    50% {
      transform: rotate(6deg);
    }
  }
  @keyframes ladaRibbonFlutter {
    0%, 100% {
      transform: rotate(-8deg) scaleY(0.96);
    }
    50% {
      transform: rotate(9deg) scaleY(1.05);
    }
  }
  @keyframes ladaCandleFlame {
    0%, 100% {
      transform: scale(0.93) rotate(-3deg);
      opacity: 0.92;
    }
    50% {
      transform: scale(1.09) rotate(3deg);
      opacity: 1;
    }
  }
  @keyframes ladaHaloPulse {
    0%, 100% {
      transform: scale(0.88);
      opacity: 0.38;
    }
    50% {
      transform: scale(1.16);
      opacity: 0.85;
    }
  }
  @keyframes ladaAromaWave {
    0% {
      transform: translateY(1.5px) scale(0.88);
      opacity: 0.15;
    }
    50% {
      transform: translateY(-2.5px) scale(1.06);
      opacity: 0.95;
    }
    100% {
      transform: translateY(-6px) scale(1.2);
      opacity: 0;
    }
  }
  @keyframes ladaSmokeRing {
    0% {
      transform: translateY(1px) scale(0.65);
      opacity: 0.15;
    }
    45% {
      transform: translateY(-3px) scale(1.02);
      opacity: 0.9;
    }
    100% {
      transform: translateY(-7.5px) scale(1.32);
      opacity: 0;
    }
  }
  @keyframes ladaBeeWingFlutter {
    0%, 100% {
      transform: rotate(-14deg) scaleY(0.82);
      opacity: 0.85;
    }
    50% {
      transform: rotate(14deg) scaleY(1.15);
      opacity: 1;
    }
  }
  @keyframes ladaHolySplash {
    0% {
      transform: translateY(1px) scale(0.75);
      opacity: 0.25;
    }
    50% {
      transform: translateY(-2.5px) scale(1.12);
      opacity: 1;
    }
    100% {
      transform: translateY(-5px) scale(0.9);
      opacity: 0.15;
    }
  }
  @keyframes ladaFlowerSway {
    0%, 100% {
      transform: rotate(-5deg) translateY(0px);
    }
    50% {
      transform: rotate(5deg) translateY(-1.5px);
    }
  }
  @keyframes ladaFrostSparkle {
    0%, 100% {
      transform: scale(0.55) rotate(0deg);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.25) rotate(45deg);
      opacity: 1;
    }
  }
  @keyframes ladaTreasureRock {
    0%, 100% {
      transform: rotate(-3deg) scale(1);
    }
    50% {
      transform: rotate(3deg) scale(1.06);
    }
  }
  @keyframes ladaStarGlintTwinkle {
    0%, 100% {
      transform: scale(0.5) rotate(0deg);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.25) rotate(45deg);
      opacity: 1;
    }
  }
  @keyframes ladaMillWheelTurn {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes ladaBellSwing {
    0%, 100% {
      transform: rotate(-8deg);
    }
    50% {
      transform: rotate(8deg);
    }
  }
  @keyframes ladaBellClapper {
    0%, 100% {
      transform: translateX(-1.5px) rotate(-10deg);
    }
    50% {
      transform: translateX(1.5px) rotate(10deg);
    }
  }
  .lada-food-base {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaFoodBob 2.7s ease-in-out infinite;
  }
  .lada-steam-wisp-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaSteam 2.3s ease-in-out infinite;
  }
  .lada-steam-wisp-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaSteam 2.6s ease-in-out infinite 0.95s;
  }
  .lada-melee-base {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaMeleeSwing 2.4s ease-in-out infinite;
  }
  .lada-ribbon-detail {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaRibbonFlutter 1.9s ease-in-out infinite;
  }
  .lada-candle-flame {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaCandleFlame 1.5s ease-in-out infinite;
  }
  .lada-halo-glow {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaHaloPulse 2.1s ease-in-out infinite;
  }
  .lada-aroma-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaAromaWave 2.2s ease-in-out infinite;
  }
  .lada-aroma-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaAromaWave 2.5s ease-in-out infinite 0.85s;
  }
  .lada-smoke-ring-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaSmokeRing 2.4s ease-in-out infinite;
  }
  .lada-smoke-ring-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaSmokeRing 2.7s ease-in-out infinite 1.05s;
  }
  .lada-bee-wing-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBeeWingFlutter 0.38s ease-in-out infinite;
  }
  .lada-bee-wing-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBeeWingFlutter 0.42s ease-in-out infinite 0.15s;
  }
  .lada-splash-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaHolySplash 1.8s ease-in-out infinite;
  }
  .lada-splash-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaHolySplash 2.1s ease-in-out infinite 0.7s;
  }
  .lada-flower-sway {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaFlowerSway 2.6s ease-in-out infinite;
  }
  .lada-frost-sparkle-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaFrostSparkle 2.0s ease-in-out infinite;
  }
  .lada-frost-sparkle-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaFrostSparkle 2.4s ease-in-out infinite 0.8s;
  }
  .lada-treasure-base {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaTreasureRock 2.6s ease-in-out infinite;
  }
  .lada-star-glint-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaStarGlintTwinkle 2.1s ease-in-out infinite;
  }
  .lada-star-glint-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaStarGlintTwinkle 2.5s ease-in-out infinite 0.9s;
  }
  .lada-mill-wheel {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaMillWheelTurn 10s linear infinite;
  }
  .lada-bell-swing {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBellSwing 2.2s ease-in-out infinite;
  }
  .lada-bell-clapper {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBellClapper 2.2s ease-in-out infinite 0.25s;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-food-base,
    .lada-steam-wisp-1,
    .lada-steam-wisp-2,
    .lada-melee-base,
    .lada-ribbon-detail,
    .lada-candle-flame,
    .lada-halo-glow,
    .lada-aroma-1,
    .lada-aroma-2,
    .lada-smoke-ring-1,
    .lada-smoke-ring-2,
    .lada-bee-wing-1,
    .lada-bee-wing-2,
    .lada-splash-1,
    .lada-splash-2,
    .lada-flower-sway,
    .lada-frost-sparkle-1,
    .lada-frost-sparkle-2,
    .lada-treasure-base,
    .lada-star-glint-1,
    .lada-star-glint-2,
    .lada-mill-wheel,
    .lada-bell-swing,
    .lada-bell-clapper {
      animation: none !important;
    }
  }
`;

const svgWrapStyle = (size: string | number, style: React.CSSProperties = {}): React.CSSProperties => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'visible',
  flexShrink: 0,
  width: typeof size === 'number' ? `${size}px` : size,
  height: typeof size === 'number' ? `${size}px` : size,
  ...style,
});

export function isHalapartnaIcon(icon: any): boolean {
  return icon === 'kovana_halapartna' || icon === 'halapartna' || icon === 'wp_halberd' || icon === 'halberd';
}

export function isFajfkaIcon(icon: any): boolean {
  return icon === 'bylinkova_fajfka' || icon === 'fajfka' || icon === 'wp_fajfka' || icon === 'pipe' || icon === 'clay_pipe' || icon === '🚬';
}

export function isPernikoveSrdceIcon(icon: any): boolean {
  return icon === 'poutove_srdce' || icon === 'pernikove_srdce' || icon === 'fairground_heart' || icon === 'srdce_se_zrcatkem' || icon === '💝';
}

export function isPernicekIcon(icon: any): boolean {
  return icon === 'gingerbread' || icon === 'pernicek' || icon === 'perníček' || icon === 'pernicky' || icon === 'perníčky' || icon === '🍪';
}

export function isOrangeIcon(icon: any): boolean {
  return icon === 'pomeranc_z_orientu' || icon === 'pomeranc' || icon === 'orange' || icon === 'pomeranč' || icon === 'citrus' || icon === '🍊' || icon === 'kynuty_kolac_perk';
}

export function isKurazIcon(icon: any): boolean {
  return icon === 'medvedi_mast' || icon === 'medvedimast' || icon === 'mast' || icon === 'opravdova_kuraz' || icon === 'kuraz' || icon === 'courage' || icon === 'fist' || icon === 'opravdovakuraz' || icon === 'hrosi_kuze' || icon === '🐻' || icon === 'maska_medveda' || icon === 'bear';
}

export function isKavaIcon(icon: any): boolean {
  return icon === 'opravdova_kava' || icon === 'kava' || icon === 'coffee' || icon === 'cerna_kava' || icon === '☕';
}

export function isJelitoIcon(icon: any): boolean {
  return icon === 'krvave_jelito' || icon === 'jelito' || icon === 'blood_sausage' || icon === 'krvavejelito';
}

export function isBuchtaIcon(icon: any): boolean {
  return icon === 'czech_buchta' || icon === 'povidlove_buchty' || icon === 'wp_buns' || icon === '🥟' || icon === 'buns';
}

export function isKolacIcon(icon: any): boolean {
  return icon === 'kynuty_kolac' || icon === 'kolac' || icon === 'kynuty_kolac_s_makem' || icon === 'chodsky_kolac' || icon === 'svatebni_kolac' || icon === 'wp_kolac';
}

export function isHruskaIcon(icon: any): boolean {
  return icon === 'hruska' || icon === 'pear' || icon === '🍐' || icon === 'hruška';
}

export function isCoinIcon(icon: any): boolean {
  return icon === '🪙' || icon === 'coin' || icon === 'krejcar' || icon === 'coins';
}

export function isJitrniceIcon(icon: any): boolean {
  return icon === 'jitrnice' || icon === '🌭' || icon === 'sausage' || icon === 'jaternice' || icon === 'balzam';
}

export function isOsikovyPrutIcon(icon: any): boolean {
  return icon === 'osikovy_prut' || icon === 'cane' || icon === '🎋' || icon === 'prut' || icon === 'osika' || icon === 'soaked_cane' || icon === 'wp_cane';
}

export function isValecniceIcon(icon: any): boolean {
  return icon === 'valecnice' || icon === 'wp_valecnice' || icon === 'rollingpin' || icon === 'kucharka' || icon === 'hospodynka' || icon === '👩‍🍳';
}

export function isGarlicIcon(icon: any): boolean {
  return icon === 'cesnekova_topinka' || icon === 'cesnekova-topinka' || icon === 'wp_cesnekova-topinka' || icon === 'topinka' || icon === '🧄';
}

export function isPickleIcon(icon: any): boolean {
  return icon === 'kysela_okurka' || icon === 'kysela-okurka' || icon === 'kysele_okurky' || icon === 'wp_kysela-okurka' || icon === 'okurka' || icon === 'pickle' || icon === '🥒';
}

/* ============================================================================
   UPGRADED TRADITIONAL CZECH VILLAGE (JOSEF LADA) SVG ICONS
   ============================================================================ */

type UpgradedSvgProps = Omit<GameIconProps, 'icon'>;

const UpgradedPitchforkSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Kovářské vidle" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <ellipse cx="14" cy="33" rx="10" ry="2.2" fill="#1A1612" opacity="0.24" />
    <g className="lada-anim-rock lada-melee-base">
      {/* Ashwood handle with wood-grain ink lines & gouache shading */}
      <path
        d="M 5.5 31.5 L 19.5 17.5 L 21.8 19.8 L 7.8 33.8 Z"
        fill="#A66E40"
        stroke="#1A1612"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="7" y1="31.5" x2="20" y2="18.5" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <line x1="11" y1="28.5" x2="13" y2="26.5" stroke="#5E3A21" strokeWidth="1" strokeLinecap="round" />
      <line x1="15" y1="24.5" x2="17" y2="22.5" stroke="#5E3A21" strokeWidth="1" strokeLinecap="round" />

      {/* Fluttering folk ribbon (pentle) tied to handle */}
      <g className="lada-ribbon-detail">
        <path
          d="M 16 21 C 19 23, 22 26, 21 30 C 18 28, 17 25, 15 22 Z"
          fill="#C83E31"
          stroke="#1A1612"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 15 22 C 16 26, 15 29, 13 31 C 12 28, 13 25, 14 22 Z"
          fill="#DC2626"
          stroke="#1A1612"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="15.8" cy="21.5" r="1.8" fill="#FACC15" stroke="#1A1612" strokeWidth="1.3" />
      </g>

      {/* Forged iron socket with brass rivets */}
      <path
        d="M 17.5 16.5 L 20.5 13.5 L 23.5 16.5 L 20.5 19.5 Z"
        fill="#5E3A21"
        stroke="#1A1612"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="19.8" cy="17.2" r="1" fill="#FACC15" stroke="#1A1612" strokeWidth="0.7" />
      <circle cx="21.4" cy="15.6" r="1" fill="#FACC15" stroke="#1A1612" strokeWidth="0.7" />

      {/* Three forged iron prongs with pale steel gouache highlights */}
      <path
        d="M 17 18 C 14 14, 15 8, 24 3.5"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M 17 18 C 14 14, 15 8, 24 3.5"
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 19 20 C 23 23, 29 22, 33.5 13"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M 19 20 C 23 23, 29 22, 33.5 13"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line x1="20.5" y1="16.5" x2="30.5" y2="6.5" stroke="#1A1612" strokeWidth="3.6" strokeLinecap="round" />
      <line x1="20.5" y1="16.5" x2="30.5" y2="6.5" stroke="#FFFDF7" strokeWidth="1.8" strokeLinecap="round" />

      {/* Secondary detail: Twinkling blade tip glint */}
      <g className="lada-anim-glint lada-star-glint-1">
        <path
          d="M 30.5 3.5 L 31.3 5.7 L 33.5 6.5 L 31.3 7.3 L 30.5 9.5 L 29.7 7.3 L 27.5 6.5 L 29.7 5.7 Z"
          fill="#FFFDF7"
          stroke="#1A1612"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <circle cx="30.5" cy="6.5" r="1.1" fill="#FEF08A" />
      </g>
    </g>
  </svg>
);

const UpgradedFlailSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Dřevěný cep na obilí" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <ellipse cx="18" cy="33" rx="13" ry="2.4" fill="#1A1612" opacity="0.24" />
    <g className="lada-anim-rock lada-melee-base" strokeLinecap="round" strokeLinejoin="round">
      {/* Golden harvest wheat sprig behind handle */}
      <path d="M 8 28 Q 10 19 14 12" fill="none" stroke="#1A1612" strokeWidth="2.4" />
      <path d="M 8 28 Q 10 19 14 12" fill="none" stroke="#D9A036" strokeWidth="1.5" />
      <ellipse cx="12.5" cy="14" rx="1.6" ry="2.8" transform="rotate(-25 12.5 14)" fill="#FACC15" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="15" cy="11.5" rx="1.6" ry="2.8" transform="rotate(15 15 11.5)" fill="#FEF08A" stroke="#1A1612" strokeWidth="1.2" />

      {/* Ashwood handle (držák cepu) with wood-grain ink lines */}
      <path
        d="M 4.5 31.5 L 19.5 7.5 L 22.5 9.5 L 7.5 33.5 Z"
        fill="#A66E40"
        stroke="#1A1612"
        strokeWidth="2.2"
      />
      <line x1="6.5" y1="31" x2="20.2" y2="9" stroke="#FEF08A" strokeWidth="1.1" opacity="0.85" />
      <line x1="11" y1="23" x2="13.5" y2="19" stroke="#5E3A21" strokeWidth="1.1" />

      {/* Fluttering folk red ribbon (pentle) on the shaft */}
      <g className="lada-ribbon-detail">
        <path
          d="M 14 18 C 10 18, 7 20, 6 23 C 9 23, 12 21, 14 19 Z"
          fill="#C83E31"
          stroke="#1A1612"
          strokeWidth="1.4"
        />
        <circle cx="14.2" cy="18.2" r="1.6" fill="#FACC15" stroke="#1A1612" strokeWidth="1.1" />
      </g>

      {/* Leather cap & iron swivel loop (úvazek / svora) */}
      <circle cx="21.5" cy="8.2" r="2.5" fill="#5E3A21" stroke="#1A1612" strokeWidth="1.7" />
      <path
        d="M 22.5 7.2 C 26.8 3.2, 30.8 5.2, 28.8 9.5 C 28 11, 26.2 11.8, 25 12.2"
        fill="none"
        stroke="#1A1612"
        strokeWidth="2.6"
      />
      <path
        d="M 22.5 7.2 C 26.8 3.2, 30.8 5.2, 28.8 9.5"
        fill="none"
        stroke="#D9A036"
        strokeWidth="1.2"
      />

      {/* Heavy iron-bound oak beater (biják) with forged bands & brass rivets */}
      <path
        d="M 24.2 12.2 Q 27.8 10.4 30.2 13.2 L 34.2 25.2 Q 34.6 28 31.8 29.2 Q 28.8 30 27.5 27.2 L 22.8 15.8 Q 22 13.5 24.2 12.2 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.2"
      />
      <path
        d="M 25.2 13.8 L 29.2 12.4 L 33.2 24.2 L 29.2 25.8 Z"
        fill="#D97706"
        opacity="0.7"
      />
      <line x1="25.2" y1="14" x2="29" y2="25.5" stroke="#FEF08A" strokeWidth="1.2" opacity="0.85" />
      {/* Forged iron bands & rivets on beater */}
      <path d="M 23.2 15.5 L 29.8 13.2" stroke="#1A1612" strokeWidth="2.6" />
      <path d="M 26.5 24.5 L 33.2 22.2" stroke="#1A1612" strokeWidth="2.6" />
      <circle cx="26.5" cy="14.3" r="1" fill="#FACC15" />
      <circle cx="29.8" cy="23.3" r="1" fill="#FACC15" />

      {/* Secondary detail: Twinkling impact spark on beater */}
      <g className="lada-anim-glint lada-star-glint-1">
        <path
          d="M 32 25 L 32.8 27.2 L 35 28 L 32.8 28.8 L 32 31 L 31.2 28.8 L 29 28 L 31.2 27.2 Z"
          fill="#FEF08A"
          stroke="#1A1612"
          strokeWidth="0.8"
        />
      </g>
    </g>
  </svg>
);

const UpgradedHromnickaSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Hromnička" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    {/* Secondary detail: Pulsing warm golden halo */}
    <circle
      cx="18"
      cy="10"
      r="8.5"
      fill="#FEF08A"
      opacity="0.55"
      className="lada-halo-glow"
    />
    <circle
      cx="18"
      cy="10"
      r="5.5"
      fill="#FACC15"
      opacity="0.45"
      className="lada-halo-glow"
    />

    <g className="lada-anim-float lada-food-base">
      {/* Wrought-iron & brass saucer holder */}
      <ellipse cx="18" cy="31" rx="11" ry="3" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" />
      <ellipse cx="18" cy="30.5" rx="8" ry="1.8" fill="#D9A036" stroke="#1A1612" strokeWidth="1.4" />
      <path d="M 27 28.5 C 31.5 28, 31.5 33, 27 32.5" fill="none" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 27 28.5 C 31.5 28, 31.5 33, 27 32.5" fill="none" stroke="#D9A036" strokeWidth="1.2" strokeLinecap="round" />

      {/* Beeswax consecrated candle body with folk blue & red ribbons */}
      <rect
        x="14"
        y="16.5"
        width="8"
        height="13.5"
        rx="1.5"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="15" y="17.5" width="2.2" height="11.5" fill="#FFFDF7" opacity="0.85" />
      {/* Painted folk blue & red wax bands */}
      <path d="M 14.2 21.5 Q 18 23 21.8 21.5" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <path d="M 14.2 24.5 Q 18 26 21.8 24.5" fill="none" stroke="#C83E31" strokeWidth="2" strokeLinecap="round" />
      {/* Wax drip */}
      <path d="M 14 18.5 C 12.8 20.5, 13.2 22.5, 14.2 22" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.3" strokeLinecap="round" />

      {/* Consecrated rosemary sprig tied at base */}
      <path d="M 12 29 Q 15 26 18 28 Q 21 26 24 29" fill="none" stroke="#4D7C0F" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="18" cy="28" r="1.5" fill="#C83E31" stroke="#1A1612" strokeWidth="1" />

      {/* Wick */}
      <line x1="18" y1="14.5" x2="18" y2="16.8" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" />

      {/* Secondary detail: Flickering/dancing multi-tone candle flame */}
      <g className="lada-anim-flicker lada-candle-flame">
        <path
          d="M 18 3 C 18 3, 12.5 8.5, 13 12.2 C 13.4 14.8, 15.5 15.8, 18 15.8 C 20.5 15.8, 22.6 14.8, 23 12.2 C 23.5 8.5, 18 3, 18 3 Z"
          fill="#EA580C"
          stroke="#1A1612"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 18 5.2 C 18 5.2, 14.5 9.2, 14.8 12 C 15 13.8, 16.4 14.8, 18 14.8 C 19.6 14.8, 21 13.8, 21.2 12 C 21.5 9.2, 18 5.2, 18 5.2 Z"
          fill="#FACC15"
        />
        <ellipse cx="18" cy="12.4" rx="1.6" ry="2.2" fill="#FFFDF7" />
      </g>
    </g>
  </svg>
);

const UpgradedKropenkaSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Kropenka se svěcenou vodou" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <g className="lada-anim-rock lada-melee-base">
      {/* Turned beechwood & brass handle */}
      <path
        d="M 6 29 L 17 18 L 19.5 20.5 L 8.5 31.5 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <line x1="7.5" y1="29.5" x2="17.5" y2="19.5" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <circle cx="7" cy="30.5" r="2.2" fill="#D9A036" stroke="#1A1612" strokeWidth="1.6" />

      {/* Red parish ribbon tied to collar */}
      <g className="lada-ribbon-detail">
        <path d="M 16 20 C 17 24, 15 27, 13 28" fill="none" stroke="#1A1612" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 16 20 C 17 24, 15 27, 13 28" fill="none" stroke="#C83E31" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Perforated brass spherical aspergillum head (kropáč) */}
      <circle
        cx="21"
        cy="15"
        r="6.2"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.2"
      />
      <path d="M 17 12 A 4.8 4.8 0 0 1 24 11" fill="none" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Perforation holes & embossed band */}
      <line x1="16" y1="18" x2="24" y2="10" stroke="#5E3A21" strokeWidth="1.6" />
      <circle cx="20" cy="13" r="0.9" fill="#1A1612" />
      <circle cx="23" cy="14" r="0.9" fill="#1A1612" />
      <circle cx="22" cy="17" r="0.9" fill="#1A1612" />
    </g>

    {/* Secondary detail: Splashing consecrated holy water droplets & golden cross glint */}
    <g className="lada-splash-1">
      <path
        d="M 27 8 C 29 5, 32 5, 32 8 C 32 10.5, 29 10.5, 27 8 Z"
        fill="#38BDF8"
        stroke="#1A1612"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="7.5" r="0.8" fill="#FFFDF7" />
      <path
        d="M 19 6 C 19 3, 22 3, 21.5 6 C 21 8, 19 8, 19 6 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </g>
    <g className="lada-splash-2">
      <path
        d="M 28 15 C 31 14, 34 15.5, 33 18 C 32 19.8, 29.5 18, 28 15 Z"
        fill="#2563EB"
        stroke="#1A1612"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="31.2" cy="16.5" r="0.8" fill="#E0F2FE" />
      <path
        d="M 25 4 L 25.8 6.2 L 28 7 L 25.8 7.8 L 25 10 L 24.2 7.8 L 22 7 L 24.2 6.2 Z"
        fill="#FEF08A"
        stroke="#1A1612"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const UpgradedBeeSwarmSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Včelí roj" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <ellipse cx="18" cy="33" rx="12" ry="2.5" fill="#1A1612" opacity="0.24" />
    <g className="lada-anim-float lada-food-base">
      {/* Coiled golden straw skep hive (slaměný koš / úl) */}
      <path
        d="M 9.5 30.5 C 8.5 19.5, 12.5 13.5, 18 13.5 C 23.5 13.5, 27.5 19.5, 26.5 30.5 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path d="M 11.5 29.5 C 11 20, 14 15, 18 15" fill="none" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      {/* Woven straw coils */}
      <path d="M 10.5 26 Q 18 28 25.5 26" fill="none" stroke="#8C5A35" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 11.2 22 Q 18 24 24.8 22" fill="none" stroke="#8C5A35" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 12.8 18 Q 18 19.8 23.2 18" fill="none" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
      {/* Wooden baseboard & dark flight entrance */}
      <rect x="8" y="29.5" width="20" height="2.8" rx="1.2" fill="#5E3A21" stroke="#1A1612" strokeWidth="1.8" />
      <ellipse cx="18" cy="27" rx="2.6" ry="1.8" fill="#1A1612" />
      {/* Little folk red flower by hive */}
      <circle cx="11" cy="29" r="2" fill="#C83E31" stroke="#1A1612" strokeWidth="1.1" />
      <circle cx="11" cy="29" r="0.8" fill="#FEF08A" />

      {/* Bee 1 (upper right) with rapidly fluttering wings */}
      <g transform="translate(25.5, 9.5) rotate(-14)">
        <ellipse cx="0" cy="0" rx="4.2" ry="2.8" fill="#FACC15" stroke="#1A1612" strokeWidth="1.6" />
        <line x1="-1.2" y1="-2.4" x2="-1.2" y2="2.4" stroke="#1A1612" strokeWidth="1.5" />
        <line x1="1.2" y1="-2.4" x2="1.2" y2="2.4" stroke="#1A1612" strokeWidth="1.5" />
        <g className="lada-bee-wing-1">
          <ellipse cx="-0.8" cy="-3.4" rx="2.2" ry="3.2" transform="rotate(18 -0.8 -3.4)" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.1" />
          <ellipse cx="1.2" cy="-3.1" rx="1.8" ry="2.6" transform="rotate(-15 1.2 -3.1)" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1" />
        </g>
      </g>

      {/* Bee 2 (upper left) with rapidly fluttering wings */}
      <g transform="translate(9.5, 11) rotate(18)">
        <ellipse cx="0" cy="0" rx="3.8" ry="2.5" fill="#FACC15" stroke="#1A1612" strokeWidth="1.6" />
        <line x1="-1" y1="-2.2" x2="-1" y2="2.2" stroke="#1A1612" strokeWidth="1.4" />
        <line x1="1" y1="-2.2" x2="1" y2="2.2" stroke="#1A1612" strokeWidth="1.4" />
        <g className="lada-bee-wing-2">
          <ellipse cx="0.6" cy="-3.1" rx="2" ry="2.9" transform="rotate(-18 0.6 -3.1)" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.1" />
          <ellipse cx="-1.1" cy="-2.8" rx="1.6" ry="2.4" transform="rotate(15 -1.1 -2.8)" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1" />
        </g>
      </g>
    </g>
  </svg>
);

const UpgradedDevateroKvitiSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Devatero kvítí" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    {/* Base: Gentle flower sway */}
    <g className="lada-anim-rock lada-flower-sway" strokeLinecap="round" strokeLinejoin="round">
      {/* Herbal stems bundle */}
      <path d="M 14 33 Q 17 24 18 14" fill="none" stroke="#1A1612" strokeWidth="2.8" />
      <path d="M 14 33 Q 17 24 18 14" fill="none" stroke="#4D7C0F" strokeWidth="1.6" />
      <path d="M 22 33 Q 19 24 16 14" fill="none" stroke="#1A1612" strokeWidth="2.8" />
      <path d="M 22 33 Q 19 24 16 14" fill="none" stroke="#65A30D" strokeWidth="1.6" />

      {/* Meadow leaves */}
      <path d="M 16 22 C 10 21, 7 16, 10 13 C 14 13, 16 18, 16 22 Z" fill="#65A30D" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 20 22 C 26 21, 29 16, 26 13 C 22 13, 20 18, 20 22 Z" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 18 19 C 13 15, 11 9, 14 6 C 17 8, 18 13, 18 19 Z" fill="#86EFAC" stroke="#1A1612" strokeWidth="1.6" />

      {/* Red folk poppy / clover blossom (left) */}
      <circle cx="11" cy="11" r="4" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="11" cy="11" r="1.4" fill="#FEF08A" stroke="#1A1612" strokeWidth="0.9" />

      {/* Blue cornflower blossom (right) */}
      <circle cx="25" cy="11" r="4" fill="#2563EB" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="25" cy="11" r="1.5" fill="#38BDF8" stroke="#1A1612" strokeWidth="0.9" />

      {/* Central white & gold chamomile / St. John's wort flower */}
      <circle cx="18" cy="6.5" r="2.5" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="21.5" cy="9" r="2.5" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="20" cy="13" r="2.5" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="16" cy="13" r="2.5" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="14.5" cy="9" r="2.5" fill="#FFFDF7" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="18" cy="10" r="2.8" fill="#FACC15" stroke="#1A1612" strokeWidth="1.6" />

      {/* Festive red folk ribbon bow tying the bouquet */}
      <g className="lada-ribbon-detail">
        <path d="M 18 26 C 14 24, 12 28, 17 28 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
        <path d="M 18 26 C 22 24, 24 28, 19 28 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
        <circle cx="18" cy="26.5" r="1.8" fill="#FACC15" stroke="#1A1612" strokeWidth="1.2" />
      </g>
    </g>

    {/* Secondary detail: Twinkling golden pollen sparkles */}
    <g className="lada-anim-glint lada-star-glint-1">
      <path d="M 8 4 L 8.7 5.8 L 10.5 6.5 L 8.7 7.2 L 8 9 L 7.3 7.2 L 5.5 6.5 L 7.3 5.8 Z" fill="#FEF08A" stroke="#1A1612" strokeWidth="0.7" />
    </g>
    <g className="lada-star-glint-2">
      <path d="M 28.5 4.5 L 29.1 6 L 30.6 6.6 L 29.1 7.2 L 28.5 8.7 L 27.9 7.2 L 26.4 6.6 L 27.9 6 Z" fill="#FFFDF7" stroke="#1A1612" strokeWidth="0.7" />
    </g>
  </svg>
);

const UpgradedSnowballSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Sněhová koule" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <ellipse cx="18" cy="32.5" rx="11.5" ry="2.5" fill="#1A1612" opacity="0.22" />
    <g className="lada-anim-float lada-food-base">
      {/* Hand-packed Lada winter snowball with icy blue gouache shading & crisp ink outline */}
      <path
        d="M 18 5.5 C 25.5 5.5, 31 11, 30.5 18.5 C 30.2 25.8, 25 30.5, 17.5 30.5 C 10.5 30.5, 5.5 25.2, 5.5 18 C 5.5 10.8, 11 5.5, 18 5.5 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Deeper winter frost crescent shade */}
      <path
        d="M 26 9.5 C 29.5 14, 29 22, 23.5 26.5 C 18.5 30, 11.5 29, 8.5 24.5 C 14 27.5, 22 25.5, 25 19 C 26.5 15.5, 26.8 12, 26 9.5 Z"
        fill="#38BDF8"
        opacity="0.55"
      />
      <path
        d="M 23 25 C 19 28.5, 13 28.5, 9.5 25"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Pure snow highlight dome */}
      <ellipse cx="15" cy="13.5" rx="7.5" ry="5.2" transform="rotate(-18 15 13.5)" fill="#FFFDF7" opacity="0.92" />
      {/* Packed snow dimples */}
      <path d="M 12 18 Q 14 19.5 16 18.5" fill="none" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <path d="M 20 21 Q 22 22.5 24 21" fill="none" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Secondary detail: Frosty crystal sparkle pulses */}
    <g className="lada-anim-glint lada-frost-sparkle-1">
      <path
        d="M 9 6 L 10 8.8 L 12.8 9.8 L 10 10.8 L 9 13.6 L 8 10.8 L 5.2 9.8 L 8 8.8 Z"
        fill="#FFFDF7"
        stroke="#1A1612"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9.8" r="1.2" fill="#38BDF8" />
    </g>
    <g className="lada-frost-sparkle-2">
      <path
        d="M 28.5 7.5 L 29.3 9.7 L 31.5 10.5 L 29.3 11.3 L 28.5 13.5 L 27.7 11.3 L 25.5 10.5 L 27.7 9.7 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const UpgradedRoastedPotatoSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Pečený brambor" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <ellipse cx="18" cy="32" rx="13.5" ry="3" fill="#1A1612" opacity="0.28" />
    <g className="lada-anim-float lada-food-base">
      {/* Glowing hearth ash & ember bed */}
      <ellipse cx="18" cy="28.5" rx="13" ry="3.8" fill="#5E3A21" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="10" cy="28.5" r="1.4" fill="#EA580C" />
      <circle cx="26" cy="28.5" r="1.4" fill="#FACC15" />

      {/* Plump hearth-roasted potato body */}
      <path
        d="M 5.5 22.5 C 4.5 16.5, 9.5 12, 17.5 12 C 25.5 12, 31 16, 30.5 22.5 C 30 28, 24.5 30, 18 30 C 11 30, 6.2 27.5, 5.5 22.5 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Darker charred ash patches */}
      <path d="M 8 25 C 12 28.5, 23 28.5, 28 24.5 C 25 28.8, 12 29, 8 25 Z" fill="#5E3A21" opacity="0.8" />

      {/* Split-open top revealing steaming golden-yellow crumb & melting butter */}
      <path
        d="M 10.5 17.5 C 13.5 14.5, 22.5 14.5, 25.5 17.5 C 23.5 21.5, 12.5 21.5, 10.5 17.5 Z"
        fill="#FEF08A"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="18" cy="17.8" rx="4.2" ry="1.8" fill="#FACC15" />
      {/* Caraway & green herb flecks on butter */}
      <circle cx="16.5" cy="17.5" r="0.8" fill="#65A30D" />
      <circle cx="19.5" cy="18" r="0.8" fill="#65A30D" />
      <circle cx="18" cy="17" r="0.7" fill="#C83E31" />
    </g>

    {/* Secondary detail: 2 staggered rising cream/ink steam wisps */}
    <g className="lada-anim-steam-1 lada-steam-wisp-1">
      <path d="M 14 11 C 12 7.5, 16 4.5, 14 1.5" fill="none" stroke="#1A1612" strokeWidth="3.2" strokeLinecap="round" opacity="0.32" />
      <path d="M 14 11 C 12 7.5, 16 4.5, 14 1.5" fill="none" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" />
    </g>
    <g className="lada-anim-steam-2 lada-steam-wisp-2">
      <path d="M 22 11.5 C 24 8, 20 5, 22 2" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" opacity="0.32" />
      <path d="M 22 11.5 C 24 8, 20 5, 22 2" fill="none" stroke="#F3E9D2" strokeWidth="1.9" strokeLinecap="round" />
    </g>
  </svg>
);

const UpgradedOvenBuildingSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Pekárna u rozpálené pece" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <g className="lada-anim-float lada-food-base">
      {/* Whitewashed clay bakery oven dome */}
      <path
        d="M 5 30 L 5 16 C 5 9, 11 5, 18 5 C 25 5, 31 9, 31 16 L 31 30 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Red brick arch trim */}
      <path
        d="M 9 30 L 9 19 C 9 13.5, 13 11, 18 11 C 23 11, 27 13.5, 27 19 L 27 30"
        fill="none"
        stroke="#C83E31"
        strokeWidth="3.4"
        strokeDasharray="3 1.5"
      />
      {/* Dark oven hearth chamber */}
      <path
        d="M 10.5 30 L 10.5 19.5 C 10.5 15, 14 13, 18 13 C 22 13, 25.5 15, 25.5 19.5 L 25.5 30 Z"
        fill="#5E3A21"
        stroke="#1A1612"
        strokeWidth="2"
      />
      {/* Secondary detail: Pulsing hearth fire glow inside oven */}
      <g className="lada-anim-pulse lada-halo-glow">
        <ellipse cx="18" cy="24" rx="6" ry="4.5" fill="#EA580C" />
        <ellipse cx="18" cy="25" rx="4" ry="2.8" fill="#FACC15" />
        <ellipse cx="18" cy="25.5" rx="2.2" ry="1.5" fill="#FEF08A" />
      </g>
      {/* Golden-baked loaf on wooden baker's peel */}
      <ellipse cx="18" cy="28" rx="4.8" ry="2.4" fill="#D97706" stroke="#1A1612" strokeWidth="1.5" />
      <rect x="4" y="29.5" width="28" height="3" rx="1" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
    </g>
  </svg>
);

const UpgradedForgeBuildingSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Kovářská výheň" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    <g className="lada-anim-float lada-food-base">
      {/* Secondary detail: Pulsing forge hearth ember halo */}
      <g className="lada-anim-pulse lada-halo-glow">
        <circle cx="18" cy="14" r="9" fill="#EA580C" opacity="0.45" />
        <path
          d="M 13 18 C 12 12, 16 7, 18 5 C 20 7, 24 12, 23 18 Z"
          fill="#FACC15"
          stroke="#1A1612"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="14" r="2.5" fill="#FEF08A" />
      </g>
      {/* Heavy forged blacksmith anvil (kovadlina) on oak block */}
      <rect x="12" y="26" width="12" height="6" rx="1" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.1" />
      <path
        d="M 5 18 L 28 18 L 31 20.5 L 25 22.5 L 23 26 L 13 26 L 11 22.5 L 5 18 Z"
        fill="#334155"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <line x1="7" y1="19.5" x2="27" y2="19.5" stroke="#E0F2FE" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  </svg>
);

const UpgradedBoziMukaSvg: React.FC<UpgradedSvgProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={svgWrapStyle(size, style)} className={className} role="img" aria-label="Boží muka u polní cesty" {...props}>
    <style>{LADA_VILLAGE_ICON_KEYFRAMES}</style>
    {/* Secondary detail: Pulsing lantern halo */}
    <circle cx="18" cy="14" r="8.5" fill="#FEF08A" opacity="0.55" className="lada-halo-glow" />
    <g className="lada-anim-float lada-food-base">
      {/* Golden cross on top */}
      <line x1="18" y1="2.5" x2="18" y2="7.5" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="15.5" y1="4.8" x2="20.5" y2="4.8" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="18" y1="2.5" x2="18" y2="7.5" stroke="#FACC15" strokeWidth="1.2" strokeLinecap="round" />
      {/* Terracotta red roof */}
      <polygon points="18,7 10,12 26,12" fill="#C83E31" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Whitewashed stone shrine head with glowing niche */}
      <rect x="12" y="12" width="12" height="9" fill="#FFFDF7" stroke="#1A1612" strokeWidth="2.2" />
      <path d="M 15 19 L 15 15 C 15 13.2, 21 13.2, 21 15 L 21 19 Z" fill="#FACC15" stroke="#1A1612" strokeWidth="1.6" />
      <circle cx="18" cy="16.5" r="1.4" fill="#EA580C" className="lada-candle-flame" />
      {/* Stone pillar & floral wreath */}
      <rect x="14" y="21" width="8" height="10" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.1" />
      <path d="M 13 24 Q 18 26.5 23 24" fill="none" stroke="#65A30D" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="18" cy="25" r="1.4" fill="#C83E31" />
      <rect x="10" y="30.5" width="16" height="3" rx="1" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
    </g>
  </svg>
);

export const GameIcon: React.FC<GameIconProps> = ({ icon, size = '1.2em', className = '', style = {}, ...props }) => {
  // Normalize string for emoji interception
  const rawKey = typeof icon === 'string' ? icon.trim() : icon;
  const key = typeof rawKey === 'string' ? rawKey.replace(/\uFE0F/g, '') : rawKey;

  // 1. Existing dedicated icons with authentic Lada animations
  if (isPernicekIcon(key)) return <PernicekIcon size={size} className={className} style={style} {...props} />;
  if (isPernikoveSrdceIcon(key)) return <PernikoveSrdceIcon size={size} className={className} style={style} {...props} />;
  if (isHalapartnaIcon(key)) return <HalapartnaIcon size={size} className={className} style={style} {...props} />;
  if (isFajfkaIcon(key)) return <FajfkaIcon size={size} className={className} style={style} {...props} />;
  if (key === 'tepla_cikorka' || key === 'zejdlik_piva' || key === 'panak_koralky') {
    return <HunterConsumableIcon kind={key} size={size} className={className} style={style} {...props} />;
  }
  if (key === 'pekeln_poklad_drobny' || key === 'pekeln_poklad_stribrny' || key === 'pekeln_poklad_zlaty') {
    return <PekelnyPokladIcon kind={key} size={size} className={className} style={style} {...props} />;
  }
  if (isValecniceIcon(key)) return <ValecniceIcon size={size} className={className} style={style} {...props} />;
  if (isGarlicIcon(key)) return <CesnekovaTopinkaIcon size={size} className={className} style={style} {...props} />;
  if (isPickleIcon(key)) return <KyselaOkurkaIcon size={size} className={className} style={style} {...props} />;
  if (isOrangeIcon(key)) return <PomerancIcon size={size} className={className} style={style} {...props} />;
  if (isKolacIcon(key)) return <KynutyKolacIcon size={size} className={className} style={style} {...props} />;
  if (isHruskaIcon(key)) return <HruskaIcon size={size} className={className} style={style} {...props} />;
  if (isBuchtaIcon(key)) return <CzechBuchtaIcon size={size} className={className} style={style} {...props} />;
  if (isCoinIcon(key)) return <KrejcarIcon size={size} className={className} style={style} {...props} />;
  if (isJitrniceIcon(key)) return <JitrniceIcon size={size} className={className} style={style} {...props} />;
  if (isOsikovyPrutIcon(key)) return <OsikovyPrutIcon size={size} className={className} style={style} soaked={key === 'soaked_cane'} {...props} />;
  if (isKurazIcon(key)) return <MedvediMastIcon size={size} className={className} style={style} {...props} />;
  if (isKavaIcon(key)) return <OpravdovaKavaIcon size={size} className={className} style={style} {...props} />;
  if (isJelitoIcon(key)) return <KrvaveJelitoIcon size={size} className={className} style={style} {...props} />;

  // 2. Upgraded Czech Village Weapons, Projectiles, Auras & Buildings
  if (key === 'kovarske_vidle' || key === 'wp_pitchfork' || key === '🔱' || key === 'pitchfork' || key === 'vidle') {
    return <UpgradedPitchforkSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'dreveny_cep' || key === 'wp_flail' || key === '🌾' || key === 'flail' || key === 'cep' || key === 'wheat' || key === 'obili' || key === 'snop') {
    return <UpgradedFlailSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'hromnicka' || key === 'wp_hromnicka') {
    return <UpgradedHromnickaSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'svecena_kropenka' || key === 'wp_holywater' || key === 'holywater' || key === 'kropenka') {
    return <UpgradedKropenkaSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'vceli_roj' || key === 'wp_bees' || key === '🐝' || key === 'bees' || key === 'vcely' || key === 'roj' || key === 'ul') {
    return <UpgradedBeeSwarmSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'devatero_kviti' || key === 'devatery_kviti' || key === 'wp_herbs' || key === 'herbs') {
    return <UpgradedDevateroKvitiSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'snehova_koule' || key === 'wp_snowball' || key === 'snowball') {
    return <UpgradedSnowballSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === '🥔' || key === 'potato' || key === 'horky_brambor' || key === 'brambor' || key === 'wp_potato') {
    return <UpgradedRoastedPotatoSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'oven' || key === 'pekarna' || key === 'pec') {
    return <UpgradedOvenBuildingSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'forge' || key === 'kovarna' || key === 'vyhen') {
    return <UpgradedForgeBuildingSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'boziMuka' || key === 'bozi_muka') {
    return <UpgradedBoziMukaSvg size={size} className={className} style={style} {...props} />;
  }

  if (key === 'regen' || key === 'zahradka' || key === 'bylinkova_zahradka') {
    return <UpgradedDevateroKvitiSvg size={size} className={className} style={style} {...props} />;
  }

  // 3. Metaphorical Czech Village icons & Emoji Interceptions
  // Settings & Mills
  if (key === '⚙' || key === 'settings' || key === 'mlyn' || key === 'mill' || key === 'gear' || key === 'cog') {
    return <LadaSettingsCogIcon size={size} className={className} style={style} {...props} />;
  }

  // Combat Texts, Scrolls, Chronicles
  if (key === '💬' || key === '📜' || key === 'combat_text' || key === 'scroll' || key === 'speech' || key === 'chronicle' || key === 'chat') {
    return <LadaCombatTextIcon size={size} className={className} style={style} {...props} />;
  }

  // Bestiary book & fairytale books
  if (key === '📖' || key === 'book' || key === 'kniha' || key === 'bestiary' || key === 'bestiar') {
    return <LadaBookIcon size={size} className={className} style={style} {...props} />;
  }

  // Painted chest & rewards
  if (key === '🎁' || key === 'chest' || key === 'truhla' || key === 'malovana_truhla' || key === 'poklad') {
    return <LadaChestIcon size={size} className={className} style={style} {...props} />;
  }

  // Padlocks & Security
  if (key === '🔒' || key === 'lock' || key === 'locked' || key === 'padlock') {
    return <LadaPadlockIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🔓' || key === 'unlocked' || key === 'unlock' || key === 'padlock_open') {
    return <LadaOpenPadlockIcon size={size} className={className} style={style} {...props} />;
  }

  // Magnifiers & Reveal Tiers
  if (key === '🔎' || key === '🔍' || key === 'magnifier' || key === 'reveal' || key === 'search' || key === 'eye' || key === 'oko' || key === '👁') {
    return <LadaMagnifierIcon size={size} className={className} style={style} {...props} />;
  }

  // Škvarková placka
  if (key === '🫓' || key === 'skvarkova_placka' || key === 'placka') {
    return <LadaPlackaIcon size={size} className={className} style={style} {...props} />;
  }

  // Toulavé boty & walking
  if (key === '👢' || key === '🥾' || key === 'toulave_boty' || key === 'sedmimile_krpce' || key === 'boots' || key === 'skorne' || key === 'walk' || key === '🚶' || key === 'chuze' || key === 'krok' || key === '🏃' || key === 'run' || key === 'beh') {
    return <LadaBootsIcon size={size} className={className} style={style} {...props} />;
  }

  // Zlatý dukát & linen pouch
  if (key === '💰' || key === 'zlaty_dukat' || key === 'dukat' || key === 'money' || key === 'pouch') {
    return <LadaDucatPouchIcon size={size} className={className} style={style} {...props} />;
  }

  // Beer mug & tavern
  if (key === '🍺' || key === '🍻' || key === 'beer' || key === 'korbel' || key === 'hospodsky_korbel' || key === 'hospoda' || key === 'tavernShield' || key === 'pivni_tacek') {
    return <LadaBeerMugIcon size={size} className={className} style={style} {...props} />;
  }

  // Crown
  if (key === '👑' || key === 'crown' || key === 'koruna') {
    return <LadaCrownIcon size={size} className={className} style={style} {...props} />;
  }

  // Trophy & Celebration
  if (key === '🏆' || key === 'trophy' || key === 'pohar') {
    return <LadaTrophyIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🎉' || key === 'celebration' || key === 'party' || key === 'pentle') {
    return <LadaCelebrationRibbonIcon size={size} className={className} style={style} {...props} />;
  }

  // Birch broom
  if (key === '🧹' || key === 'broom' || key === 'koste') {
    return <LadaBroomIcon size={size} className={className} style={style} {...props} />;
  }

  // Painted rooster
  if (key === '🐓' || key === 'rooster' || key === 'kohoutek' || key === 'hlineny_kohoutek') {
    return <LadaRoosterIcon size={size} className={className} style={style} {...props} />;
  }

  // Forged horseshoe
  if (key === '🧲' || key === 'horseshoe' || key === 'kovarska_podkova' || key === 'podkova' || key === 'podkova_pro_stesti' || key === 'magnet') {
    return <LadaHorseshoeIcon size={size} className={className} style={style} {...props} />;
  }

  // Cuckoo clock
  if (key === '⏰' || key === 'clock' || key === 'cuckoo' || key === 'kukacky' || key === 'hodiny' || key === 'vyrezavane_kukacky') {
    return <LadaCuckooClockIcon size={size} className={className} style={style} {...props} />;
  }

  // Seedling & Spring
  if (key === '🌱' || key === 'seedling' || key === 'sazenicka' || key === 'klicek' || key === 'predjari') {
    return <LadaSeedlingIcon size={size} className={className} style={style} {...props} />;
  }

  // Autumn leaf
  if (key === '🍂' || key === '🍁' || key === 'autumn_leaf' || key === 'leaf' || key === 'list' || key === 'podzim') {
    return <LadaAutumnLeafIcon size={size} className={className} style={style} {...props} />;
  }

  // Tombstone & cemetery
  if (key === '🪦' || key === '⚰' || key === 'tomb' || key === 'tombstone' || key === 'nahrobek' || key === 'hrbitov' || key === 'undead') {
    return <LadaTombstoneIcon size={size} className={className} style={style} {...props} />;
  }

  // Dragon
  if (key === '🐉' || key === 'dragon' || key === 'drak' || key === 'trojhlavy_drak') {
    return <LadaDragonIcon size={size} className={className} style={style} {...props} />;
  }

  // Crow / Raven
  if (key === '🐦‍⬛' || key === '🐦' || key === 'crow' || key === 'vrana' || key === 'havran' || key === 'hejno_vran') {
    return <LadaCrowIcon size={size} className={className} style={style} {...props} />;
  }

  // Lion
  if (key === '🦁' || key === 'lion' || key === 'lev' || key === 'kralovstvi') {
    return <LadaLionIcon size={size} className={className} style={style} {...props} />;
  }

  // Moon
  if (key === '🌙' || key === 'moon' || key === 'mesic' || key === 'noc') {
    return <LadaMoonIcon size={size} className={className} style={style} {...props} />;
  }

  // Sleep
  if (key === '💤' || key === 'sleep' || key === 'spanek' || key === 'vycerpany') {
    return <LadaSleepIcon size={size} className={className} style={style} {...props} />;
  }

  // Pause
  if (key === '⏸' || key === 'pause' || key === 'pauza') {
    return <LadaPauseIcon size={size} className={className} style={style} {...props} />;
  }

  // Stats ledger / Tavern tally
  if (key === '📊' || key === 'stats' || key === 'chart' || key === 'statistika' || key === 'ucet') {
    return <LadaStatsLedgerIcon size={size} className={className} style={style} {...props} />;
  }

  // Shield & Defense
  if (key === '🛡' || key === 'shield' || key === 'stit' || key === 'defense') {
    return <LadaShieldIcon size={size} className={className} style={style} {...props} />;
  }

  // Swords & Weapons
  if (key === '🗡' || key === '⚔' || key === 'sword' || key === 'swords' || key === 'weapons' || key === 'weapons_mastery' || key === 'blade' || key === 'sabla') {
    return <LadaSwordIcon size={size} className={className} style={style} {...props} />;
  }

  // Hearth fire
  if (key === '🔥' || key === 'fire' || key === 'flame' || key === 'ohen' || key === 'plamen') {
    return <LadaHearthFireIcon size={size} className={className} style={style} {...props} />;
  }

  // Frost & Ice
  if (key === '❄' || key === '🧊' || key === 'frost' || key === 'ice' || key === 'snowflake' || key === 'mraz' || key === 'vlocka') {
    return <LadaSnowflakeIcon size={size} className={className} style={style} {...props} />;
  }

  // Ladovský snowman (Sněhulák)
  if (key === '☃' || key === '☃️' || key === 'snowman' || key === 'snehulak') {
    return <LadaSnowmanIcon size={size} className={className} style={style} {...props} />;
  }

  // Lightning
  if (key === '⚡' || key === 'lightning' || key === 'blesk') {
    return <LadaLightningIcon size={size} className={className} style={style} {...props} />;
  }

  // Wind gust
  if (key === '💨' || key === 'wind' || key === 'dash' || key === 'vitr') {
    return <LadaWindGustIcon size={size} className={className} style={style} {...props} />;
  }

  // Impact burst
  if (key === '💥' || key === 'impact' || key === 'prask' || key === 'hit') {
    return <LadaImpactBurstIcon size={size} className={className} style={style} {...props} />;
  }

  // Birch log & sukovice
  if (key === '🪵' || key === 'wood' || key === 'log' || key === 'wood_log' || key === 'povestna_sukovice' || key === 'sukovice') {
    return <LadaBirchLogIcon size={size} className={className} style={style} {...props} />;
  }

  // Chapel bell
  if (key === '🔔' || key === 'bell' || key === 'zvonice' || key === 'zvon' || key === 'zvonek_zatoulane_kozy') {
    return <LadaChapelBellIcon size={size} className={className} style={style} {...props} />;
  }

  // Rosemary & herbs
  if (key === '🌿' || key === 'herb' || key === 'rosemary' || key === 'rozmaryn' || key === 'svate_kadidlo') {
    return <LadaRosemaryIcon size={size} className={className} style={style} {...props} />;
  }

  // Meadow flower / Blatouch / Chamomile
  if (key === '🌼' || key === 'flower' || key === 'kvet' || key === 'blatouch' || key === 'hermanek' || key === 'kopretina' || key === 'kviti') {
    return <LadaMeadowFlowerIcon size={size} className={className} style={style} {...props} />;
  }

  // Skull
  if (key === '💀' || key === 'skull' || key === 'lebka' || key === 'smrt') {
    return <LadaFolkSkullIcon size={size} className={className} style={style} {...props} />;
  }

  // Heart & HP
  if (key === '❤' || key === '♥' || key === 'heart' || key === 'hp' || key === 'srdce') {
    return <LadaFolkHeartIcon size={size} className={className} style={style} {...props} />;
  }

  // Bread & rolls
  if (key === '🍞' || key === '🥖' || key === 'bread' || key === 'chleb') {
    return <LadaRyeBreadIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🥐' || key === 'croissant' || key === 'rohlik') {
    return <LadaCroissantIcon size={size} className={className} style={style} {...props} />;
  }

  // Cheese & Tvarůžek
  if (key === '🧀' || key === 'cheese' || key === 'olomoucky_tvaruzek' || key === 'tvaruzek' || key === 'ulezely_syrecek') {
    return <LadaCheeseWheelIcon size={size} className={className} style={style} {...props} />;
  }

  // Fieldstone
  if (key === '🪨' || key === 'stone' || key === 'kamen') {
    return <LadaGraniteStoneIcon size={size} className={className} style={style} {...props} />;
  }

  // Wicker basket
  if (key === '🧺' || key === 'basket' || key === 'kosik' || key === 'nuse' || key === 'babicka_apron') {
    return <LadaWickerBasketIcon size={size} className={className} style={style} {...props} />;
  }

  // Candle, lantern & light
  if (key === '🕯' || key === '🪔' || key === 'candle' || key === 'svicka' || key === 'lantern' || key === 'petrolejka' || key === 'lucerna' || key === 'pytlacka_lucerna') {
    return <LadaCandleIcon size={size} className={className} style={style} {...props} />;
  }

  // Axe
  if (key === '🪓' || key === 'axe' || key === 'sekyra') {
    return <LadaAxeIcon size={size} className={className} style={style} {...props} />;
  }

  // Hunting bow & hunter
  if (key === '🏹' || key === 'bow' || key === 'luk' || key === 'hunter' || key === 'lovec' || key === 'lovci') {
    return <LadaHuntingBowIcon size={size} className={className} style={style} {...props} />;
  }

  // Target
  if (key === '🎯' || key === 'target' || key === 'terc') {
    return <LadaCarnivalTargetIcon size={size} className={className} style={style} {...props} />;
  }

  // Horn (sound / mute / post horn)
  if (key === '🔊' || key === '📯' || key === 'sound' || key === 'sound_on' || key === 'soundEnabled' || key === 'soundEffectsEnabled' || key === 'zvuk' || key === 'horn' || key === 'roh' || key === 'ponocny_horn') {
    return <LadaHornIcon muted={false} size={size} className={className} style={style} {...props} />;
  }
  if (key === '🔇' || key === 'mute' || key === 'sound_off' || key === 'soundDisabled' || key === 'ztlumit' || key === 'muted') {
    return <LadaHornIcon muted={true} size={size} className={className} style={style} {...props} />;
  }

  // Music & tavern notes
  if (key === '🎵' || key === '🎶' || key === 'music' || key === 'music_on' || key === 'musicEnabled' || key === 'hudba' || key === 'nota' || key === 'vesela_mysl' || key === 'svanda_bagpipes') {
    return <LadaFiddleMusicIcon muted={false} size={size} className={className} style={style} {...props} />;
  }
  if (key === 'music_off' || key === 'musicDisabled') {
    return <LadaFiddleMusicIcon muted={true} size={size} className={className} style={style} {...props} />;
  }

  // Puppet toy / controller & mobile controls
  if (key === '🎮' || key === '🕹' || key === 'game' || key === 'gamepad' || key === 'controller' || key === 'joystick' || key === 'mobile' || key === 'loutka') {
    return <LadaPuppetToyIcon size={size} className={className} style={style} {...props} />;
  }

  // Cottage & Village buildings
  if (key === '🏘' || key === 'cottage' || key === 'village' || key === 'statl' || key === 'chaloupka' || key === 'vesnice') {
    return <LadaCottageIcon size={size} className={className} style={style} {...props} />;
  }

  // Ruined castle & ramparts (5th level - Ruined Castle / Zlenice)
  if (key === '🏰' || key === 'castle' || key === 'hrad' || key === 'zricenina' || key === 'ruins' || key === 'zlenice') {
    return <LadaCastleRuinsIcon size={size} className={className} style={style} {...props} />;
  }

  // Folkloric spectral White Lady ghost (Bílá paní / Strašidlo)
  if (key === '👻' || key === 'ghost' || key === 'duch' || key === 'bila_pani' || key === 'strasidlo' || key === 'bludicka') {
    return <LadaGhostIcon size={size} className={className} style={style} {...props} />;
  }

  // Church
  if (key === '⛪' || key === 'church' || key === 'kostel' || key === 'kaple') {
    return <LadaChurchSpireIcon size={size} className={className} style={style} {...props} />;
  }

  // Village noon sun / Polednice
  if (key === '☀' || key === '☀️' || key === 'sun' || key === 'slunce' || key === 'polednice' || key === 'jasno') {
    return <LadaVillageSunIcon size={size} className={className} style={style} {...props} />;
  }

  // Star glint & Sparkle
  if (key === '✨' || key === '🌟' || key === '✦' || key === 'star' || key === 'sparkle' || key === 'sparkles' || key === 'spark' || key === 'hvezda') {
    return <LadaStarGlintIcon size={size} className={className} style={style} {...props} />;
  }

  // Four-leaf clover & Luck
  if (key === '🍀' || key === 'clover' || key === 'luck' || key === 'stesti' || key === 'ctyrlistek') {
    return <LadaFourLeafCloverIcon size={size} className={className} style={style} {...props} />;
  }

  // Pineapple
  if (key === '🍍' || key === 'pineapple' || key === 'ananas' || key === 'arcivzacny_ananas') {
    return <LadaPineappleIcon size={size} className={className} style={style} {...props} />;
  }

  // Grandmother & Grandfather & Barunka & Hunters (Pasáček, Kostelník, Poutník)
  if (key === '👵' || key === 'granny' || key === 'babicka' || key === 'babicka_barunka') {
    return <LadaGrannyIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🧓' || key === 'grandpa' || key === 'dedecek') {
    return <LadaGrandpaIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '👧' || key === 'barunka' || key === 'girl' || key === 'devce' || key === 'divka' || key === 'devcatko') {
    return <LadaBarunkaIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === 'pasacek' || key === 'shepherd') {
    return <LadaPasacekIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === 'kostelnik' || key === 'sexton') {
    return <LadaKostelnikIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === 'wanderer' || key === 'tulak' || key === 'poutnik' || key === 'krajanek') {
    return <OsikovyPrutIcon size={size} className={className} style={style} {...props} />;
  }

  // Čert / Devil
  if (key === '👹' || key === '😈' || key === 'devil' || key === 'cert' || key === 'rarach') {
    return <LadaDevilIcon size={size} className={className} style={style} {...props} />;
  }

  // Waterman's top hat / Vodnický cylinder
  if (key === '🎩' || key === 'tophat' || key === 'cylinder' || key === 'klobouk' || key === 'vodnik_klobouk' || key === 'hastrman_klobouk') {
    return <LadaWatermanHatIcon size={size} className={className} style={style} {...props} />;
  }

  // Water wave
  if (key === '🌊' || key === '💧' || key === 'wave' || key === 'water' || key === 'drop' || key === 'kapka' || key === 'vlna' || key === 'studanka') {
    return <LadaWaterWaveIcon size={size} className={className} style={style} {...props} />;
  }

  // Animal Paw print
  if (key === '🐾' || key === 'paw' || key === 'stopa') {
    return <LadaPawPrintIcon size={size} className={className} style={style} {...props} />;
  }

  // Village dog / Voříšek
  if (key === '🐕' || key === '🐕‍🦺' || key === 'dog' || key === 'pes' || key === 'vorisek' || key === 'hafik') {
    return <LadaVillageDogIcon size={size} className={className} style={style} {...props} />;
  }

  // Goose
  if (key === '🪿' || key === 'goose' || key === 'husa' || key === 'splaseny_houser' || key === 'wp_splaseny_houser' || key === 'houser' || key === 'gander') {
    return <LadaVillageGooseIcon size={size} className={className} style={style} {...props} />;
  }

  // Spruce pine
  if (key === '🌲' || key === 'pine' || key === 'smrk' || key === 'strom' || key === 'forest' || key === 'les') {
    return <LadaSpruceTreeIcon size={size} className={className} style={style} {...props} />;
  }

  // Sheep & Ox
  if (key === '🐑' || key === 'sheep' || key === 'ovce' || key === 'beranek') {
    return <LadaFolkSheepIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🐂' || key === 'ox' || key === 'vul') {
    return <LadaFarmOxIcon size={size} className={className} style={style} {...props} />;
  }

  // Frog
  if (key === '🐸' || key === 'frog' || key === 'zaba') {
    return <LadaPondFrogIcon size={size} className={className} style={style} {...props} />;
  }

  // Fairground mirror
  if (key === '🪞' || key === 'mirror' || key === 'zrcadlo') {
    return <LadaFairgroundMirrorIcon size={size} className={className} style={style} {...props} />;
  }

  // Hemp rope & Whip
  if (key === '🪢' || key === 'rope' || key === 'lano' || key === 'provaz' || key === 'formansky_bic' || key === 'wp_whip' || key === 'whip' || key === 'scarecrow') {
    return <LadaHempRopeIcon size={size} className={className} style={style} {...props} />;
  }

  // Wall
  if (key === '🧱' || key === 'wall' || key === 'zed' || key === 'hradba') {
    return <LadaStoneWallIcon size={size} className={className} style={style} {...props} />;
  }

  // Honey pot
  if (key === '🍯' || key === 'honey' || key === 'med' || key === 'bezedny_krajac_povidel') {
    return <LadaHoneyPotIcon size={size} className={className} style={style} {...props} />;
  }

  // Wool sock
  if (key === '🧦' || key === 'sock' || key === 'socks' || key === 'ponozka' || key === 'fusekle' || key === 'babicciny_kousave_fusekle') {
    return <LadaWoolSockIcon size={size} className={className} style={style} {...props} />;
  }

  // Dice & numbers
  if (key === '🎲' || key === 'dice' || key === 'kostka' || key === 'numbers' || key === '🔢') {
    return <LadaBoneDiceIcon size={size} className={className} style={style} {...props} />;
  }

  // Warning & signs
  if (key === '⚠' || key === '🚨' || key === 'warning' || key === 'vystraha') {
    return <LadaWarningSignIcon size={size} className={className} style={style} {...props} />;
  }

  // Checkmark & status
  if (key === '✅' || key === '✓' || key === 'check' || key === 'checkmark' || key === 'hotovo') {
    return <LadaCheckmarkIcon size={size} className={className} style={style} {...props} />;
  }

  // Cancel / Cross / Forbidden
  if (key === '❌' || key === '✕' || key === '🛑' || key === 'cancel' || key === 'zrusit' || key === 'cross' || key === 'forbidden' || key === '🚫') {
    return <LadaCrossCancelIcon size={size} className={className} style={style} {...props} />;
  }

  // Tavern direction pointer (left and right)
  if (key === 'arrow_left' || key === '←') {
    return <LadaTavernArrowIcon direction="left" size={size} className={className} style={style} {...props} />;
  }
  if (key === '➔' || key === '→' || key === 'arrow' || key === 'sipka') {
    return <LadaTavernArrowIcon direction="right" size={size} className={className} style={style} {...props} />;
  }

  // Question mark
  if (key === '❓' || key === '?' || key === 'question' || key === 'otaznik') {
    return <LadaQuestionMarkIcon size={size} className={className} style={style} {...props} />;
  }

  // Lantern & Ideas
  if (key === '💡' || key === 'idea' || key === 'hint' || key === 'lucerna') {
    return <LadaLanternSparkIcon size={size} className={className} style={style} {...props} />;
  }

  // Folded map
  if (key === '🗺' || key === 'map' || key === 'mapa') {
    return <LadaFoldedMapIcon size={size} className={className} style={style} {...props} />;
  }

  // Knapsack
  if (key === '🎒' || key === '🧳' || key === 'knapsack' || key === 'bag' || key === 'kufr' || key === 'brasna' || key === 'batoh') {
    return <LadaKnapsackIcon size={size} className={className} style={style} {...props} />;
  }

  // Storage crate
  if (key === '📦' || key === 'crate' || key === 'bedynka' || key === 'box') {
    return <LadaStorageCrateIcon size={size} className={className} style={style} {...props} />;
  }

  // Amphora & jugs
  if (key === '🏺' || key === 'amphora' || key === 'dzban' || key === 'urn' || key === 'slivovice_splash') {
    return <LadaClayAmphoraIcon size={size} className={className} style={style} {...props} />;
  }

  // Compass
  if (key === '🧭' || key === 'compass' || key === 'kompas') {
    return <LadaCompassIcon size={size} className={className} style={style} {...props} />;
  }

  // Reload / Refresh
  if (key === '🔄' || key === 'refresh' || key === 'reload' || key === 'turn') {
    return <LadaWatermillTurnIcon size={size} className={className} style={style} {...props} />;
  }

  // Trash bucket
  if (key === '🗑' || key === 'trash' || key === 'delete' || key === 'smazat') {
    return <LadaAshBucketIcon size={size} className={className} style={style} {...props} />;
  }

  // Scales
  if (key === '⚖' || key === 'scales' || key === 'balance' || key === 'vahy') {
    return <LadaBalanceScalesIcon size={size} className={className} style={style} {...props} />;
  }

  // Painter's palette & pictures
  if (key === '🎨' || key === 'palette' || key === 'art' || key === 'paleta' || key === 'picture' || key === 'obraz' || key === '🖼') {
    return <LadaPainterPaletteIcon size={size} className={className} style={style} {...props} />;
  }

  // Slivovitz flask
  if (key === '🧪' || key === 'flask' || key === 'potion' || key === 'slivovice') {
    return <LadaSlivovitzFlaskIcon size={size} className={className} style={style} {...props} />;
  }

  // Puppet theatre booth
  if (key === '🎬' || key === 'theatre' || key === 'divadlo') {
    return <LadaPuppetBoothIcon size={size} className={className} style={style} {...props} />;
  }

  // Shepherd's flute
  if (key === '🪈' || key === 'pastyrska_pistala' || key === 'flute' || key === 'pistalka') {
    return <LadaShepherdsPipeIcon size={size} className={className} style={style} {...props} />;
  }

  // Smoked ham & meats
  if (key === '🍖' || key === '🥩' || key === 'meat' || key === 'ham' || key === 'kyta') {
    return <LadaSmokedHamIcon size={size} className={className} style={style} {...props} />;
  }

  // Curious field mouse Rézinka
  if (key === '🐭' || key === 'mouse' || key === 'myska' || key === 'rezinka') {
    return <LadaMouseIcon size={size} className={className} style={style} {...props} />;
  }

  // Blacksmith forge hammer
  if (key === '🔨' || key === 'hammer' || key === 'kladivo') {
    return <LadaHammerIcon size={size} className={className} style={style} {...props} />;
  }

  // Steaming rustic soup bowl / garlic broth / podmáslí
  if (key === '🥣' || key === 'soup' || key === 'polevka' || key === 'miska' || key === 'krajac_na_podmasli' || key === 'podmasli') {
    return <LadaSoupBowlIcon size={size} className={className} style={style} {...props} />;
  }

  // Shepherd's patched coat / hubertus
  if (key === '🧥' || key === 'coat' || key === 'kabat' || key === 'hubertus' || key === 'zaplacovany_kabat') {
    return <LadaPatchedCoatIcon size={size} className={className} style={style} {...props} />;
  }

  // Consecrated chalk / K+M+B / crayon
  if (key === '🖍' || key === '🖍️' || key === 'chalk' || key === 'krida' || key === 'crayon' || key === 'trikralova_krida') {
    return <LadaHolyChalkIcon size={size} className={className} style={style} {...props} />;
  }

  // Spicy horseradish root / křen
  if (key === '🫚' || key === 'ginger' || key === 'horseradish' || key === 'kren' || key === 'koren' || key === 'strouhany_kren') {
    return <LadaHorseradishRootIcon size={size} className={className} style={style} {...props} />;
  }

  // Easter wooden ratchet rattle / řehtačka
  if (key === '🪇' || key === 'rattle' || key === 'rehtacka' || key === 'klapacka' || key === 'masopust_rattle') {
    return <LadaRehtackaIcon size={size} className={className} style={style} {...props} />;
  }

  // Carved horn/bone coat button / knoflík
  if (key === '🔘' || key === 'button' || key === 'knoflik' || key === 'kominik_button') {
    return <LadaBoneButtonIcon size={size} className={className} style={style} {...props} />;
  }

  // Fallback for non-emoji text or unknown element
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontSize: typeof size === 'number' ? `${size}px` : size,
        ...style,
      }}
      {...props}
    >
      {icon}
    </span>
  );
};

export {
  PernicekIcon,
  HalapartnaIcon,
  FajfkaIcon,
  ValecniceIcon,
  CesnekovaTopinkaIcon,
  KyselaOkurkaIcon,
  CzechBuchtaIcon,
  KynutyKolacIcon,
  HruskaIcon,
  KrejcarIcon,
  JitrniceIcon,
  OsikovyPrutIcon,
  OpravdovaKurazIcon,
  MedvediMastIcon,
  OpravdovaKavaIcon,
  KrvaveJelitoIcon,
  LadaCastleRuinsIcon,
  LadaGhostIcon,
  LadaSnowmanIcon,
  LadaVillageDogIcon,
  LadaWatermanHatIcon,
  LadaMeadowFlowerIcon,
  LadaVillageSunIcon,
  LadaPasacekIcon,
  LadaKostelnikIcon,
  LadaGrannyIcon,
  LadaBarunkaIcon,
};
