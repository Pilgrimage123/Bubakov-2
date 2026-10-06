import React, { useState, useEffect, useRef } from 'react';
import { LadaFrieze } from './LadaFrieze';
import { sound } from '../audio';

interface BubakovCoverTitleProps {
  className?: string;
  showCharacters?: boolean;
  showSubtitle?: boolean;
  compact?: boolean;
  interactiveBubak?: boolean;
}

interface BubakFramePose {
  headX: number;
  headY: number;
  headRot: number;
  headScale: number;
  browDy: number;
  pupilDx: number;
  pupilDy: number;
  eyeSquintLeft: number;
  eyeScaleRight: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthRot: number;
  mouthType: 'open' | 'wide' | 'snarl' | 'chomp' | 'smirk';
  leftArmAngle: number;
  rightArmAngle: number;
  torsoX: number;
  torsoY: number;
  torsoScaleX: number;
  torsoScaleY: number;
  skirtRot: number;
}

interface CertFramePose {
  bodyX: number;
  bodyY: number;
  bodyRot: number;
  bodyScaleY: number;
  headX: number;
  headY: number;
  headRot: number;
  tongueLength: number;
  tongueCurl: number;
  tongueWave: number;
  forkX: number;
  forkY: number;
  forkRot: number;
  leftLegAngle: number;
  rightLegAngle: number;
  rightLegLiftY: number;
  leftArmAngle: number;
  leftForearmAngle: number;
  leftHandClawSpread: number;
  rightArmAngle: number;
  stompShock: boolean;
  stompSparks: boolean;
  tailAngle: number;
  tailFlameScale: number;
  eyeScale: number;
  pupilDx: number;
  pupilDy: number;
  browDy: number;
}

const CERT_POSES: CertFramePose[] = [
  // Snímek 1: Základní postoj z knihy (šibalský pohled, klidné vidle, ruka v bok, jazyk lehce vykukuje)
  {
    bodyX: 0,
    bodyY: 0,
    bodyRot: 0,
    bodyScaleY: 1,
    headX: 0,
    headY: 0,
    headRot: 0,
    tongueLength: 0.45,
    tongueCurl: 4,
    tongueWave: 2,
    forkX: 0,
    forkY: 0,
    forkRot: -10,
    leftLegAngle: 0,
    rightLegAngle: 0,
    rightLegLiftY: 0,
    leftArmAngle: -4,
    leftForearmAngle: 6,
    leftHandClawSpread: 1,
    rightArmAngle: 0,
    stompShock: false,
    stompSparks: false,
    tailAngle: 4,
    tailFlameScale: 1.0,
    eyeScale: 1.0,
    pupilDx: 2.4,
    pupilDy: 0.6,
    browDy: 0,
  },
  // Snímek 2: Nápřah k dupnutí (přikrčení, zvedá kopyto do vzduchu, zatahuje jazyk, napřahuje vidle i paži)
  {
    bodyX: -2,
    bodyY: 4,
    bodyRot: -2,
    bodyScaleY: 0.94,
    headX: -1,
    headY: 3,
    headRot: 4,
    tongueLength: 0.28,
    tongueCurl: -2,
    tongueWave: -1,
    forkX: -8,
    forkY: -4,
    forkRot: -16,
    leftLegAngle: 4,
    rightLegAngle: 16,
    rightLegLiftY: -16,
    leftArmAngle: -12,
    leftForearmAngle: 18,
    leftHandClawSpread: 0.85,
    rightArmAngle: -10,
    stompShock: false,
    stompSparks: false,
    tailAngle: -28,
    tailFlameScale: 1.25,
    eyeScale: 0.95,
    pupilDx: -2.2,
    pupilDy: -3.2,
    browDy: -1.5,
  },
  // Snímek 3: DUPNUTÍ & BODNUTÍ & EPICKÉ JISKRY! (BAM kopytem o zem, ohňostroj jisker, bodnutí vidlemi, dlouhý jazyk!)
  {
    bodyX: 5,
    bodyY: 1,
    bodyRot: 4,
    bodyScaleY: 0.98,
    headX: 6,
    headY: 2,
    headRot: 8,
    tongueLength: 1.5,
    tongueCurl: 18,
    tongueWave: -8,
    forkX: 26,
    forkY: -3,
    forkRot: 38,
    leftLegAngle: -2,
    rightLegAngle: -4,
    rightLegLiftY: 0,
    leftArmAngle: 22,
    leftForearmAngle: -16,
    leftHandClawSpread: 1.4,
    rightArmAngle: 24,
    stompShock: true,
    stompSparks: true,
    tailAngle: 24,
    tailFlameScale: 1.55,
    eyeScale: 1.42,
    pupilDx: 0.4,
    pupilDy: 0.2,
    browDy: -3,
  },
  // Snímek 4: Poskok do vzduchu (výskok oběma nohama, jazyk se vlní v letu, planoucí ocas, koulení očima)
  {
    bodyX: 3,
    bodyY: -12,
    bodyRot: 1,
    bodyScaleY: 1.05,
    headX: 3,
    headY: -13,
    headRot: -4,
    tongueLength: 1.25,
    tongueCurl: -14,
    tongueWave: 6,
    forkX: 18,
    forkY: -14,
    forkRot: 22,
    leftLegAngle: -8,
    rightLegAngle: 8,
    rightLegLiftY: -8,
    leftArmAngle: 32,
    leftForearmAngle: 12,
    leftHandClawSpread: 1.3,
    rightArmAngle: 12,
    stompShock: false,
    stompSparks: true,
    tailAngle: -36,
    tailFlameScale: 1.35,
    eyeScale: 1.18,
    pupilDx: 1.8,
    pupilDy: 3.4,
    browDy: -1,
  },
  // Snímek 5: Vítězné mávání vidlemi & poskakování (vrchol skoku, vidle nahoře, jazyk do smyčky, pumpování pěstí)
  {
    bodyX: -1,
    bodyY: -10,
    bodyRot: -5,
    bodyScaleY: 1.02,
    headX: -2,
    headY: -10,
    headRot: -8,
    tongueLength: 0.95,
    tongueCurl: 16,
    tongueWave: -4,
    forkX: 3,
    forkY: -22,
    forkRot: -24,
    leftLegAngle: 10,
    rightLegAngle: -12,
    rightLegLiftY: -6,
    leftArmAngle: -28,
    leftForearmAngle: 34,
    leftHandClawSpread: 1.2,
    rightArmAngle: -18,
    stompShock: false,
    stompSparks: false,
    tailAngle: -45,
    tailFlameScale: 1.25,
    eyeScale: 1.1,
    pupilDx: 3.2,
    pupilDy: -2.2,
    browDy: -1.5,
  },
  // Snímek 6: Dopad na kopyta & ďábelský smích (dopad s pružnými koleny, vidle klesají, jazyk zajíždí)
  {
    bodyX: 0,
    bodyY: 3,
    bodyRot: -1,
    bodyScaleY: 0.96,
    headX: 0,
    headY: 2,
    headRot: 2,
    tongueLength: 0.58,
    tongueCurl: -6,
    tongueWave: 2,
    forkX: 6,
    forkY: 0,
    forkRot: 8,
    leftLegAngle: -2,
    rightLegAngle: -2,
    rightLegLiftY: 0,
    leftArmAngle: 4,
    leftForearmAngle: -8,
    leftHandClawSpread: 1.05,
    rightArmAngle: 4,
    stompShock: false,
    stompSparks: false,
    tailAngle: -14,
    tailFlameScale: 1.1,
    eyeScale: 1.02,
    pupilDx: -1.2,
    pupilDy: 1.8,
    browDy: 0,
  },
  // Snímek 7: Plynulý návrat (narovnání těla, jazyk v koutku, vidle v pohotovosti)
  {
    bodyX: 0,
    bodyY: 0,
    bodyRot: 0,
    bodyScaleY: 1,
    headX: 0,
    headY: 0,
    headRot: 0,
    tongueLength: 0.45,
    tongueCurl: 4,
    tongueWave: 2,
    forkX: 0,
    forkY: 0,
    forkRot: -10,
    leftLegAngle: 0,
    rightLegAngle: 0,
    rightLegLiftY: 0,
    leftArmAngle: -4,
    leftForearmAngle: 6,
    leftHandClawSpread: 1,
    rightArmAngle: 0,
    stompShock: false,
    stompSparks: false,
    tailAngle: 4,
    tailFlameScale: 1.0,
    eyeScale: 1.0,
    pupilDx: 2.4,
    pupilDy: 0.6,
    browDy: 0,
  },
];

