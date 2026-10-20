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
} from './LadaCustomIcons';

export interface GameIconProps {
  icon: any;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

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
  return icon === 'pomeranc_z_orientu' || icon === 'pomeranc' || icon === 'orange' || icon === 'pomeranč' || icon === 'citrus' || icon === '🍊';
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
  return icon === 'czech_buchta' || icon === '🥟' || icon === 'buns';
}

export function isKolacIcon(icon: any): boolean {
  return icon === 'kynuty_kolac' || icon === 'kolac' || icon === 'kynuty_kolac_s_makem' || icon === 'chodsky_kolac' || icon === 'svatebni_kolac';
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
  return icon === 'osikovy_prut' || icon === 'cane' || icon === '🎋' || icon === 'prut' || icon === 'osika' || icon === 'soaked_cane';
}

export function isValecniceIcon(icon: any): boolean {
  return icon === 'valecnice';
}

export function isGarlicIcon(icon: any): boolean {
  return icon === 'cesnekova_topinka' || icon === 'topinka' || icon === '🧄';
}

export function isPickleIcon(icon: any): boolean {
  return icon === 'kysela_okurka' || icon === 'okurka' || icon === 'pickle' || icon === '🥒';
}

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

  // 2. Metaphorical Czech Village icons & Emoji Interceptions
  // Settings & Mills
  if (key === '⚙' || key === 'settings' || key === 'mlyn' || key === 'mill' || key === 'gear') {
    return <LadaSettingsCogIcon size={size} className={className} style={style} {...props} />;
  }

  // Combat Texts, Scrolls, Chronicles
  if (key === '💬' || key === '📜' || key === 'combat_text' || key === 'scroll' || key === 'speech' || key === 'chronicle') {
    return <LadaCombatTextIcon size={size} className={className} style={style} {...props} />;
  }

  // Padlocks & Security
  if (key === '🔒' || key === 'lock' || key === 'locked') {
    return <LadaPadlockIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🔓' || key === 'unlocked' || key === 'unlock') {
    return <LadaOpenPadlockIcon size={size} className={className} style={style} {...props} />;
  }

  // Magnifiers & Reveal Tiers
  if (key === '🔎' || key === '🔍' || key === 'magnifier' || key === 'reveal' || key === 'search') {
    return <LadaMagnifierIcon size={size} className={className} style={style} {...props} />;
  }

  // Škvarková placka
  if (key === '🫓' || key === 'skvarkova_placka' || key === 'placka') {
    return <LadaPlackaIcon size={size} className={className} style={style} {...props} />;
  }

  // Toulavé boty
  if (key === '👢' || key === '🥾' || key === 'toulave_boty' || key === 'boots' || key === 'skorne') {
    return <LadaBootsIcon size={size} className={className} style={style} {...props} />;
  }

  // Zlatý dukát & linen pouch
  if (key === '💰' || key === 'zlaty_dukat' || key === 'dukat' || key === 'money' || key === 'pouch') {
    return <LadaDucatPouchIcon size={size} className={className} style={style} {...props} />;
  }

  // Beer mug & tavern
  if (key === '🍺' || key === '🍻' || key === 'beer' || key === 'korbel' || key === 'hospodsky_korbel' || key === 'hospoda') {
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
  if (key === '🐓' || key === 'rooster' || key === 'kohoutek') {
    return <LadaRoosterIcon size={size} className={className} style={style} {...props} />;
  }

  // Forged horseshoe
  if (key === '🧲' || key === 'horseshoe' || key === 'kovarska_podkova' || key === 'podkova' || key === 'magnet') {
    return <LadaHorseshoeIcon size={size} className={className} style={style} {...props} />;
  }

  // Cuckoo clock
  if (key === '⏰' || key === 'clock' || key === 'cuckoo' || key === 'kukacky' || key === 'hodiny') {
    return <LadaCuckooClockIcon size={size} className={className} style={style} {...props} />;
  }

  // Shield & Defense
  if (key === '🛡' || key === 'shield' || key === 'stit' || key === 'defense') {
    return <LadaShieldIcon size={size} className={className} style={style} {...props} />;
  }

  // Swords & Weapons
  if (key === '🗡' || key === '⚔' || key === 'sword' || key === 'weapons' || key === 'weapons_mastery' || key === 'blade' || key === 'sabla') {
    return <LadaSwordIcon size={size} className={className} style={style} {...props} />;
  }

  // Hearth fire
  if (key === '🔥' || key === 'fire' || key === 'ohen' || key === 'plamen') {
    return <LadaHearthFireIcon size={size} className={className} style={style} {...props} />;
  }

  // Frost & Ice
  if (key === '❄' || key === '🧊' || key === 'frost' || key === 'ice' || key === 'mraz' || key === 'vlocka') {
    return <LadaSnowflakeIcon size={size} className={className} style={style} {...props} />;
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
  if (key === '🪵' || key === 'wood' || key === 'log' || key === 'povestna_sukovice' || key === 'sukovice') {
    return <LadaBirchLogIcon size={size} className={className} style={style} {...props} />;
  }

  // Chapel bell
  if (key === '🔔' || key === 'bell' || key === 'zvonice' || key === 'zvon') {
    return <LadaChapelBellIcon size={size} className={className} style={style} {...props} />;
  }

  // Rosemary & herbs
  if (key === '🌿' || key === 'herb' || key === 'rosemary' || key === 'rozmaryn' || key === 'svate_kadidlo') {
    return <LadaRosemaryIcon size={size} className={className} style={style} {...props} />;
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
  if (key === '🧀' || key === 'cheese' || key === 'olomoucky_tvaruzek' || key === 'tvaruzek') {
    return <LadaCheeseWheelIcon size={size} className={className} style={style} {...props} />;
  }

  // Fieldstone
  if (key === '🪨' || key === 'stone' || key === 'kamen') {
    return <LadaGraniteStoneIcon size={size} className={className} style={style} {...props} />;
  }

  // Wicker basket
  if (key === '🧺' || key === 'basket' || key === 'kosik' || key === 'nuse') {
    return <LadaWickerBasketIcon size={size} className={className} style={style} {...props} />;
  }

  // Candle & light
  if (key === '🕯' || key === '🪔' || key === 'candle' || key === 'svicka') {
    return <LadaCandleIcon size={size} className={className} style={style} {...props} />;
  }

  // Axe
  if (key === '🪓' || key === 'axe' || key === 'sekyra') {
    return <LadaAxeIcon size={size} className={className} style={style} {...props} />;
  }

  // Hunting bow
  if (key === '🏹' || key === 'bow' || key === 'luk') {
    return <LadaHuntingBowIcon size={size} className={className} style={style} {...props} />;
  }

  // Target
  if (key === '🎯' || key === 'target' || key === 'terc') {
    return <LadaCarnivalTargetIcon size={size} className={className} style={style} {...props} />;
  }

  // Horn (sound / mute)
  if (key === '🔊' || key === 'sound' || key === 'zvuk') {
    return <LadaHornIcon muted={false} size={size} className={className} style={style} {...props} />;
  }
  if (key === '🔇' || key === 'mute' || key === 'ztlumit') {
    return <LadaHornIcon muted={true} size={size} className={className} style={style} {...props} />;
  }

  // Music & tavern notes
  if (key === '🎵' || key === '🎶' || key === 'music' || key === 'hudba' || key === 'nota') {
    return <LadaFiddleMusicIcon size={size} className={className} style={style} {...props} />;
  }

  // Puppet toy / controller
  if (key === '🎮' || key === '🕹' || key === 'game' || key === 'controller' || key === 'loutka') {
    return <LadaPuppetToyIcon size={size} className={className} style={style} {...props} />;
  }

  // Cottage & Village buildings
  if (key === '🏘' || key === 'cottage' || key === 'village' || key === 'statl' || key === 'chaloupka' || key === 'vesnice') {
    return <LadaCottageIcon size={size} className={className} style={style} {...props} />;
  }

  // Church
  if (key === '⛪' || key === 'church' || key === 'kostel') {
    return <LadaChurchSpireIcon size={size} className={className} style={style} {...props} />;
  }

  // Star glint & Sparkle
  if (key === '✨' || key === '🌟' || key === '✦' || key === 'star' || key === 'sparkle' || key === 'hvezda') {
    return <LadaStarGlintIcon size={size} className={className} style={style} {...props} />;
  }

  // Four-leaf clover & Luck
  if (key === '🍀' || key === 'clover' || key === 'luck' || key === 'stesti' || key === 'ctyrlistek') {
    return <LadaFourLeafCloverIcon size={size} className={className} style={style} {...props} />;
  }

  // Pineapple
  if (key === '🍍' || key === 'pineapple' || key === 'ananas') {
    return <LadaPineappleIcon size={size} className={className} style={style} {...props} />;
  }

  // Roasted potato
  if (key === '🥔' || key === 'potato' || key === 'horky_brambor' || key === 'brambor') {
    return <LadaRoastedPotatoIcon size={size} className={className} style={style} {...props} />;
  }

  // Grandmother & Grandfather
  if (key === '👵' || key === 'granny' || key === 'babicka') {
    return <LadaGrannyIcon size={size} className={className} style={style} {...props} />;
  }
  if (key === '🧓' || key === 'grandpa' || key === 'dedecek') {
    return <LadaGrandpaIcon size={size} className={className} style={style} {...props} />;
  }

  // Čert / Devil
  if (key === '👹' || key === 'devil' || key === 'cert') {
    return <LadaDevilIcon size={size} className={className} style={style} {...props} />;
  }

  // Water wave
  if (key === '🌊' || key === '💧' || key === 'wave' || key === 'water' || key === 'vlna') {
    return <LadaWaterWaveIcon size={size} className={className} style={style} {...props} />;
  }

  // Animal Paw print
  if (key === '🐾' || key === 'paw' || key === 'stopa') {
    return <LadaPawPrintIcon size={size} className={className} style={style} {...props} />;
  }

  // Goose
  if (key === '🪿' || key === 'goose' || key === 'husa') {
    return <LadaVillageGooseIcon size={size} className={className} style={style} {...props} />;
  }

  // Spruce pine
  if (key === '🌲' || key === 'pine' || key === 'smrk' || key === 'strom') {
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

  // Hemp rope
  if (key === '🪢' || key === 'rope' || key === 'lano' || key === 'provaz') {
    return <LadaHempRopeIcon size={size} className={className} style={style} {...props} />;
  }

  // Wall
  if (key === '🧱' || key === 'wall' || key === 'zed' || key === 'hradba') {
    return <LadaStoneWallIcon size={size} className={className} style={style} {...props} />;
  }

  // Honey pot
  if (key === '🍯' || key === 'honey' || key === 'med') {
    return <LadaHoneyPotIcon size={size} className={className} style={style} {...props} />;
  }

  // Wool sock
  if (key === '🧦' || key === 'sock' || key === 'ponozka') {
    return <LadaWoolSockIcon size={size} className={className} style={style} {...props} />;
  }

  // Dice
  if (key === '🎲' || key === 'dice' || key === 'kostka') {
    return <LadaBoneDiceIcon size={size} className={className} style={style} {...props} />;
  }

  // Warning & signs
  if (key === '⚠' || key === '🚨' || key === 'warning' || key === 'vystraha') {
    return <LadaWarningSignIcon size={size} className={className} style={style} {...props} />;
  }

  // Checkmark & status
  if (key === '✅' || key === '✓' || key === 'check' || key === 'hotovo') {
    return <LadaCheckmarkIcon size={size} className={className} style={style} {...props} />;
  }

  // Cancel / Cross
  if (key === '❌' || key === '✕' || key === '🛑' || key === 'cancel' || key === 'zrusit' || key === 'cross') {
    return <LadaCrossCancelIcon size={size} className={className} style={style} {...props} />;
  }

  // Tavern direction pointer
  if (key === '➔' || key === '→' || key === 'arrow' || key === 'sipka') {
    return <LadaTavernArrowIcon size={size} className={className} style={style} {...props} />;
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
  if (key === '🎒' || key === '🧳' || key === 'knapsack' || key === 'brasna' || key === 'batoh') {
    return <LadaKnapsackIcon size={size} className={className} style={style} {...props} />;
  }

  // Storage crate
  if (key === '📦' || key === 'crate' || key === 'bedynka' || key === 'box') {
    return <LadaStorageCrateIcon size={size} className={className} style={style} {...props} />;
  }

  // Amphora & jugs
  if (key === '🏺' || key === 'amphora' || key === 'dzban' || key === 'urn') {
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

  // Painter's palette
  if (key === '🎨' || key === 'palette' || key === 'art' || key === 'paleta') {
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
};