const BUBAK_POSES: BubakFramePose[] = [
  // Snímek 1: Základní postoj z knihy
  {
    headX: 0,
    headY: 0,
    headRot: 0,
    headScale: 1,
    browDy: 0,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1,
    mouthScaleY: 1,
    mouthRot: 0,
    mouthType: 'open',
    leftArmAngle: 0,
    rightArmAngle: 0,
    torsoX: 0,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 0,
  },
  // Snímek 2: Příprava k bafnutí (přikrčení, pohled doleva, nápřah)
  {
    headX: -2.5,
    headY: 2,
    headRot: -6,
    headScale: 0.98,
    browDy: 1.5,
    pupilDx: -2.8,
    pupilDy: 0.6,
    eyeSquintLeft: 0.85,
    eyeScaleRight: 0.95,
    mouthScaleX: 0.92,
    mouthScaleY: 0.78,
    mouthRot: -2,
    mouthType: 'snarl',
    leftArmAngle: 12,
    rightArmAngle: -12,
    torsoX: -1.5,
    torsoY: 1,
    torsoScaleX: 0.98,
    torsoScaleY: 0.98,
    skirtRot: 2.5,
  },
  // Snímek 3: Velké BAF! (obří tlama, vyvalené oči, rozpažené rukávy)
  {
    headX: 0,
    headY: 3.5,
    headRot: 0,
    headScale: 1.08,
    browDy: -1.5,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1.15,
    eyeScaleRight: 1.15,
    mouthScaleX: 1.25,
    mouthScaleY: 1.35,
    mouthRot: 0,
    mouthType: 'wide',
    leftArmAngle: -16,
    rightArmAngle: 16,
    torsoX: 0,
    torsoY: -0.5,
    torsoScaleX: 1.05,
    torsoScaleY: 1.02,
    skirtRot: 0,
  },
  // Snímek 4: Záchvěv děsu (chvění paží a zubů, pohled doprava)
  {
    headX: 2.5,
    headY: -1,
    headRot: 6,
    headScale: 1.02,
    browDy: -0.5,
    pupilDx: 2.8,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1.1,
    mouthScaleY: 0.95,
    mouthRot: 3,
    mouthType: 'wide',
    leftArmAngle: -8,
    rightArmAngle: 8,
    torsoX: 1.5,
    torsoY: -0.5,
    torsoScaleX: 1.02,
    torsoScaleY: 1,
    skirtRot: -2.5,
  },
  // Snímek 5: Cvaknutí zuby (zaklapnutí čelistí se zuby do sebe jako zip)
  {
    headX: 1,
    headY: -3,
    headRot: 2,
    headScale: 0.99,
    browDy: -1,
    pupilDx: 0,
    pupilDy: 2.4,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1,
    mouthScaleY: 1,
    mouthRot: 0,
    mouthType: 'chomp',
    leftArmAngle: 20,
    rightArmAngle: -18,
    torsoX: 0,
    torsoY: 0.5,
    torsoScaleX: 0.99,
    torsoScaleY: 1,
    skirtRot: 0,
  },
  // Snímek 6: Šibalský úšklebek (pokřivený úsměv, houpavé rukávy)
  {
    headX: -1,
    headY: -1,
    headRot: -3,
    headScale: 1,
    browDy: 0.5,
    pupilDx: -1.5,
    pupilDy: -1.5,
    eyeSquintLeft: 0.78,
    eyeScaleRight: 1.05,
    mouthScaleX: 1.05,
    mouthScaleY: 0.85,
    mouthRot: -4,
    mouthType: 'smirk',
    leftArmAngle: 6,
    rightArmAngle: -6,
    torsoX: -0.5,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 1.5,
  },
  // Snímek 7: Plynulý návrat (nadechnutí a návrat do výchozí polohy)
  {
    headX: 0,
    headY: 0,
    headRot: 0,
    headScale: 1,
    browDy: 0,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 0.98,
    mouthScaleY: 0.95,
    mouthRot: 0,
    mouthType: 'open',
    leftArmAngle: 0,
    rightArmAngle: 0,
    torsoX: 0,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 0,
  },
];

/**
 * Authentic Josef Lada title banner inspired directly by his classic book covers,
 * Easter postcard vignettes, and zincography floral motifs ("zinkografie"):
 *
 * Features:
 * - Extremely detailed, lively animated Bubák on the left with 7 coordinated frames:
 *   hands, head, eyes, mouth moving in perfect synchronization
 * - Modeled directly on the book cover "Bubáci a hastrmani" (burlap grain, brow ticks,
 *   snout/button nose with 2 nostrils, gaping red toothy maw, green seam with stitches,
 *   crease folds, sewn patches, tattered flared sleeves, dark frond skirt, wooden post)
 * - Authentic Josef Lada framed storybook cartouche with rounded corners
 * - Signature 5-petaled yellow corner flowers with black ink stippled seed cores
 * - Folk botanical stems with rounded green leaves and carmine-rose blossoms
 * - Clear, unobstructed monumental "BUBÁKOV" typography with ZERO overlapping elements
 * - Čertík on the right flanking the decorative cartouche
 * - Lada scalloped frieze border underneath
 */
export const BubakovCoverTitle: React.FC<BubakovCoverTitleProps> = ({
  className = '',
  showCharacters = true,
  showSubtitle = true,
  compact = false,
  interactiveBubak = true,
}) => {
  // 7 coordinated animation frames for Bubák and Čert: 0 through 6
  const [bubakFrame, setBubakFrame] = useState<number>(0);
  const [isScaring, setIsScaring] = useState<boolean>(false);
  const [isCertStomping, setIsCertStomping] = useState<boolean>(false);
  const [isBubakHovered, setIsBubakHovered] = useState<boolean>(false);
  const [isCertHovered, setIsCertHovered] = useState<boolean>(false);
  const isPaused = false;
  const scareTimeoutRef = useRef<number | null>(null);
  const certTimeoutRef = useRef<number | null>(null);

  // 7-frame animation cycle: significantly slower (540ms default) with smooth transitions
  useEffect(() => {
    if (isPaused || isScaring || isCertStomping) return;

    // 540ms per frame gives a theatrical, slow, majestic Czech puppetry cadence (~3.8s total loop)
    const intervalTime = isBubakHovered || isCertHovered ? 440 : 540;

    const interval = window.setInterval(() => {
      setBubakFrame((prev) => (prev + 1) % 7);
    }, intervalTime);

    return () => window.clearInterval(interval);
  }, [isPaused, isBubakHovered, isCertHovered, isScaring, isCertStomping]);

  // Click on Bubák: sudden scare reaction (Frame 2 "BAF!") + sound
  const handleBubakClick = (e: React.MouseEvent) => {
    if (!interactiveBubak) return;
    e.stopPropagation();

    try {
      sound.caneWhip();
    } catch {}

    setIsScaring(true);
    setBubakFrame(2); // Jump directly to the big "BAF!" roar

    if (scareTimeoutRef.current) {
      window.clearTimeout(scareTimeoutRef.current);
    }

    scareTimeoutRef.current = window.setTimeout(() => {
      setBubakFrame(3); // Apex shiver
      scareTimeoutRef.current = window.setTimeout(() => {
        setBubakFrame(4); // Tooth chomp
        scareTimeoutRef.current = window.setTimeout(() => {
          setIsScaring(false);
          setBubakFrame(0);
        }, 520);
      }, 480);
    }, 620);
  };

  // Click on Čert: sudden hoof stomp & pitchfork jab reaction (Frame 2 "DUP! & BODNUTÍ!") + sounds
  const handleCertClick = (e: React.MouseEvent) => {
    if (!interactiveBubak) return;
    e.stopPropagation();

    try {
      sound.heavyHit();
      window.setTimeout(() => {
        try {
          sound.slash();
        } catch {}
      }, 80);
    } catch {}

    setIsCertStomping(true);
    setBubakFrame(2); // Jump to Frame 3 (index 2: DUPNUTÍ & BODNUTÍ VIDLEMI!)

    if (certTimeoutRef.current) {
      window.clearTimeout(certTimeoutRef.current);
    }

    certTimeoutRef.current = window.setTimeout(() => {
      setBubakFrame(3); // Airborne hop
      certTimeoutRef.current = window.setTimeout(() => {
        setBubakFrame(4); // Brandish & taunt
        certTimeoutRef.current = window.setTimeout(() => {
          setIsCertStomping(false);
          setBubakFrame(0);
        }, 520);
      }, 480);
    }, 620);
  };

  useEffect(() => {
    return () => {
      if (scareTimeoutRef.current) window.clearTimeout(scareTimeoutRef.current);
      if (certTimeoutRef.current) window.clearTimeout(certTimeoutRef.current);
    };
  }, []);

  return (
    <header className={`bubakov-cover-header relative select-none w-full flex flex-col items-center justify-center my-1 ${className}`}>
      {/* Hand-drawn 5-pointed folk star */}
      <div className="my-0.5">
        <svg width="28" height="28" viewBox="0 0 40 40" className="drop-shadow-sm">
          {/* Ink outer outline */}
          <polygon
            points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14"
            fill="#C53026"
            stroke="#1C1610"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Inner folk highlight */}
          <polygon
            points="20,7 23,15 32,16 25,22 27,31 20,26 13,31 15,22 8,16 17,15"
            fill="none"
            stroke="#FAF5E8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Main Illustration & Typography Stage */}
      <div className="relative w-full max-w-[820px] px-2 sm:px-4 flex items-center justify-center">
        <svg
          viewBox="0 0 880 195"
          className="w-full h-auto max-h-[205px] drop-shadow-md overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bubákov - Ladovská výprava"
        >
          <defs>
            {/* Red text hatched fill pattern */}
            <pattern
              id="folk-red-hatch"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="10" height="10" fill="#C53026" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#FDE8CD" strokeWidth="2.2" />
            </pattern>

            {/* Ink filter for organic line pressure */}
            <filter id="lada-ink-spread" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="3" dy="3.5" stdDeviation="0.2" floodColor="#1C1610" floodOpacity="0.9" />
            </filter>

            {/* Lithograph Burlap Fabric Stippled Grain Texture for Bubák */}
            <pattern
              id="bubak-cover-burlap-dots"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#C2945D" />
              <circle cx="1.5" cy="1.5" r="0.75" fill="#916233" />
              <circle cx="4.5" cy="4.5" r="0.75" fill="#916233" />
              <circle cx="1.5" cy="4.5" r="0.5" fill="#6E441D" />
              <circle cx="4.5" cy="1.5" r="0.5" fill="#DCAB75" />
              <line x1="0" y1="3" x2="6" y2="3" stroke="#A87541" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            </pattern>

            {/* Dark Frond Fleck Pattern for lower foliage/skirt */}
            <pattern
              id="bubak-cover-frond-texture"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#1E2319" />
              <circle cx="2" cy="3" r="0.8" fill="#5F733E" />
              <circle cx="6" cy="6" r="0.8" fill="#7C924F" />
              <circle cx="5" cy="1.5" r="0.6" fill="#A8813C" />
            </pattern>

            {/* Red mouth gradient */}
            <radialGradient id="bubak-cover-mouth-depth" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#8A1310" />
              <stop offset="65%" stopColor="#B3211B" />
              <stop offset="100%" stopColor="#5E0B09" />
            </radialGradient>

            {/* Čert curly black fur pattern */}
            <pattern
              id="cert-cover-fur-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#221915" />
              <circle cx="2" cy="2" r="0.9" fill="#3D2E27" />
              <circle cx="6" cy="6" r="0.9" fill="#3D2E27" />
              <path d="M 1,4 Q 3,6 5,4" stroke="#150F0D" strokeWidth="0.8" fill="none" />
            </pattern>

            {/* Devil horn sharp crimson gradient */}
            <linearGradient id="cert-horn-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3838" />
              <stop offset="30%" stopColor="#DC2626" />
              <stop offset="70%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#4A0B0B" />
            </linearGradient>

            {/* Devil burning tail flame gradients */}
            <radialGradient id="cert-flame-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5722" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cert-flame-core" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#B91C1C" />
              <stop offset="28%" stopColor="#DC2626" />
              <stop offset="55%" stopColor="#F97316" />
              <stop offset="82%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <radialGradient id="cert-ember-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cert-spark-blast-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#DC2626" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
            </radialGradient>

            <style>{`
              @keyframes certFlameFlicker {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.08, 0.94) rotate(-3deg); }
                50% { transform: scale(0.95, 1.06) rotate(4deg); }
                75% { transform: scale(1.04, 0.98) rotate(-1deg); }
              }
              @keyframes certSmokeDrift {
                0% { transform: translate(0px, 0px) scale(0.7); opacity: 0.8; }
                40% { transform: translate(-3px, -7px) scale(1.05); opacity: 0.7; }
                80% { transform: translate(-7px, -15px) scale(1.3); opacity: 0.35; }
                100% { transform: translate(-10px, -22px) scale(1.5); opacity: 0; }
              }
              @keyframes certSparkStarGlow {
                0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 1px #FEF08A); }
                50% { transform: scale(1.22) rotate(15deg); filter: drop-shadow(0 0 5px #F59E0B); }
              }
            `}</style>
          </defs>

          {/* Pale Sage Green Watercolor Meadow Contour (like the book cover wash) */}
          <path
            d="M 160,50 Q 240,25 360,40 Q 480,20 620,35 Q 720,60 690,130 Q 640,165 480,165 Q 320,165 180,150 Q 130,110 160,50 Z"
            fill="#D5E3C9"
            fillOpacity="0.5"
          />

          {/* Josef Lada Vignette Frame / Cartouche (inspired by Easter postcard rounded frame) */}
          <rect
            x="180"
            y="18"
            width="500"
            height="154"
            rx="24"
            ry="24"
            fill="#FAF6ED"
            stroke="#1C1610"
            strokeWidth="3.6"
          />
          {/* Inner double border line */}
          <rect
            x="188"
            y="26"
            width="484"
            height="138"
            rx="18"
            ry="18"
            fill="#FFFDF8"
            fillOpacity="0.65"
            stroke="#1C1610"
            strokeWidth="1.6"
          />

          {/* ============================================================== */}
          {/* LEFT FOLK FLORAL STEM: Hugs cartouche, completely behind      */}
          {/* Bubák's arm so Bubák's hand is NEVER covered by any flower!     */}
          {/* ============================================================== */}
          <g id="ribbon-streamer-left">
            {/* 1st child: Main curved stem contour (yellow stem with black contour) */}
            <path
              d="M 174,166 Q 170,118 174,74 Q 178,50 176,30"
              stroke="#1C1610"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Inner warm yellow stem core */}
            <path
              d="M 174,166 Q 170,118 174,74 Q 178,50 176,30"
              stroke="#E8B834"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Folk Leaf 1 (lower) */}
            <path
              d="M 174,142 C 182,142 186,126 178,118 C 172,113 170,127 174,142 Z"
              fill="#528850"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 174,138 C 177,132 179,127 180,122" stroke="#1C1610" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Folk Leaf 2 (middle) */}
            <path
              d="M 173,108 C 167,101 163,112 169,120 C 174,124 176,116 173,108 Z"
              fill="#5B9557"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 173,111 C 171,114 169,116 167,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            {/* Folk Leaf 3 (upper) */}
            <path
              d="M 174,82 C 182,80 186,66 178,58 C 172,54 170,66 174,82 Z"
              fill="#4D834B"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 174,78 C 177,72 179,66 180,62" stroke="#1C1610" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Carmine-Rose Folk Flower at top of stem */}
            <g transform="translate(176, 28)">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -5,-6 -5,-13 0,-14 C 5,-13 5,-6 0,0 Z"
                  fill="#BA3852"
                  stroke="#1C1610"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#F4C732" stroke="#1C1610" strokeWidth="1.8" />
            </g>
          </g>

          {/* ============================================================== */}
          {/* RIGHT FOLK FLORAL STEM: Hugs right edge of cartouche           */}
          {/* ============================================================== */}
          <g id="ribbon-streamer-right">
            {/* 1st child: Main curved stem contour */}
            <path
              d="M 686,166 Q 690,118 686,74 Q 682,50 684,30"
              stroke="#1C1610"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Inner warm yellow stem core */}
            <path
              d="M 686,166 Q 690,118 686,74 Q 682,50 684,30"
              stroke="#E8B834"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Folk Leaf 1 (lower) */}
            <path
              d="M 686,142 C 678,142 674,126 682,118 C 688,113 690,127 686,142 Z"
              fill="#528850"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 686,138 C 683,132 681,127 680,122" stroke="#1C1610" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Folk Leaf 2 (middle) */}
            <path
              d="M 687,108 C 693,101 697,112 691,120 C 686,124 684,116 687,108 Z"
              fill="#5B9557"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 687,111 C 689,114 691,116 693,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            {/* Folk Leaf 3 (upper) */}
            <path
              d="M 686,82 C 678,80 674,66 682,58 C 688,54 690,66 686,82 Z"
              fill="#4D834B"
              stroke="#1C1610"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 686,78 C 683,72 681,66 680,62" stroke="#1C1610" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Carmine-Rose Folk Flower at top of stem */}
            <g transform="translate(684, 28)">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -5,-6 -5,-13 0,-14 C 5,-13 5,-6 0,0 Z"
                  fill="#BA3852"
                  stroke="#1C1610"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#F4C732" stroke="#1C1610" strokeWidth="1.8" />
            </g>
          </g>

          {/* ============================================================== */}
          {/* AUTHENTIC JOSEF LADA YELLOW CORNER FLOWERS (Four corners)      */}
          {/* ============================================================== */}
          <g id="lada-cartouche-corner-flowers">
            {/* Top-Left Corner Flower */}
            <g transform="translate(204, 40) rotate(-15)">
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <path
                  key={`tl-${idx}`}
                  transform={`rotate(${angle})`}
                  d="M 0,0 C -7,-7 -8,-17 0,-19 C 8,-17 7,-7 0,0 Z"
                  fill="#F5C834"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="7.2" fill="#E5B224" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="1.1" fill="#1C1610" />
              <circle cx="0" cy="-3.2" r="0.8" fill="#1C1610" />
              <circle cx="3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="0" cy="-5.2" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="-3.6" r="0.7" fill="#1C1610" />
              <circle cx="5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="0" cy="5.2" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="-5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="-3.6" r="0.7" fill="#1C1610" />
            </g>

            {/* Top-Right Corner Flower */}
            <g transform="translate(656, 40) rotate(15)">
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <path
                  key={`tr-${idx}`}
                  transform={`rotate(${angle})`}
                  d="M 0,0 C -7,-7 -8,-17 0,-19 C 8,-17 7,-7 0,0 Z"
                  fill="#F5C834"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="7.2" fill="#E5B224" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="1.1" fill="#1C1610" />
              <circle cx="0" cy="-3.2" r="0.8" fill="#1C1610" />
              <circle cx="3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="0" cy="-5.2" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="-3.6" r="0.7" fill="#1C1610" />
              <circle cx="5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="0" cy="5.2" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="-5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="-3.6" r="0.7" fill="#1C1610" />
            </g>

            {/* Bottom-Left Corner Flower */}
            <g transform="translate(204, 150) rotate(-45)">
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <path
                  key={`bl-${idx}`}
                  transform={`rotate(${angle})`}
                  d="M 0,0 C -7,-7 -8,-17 0,-19 C 8,-17 7,-7 0,0 Z"
                  fill="#F5C834"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="7.2" fill="#E5B224" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="1.1" fill="#1C1610" />
              <circle cx="0" cy="-3.2" r="0.8" fill="#1C1610" />
              <circle cx="3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="0" cy="-5.2" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="-3.6" r="0.7" fill="#1C1610" />
              <circle cx="5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="0" cy="5.2" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="-5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="-3.6" r="0.7" fill="#1C1610" />
            </g>

            {/* Bottom-Right Corner Flower */}
            <g transform="translate(656, 150) rotate(45)">
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <path
                  key={`br-${idx}`}
                  transform={`rotate(${angle})`}
                  d="M 0,0 C -7,-7 -8,-17 0,-19 C 8,-17 7,-7 0,0 Z"
                  fill="#F5C834"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="7.2" fill="#E5B224" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="1.1" fill="#1C1610" />
              <circle cx="0" cy="-3.2" r="0.8" fill="#1C1610" />
              <circle cx="3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-1.9" cy="2.5" r="0.8" fill="#1C1610" />
              <circle cx="-3" cy="-1" r="0.8" fill="#1C1610" />
              <circle cx="0" cy="-5.2" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="-3.6" r="0.7" fill="#1C1610" />
              <circle cx="5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="0" cy="5.2" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="3.6" r="0.7" fill="#1C1610" />
              <circle cx="-5.2" cy="0" r="0.7" fill="#1C1610" />
              <circle cx="-3.6" cy="-3.6" r="0.7" fill="#1C1610" />
            </g>
          </g>

          {/* ============================================================== */}
          {/* LEVÁ POSTAVIČKA: STRAŠÁK / BUBÁK (7 ANIMOVANÝCH SNÍMKŮ)       */}
          {/* Umístěn na levé straně nápisu Bubákov                         */}
          {/* ============================================================== */}
          {showCharacters && (() => {
            const pose = BUBAK_POSES[bubakFrame] || BUBAK_POSES[0];
            return (
              <g transform="translate(12, 4)">
                <g
                  id="lada-cover-strasak"
                  className="cursor-pointer select-none"
                  style={{
                    transformOrigin: '84px 100px',
                    transform: isScaring
                      ? 'scale(1.08) translateY(-3px)'
                      : isBubakHovered
                      ? 'scale(1.03) translateY(-1px)'
                      : 'scale(1)',
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                  onClick={handleBubakClick}
                  onMouseEnter={() => setIsBubakHovered(true)}
                  onMouseLeave={() => setIsBubakHovered(false)}
                >
                {/* Title tooltip for accessibility */}
                <title>Bubák ze slavné knihy Josefa Lady (klikni pro bafnutí!)</title>

                {/* 1. Grounded Weathered Wooden Mounting Pole */}
                <g id="bubak-wood-pole">
                  <rect
                    x="79.5"
                    y="136"
                    width="9"
                    height="56"
                    fill="#783E24"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                    rx="1.5"
                  />
                  <line x1="82.5" y1="140" x2="82.5" y2="190" stroke="#9A5632" strokeWidth="1.6" />
                  <line x1="85.5" y1="142" x2="85.5" y2="186" stroke="#522712" strokeWidth="1.2" />
                  <ellipse cx="83.5" cy="164" rx="2" ry="3.2" fill="#3D1A0B" stroke="#1C1610" strokeWidth="1" />
                </g>

                {/* 2. Lower Dark Shredded Leaf-Frond Skirt (sways smoothly with pose) */}
                <g
                  id="bubak-frond-skirt"
                  style={{
                    transformOrigin: '84px 126px',
                    transform: `rotate(${pose.skirtRot}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <path
                    d="M 54,124 Q 40,140 32,154 Q 44,148 56,134 Q 68,158 84,164 Q 100,158 112,134 Q 124,148 136,154 Q 128,140 114,124 Z"
                    fill="url(#bubak-cover-frond-texture)"
                    stroke="#1C1610"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path d="M 84,130 L 84,160 M 70,128 L 52,148 M 98,128 L 116,148" stroke="#3D4B2A" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>

                {/* 3. Left Scarecrow Arm / Flared Sleeve (Pivot at shoulder: 68px, 74px) */}
                <g
                  id="bubak-left-arm"
                  style={{
                    transformOrigin: '68px 74px',
                    transform: `rotate(${pose.leftArmAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <polygon
                    points="68,76 34,58 14,38 28,32 54,48 74,68"
                    fill="url(#bubak-cover-burlap-dots)"
                    stroke="#1C1610"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path d="M 46,58 C 38,54 30,48 24,42" stroke="#1C1610" strokeWidth="2" fill="none" />
                  <path d="M 56,66 C 48,60 40,54 34,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />

                  {/* 5 Shredded frayed cuff fingers (torn jagged fabric points) */}
                  <polygon
                    points="28,32 18,22 14,34 6,28 10,42 2,44 14,52 22,46"
                    fill="#946332"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  <line x1="14" y1="36" x2="22" y2="40" stroke="#FAF5E8" strokeWidth="1.4" />
                  <line x1="8" y1="32" x2="16" y2="34" stroke="#D9A036" strokeWidth="1.4" />
                  <line x1="10" y1="46" x2="18" y2="48" stroke="#D9A036" strokeWidth="1.4" />
                </g>

                {/* 4. Right Scarecrow Arm / Flared Sleeve (Pivot at shoulder: 100px, 74px) */}
                <g
                  id="bubak-right-arm"
                  style={{
                    transformOrigin: '100px 74px',
                    transform: `rotate(${pose.rightArmAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <polygon
                    points="100,76 134,58 154,38 140,32 114,48 94,68"
                    fill="url(#bubak-cover-burlap-dots)"
                    stroke="#1C1610"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path d="M 122,58 C 130,54 138,48 144,42" stroke="#1C1610" strokeWidth="2" fill="none" />
                  <path d="M 112,66 C 120,60 128,54 134,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />

                  {/* 5 Shredded frayed cuff fingers */}
                  <polygon
                    points="140,32 150,22 154,34 162,28 158,42 166,44 154,52 146,46"
                    fill="#946332"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  <line x1="154" y1="36" x2="146" y2="40" stroke="#FAF5E8" strokeWidth="1.4" />
                  <line x1="160" y1="32" x2="152" y2="34" stroke="#D9A036" strokeWidth="1.4" />
                  <line x1="158" y1="46" x2="150" y2="48" stroke="#D9A036" strokeWidth="1.4" />
                </g>

                {/* 5. Persistent Stable Torso / Barrel Sack Belly (ZERO JUMPING STRIPES!) */}
                <g
                  id="bubak-torso-group"
                  style={{
                    transformOrigin: '84px 98px',
                    transform: `translate(${pose.torsoX}px, ${pose.torsoY}px) scale(${pose.torsoScaleX}, ${pose.torsoScaleY})`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Burlap Torso Shape */}
                  <ellipse
                    cx="84"
                    cy="98"
                    rx="24.5"
                    ry="29.5"
                    fill="url(#bubak-cover-burlap-dots)"
                    stroke="#1C1610"
                    strokeWidth="3.4"
                  />

                  {/* Vertical Green Center Seam with black ink core & cross-stitches */}
                  <path d="M 84,69 L 84,127" stroke="#486935" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M 84,69 L 84,127" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
                  {/* Stable Cross Stitches */}
                  {[76, 86, 96, 106, 116, 123].map((y) => (
                    <line key={`seam-stitch-${y}`} x1="81" y1={y} x2="87" y2={y} stroke="#1C1610" strokeWidth="1.8" />
                  ))}

                  {/* Smooth, persistent organic fold wrinkles (consistent across all frames) */}
                  <path d="M 65,88 C 72,92 78,92 82,90" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                  <path d="M 86,90 C 92,92 98,92 103,88" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                  <path d="M 66,108 C 73,112 78,112 82,110" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                  <path d="M 86,110 C 92,112 97,112 102,108" stroke="#1C1610" strokeWidth="2.2" fill="none" />

                  {/* Hand-drawn burlap side shadows */}
                  <path d="M 62,96 C 63,102 64,108 67,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />
                  <path d="M 106,96 C 105,102 104,108 101,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />

                  {/* Stitched Fabric Patches */}
                  <g transform="translate(98, 86)">
                    <ellipse cx="0" cy="0" rx="5" ry="7" fill="#382C1E" stroke="#1C1610" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#886036" />
                    <line x1="-3" y1="-5" x2="-3" y2="-7" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="3" y1="-5" x2="3" y2="-7" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="-3" y1="5" x2="-3" y2="7" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="3" y1="5" x2="3" y2="7" stroke="#FAF5E8" strokeWidth="1" />
                  </g>
                  <g transform="translate(71, 110)">
                    <ellipse cx="0" cy="0" rx="4.5" ry="6" fill="#2E2419" stroke="#1C1610" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.2" fill="#886036" />
                    <line x1="-2.5" y1="-4" x2="-2.5" y2="-6" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="2.5" y1="-4" x2="2.5" y2="-6" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="-2.5" y1="4" x2="-2.5" y2="6" stroke="#FAF5E8" strokeWidth="1" />
                    <line x1="2.5" y1="4" x2="2.5" y2="6" stroke="#FAF5E8" strokeWidth="1" />
                  </g>
                </g>

                {/* 6. Burlap Sack Head (Pivot at neck: 84px, 68px) */}
                <g
                  id="bubak-head-group"
                  style={{
                    transformOrigin: '84px 68px',
                    transform: `translate(${pose.headX}px, ${pose.headY}px) rotate(${pose.headRot}deg) scale(${pose.headScale})`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <g transform="translate(84, 42)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="20.5"
                      ry="25.5"
                      fill="url(#bubak-cover-burlap-dots)"
                      stroke="#1C1610"
                      strokeWidth="3.4"
                    />

                    {/* Straw tufts on head */}
                    <line x1="0" y1="-25" x2="0" y2="-32" stroke="#D9A036" strokeWidth="2.4" strokeLinecap="round" />
                    <line x1="-4" y1="-24" x2="-9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="4" y1="-24" x2="9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Head contour wrinkles */}
                    <path d="M -16,-6 C -12,-8 -8,-8 -6,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 6,-6 C 8,-8 12,-8 16,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                    {/* Brow Furrow Ticks */}
                    <g
                      style={{
                        transform: `translateY(${pose.browDy}px)`,
                        transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                      }}
                    >
                      <line x1="-3" y1="-17" x2="-2" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                      <line x1="2" y1="-17" x2="3" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                    </g>

                    {/* Left Eye with mobile pupil */}
                    <g
                      style={{
                        transform: `translate(-8px, -8px) scaleY(${pose.eyeSquintLeft})`,
                        transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                      }}
                    >
                      <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                      <g
                        style={{
                          transform: `translate(${pose.pupilDx}px, ${pose.pupilDy}px)`,
                          transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                        }}
                      >
                        <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                        <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                      </g>
                    </g>

                    {/* Right Eye with mobile pupil */}
                    <g
                      style={{
                        transform: `translate(8px, -8px) scale(${pose.eyeScaleRight})`,
                        transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                      }}
                    >
                      <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                      <g
                        style={{
                          transform: `translate(${pose.pupilDx}px, ${pose.pupilDy}px)`,
                          transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                        }}
                      >
                        <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                        <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                      </g>
                    </g>

                    {/* Snout / Button Nose with two nostril dots */}
                    <ellipse cx="0" cy="1" rx="3.6" ry="3.2" fill="#A06E3B" stroke="#1C1610" strokeWidth="2.2" />
                    <circle cx="-1.2" cy="1.2" r="0.8" fill="#1C1610" />
                    <circle cx="1.2" cy="1.2" r="0.8" fill="#1C1610" />

                    {/* Mouth Group: Smooth scaling & rotating */}
                    <g
                      id="bubak-mouth-group"
                      style={{
                        transformOrigin: '0px 11px',
                        transform: `scale(${pose.mouthScaleX}, ${pose.mouthScaleY}) rotate(${pose.mouthRot}deg)`,
                        transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                      }}
                    >
                      {pose.mouthType === 'chomp' ? (
                        /* Interlocking Zipper Saw Teeth (Frame 4: Chomp) */
                        <g id="mouth-chomp-mode">
                          <path d="M -11,9 Q 0,11 11,9 Q 0,7 -11,9 Z" fill="#6E0F0C" />
                          <polygon
                            points="-11,6 -9,12 -7,6 -5,12 -3,6 -1,12 1,6 3,12 5,6 7,12 9,6 11,12 11,7 -11,7"
                            fill="#FAF6ED"
                            stroke="#1C1610"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                          />
                          <polygon
                            points="-11,13 -9,7 -7,13 -5,7 -3,13 -1,7 1,13 3,7 5,13 7,7 9,13 11,7 11,12 -11,12"
                            fill="#FAF6ED"
                            stroke="#1C1610"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                          />
                          <path d="M -12,9 Q 0,10 12,9" stroke="#1C1610" strokeWidth="2.4" fill="none" />
                        </g>
                      ) : (
                        /* Gaping Red Maw with razor-sharp saw teeth */
                        <g id="mouth-open-mode">
                          <path
                            d="M -12,7 C -12,3 12,3 12,7 C 13,20 -13,20 -12,7 Z"
                            fill="url(#bubak-cover-mouth-depth)"
                            stroke="#1C1610"
                            strokeWidth="2.8"
                            strokeLinejoin="round"
                          />
                          <polygon
                            points="-10,6 -8,11 -6,6 -4,11 -2,6 0,11 2,6 4,11 6,6 8,11 10,6"
                            fill="#FAF6ED"
                            stroke="#1C1610"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                          <polygon
                            points="-10,18 -8,13 -6,18 -4,13 -2,18 0,13 2,18 4,13 6,18 8,13 10,18"
                            fill="#FAF6ED"
                            stroke="#1C1610"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                        </g>
                      )}
                    </g>
                  </g>
                </g>
              </g>
            </g>
          );
        })()}

          {/* ============================================================== */}
          {/* PRAVÁ POSTAVIČKA: ČERTÍK (7 ANIMOVANÝCH SNÍMKŮ)               */}
          {/* Přesunut na pravou stranu nápisu Bubákov, aby se nepřekrýval    */}
          {/* s bubákem na levé straně ani s centrální vinětou titulu        */}
          {/* Meticulously modeled on Josef Lada's classic devil artwork:     */}
          {/* - Červené špičaté rohy s ostrými hroty a ladovskými vruby       */}
          {/* - Větší vykulené a koulející se oči s rubínovou duhovkou         */}
          {/* - Plynulejší zvlněný pohyb čertovského jazyka                   */}
          {/* - Doplňené chybějící ruce s ostrými čertovskými spáry a drápy   */}
          {/* - Rudě hořící a doutnající konec ocasu s plamenem a kouřem      */}
          {/* - Epické jiskry a rázové vlny odletující od dupnutí kopytem     */}
          {/* ============================================================== */}
          {showCharacters && (() => {
            const certPose = CERT_POSES[bubakFrame] || CERT_POSES[0];
            return (
              <g transform="translate(710, 4)">
                <g
                  id="lada-cover-cert"
                  className="cursor-pointer select-none"
                  style={{
                    transformOrigin: '74px 100px',
                    transform: isCertStomping
                      ? 'scale(1.08) translateY(-3px)'
                      : isCertHovered
                      ? 'scale(1.03) translateY(-1px)'
                      : 'scale(1)',
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                  onClick={handleCertClick}
                  onMouseEnter={() => setIsCertHovered(true)}
                  onMouseLeave={() => setIsCertHovered(false)}
                >
                <title>Pekelný čertík Josefa Lady (klikni pro dupnutí kopytem, bodnutí vidlemi a spršku pekelných jisker!)</title>

                {/* 1. Green Meadow Turf Pedestal with Josef Lada Grass Blades */}
                <g id="cert-turf-pedestal">
                  <ellipse cx="74" cy="168" rx="38" ry="12" fill="#3D7843" stroke="#1C1610" strokeWidth="3" />
                  <ellipse cx="74" cy="166" rx="32" ry="7" fill="#589B5F" />
                  <path
                    d="M 52,162 L 54,152 L 58,162 M 68,160 L 71,150 L 74,160 M 88,160 L 92,151 L 95,160"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* EPICKÉ JISKRY & RÁZOVÉ VLNY ODLETUJÍCÍ OD DUPNUTÍ KOPYTEM */}
                  {(certPose.stompShock || certPose.stompSparks || isCertStomping) && (
                    <g id="cert-stomp-impact-epic" className="animate-pulse">
                      {/* Fiery impact ground glow */}
                      <ellipse cx="88" cy="164" rx="22" ry="7" fill="url(#cert-spark-blast-radial)" opacity="0.9" />

                      {/* Earthen fracture lines */}
                      <path d="M 78,165 Q 88,161 100,165" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                      <path d="M 84,167 Q 96,168 108,166" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" fill="none" />
                      <path d="M 72,166 Q 64,163 56,167" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" fill="none" />

                      {/* Arcing high-velocity spark trails shooting outwards */}
                      <line x1="88" y1="158" x2="124" y2="132" stroke="#FEF08A" strokeWidth="2.6" strokeLinecap="round" />
                      <line x1="86" y1="156" x2="102" y2="114" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
                      <line x1="90" y1="160" x2="138" y2="152" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="84" y1="158" x2="64" y2="128" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="90" y1="164" x2="132" y2="167" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="87" y1="155" x2="114" y2="104" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />

                      {/* 4-pointed & 8-pointed folk diamond spark stars (⭐ ✨) */}
                      <polygon
                        points="126,122 128.5,129 135,130 128.5,131 126,138 123.5,131 117,130 123.5,129"
                        fill="#FFFBEB"
                        stroke="#1C1610"
                        strokeWidth="1.2"
                        style={{ transformOrigin: '126px 130px', animation: 'certSparkStarGlow 0.8s ease-in-out infinite' }}
                      />
                      <circle cx="126" cy="130" r="1.8" fill="#EF4444" />

                      <polygon
                        points="104,106 106,111 111,112 106,113 104,118 102,113 97,112 102,111"
                        fill="#FEF08A"
                        stroke="#1C1610"
                        strokeWidth="1"
                      />
                      <circle cx="104" cy="112" r="1.4" fill="#F59E0B" />

                      <polygon
                        points="140,144 142,149 147,150 142,151 140,156 138,151 133,150 138,149"
                        fill="#FEF08A"
                        stroke="#1C1610"
                        strokeWidth="1.1"
                      />

                      <polygon
                        points="62,121 63.5,125 68,126 63.5,127 62,131 60.5,127 56,126 60.5,125"
                        fill="#F59E0B"
                        stroke="#1C1610"
                        strokeWidth="1"
                      />

                      <polygon
                        points="114,97 115.5,101 119,102 115.5,103 114,107 112.5,103 109,102 112.5,101"
                        fill="#FFF"
                        stroke="#1C1610"
                        strokeWidth="0.8"
                      />

                      <polygon
                        points="144,132 145.5,135 149,136 145.5,137 144,141 142.5,137 139,136 142.5,135"
                        fill="#FEF08A"
                        stroke="#1C1610"
                        strokeWidth="0.8"
                      />

                      {/* Glowing flying ember droplets */}
                      <circle cx="112" cy="142" r="2.6" fill="#FF5722" stroke="#1C1610" strokeWidth="0.8" />
                      <circle cx="130" cy="122" r="2.2" fill="#FBBF24" />
                      <circle cx="72" cy="138" r="1.9" fill="#EF4444" />
                      <circle cx="98" cy="120" r="1.8" fill="#FFFBEB" />
                      <circle cx="118" cy="162" r="2.4" fill="#F59E0B" />
                      <circle cx="134" cy="110" r="1.6" fill="#FEF08A" />

                      {/* Sulfur smoke & dust puffs at hoof */}
                      <circle cx="94" cy="160" r="3.8" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.8" />
                      <circle cx="78" cy="162" r="3.2" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.8" />
                      <circle cx="106" cy="164" r="2.8" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.6" />
                      <circle cx="68" cy="165" r="2.2" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.4" />
                    </g>
                  )}
                </g>

                {/* 2. Long Sinuous Devil Tail with RUDĚ HOŘÍCÍ A DOUTNAJÍCÍ KONEC */}
                <g
                  id="cert-tail"
                  style={{
                    transformOrigin: '58px 116px',
                    transform: `rotate(${certPose.tailAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Sinuous furry tail stem */}
                  <path
                    d="M 58,116 Q 38,122 30,108 Q 24,94 16,88"
                    stroke="#1C1610"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 58,116 Q 38,122 30,108 Q 24,94 16,88"
                    stroke="#2A1F1B"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Bushy spade base at tail tip */}
                  <path
                    d="M 16,88 C 10,82 4,84 2,90 C 4,98 10,100 16,94 Z"
                    fill="#1C1610"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <line x1="12" y1="89" x2="6" y2="86" stroke="#523F35" strokeWidth="1.2" />
                  <line x1="11" y1="93" x2="5" y2="95" stroke="#523F35" strokeWidth="1.2" />

                  {/* RUDĚ HOŘÍCÍ PLAMEN (Red burning flame at tail tip) */}
                  <g
                    id="cert-tail-flame"
                    style={{
                      transformOrigin: '8px 84px',
                      transform: `scale(${certPose.tailFlameScale})`,
                      transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                    }}
                  >
                    {/* Glowing outer ruby halo */}
                    <circle cx="8" cy="82" r="17" fill="url(#cert-flame-glow)" />

                    {/* Licking crimson flame tongues */}
                    <path
                      d="M 12,94 C 4,92 -3,84 1,74 C 5,66 1,60 -1,56 C 5,60 7,68 11,70 C 15,62 13,56 11,50 C 17,56 19,66 17,74 C 21,78 19,88 12,94 Z"
                      fill="url(#cert-flame-core)"
                      stroke="#1C1610"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      style={{
                        transformOrigin: '8px 82px',
                        animation: 'certFlameFlicker 1.8s ease-in-out infinite',
                      }}
                    />

                    {/* Inner golden flame tongue */}
                    <path
                      d="M 10,88 C 6,86 2,80 5,75 C 8,70 6,65 4,62 C 8,65 10,70 11,73 C 13,68 12,63 11,58 C 14,64 15,70 13,76 C 16,79 14,85 10,88 Z"
                      fill="#FEF08A"
                    />

                    {/* Incandescent hot ember core */}
                    <circle cx="9" cy="85" r="3.2" fill="#FF4500" />
                    <circle cx="9" cy="85" r="1.6" fill="#FFFDE7" />
                  </g>

                  {/* DOUTNÁNÍ & KOUŘ (Smoldering embers & billowing smoke puffs) */}
                  <g id="cert-tail-smoke" style={{ transformOrigin: '4px 60px', animation: 'certSmokeDrift 2.4s ease-out infinite' }}>
                    {/* Stylized Lada circular folk smoke puffs */}
                    <circle cx="4" cy="46" r="4.8" fill="rgba(50,40,36,0.65)" stroke="#1C1610" strokeWidth="1.2" />
                    <circle cx="0" cy="35" r="6.2" fill="rgba(70,60,54,0.5)" stroke="#1C1610" strokeWidth="1.2" />
                    <circle cx="-5" cy="22" r="7.8" fill="rgba(90,80,74,0.35)" stroke="#1C1610" strokeWidth="1.0" />
                    <path d="M 6,50 Q 0,42 2,32 Q 4,24 -2,16" stroke="#4A3E39" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />

                    {/* Rising glowing ember specks */}
                    <circle cx="12" cy="48" r="1.4" fill="#FFA000" stroke="#1C1610" strokeWidth="0.5" />
                    <circle cx="6" cy="38" r="1.2" fill="#FF3D00" />
                    <circle cx="-6" cy="27" r="1.3" fill="#FFD54F" />
                    <circle cx="2" cy="18" r="0.9" fill="#FFA000" />
                  </g>
                </g>

                {/* 3. Left Goat Leg (standing supporting leg) */}
                <g
                  id="cert-left-leg"
                  style={{
                    transformOrigin: '64px 116px',
                    transform: `rotate(${certPose.leftLegAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <path
                    d="M 64,116 Q 58,136 60,162"
                    stroke="#1C1610"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 64,116 Q 58,136 60,162"
                    stroke="#281E19"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M 56,134 L 51,138 L 57,142" stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <polygon points="56,158 66,158 65,165 54,165" fill="#1C1610" stroke="#1C1610" strokeWidth="1.5" />
                  <line x1="60" y1="160" x2="60" y2="165" stroke="#FAF6ED" strokeWidth="1.2" />
                </g>

                {/* 4. Right Goat Leg: DUPE KOPYTEM! (lifting high, stomping down with sparks!) */}
                <g
                  id="cert-right-leg"
                  style={{
                    transformOrigin: '82px 116px',
                    transform: `translate(0px, ${certPose.rightLegLiftY}px) rotate(${certPose.rightLegAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  <path
                    d="M 82,116 Q 84,136 84,162"
                    stroke="#1C1610"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 82,116 Q 84,136 84,162"
                    stroke="#281E19"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M 87,134 L 92,138 L 86,142" stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <polygon points="79,158 89,158 90,165 79,165" fill="#1C1610" stroke="#1C1610" strokeWidth="1.5" />
                  <line x1="84" y1="160" x2="84" y2="165" stroke="#FAF6ED" strokeWidth="1.2" />
                </g>

                {/* 5. Main Devil Torso: POSKAKUJE! */}
                <g
                  id="cert-torso-group"
                  style={{
                    transformOrigin: '74px 96px',
                    transform: `translate(${certPose.bodyX}px, ${certPose.bodyY}px) scaleY(${certPose.bodyScaleY}) rotate(${certPose.bodyRot}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Black furry devil body */}
                  <ellipse
                    cx="74"
                    cy="96"
                    rx="17.5"
                    ry="25"
                    fill="url(#cert-cover-fur-pattern)"
                    stroke="#1C1610"
                    strokeWidth="3.4"
                  />
                  {/* Josef Lada signature ink fur curls (kudrny) */}
                  <path d="M 64,84 C 62,87 63,91 66,89" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  <path d="M 62,95 C 60,98 62,102 65,99" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  <path d="M 64,106 C 62,109 64,113 67,110" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  <path d="M 83,85 C 85,88 84,92 81,90" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  <path d="M 84,97 C 86,100 85,104 82,101" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  <path d="M 82,108 C 84,111 83,114 80,112" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                  {/* Subtle warm belly center */}
                  <ellipse cx="74" cy="98" rx="8" ry="12" fill="#362922" fillOpacity="0.45" />
                  <path d="M 70,88 Q 74,92 78,88" stroke="#523E33" strokeWidth="1.5" fill="none" />
                  <path d="M 71,98 Q 74,102 77,98" stroke="#523E33" strokeWidth="1.5" fill="none" />
                </g>

                {/* 6. DOPLNĚNÉ CHYBĚJÍCÍ RUCE: LEVÁ PAŽE S OSTRÝMI DRÁPY */}
                <g
                  id="cert-left-arm"
                  style={{
                    transformOrigin: '60px 82px',
                    transform: `rotate(${certPose.leftArmAngle}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Upper Arm with thick fur */}
                  <path d="M 60,82 Q 46,90 48,102" stroke="#1C1610" strokeWidth="6.5" strokeLinecap="round" fill="none" />
                  <path d="M 60,82 Q 46,90 48,102" stroke="#241B17" strokeWidth="4.0" strokeLinecap="round" fill="none" />
                  <path d="M 46,92 C 42,94 43,98 47,96" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                  {/* Forearm & Hand with Clawed Fingers (spáry a drápy) */}
                  <g
                    style={{
                      transformOrigin: '48px 102px',
                      transform: `rotate(${certPose.leftForearmAngle}deg) scale(${certPose.leftHandClawSpread})`,
                      transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                    }}
                  >
                    <path d="M 48,102 Q 52,112 50,116" stroke="#1C1610" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                    <path d="M 48,102 Q 52,112 50,116" stroke="#241B17" strokeWidth="3.2" strokeLinecap="round" fill="none" />

                    {/* Palm base */}
                    <circle cx="50" cy="116" r="3.2" fill="#1C1610" />

                    {/* 4 Articulated Sharp Devil Claws (čertovské drápy s ivory hroty) */}
                    {/* Thumb claw */}
                    <path d="M 52,114 Q 56,116 54,120" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="54" cy="120" r="0.7" fill="#FAF6ED" />

                    {/* Index claw */}
                    <path d="M 50,117 Q 47,121 44,124" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                    <circle cx="44" cy="124" r="0.8" fill="#FAF6ED" />

                    {/* Middle claw */}
                    <path d="M 48,116 Q 44,118 40,121" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                    <circle cx="40" cy="121" r="0.8" fill="#FAF6ED" />

                    {/* Ring claw */}
                    <path d="M 47,114 Q 42,115 39,117" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="39" cy="117" r="0.7" fill="#FAF6ED" />
                  </g>
                </g>

                {/* 7. Devil Head, ČERVENÉ ŠPIČATÉ ROHY, VĚTŠÍ VYKULENÉ A KOULEJÍCÍ SE OČI & JAZYK */}
                <g
                  id="cert-head-group"
                  style={{
                    transformOrigin: '74px 66px',
                    transform: `translate(${certPose.headX}px, ${certPose.headY}px) rotate(${certPose.headRot}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Wild black hair tuft on top of head */}
                  <path
                    d="M 68,40 L 64,26 L 71,34 L 74,22 L 77,34 L 84,26 L 80,40 Z"
                    fill="#1C1610"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* ČERVENÉ ŠPIČATÉ ROHY (Sharp pointed crimson horns) */}
                  {/* Left Red Horn */}
                  <path
                    d="M 63,43 Q 53,26 44,16 Q 55,31 62,44 Z"
                    fill="url(#cert-horn-red)"
                    stroke="#1C1610"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                  />
                  <line x1="57" y1="38" x2="52" y2="34" stroke="#1C1610" strokeWidth="1.5" />
                  <line x1="51" y1="30" x2="48" y2="26" stroke="#1C1610" strokeWidth="1.5" />
                  <path d="M 61,42 Q 52,28 45,18" stroke="#FFA8A8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Right Red Horn */}
                  <path
                    d="M 85,43 Q 95,26 104,16 Q 93,31 86,44 Z"
                    fill="url(#cert-horn-red)"
                    stroke="#1C1610"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                  />
                  <line x1="91" y1="38" x2="96" y2="34" stroke="#1C1610" strokeWidth="1.5" />
                  <line x1="97" y1="30" x2="100" y2="26" stroke="#1C1610" strokeWidth="1.5" />
                  <path d="M 87,42 Q 96,28 103,18" stroke="#FFA8A8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Devil Ears */}
                  <path d="M 58,56 C 50,54 51,47 58,50 Z" fill="#241B17" stroke="#1C1610" strokeWidth="2.2" />
                  <path d="M 90,56 C 98,54 97,47 90,50 Z" fill="#241B17" stroke="#1C1610" strokeWidth="2.2" />

                  {/* Round black furry head */}
                  <circle cx="74" cy="56" r="19" fill="#241B17" stroke="#1C1610" strokeWidth="3.2" />

                  {/* Goat beard (kozlí bradka) on chin */}
                  <path
                    d="M 71,72 L 73,83 L 75,74 L 77,82 L 78,72 Z"
                    fill="#1C1610"
                    stroke="#1C1610"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  {/* VĚTŠÍ VYKULENÉ A KOULEJÍCÍ SE OČI (Bulging rolling eyes) */}
                  {/* Left Big Eye */}
                  <g
                    style={{
                      transform: `scale(${certPose.eyeScale})`,
                      transformOrigin: '66px 52px',
                      transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                    }}
                  >
                    {/* Sclera */}
                    <circle cx="66" cy="52" r="7.4" fill="#FFFDF8" stroke="#1C1610" strokeWidth="2.5" />
                    {/* Bloodshot / devilish rim arc */}
                    <path d="M 59,52 A 7 7 0 0 1 66,45" stroke="#DC2626" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                    {/* Ruby-red iris */}
                    <circle cx={66 + certPose.pupilDx * 0.7} cy={52 + certPose.pupilDy * 0.7} r="5.0" fill="#B91C1C" />
                    {/* Glossy black pupil rolling smoothly */}
                    <circle cx={66 + certPose.pupilDx} cy={52 + certPose.pupilDy} r="3.5" fill="#1C1610" />
                    {/* Dual catchlights */}
                    <circle cx={64 + certPose.pupilDx} cy={50 + certPose.pupilDy} r="1.3" fill="#FFFFFF" />
                    <circle cx={67.5 + certPose.pupilDx} cy={53.5 + certPose.pupilDy} r="0.7" fill="#FFFFFF" />
                  </g>

                  {/* Right Big Eye */}
                  <g
                    style={{
                      transform: `scale(${certPose.eyeScale})`,
                      transformOrigin: '82px 52px',
                      transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                    }}
                  >
                    {/* Sclera */}
                    <circle cx="82" cy="52" r="7.4" fill="#FFFDF8" stroke="#1C1610" strokeWidth="2.5" />
                    {/* Bloodshot / devilish rim arc */}
                    <path d="M 75,52 A 7 7 0 0 1 82,45" stroke="#DC2626" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                    {/* Ruby-red iris */}
                    <circle cx={82 + certPose.pupilDx * 0.7} cy={52 + certPose.pupilDy * 0.7} r="5.0" fill="#B91C1C" />
                    {/* Glossy black pupil rolling smoothly */}
                    <circle cx={82 + certPose.pupilDx} cy={52 + certPose.pupilDy} r="3.5" fill="#1C1610" />
                    {/* Dual catchlights */}
                    <circle cx={80 + certPose.pupilDx} cy={50 + certPose.pupilDy} r="1.3" fill="#FFFFFF" />
                    <circle cx={83.5 + certPose.pupilDx} cy={53.5 + certPose.pupilDy} r="0.7" fill="#FFFFFF" />
                  </g>

                  {/* Raised bushy eyebrows */}
                  <g
                    style={{
                      transform: `translateY(${certPose.browDy}px)`,
                      transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                    }}
                  >
                    <path d="M 58,43 Q 66,39 73,43" stroke="#1C1610" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                    <path d="M 75,43 Q 82,39 90,43" stroke="#1C1610" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                  </g>

                  {/* Pug devil nose with 2 nostrils */}
                  <ellipse cx="74" cy="59" rx="3.4" ry="2.6" fill="#1C1610" />
                  <circle cx="72.6" cy="59.4" r="0.7" fill="#886036" />
                  <circle cx="75.4" cy="59.4" r="0.7" fill="#886036" />

                  {/* Grinning devil mouth with white fangs */}
                  <path d="M 62,65 Q 74,74 86,65" stroke="#1C1610" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                  <polygon points="66,65 67.5,70 69.5,65" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1" />
                  <polygon points="79,65 81,70 82.5,65" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1" />

                  {/* PLYNULEJŠÍ POHYB JAZYKA (Smooth organic undulating tongue) */}
                  <g
                    id="cert-tongue"
                    style={{
                      transformOrigin: '74px 66px',
                      transform: `scale(${certPose.tongueLength}) rotate(${certPose.tongueCurl}deg)`,
                      transition: 'transform 440ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {/* S-curve undulating tongue body */}
                    <path
                      d="M 72,66 Q 78,76 83,92 Q 91,114 108,118 Q 98,124 81,105 Q 74,88 72,66 Z"
                      fill="#C53026"
                      stroke="#1C1610"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />
                    {/* Tongue deep center groove */}
                    <path d="M 73,68 Q 79,78 85,96 Q 90,108 100,116" stroke="#87140E" strokeWidth="1.5" fill="none" />
                    {/* Pinkish top reflection sheen */}
                    <path d="M 74,69 Q 78,77 81,89" stroke="#FFA299" strokeWidth="1.1" fill="none" />
                    {/* Forked tongue pointed tip */}
                    <polygon points="106,117 110,121 106,122 108,126 104,121" fill="#C53026" stroke="#1C1610" strokeWidth="0.8" />
                  </g>
                </g>

                {/* 8. DOPLNĚNÉ CHYBĚJÍCÍ RUCE: PRAVÁ PAŽE SVÍRAJÍCÍ VIDLE + VIDLE */}
                <g
                  id="cert-fork-and-arm"
                  style={{
                    transformOrigin: '84px 82px',
                    transform: `translate(${certPose.forkX}px, ${certPose.forkY}px) rotate(${certPose.forkRot}deg)`,
                    transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                  }}
                >
                  {/* Muscular furry upper arm extending towards pitchfork haft */}
                  <path d="M 84,82 Q 98,74 92,56" stroke="#1C1610" strokeWidth="6.5" strokeLinecap="round" fill="none" />
                  <path d="M 84,82 Q 98,74 92,56" stroke="#241B17" strokeWidth="3.8" strokeLinecap="round" fill="none" />
                  <path d="M 94,72 C 98,74 97,78 93,76" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                  {/* Clawed devil fist clutching pitchfork shaft with 4 distinct wrapping claws */}
                  <ellipse cx="92" cy="56" rx="4.8" ry="5.2" fill="#1C1610" />
                  <path d="M 89,52 Q 94,51 97,53" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M 88,55 Q 94,54 97,56" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M 88,58 Q 94,57 97,59" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M 89,61 Q 94,60 96,62" stroke="#FAF6ED" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <line x1="90" y1="53" x2="90" y2="60" stroke="#4D3B31" strokeWidth="1.2" />

                  {/* TROJZUBÉ ŽELEZNÉ VIDLE (Iron Pitchfork) */}
                  {/* Wooden handle shaft */}
                  <line x1="92" y1="-8" x2="92" y2="152" stroke="#1C1610" strokeWidth="4.2" strokeLinecap="round" />
                  <line x1="92" y1="-8" x2="92" y2="152" stroke="#8A5128" strokeWidth="2.4" strokeLinecap="round" />
                  <line x1="93" y1="10" x2="93" y2="140" stroke="#5C3214" strokeWidth="1" strokeLinecap="round" />

                  {/* Iron collar ferrule */}
                  <rect x="89" y="-12" width="6" height="7" fill="#3D4247" stroke="#1C1610" strokeWidth="1.8" rx="1" />

                  {/* Iron crossbar */}
                  <path d="M 78,-10 Q 92,-4 106,-10" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                  <path d="M 78,-10 Q 92,-4 106,-10" fill="none" stroke="#717A85" strokeWidth="2" strokeLinecap="round" />

                  {/* Left prong (sharp curved tine) */}
                  <path d="M 78,-10 Q 76,-24 74,-36" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                  <path d="M 78,-10 Q 76,-24 74,-36" fill="none" stroke="#8C97A4" strokeWidth="1.8" strokeLinecap="round" />

                  {/* Center prong */}
                  <line x1="92" y1="-10" x2="92" y2="-40" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                  <line x1="92" y1="-10" x2="92" y2="-40" stroke="#FAF6ED" strokeWidth="1.8" strokeLinecap="round" />

                  {/* Right prong */}
                  <path d="M 106,-10 Q 108,-24 110,-36" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                  <path d="M 106,-10 Q 108,-24 110,-36" fill="none" stroke="#8C97A4" strokeWidth="1.8" strokeLinecap="round" />

                  {/* Thrust speed lines when stabbing forward */}
                  {certPose.forkRot > 20 && (
                    <g id="fork-thrust-lines">
                      <line x1="116" y1="-36" x2="134" y2="-36" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="102" y1="-42" x2="124" y2="-42" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" />
                      <line x1="84" y1="-38" x2="102" y2="-38" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              </g>
            </g>
          );
        })()}

          {/* ============================================================== */}
          {/* 6th <g>: MAIN LETTERING: "BUBÁKOV"                             */}
          {/* ABSOLUTELY ZERO OVERLAPPING ELEMENTS! Pure, unobstructed,      */}
          {/* legible, bold Josef Lada book title display typography         */}
          {/* ============================================================== */}
          <g id="bubakov-word-group" filter="url(#lada-ink-spread)">
            {/* Author label above title */}
            <text
              x="430"
              y="52"
              textAnchor="middle"
              fill="#7A4B27"
              stroke="#FAF5E8"
              strokeWidth="0.8"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "5px",
              }}
            >
              • JOS. LADA • BUBÁCI A HASTRMANI •
            </text>

            {/* Deep black 3D ink shadow offset */}
            <text
              x="430"
              y="116"
              textAnchor="middle"
              fill="#1C1610"
              stroke="#1C1610"
              strokeWidth="11"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "7px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Red main fill with folk hatched texture */}
            <text
              x="430"
              y="114"
              textAnchor="middle"
              fill="url(#folk-red-hatch)"
              stroke="#FAF5E8"
              strokeWidth="2.4"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "7px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Inner inline white folk contour / pinstripe */}
            <text
              x="430"
              y="114"
              textAnchor="middle"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeDasharray="12 3"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "7px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Hand-drawn Czech acute accent on 'Á' */}
            <g transform="translate(382, 42)">
              {/* Black ink shadow */}
              <polygon points="10,16 26,2 32,4 16,20" fill="#1C1610" stroke="#1C1610" strokeWidth="4.5" strokeLinejoin="round" />
              {/* Red fill */}
              <polygon points="10,16 26,2 32,4 16,20" fill="#C53026" stroke="#FAF5E8" strokeWidth="1.6" strokeLinejoin="round" />
              <line x1="14" y1="16" x2="26" y2="5" stroke="#FAF5E8" strokeWidth="1.4" />
            </g>
          </g>

          {/* ============================================================== */}
          {/* 7th <g>: CLEAN BASELINE FOLK ORNAMENT UNDER TITLE              */}
          {/* Positioned safely at y=148, well clear of the letters          */}
          {/* ============================================================== */}
          <g id="bubakov-sub-ornament" transform="translate(430, 148)">
            {/* Left sprig branch */}
            <line x1="-90" y1="0" x2="-25" y2="0" stroke="#1C1610" strokeWidth="1.8" strokeDasharray="3 3" />
            <circle cx="-95" cy="0" r="3.2" fill="#BA3852" stroke="#1C1610" strokeWidth="1.5" />
            <circle cx="-60" cy="-4" r="2.2" fill="#528850" stroke="#1C1610" strokeWidth="1.2" />
            <circle cx="-40" cy="4" r="2.2" fill="#528850" stroke="#1C1610" strokeWidth="1.2" />

            {/* Central golden folk rosette */}
            <circle cx="0" cy="0" r="6.5" fill="#F4C732" stroke="#1C1610" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="1.5" fill="#1C1610" />

            {/* Right sprig branch */}
            <line x1="25" y1="0" x2="90" y2="0" stroke="#1C1610" strokeWidth="1.8" strokeDasharray="3 3" />
            <circle cx="95" cy="0" r="3.2" fill="#BA3852" stroke="#1C1610" strokeWidth="1.5" />
            <circle cx="60" cy="-4" r="2.2" fill="#528850" stroke="#1C1610" strokeWidth="1.2" />
            <circle cx="40" cy="4" r="2.2" fill="#528850" stroke="#1C1610" strokeWidth="1.2" />
          </g>
        </svg>
      </div>

      {/* Subtitle in authentic Czech storybook typography */}
      {showSubtitle && (
        <p
          className="text-center px-4 text-xs sm:text-sm md:text-base font-bold text-amber-950 max-w-[720px] my-1"
          style={{
            fontFamily: "'Eczar', serif",
            lineHeight: '1.35',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          Česká vesnice, kde se nezbední bubáci zklidní poctivým výpraskem nebo je usmíří voňavá pečená buchta.
        </p>
      )}


      {/* Iconic Scalloped Folk Frieze (Lada Scallops) */}
      <LadaFrieze repeatCount={compact ? 14 : 22} height={compact ? 18 : 22} />
    </header>
  );
};

