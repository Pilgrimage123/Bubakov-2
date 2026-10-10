import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio';
import { ENEMIES } from '../data/enemies';
import {
  Lada,
  drawEnemyRenderer,
  drawEnemyWarningSign,
  drawStunStars,
  drawValecniceCompanion,
} from '../render/ladaRenderer';
import { GrandfatherScene } from './GrandfatherScene';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaCartouche } from './LadaCartouche';
import type { EnemyAttackCadence } from '../types';

interface AnimationTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TesterTab = 'all' | 'hunters' | 'enemies' | 'grandfather';
type CanvasBg = 'parchment' | 'night' | 'snow' | 'grid';

interface HunterDef {
  id: string;
  name: string;
  title: string;
  desc: string;
  icon: string;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, dx: number, dy: number, flee: boolean, scale: number) => void;
  supportsBarunka?: boolean;
}

const HUNTERS_LIST: HunterDef[] = [
  {
    id: 'wanderer',
    name: 'Poutník',
    title: 'Vesnický tulák z Hrusic',
    desc: 'Výchozí hrdina s osikovým prutem, kloboukem a dýmkou. Ladovský krok s houpáním paží a obláčky kouře.',
    icon: '🚶',
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawWanderer(ctx, x, y, t, dx, dy, flee, scale),
  },
  {
    id: 'shepherd',
    name: 'Pasáček',
    title: 'Hbitý chlapec z pastvin',
    desc: 'Lehkonožka s pastýřskou holí, plstěným kloboučkem a houpavým krokem. Bleskový krok po lukách.',
    icon: '🌾',
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawShepherd(ctx, x, y, t, dx, dy, flee, scale),
  },
  {
    id: 'korenarka',
    name: 'Kořenářka',
    title: 'Bylinkářka z hlubokých hvozdů',
    desc: 'Moudrá žena v červeném šátku s nůší čerstvých bylin a květů. Důstojný krok lesní ranhojičky.',
    icon: '🌿',
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawKorenarka(ctx, x, y, t, dx, dy, flee, scale),
  },
  {
    id: 'watchman',
    name: 'Ponocný',
    title: 'Noční strážce v suknici',
    desc: 'Obrněný strážce v temném plášti s kovanou halapartnou a hořící lucernou. Klapající krok noční hlídky.',
    icon: '🏮',
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawWatchman(ctx, x, y, t, dx, dy, flee, scale),
  },
  {
    id: 'sexton',
    name: 'Hrobník',
    title: 'Správce hřbitova a zvoník',
    desc: 'Vážný muž ve vysokém klobouku s mosazným zvoncem a svazkem hřbitovních klíčů. Rytmické houpání zvonce.',
    icon: '🔔',
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawSexton(ctx, x, y, t, dx, dy, flee, scale),
  },
  {
    id: 'granny',
    name: 'Babička s Barunkou',
    title: 'Laskavá stařenka z Ratibořic',
    desc: 'Babička v modré kanafaskové sukni s nůší a holí. Doprovází ji Barunka se zapletenými copy.',
    icon: '👵',
    supportsBarunka: true,
    draw: (ctx, x, y, t, dx, dy, flee, scale) => Lada.drawGranny(ctx, x, y, t, dx, dy, flee, scale, true),
  },
  {
    id: 'barunka',
    name: 'Barunka',
    title: 'Děvčátko v lidovém kroji',
    desc: 'Samostatný náhled Barunky s vlajícími copy, modrou zástěrkou a červeným korálkem.',
    icon: '👧',
    draw: (ctx, x, y, t, dx, _dy, _flee, scale) => Lada.drawBarunka(ctx, x, y, t, Math.abs(dx) > 0.1, scale * 1.2),
  },
  {
    id: 'valecnice',
    name: 'Rázná hospodyně (Válečnice)',
    title: 'Společnice s bukovým válečkem',
    desc: 'Hospodyně v naškrobené zástěře s mohutným kuchyňským válečkem. Prudký švih a vzdušný vír.',
    icon: '👩‍🍳',
    draw: (ctx, x, y, t, dx, _dy, _flee, scale) => drawValecniceCompanion(ctx, x, y, dx < 0 ? Math.PI / 2 : -Math.PI / 2, 0, t, scale * 1.15, false),
  },
];

const ENEMY_CATEGORIES = [
  { id: 'all', label: 'Všechny potvůrky (49)' },
  { id: 'swarms', label: '🐭 Havěť a skřítci' },
  { id: 'undead', label: '💀 Hroboví umrlci' },
  { id: 'shadows', label: '👤 Noční stíny a bubáci' },
  { id: 'water', label: '💧 Vodní cháska' },
  { id: 'frost', label: '❄️ Větrné a zimní' },
  { id: 'fields', label: '🌾 Polní a zbojníci' },
  { id: 'demons', label: '🔥 Pekelníci' },
  { id: 'bosses', label: '👑 Velcí bossové' },
];

export function AnimationTesterModal({ isOpen, onClose }: AnimationTesterModalProps) {
  // Mobile & viewport responsiveness
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  // Navigation
  const [activeTab, setActiveTab] = useState<TesterTab>('hunters');
  const [selectedHunterId, setSelectedHunterId] = useState<string>('wanderer');
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>('bubak');
  const [enemyCategory, setEnemyCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Canvas settings
  const [canvasBg, setCanvasBg] = useState<CanvasBg>('parchment');
  const [zoomScale, setZoomScale] = useState<number>(() => (isMobile ? 1.25 : 1.5));
  const [facingDir, setFacingDir] = useState<1 | -1>(1);

  // Animation timeline controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [animTime, setAnimTime] = useState<number>(0);

  // Hunter-specific animation state
  const [hunterMoveState, setHunterMoveState] = useState<'idle' | 'walk' | 'flee'>('walk');
  const [grannyWithBarunka, setGrannyWithBarunka] = useState<boolean>(true);
  const [valecniceStrike, setValecniceStrike] = useState<boolean>(false);

  // Enemy-specific animation state
  const [enemyAction, setEnemyAction] = useState<'idle' | 'chase' | 'windup' | 'strike' | 'panicked' | 'stunned' | 'cycle'>('cycle');
  const [enemyCadence, setEnemyCadence] = useState<EnemyAttackCadence>('normal');
  const [showWarningSign, setShowWarningSign] = useState<boolean>(true);
  const [showHitbox, setShowHitbox] = useState<boolean>(false);
  const [attackAngleDeg, setAttackAngleDeg] = useState<number>(0);

  // Grandfather-specific state
  const [grandfatherMode, setGrandfatherMode] = useState<'scene' | 'sprite'>('scene');
  const [grandfatherSceneState, setGrandfatherSceneState] = useState<'idle' | 'reaching' | 'pulling' | 'rerolling' | 'purchasing'>('idle');
  const [grandfatherSpriteMoving, setGrandfatherSpriteMoving] = useState<boolean>(true);
  const [grandfatherInteracting, setGrandfatherInteracting] = useState<boolean>(true);
  const [mousePetCount, setMousePetCount] = useState<number>(0);

  // Refs for animation loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const animTimeRef = useRef<number>(0);

  // Keep state in refs for loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  // Filtered enemies list
  const enemiesList = Object.values(ENEMIES).filter((e) => {
    const matchesCategory = enemyCategory === 'all' || e.category === enemyCategory;
    const matchesSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentHunter = HUNTERS_LIST.find((h) => h.id === selectedHunterId) || HUNTERS_LIST[0];
  const currentEnemy = ENEMIES[selectedEnemyId] || ENEMIES.bubak || Object.values(ENEMIES)[0];

  // Draw background texture on canvas
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, bg: CanvasBg) => {
    ctx.clearRect(0, 0, width, height);

    if (bg === 'parchment') {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
      grad.addColorStop(0, '#FFFDF5');
      grad.addColorStop(0.7, '#FAF4E4');
      grad.addColorStop(1, '#EDE2C7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#D9CAA5';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    } else if (bg === 'night') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.65, '#1E293B');
      grad.addColorStop(1, '#27384E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      const stars = [
        [35, 25, 1.5], [110, 40, 1.2], [220, 20, 1.8], [310, 50, 1.4],
        [80, 80, 1.2], [260, 95, 1.5], [370, 30, 2.0], [420, 75, 1.3]
      ];
      stars.forEach(([sx, sy, r]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (bg === 'snow') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#E2E8F0');
      grad.addColorStop(0.5, '#CBD5E1');
      grad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.85, width * 0.6, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (bg === 'grid') {
      ctx.fillStyle = '#181E29';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cx = width / 2;
      const cy = height * 0.62;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 30);
      ctx.stroke();
    }
  }, []);

  // Main animation render loop
  useEffect(() => {
    if (!isOpen) return;

    let localAnimId: number;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlayingRef.current) {
        animTimeRef.current += dt * playbackSpeedRef.current;
        setAnimTime(animTimeRef.current);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const t = animTimeRef.current;

          drawBackground(ctx, width, height, canvasBg);

          const cx = width / 2;
          const cy = height * 0.65;
          const dir = facingDir;

          if (activeTab === 'hunters') {
            const h = currentHunter;
            const isMoving = hunterMoveState === 'walk';
            const isFleeing = hunterMoveState === 'flee';
            const dx = isMoving ? 1 * dir : isFleeing ? -1 * dir : 0;
            const dy = isMoving ? 0.2 : 0;

            if (h.id === 'granny') {
              Lada.drawGranny(ctx, cx, cy, t, dx, dy, isFleeing, zoomScale, grannyWithBarunka);
            } else if (h.id === 'valecnice') {
              drawValecniceCompanion(ctx, cx, cy, dir < 0 ? Math.PI / 2 : -Math.PI / 2, 0, t, zoomScale * 1.15, valecniceStrike);
            } else {
              h.draw(ctx, cx, cy, t, dx, dy, isFleeing, zoomScale);
            }

            if (showHitbox) {
              ctx.save();
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
              ctx.lineWidth = 1.8;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(cx, cy, 26 * zoomScale, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = '#EF4444';
              ctx.beginPath();
              ctx.arc(cx, cy, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          } else if (activeTab === 'enemies') {
            const e = currentEnemy;
            const rad = (e.radius || 24);
            const cadence = enemyCadence;
            const delay = cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2;
            const recov = cadence === 'fast' ? 0.15 : cadence === 'slow' ? 0.25 : 0.2;

            let isAttacking = false;
            let windupTimer = 0;
            let strikeTimer = 0;
            let isPanicked = enemyAction === 'panicked';
            let vx: number = dir;

            if (enemyAction === 'idle') {
              vx = 0;
            } else if (enemyAction === 'windup') {
              isAttacking = true;
              windupTimer = delay * 0.65;
            } else if (enemyAction === 'strike') {
              isAttacking = true;
              windupTimer = 0;
              strikeTimer = recov * 0.5;
            } else if (enemyAction === 'cycle') {
              const cycleDuration = 3.6;
              const ct = t % cycleDuration;
              if (ct < 1.4) {
                vx = dir;
              } else if (ct < 1.4 + delay) {
                isAttacking = true;
                windupTimer = ct - 1.4;
              } else if (ct < 1.4 + delay + recov) {
                strikeTimer = ct - (1.4 + delay);
              } else {
                vx = 0;
              }
            }

            const attackAngleRad = (attackAngleDeg * Math.PI) / 180;

            const enemyProxy: any = {
              id: e.id,
              method: e.method,
              radius: rad,
              attackCadence: cadence,
              isAttacking,
              windupTimer,
              strikeTimer,
              recoveryTimer: strikeTimer,
              attackDelay: delay,
              strikeMaxTimer: recov,
              recoveryDuration: recov,
              attackAngle: attackAngleRad,
              mass: e.mass || 1,
            };

            const palette = e.palette;
            if (palette) {
              ctx.save();
              if (palette === 'soot') ctx.filter = 'brightness(0.55) contrast(1.4) drop-shadow(0 0 3px #EA580C)';
              else if (palette === 'crimson') ctx.filter = 'sepia(1) saturate(5) hue-rotate(320deg) brightness(0.9)';
              else if (palette === 'bog') ctx.filter = 'sepia(0.85) hue-rotate(65deg) saturate(2.5) brightness(0.85)';
              else if (palette === 'steel') ctx.filter = 'grayscale(0.85) contrast(1.35) brightness(1.15)';
            }

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(zoomScale / 1.4, zoomScale / 1.4);
            ctx.translate(-cx, -cy);

            drawEnemyRenderer(
              e.method,
              ctx,
              cx,
              cy,
              t,
              vx,
              isPanicked,
              enemyProxy
            );

            ctx.restore();

            if (palette) {
              ctx.restore();
            }

            if (showWarningSign && windupTimer > 0) {
              drawEnemyWarningSign(ctx, {
                ...enemyProxy,
                x: cx,
                y: cy,
                radius: rad * (zoomScale / 1.4),
              });
            }

            if (enemyAction === 'stunned') {
              drawStunStars(ctx, { x: cx, y: cy, radius: rad * (zoomScale / 1.4) }, t);
            }

            if (showHitbox) {
              ctx.save();
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
              ctx.lineWidth = 1.8;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(cx, cy, rad * (zoomScale / 1.4), 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = '#EF4444';
              ctx.beginPath();
              ctx.arc(cx, cy, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          } else if (activeTab === 'grandfather' && grandfatherMode === 'sprite') {
            Lada.drawGrandfather(
              ctx,
              cx,
              cy,
              t,
              grandfatherSpriteMoving ? 1 * dir : 0,
              grandfatherSpriteMoving,
              dir,
              grandfatherInteracting,
              zoomScale * 1.15
            );

            if (showHitbox) {
              ctx.save();
              ctx.strokeStyle = 'rgba(217, 119, 6, 0.75)';
              ctx.lineWidth = 1.8;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(cx, cy, 32 * zoomScale, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      localAnimId = requestAnimationFrame(loop);
    };

    localAnimId = requestAnimationFrame(loop);
    animFrameRef.current = localAnimId;

    return () => {
      if (localAnimId) cancelAnimationFrame(localAnimId);
    };
  }, [
    isOpen,
    activeTab,
    selectedHunterId,
    selectedEnemyId,
    canvasBg,
    zoomScale,
    facingDir,
    hunterMoveState,
    grannyWithBarunka,
    valecniceStrike,
    enemyAction,
    enemyCadence,
    showWarningSign,
    showHitbox,
    attackAngleDeg,
    grandfatherMode,
    grandfatherSpriteMoving,
    grandfatherInteracting,
    currentHunter,
    currentEnemy,
    drawBackground,
  ]);

  const playSoundTest = () => {
    try {
      if (activeTab === 'hunters') {
        sound.hit();
      } else if (activeTab === 'grandfather') {
        sound.mouseSqueak();
      } else {
        sound.hit();
      }
    } catch {}
  };

  // Step previous / next hunter
  const stepHunter = (delta: number) => {
    const idx = HUNTERS_LIST.findIndex((h) => h.id === selectedHunterId);
    if (idx < 0) return;
    const nextIdx = (idx + delta + HUNTERS_LIST.length) % HUNTERS_LIST.length;
    sound.coin();
    setSelectedHunterId(HUNTERS_LIST[nextIdx].id);
  };

  // Step previous / next enemy in current filtered list
  const stepEnemy = (delta: number) => {
    const list = enemiesList.length > 0 ? enemiesList : Object.values(ENEMIES);
    const idx = list.findIndex((e) => e.id === selectedEnemyId);
    if (idx < 0) {
      if (list[0]) setSelectedEnemyId(list[0].id);
      return;
    }
    const nextIdx = (idx + delta + list.length) % list.length;
    sound.hit();
    setSelectedEnemyId(list[nextIdx].id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      style={{
        zIndex: 48,
        background: 'rgba(20, 14, 8, 0.94)',
        backdropFilter: 'blur(4px)',
        padding: isSmallMobile ? '4px' : isMobile ? '8px' : '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.coin();
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: '1100px',
          width: isSmallMobile ? '99%' : isMobile ? '98%' : '96%',
          maxHeight: isSmallMobile ? '98dvh' : '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: isSmallMobile ? '8px 8px' : isMobile ? '12px 14px' : '16px 20px',
          background: 'var(--wood-light)',
          border: '4px solid var(--ink)',
          borderLeft: isSmallMobile ? '6px solid var(--lada-spine)' : undefined,
          borderRadius: isSmallMobile ? '8px' : '14px',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        <LadaCardCorners variant="default" showBottomCorners={true} />

        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px dashed rgba(254, 243, 199, 0.25)',
            paddingBottom: isSmallMobile ? '6px' : '8px',
            marginBottom: isSmallMobile ? '8px' : '10px',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? '6px' : '8px' }}>
              <span style={{ fontSize: isSmallMobile ? '1.4rem' : isMobile ? '1.7rem' : '2.1rem' }}>🎬</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: isSmallMobile ? '1.2rem' : isMobile ? '1.45rem' : '1.95rem',
                  color: '#FDE047',
                  letterSpacing: '0.5px',
                  textShadow: '2px 2px 0px var(--ink)',
                  lineHeight: 1.1,
                }}
              >
                TESTER ANIMACÍ
              </h2>
            </div>
            {!isSmallMobile && (
              <>
                <LadaBotanicalFlourish height={isMobile ? 12 : 16} />
                <p style={{ margin: '2px 0 0 0', fontWeight: 800, fontSize: isMobile ? '0.76rem' : '0.88rem', color: '#FEF3C7' }}>
                  Živá zkušebna plynulých ladovských animací — lovci, 49 strašidel a dědeček kramář.
                </p>
              </>
            )}
          </div>

          <button
            onClick={() => {
              sound.coin();
              onClose();
            }}
            style={{
              background: '#D1342B',
              color: '#FFFFFF',
              border: '2px solid var(--ink)',
              borderRadius: '6px',
              padding: isSmallMobile ? '4px 8px' : '6px 12px',
              fontSize: isSmallMobile ? '0.85rem' : '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--ink)',
              whiteSpace: 'nowrap',
            }}
            title="Zavřít tester animací"
          >
            ✕ Zavřít
          </button>
        </div>

        {/* Primary Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: isSmallMobile ? '3px' : isMobile ? '4px' : '8px',
            marginBottom: isSmallMobile ? '8px' : '10px',
          }}
        >
          <button
            className={`tab-btn ${activeTab === 'hunters' ? 'active' : ''}`}
            style={{
              fontSize: isSmallMobile ? '0.74rem' : isMobile ? '0.82rem' : '0.94rem',
              padding: isSmallMobile ? '5px 2px' : '7px 8px',
              fontWeight: 900,
              minWidth: 0,
              textAlign: 'center',
            }}
            onClick={() => {
              sound.coin();
              setActiveTab('hunters');
            }}
          >
            🏹 {isSmallMobile ? 'Lovci' : 'Lovci (8)'}
          </button>

          <button
            className={`tab-btn ${activeTab === 'enemies' ? 'active' : ''}`}
            style={{
              fontSize: isSmallMobile ? '0.74rem' : isMobile ? '0.82rem' : '0.94rem',
              padding: isSmallMobile ? '5px 2px' : '7px 8px',
              fontWeight: 900,
              minWidth: 0,
              textAlign: 'center',
            }}
            onClick={() => {
              sound.coin();
              setActiveTab('enemies');
            }}
          >
            👹 {isSmallMobile ? 'Strašidla' : 'Strašidla (49)'}
          </button>

          <button
            className={`tab-btn ${activeTab === 'grandfather' ? 'active' : ''}`}
            style={{
              fontSize: isSmallMobile ? '0.74rem' : isMobile ? '0.82rem' : '0.94rem',
              padding: isSmallMobile ? '5px 2px' : '7px 8px',
              fontWeight: 900,
              minWidth: 0,
              textAlign: 'center',
            }}
            onClick={() => {
              sound.coin();
              setActiveTab('grandfather');
            }}
          >
            🧺 Dědeček
          </button>

          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            style={{
              fontSize: isSmallMobile ? '0.74rem' : isMobile ? '0.82rem' : '0.94rem',
              padding: isSmallMobile ? '5px 2px' : '7px 8px',
              fontWeight: 900,
              minWidth: 0,
              textAlign: 'center',
            }}
            onClick={() => {
              sound.coin();
              setActiveTab('all');
            }}
          >
            🌐 {isSmallMobile ? 'Galerie' : 'Přehlídka'}
          </button>
        </div>

        {/* Tab 1: All Gallery (Synchronized Grid of Everything) */}
        {activeTab === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {/* Search and Play strip */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '8px',
                background: 'rgba(30, 20, 10, 0.45)',
                padding: isSmallMobile ? '6px 8px' : '8px 12px',
                borderRadius: '8px',
                border: '2px solid var(--ink)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                <span style={{ fontWeight: 800, color: '#FEF3C7', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  🔍 Hledat:
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="hastrman, čert, poutník, obr..."
                  style={{
                    background: '#FFFDF5',
                    color: 'var(--ink)',
                    border: '2px solid var(--ink)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    flex: 1,
                    minWidth: 0,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <button
                  className="lada-btn btn-small"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '⏸️ Pozastavit vše' : '▶️ Spustit vše'}
                </button>
                <span style={{ fontSize: '0.8rem', color: '#FDE047', fontWeight: 800 }}>
                  Čas: {animTime.toFixed(1)} s
                </span>
              </div>
            </div>

            {/* Lovci Section */}
            <div>
              <div style={{ textAlign: 'left', marginBottom: '4px' }}>
                <LadaCartouche variant="green" size="sm">
                  🏹 LOVCI A HRDINOVÉ ({HUNTERS_LIST.length})
                </LadaCartouche>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isSmallMobile
                    ? 'repeat(auto-fill, minmax(90px, 1fr))'
                    : isMobile
                    ? 'repeat(auto-fill, minmax(110px, 1fr))'
                    : 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: isSmallMobile ? '5px' : '8px',
                }}
              >
                {HUNTERS_LIST.filter(h => !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      sound.coin();
                      setSelectedHunterId(h.id);
                      setActiveTab('hunters');
                    }}
                    style={{
                      background: selectedHunterId === h.id ? '#FEF3C7' : '#FAF5E8',
                      border: '2px solid var(--ink)',
                      borderRadius: '6px',
                      padding: isSmallMobile ? '6px 4px' : '8px 6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '2px 2px 0 var(--ink)',
                    }}
                  >
                    <div style={{ fontSize: isSmallMobile ? '1.4rem' : '1.7rem' }}>{h.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: isSmallMobile ? '0.78rem' : '0.88rem', color: 'var(--ink)' }}>{h.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#78350F', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dědeček Callout Card */}
            <div>
              <div style={{ textAlign: 'left', marginBottom: '4px' }}>
                <LadaCartouche variant="ochre" size="sm">
                  🧺 DĚDEČEK KRAMÁŘ
                </LadaCartouche>
              </div>
              <div
                onClick={() => {
                  sound.coin();
                  setActiveTab('grandfather');
                }}
                style={{
                  background: '#FAF5E8',
                  border: '2.5px solid var(--ink)',
                  borderRadius: '8px',
                  padding: isSmallMobile ? '8px 10px' : '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 var(--ink)',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? '8px' : '12px', textAlign: 'left', minWidth: 0 }}>
                  <span style={{ fontSize: isSmallMobile ? '1.8rem' : '2.2rem' }}>🧺</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: isSmallMobile ? '0.92rem' : '1.05rem', color: 'var(--ink)' }}>
                      Dědeček kramář & myška Rézinka
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#78350F', fontWeight: 700 }}>
                      5 stavů nůše, dýmka, lektvary a pochod s kulháním
                    </div>
                  </div>
                </div>
                <button className="lada-btn btn-small" style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  Otevřít ➔
                </button>
              </div>
            </div>

            {/* Strašidla Section */}
            <div>
              <div style={{ textAlign: 'left', marginBottom: '4px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '6px' }}>
                <LadaCartouche variant="red" size="sm">
                  👹 STRAŠIDLA A POTVŮRKY ({enemiesList.length})
                </LadaCartouche>

                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', maxWidth: '100%' }}>
                  {ENEMY_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setEnemyCategory(cat.id)}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: enemyCategory === cat.id ? '#FDE047' : '#FAF5E8',
                        color: 'var(--ink)',
                        border: '1.5px solid var(--ink)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isSmallMobile
                    ? 'repeat(auto-fill, minmax(90px, 1fr))'
                    : isMobile
                    ? 'repeat(auto-fill, minmax(110px, 1fr))'
                    : 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: isSmallMobile ? '5px' : '8px',
                }}
              >
                {enemiesList.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      sound.hit();
                      setSelectedEnemyId(e.id);
                      setActiveTab('enemies');
                    }}
                    style={{
                      background: selectedEnemyId === e.id ? '#FEF3C7' : '#FAF5E8',
                      border: '2px solid var(--ink)',
                      borderRadius: '6px',
                      padding: isSmallMobile ? '6px 4px' : '8px 6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '2px 2px 0 var(--ink)',
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: isSmallMobile ? '0.78rem' : '0.88rem', color: 'var(--ink)' }}>{e.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#78350F', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#B91C1C', fontWeight: 900 }}>
                      {e.danger}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2, 3, 4: Detailed Inspection View */}
        {activeTab !== 'all' && (
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isSmallMobile ? '6px' : isMobile ? '8px' : '14px',
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Desktop Left Column (only rendered on desktop screens > 768px) */}
            {!isMobile && (
              <div
                style={{
                  width: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: 'rgba(28, 20, 14, 0.45)',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '2px solid var(--ink)',
                  overflowY: 'auto',
                }}
              >
                {activeTab === 'hunters' && (
                  <>
                    <div style={{ fontWeight: 900, color: '#FEF3C7', fontSize: '0.86rem', textAlign: 'left', borderBottom: '1px solid rgba(254, 243, 199, 0.2)', paddingBottom: '4px' }}>
                      🏹 VÝBĚR LOVCE ({HUNTERS_LIST.length})
                    </div>
                    {HUNTERS_LIST.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          sound.coin();
                          setSelectedHunterId(h.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          background: selectedHunterId === h.id ? '#FDE047' : '#FAF5E8',
                          color: 'var(--ink)',
                          border: '2px solid var(--ink)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: selectedHunterId === h.id ? '2px 2px 0 var(--ink)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{h.icon}</span>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>{h.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#5C3A21', fontWeight: 700 }}>{h.title}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab === 'enemies' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2px' }}>
                      <div style={{ fontWeight: 900, color: '#FEF3C7', fontSize: '0.86rem', textAlign: 'left' }}>
                        👹 VÝBĚR STRAŠIDLA
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Hledat jméno..."
                        style={{
                          background: '#FFFDF5',
                          color: 'var(--ink)',
                          border: '1.5px solid var(--ink)',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      />
                      <select
                        value={enemyCategory}
                        onChange={(e) => setEnemyCategory(e.target.value)}
                        style={{
                          background: '#FAF5E8',
                          color: 'var(--ink)',
                          border: '1.5px solid var(--ink)',
                          borderRadius: '4px',
                          padding: '3px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        {ENEMY_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' }}>
                      {enemiesList.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => {
                            sound.hit();
                            setSelectedEnemyId(e.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            background: selectedEnemyId === e.id ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxShadow: selectedEnemyId === e.id ? '2px 2px 0 var(--ink)' : 'none',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '0.84rem' }}>{e.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#5C3A21', fontWeight: 700 }}>{e.title}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#B91C1C', fontWeight: 900 }}>
                            {e.danger}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'grandfather' && (
                  <>
                    <div style={{ fontWeight: 900, color: '#FEF3C7', fontSize: '0.86rem', textAlign: 'left', borderBottom: '1px solid rgba(254, 243, 199, 0.2)', paddingBottom: '4px' }}>
                      🧺 DĚDEČKOVY REŽIMY
                    </div>
                    <div
                      onClick={() => {
                        sound.coin();
                        setGrandfatherMode('scene');
                      }}
                      style={{
                        padding: '8px',
                        background: grandfatherMode === 'scene' ? '#FDE047' : '#FAF5E8',
                        color: 'var(--ink)',
                        border: '2px solid var(--ink)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>🧺 Kramářská scéna (Nůše)</div>
                      <div style={{ fontSize: '0.7rem', color: '#5C3A21', fontWeight: 700 }}>
                        5 stavů, dýmka, lektvary a myška Rézinka
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        sound.coin();
                        setGrandfatherMode('sprite');
                      }}
                      style={{
                        padding: '8px',
                        background: grandfatherMode === 'sprite' ? '#FDE047' : '#FAF5E8',
                        color: 'var(--ink)',
                        border: '2px solid var(--ink)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>🚶 Polní pochod (Sprite)</div>
                      <div style={{ fontSize: '0.7rem', color: '#5C3A21', fontWeight: 700 }}>
                        Chůze s kulháním na kopyto a botu
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Stage Canvas & Interactive Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isSmallMobile ? '5px' : '6px', minWidth: 0 }}>
              {/* MOBILE CHARACTER SWITCHER (shown only on mobile screens < 768px) */}
              {isMobile && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: 'rgba(28, 20, 14, 0.65)',
                    padding: '6px',
                    borderRadius: '8px',
                    border: '2px solid var(--ink)',
                  }}
                >
                  {/* Category chips for enemies on mobile */}
                  {activeTab === 'enemies' && (
                    <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '2px' }}>
                      {ENEMY_CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setEnemyCategory(c.id)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            background: enemyCategory === c.id ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '1px solid var(--ink)',
                            borderRadius: '4px',
                          }}
                        >
                          {c.label.split(' ')[0]} {c.label.split(' ')[1] || ''}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Previous / Next and Direct Picker Select */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {activeTab === 'hunters' && (
                      <>
                        <button
                          onClick={() => stepHunter(-1)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            background: '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                          title="Předchozí lovec"
                        >
                          ◀
                        </button>

                        <select
                          value={selectedHunterId}
                          onChange={(e) => {
                            sound.coin();
                            setSelectedHunterId(e.target.value);
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#FDE047',
                            color: 'var(--ink)',
                            fontWeight: 900,
                            fontSize: '0.86rem',
                            padding: '4px 6px',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            fontFamily: 'Eczar, serif',
                          }}
                        >
                          {HUNTERS_LIST.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.icon} {h.name} ({h.title})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => stepHunter(1)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            background: '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                          title="Další lovec"
                        >
                          ▶
                        </button>
                      </>
                    )}

                    {activeTab === 'enemies' && (
                      <>
                        <button
                          onClick={() => stepEnemy(-1)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            background: '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                          title="Předchozí strašidlo"
                        >
                          ◀
                        </button>

                        <select
                          value={selectedEnemyId}
                          onChange={(e) => {
                            sound.hit();
                            setSelectedEnemyId(e.target.value);
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#FDE047',
                            color: 'var(--ink)',
                            fontWeight: 900,
                            fontSize: '0.84rem',
                            padding: '4px 6px',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            fontFamily: 'Eczar, serif',
                          }}
                        >
                          {enemiesList.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name} [{e.title}] {e.danger}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => stepEnemy(1)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            fontWeight: 900,
                            background: '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                          title="Další strašidlo"
                        >
                          ▶
                        </button>
                      </>
                    )}

                    {activeTab === 'grandfather' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '100%' }}>
                        <button
                          onClick={() => {
                            sound.coin();
                            setGrandfatherMode('scene');
                          }}
                          style={{
                            padding: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 900,
                            background: grandfatherMode === 'scene' ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                          }}
                        >
                          🧺 Kramářská dílna
                        </button>
                        <button
                          onClick={() => {
                            sound.coin();
                            setGrandfatherMode('sprite');
                          }}
                          style={{
                            padding: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 900,
                            background: grandfatherMode === 'sprite' ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '2px solid var(--ink)',
                            borderRadius: '5px',
                          }}
                        >
                          🚶 Polní pochod
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Horizontal swipeable chip strip for hunters on mobile */}
                  {activeTab === 'hunters' && (
                    <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingTop: '2px' }}>
                      {HUNTERS_LIST.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            sound.coin();
                            setSelectedHunterId(h.id);
                          }}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            background: selectedHunterId === h.id ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>{h.icon}</span>
                          <span>{h.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View Controls Toolbar (Zoom, Background, Direction, Sound) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(30, 20, 10, 0.45)',
                  padding: isSmallMobile ? '4px 6px' : '5px 10px',
                  borderRadius: '6px',
                  border: '2px solid var(--ink)',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}
              >
                {/* Background selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: isSmallMobile ? '0.72rem' : '0.78rem', fontWeight: 800, color: '#FEF3C7' }}>
                    {isSmallMobile ? '' : 'Pozadí:'}
                  </span>
                  {(['parchment', 'night', 'snow', 'grid'] as CanvasBg[]).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setCanvasBg(bg)}
                      style={{
                        padding: '2px 5px',
                        fontSize: isSmallMobile ? '0.68rem' : '0.72rem',
                        fontWeight: 800,
                        background: canvasBg === bg ? '#FDE047' : '#FAF5E8',
                        color: 'var(--ink)',
                        border: '1.5px solid var(--ink)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      title={bg === 'parchment' ? 'Pergamen' : bg === 'night' ? 'Noc' : bg === 'snow' ? 'Sníh' : 'Mřížka'}
                    >
                      {bg === 'parchment' ? '📜 Papír' : bg === 'night' ? '🌙 Noc' : bg === 'snow' ? '❄️ Sníh' : '📐 Síť'}
                    </button>
                  ))}
                </div>

                {/* Zoom, Facing, Sound */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: isSmallMobile ? '0.72rem' : '0.78rem', fontWeight: 800, color: '#FEF3C7' }}>
                    Zoom:
                  </span>
                  {[1, 1.5, 2].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoomScale(z)}
                      style={{
                        padding: '2px 5px',
                        fontSize: isSmallMobile ? '0.68rem' : '0.72rem',
                        fontWeight: 800,
                        background: zoomScale === z ? '#FDE047' : '#FAF5E8',
                        color: 'var(--ink)',
                        border: '1.5px solid var(--ink)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {z}x
                    </button>
                  ))}

                  <button
                    onClick={() => setFacingDir(facingDir === 1 ? -1 : 1)}
                    style={{
                      padding: '2px 6px',
                      fontSize: isSmallMobile ? '0.68rem' : '0.72rem',
                      fontWeight: 800,
                      background: '#FAF5E8',
                      color: 'var(--ink)',
                      border: '1.5px solid var(--ink)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    title="Otočit směr"
                  >
                    ↔️ {facingDir === 1 ? 'Vpravo' : 'Vlevo'}
                  </button>

                  <button
                    onClick={playSoundTest}
                    style={{
                      padding: '2px 6px',
                      fontSize: isSmallMobile ? '0.68rem' : '0.72rem',
                      fontWeight: 800,
                      background: '#38BDF8',
                      color: '#082F49',
                      border: '1.5px solid var(--ink)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    title="Zvuk"
                  >
                    🔊
                  </button>
                </div>
              </div>

              {/* Main Canvas Viewport */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#0B0F17',
                  borderRadius: '8px',
                  border: '3px solid var(--ink)',
                  overflow: 'hidden',
                  height: isSmallMobile ? '200px' : isMobile ? '225px' : '340px',
                  maxHeight: isMobile ? '38vh' : undefined,
                  minHeight: isSmallMobile ? '180px' : '200px',
                  width: '100%',
                }}
              >
                {activeTab === 'grandfather' && grandfatherMode === 'scene' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <GrandfatherScene
                      mode={isMobile ? 'mobile' : 'desktop'}
                      state={grandfatherSceneState}
                      activeItemName="Čerstvý perníček"
                      activeItemIcon="🍪"
                      onMousePet={() => {
                        setMousePetCount((c) => c + 1);
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 8,
                        background: 'rgba(45, 25, 12, 0.85)',
                        border: '1.5px solid var(--ink)',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        color: '#FDE047',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                      }}
                    >
                      🐭 Rézinka: {mousePetCount}×
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={380}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                )}

                {/* Info badge watermark */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 8,
                    background: 'rgba(28, 20, 14, 0.85)',
                    border: '1px solid var(--ink)',
                    borderRadius: '5px',
                    padding: '2px 6px',
                    color: '#FEF3C7',
                    fontSize: isSmallMobile ? '0.68rem' : '0.74rem',
                    fontWeight: 900,
                    textAlign: 'left',
                    pointerEvents: 'none',
                    maxWidth: '80%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeTab === 'hunters' && (
                    <>🏹 {currentHunter.name} — {hunterMoveState === 'idle' ? 'Klid' : hunterMoveState === 'walk' ? 'Pohyb' : 'Útěk'}</>
                  )}
                  {activeTab === 'enemies' && (
                    <>👹 {currentEnemy.name} ({currentEnemy.title})</>
                  )}
                  {activeTab === 'grandfather' && (
                    <>🧺 Dědeček — {grandfatherMode === 'scene' ? grandfatherSceneState : 'chůze'}</>
                  )}
                </div>
              </div>

              {/* Playback Timeline & Action Selectors Bar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  background: 'rgba(30, 20, 10, 0.45)',
                  padding: isSmallMobile ? '5px 6px' : '6px 10px',
                  borderRadius: '6px',
                  border: '2px solid var(--ink)',
                }}
              >
                {/* Timeline row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <button
                      className="lada-btn btn-small"
                      style={{
                        padding: isSmallMobile ? '3px 6px' : '3px 10px',
                        fontSize: isSmallMobile ? '0.74rem' : '0.78rem',
                        background: isPlaying ? '#EF4444' : '#10B981',
                        color: '#FFFFFF',
                      }}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? '⏸️ Pauza' : '▶️ Hrát'}
                    </button>

                    <button
                      className="lada-btn btn-small"
                      style={{ padding: '3px 5px', fontSize: '0.72rem' }}
                      onClick={() => {
                        animTimeRef.current = Math.max(0, animTimeRef.current - 0.05);
                        setAnimTime(animTimeRef.current);
                      }}
                      title="Krok -1 snímek"
                    >
                      ⏪
                    </button>

                    <button
                      className="lada-btn btn-small"
                      style={{ padding: '3px 5px', fontSize: '0.72rem' }}
                      onClick={() => {
                        animTimeRef.current += 0.05;
                        setAnimTime(animTimeRef.current);
                      }}
                      title="Krok +1 snímek"
                    >
                      ⏩
                    </button>

                    <button
                      className="lada-btn btn-small"
                      style={{ padding: '3px 5px', fontSize: '0.72rem' }}
                      onClick={() => {
                        animTimeRef.current = 0;
                        setAnimTime(0);
                      }}
                      title="Restart"
                    >
                      ⏮️
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FEF3C7' }}>
                      Rychlost:
                    </span>
                    {(isSmallMobile ? [0.25, 0.5, 1, 2] : [0.1, 0.25, 0.5, 1, 1.5, 2]).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        style={{
                          padding: '2px 4px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: playbackSpeed === spd ? '#FDE047' : '#FAF5E8',
                          color: 'var(--ink)',
                          border: '1px solid var(--ink)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        {spd}x
                      </button>
                    ))}
                    <span style={{ fontSize: '0.72rem', color: '#FDE047', fontWeight: 900, minWidth: '35px', textAlign: 'right' }}>
                      {animTime.toFixed(2)}s
                    </span>
                  </div>
                </div>

                {/* Hunter Action Strip */}
                {activeTab === 'hunters' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(254, 243, 199, 0.2)',
                      paddingTop: '4px',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: isSmallMobile ? '0.72rem' : '0.78rem', fontWeight: 800, color: '#FEF3C7' }}>
                        Pohyb:
                      </span>
                      {(['idle', 'walk', 'flee'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setHunterMoveState(st)}
                          style={{
                            padding: '3px 7px',
                            fontSize: isSmallMobile ? '0.72rem' : '0.76rem',
                            fontWeight: 800,
                            background: hunterMoveState === st ? '#FDE047' : '#FAF5E8',
                            color: 'var(--ink)',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {st === 'idle' ? '🛑 Klid' : st === 'walk' ? '🚶 Krok' : '😱 Útěk'}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {currentHunter.supportsBarunka && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.74rem', color: '#FEF3C7', fontWeight: 800, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={grannyWithBarunka}
                            onChange={(e) => setGrannyWithBarunka(e.target.checked)}
                          />
                          S Barunkou
                        </label>
                      )}

                      {currentHunter.id === 'valecnice' && (
                        <button
                          onClick={() => setValecniceStrike(!valecniceStrike)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: valecniceStrike ? '#DC2626' : '#FAF5E8',
                            color: valecniceStrike ? '#FFFFFF' : 'var(--ink)',
                            border: '1px solid var(--ink)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🥖 Švih
                        </button>
                      )}

                      <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.74rem', color: '#FEF3C7', fontWeight: 800, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={showHitbox}
                          onChange={(e) => setShowHitbox(e.target.checked)}
                        />
                        Hitbox
                      </label>
                    </div>
                  </div>
                )}

                {/* Enemy Action Strip */}
                {activeTab === 'enemies' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(254, 243, 199, 0.2)', paddingTop: '4px' }}>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FEF3C7' }}>
                          Fáze:
                        </span>
                        {(['cycle', 'idle', 'chase', 'windup', 'strike', 'panicked', 'stunned'] as const).map((act) => (
                          <button
                            key={act}
                            onClick={() => setEnemyAction(act)}
                            style={{
                              padding: '2px 5px',
                              fontSize: isSmallMobile ? '0.68rem' : '0.72rem',
                              fontWeight: 800,
                              background: enemyAction === act ? '#FDE047' : '#FAF5E8',
                              color: 'var(--ink)',
                              border: '1px solid var(--ink)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            {act === 'cycle' ? '🔄 Cyklus' : act === 'idle' ? '🛑 Klid' : act === 'chase' ? '🏃 Běh' : act === 'windup' ? '⚔️ Nápřah' : act === 'strike' ? '💥 Úder' : act === 'panicked' ? '💧 Panika' : '⭐ Omráč.'}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#FEF3C7', fontWeight: 800, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={showWarningSign}
                            onChange={(e) => setShowWarningSign(e.target.checked)}
                          />
                          (!)
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#FEF3C7', fontWeight: 800, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={showHitbox}
                            onChange={(e) => setShowHitbox(e.target.checked)}
                          />
                          Hitbox
                        </label>
                      </div>
                    </div>

                    {/* Cadence & angle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FEF3C7' }}>
                          Kadence:
                        </span>
                        {(['fast', 'normal', 'slow'] as const).map((cad) => (
                          <button
                            key={cad}
                            onClick={() => setEnemyCadence(cad)}
                            style={{
                              padding: '2px 5px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: enemyCadence === cad ? '#FDE047' : '#FAF5E8',
                              color: 'var(--ink)',
                              border: '1px solid var(--ink)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            {cad === 'fast' ? '⚡ 0,6s' : cad === 'normal' ? '⚔️ 1,2s' : '🔨 1,8s'}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FEF3C7' }}>Úhel:</span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={attackAngleDeg}
                          onChange={(e) => setAttackAngleDeg(Number(e.target.value))}
                          style={{ width: isSmallMobile ? '65px' : '80px' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#FDE047', fontWeight: 800, minWidth: '28px' }}>
                          {attackAngleDeg}°
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grandfather Action Strip */}
                {activeTab === 'grandfather' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(254, 243, 199, 0.2)',
                      paddingTop: '4px',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}
                  >
                    {grandfatherMode === 'scene' ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FEF3C7' }}>Nůše:</span>
                          {(['idle', 'reaching', 'pulling', 'rerolling', 'purchasing'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                sound.coin();
                                setGrandfatherSceneState(st);
                              }}
                              style={{
                                padding: '2px 5px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: grandfatherSceneState === st ? '#FDE047' : '#FAF5E8',
                                color: 'var(--ink)',
                                border: '1px solid var(--ink)',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              {st === 'idle' ? '🍵 Bafání' : st === 'reaching' ? '🤲 Sahání' : st === 'pulling' ? '🎁 Zboží' : st === 'rerolling' ? '🌀 Hrabání' : '✨ Nákup'}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            try {
                              sound.mouseSqueak();
                            } catch {}
                            setMousePetCount((c) => c + 1);
                          }}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 900,
                            background: '#FDA4AF',
                            color: '#881337',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          🐭 Pohladit Rézinku
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FEF3C7' }}>Pochod:</span>
                          <button
                            onClick={() => setGrandfatherSpriteMoving(!grandfatherSpriteMoving)}
                            style={{
                              padding: '3px 7px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: grandfatherSpriteMoving ? '#FDE047' : '#FAF5E8',
                              color: 'var(--ink)',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            {grandfatherSpriteMoving ? '🚶 Chůze' : '🛑 Stání'}
                          </button>

                          <button
                            onClick={() => setGrandfatherInteracting(!grandfatherInteracting)}
                            style={{
                              padding: '3px 7px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: grandfatherInteracting ? '#F59E0B' : '#FAF5E8',
                              color: 'var(--ink)',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            🌟 Aura
                          </button>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#FEF3C7', fontWeight: 800, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={showHitbox}
                            onChange={(e) => setShowHitbox(e.target.checked)}
                          />
                          Hitbox
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Details Drawer */}
              <div
                style={{
                  background: '#FAF5E8',
                  border: '2px solid var(--ink)',
                  borderRadius: '6px',
                  padding: isSmallMobile ? '5px 8px' : '6px 10px',
                  color: 'var(--ink)',
                  textAlign: 'left',
                  fontSize: isSmallMobile ? '0.72rem' : '0.8rem',
                }}
              >
                {activeTab === 'hunters' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <div>
                      <strong style={{ fontSize: isSmallMobile ? '0.86rem' : '0.92rem' }}>{currentHunter.name}</strong>: {currentHunter.desc}
                    </div>
                  </div>
                )}

                {activeTab === 'enemies' && (
                  <div style={{ display: 'flex', flexDirection: isSmallMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isSmallMobile ? 'flex-start' : 'center', gap: '4px' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: isSmallMobile ? '0.84rem' : '0.9rem' }}>{currentEnemy.name}</strong>: {currentEnemy.lore}
                      <div style={{ fontSize: '0.7rem', color: '#78350F', marginTop: '1px', fontWeight: 700 }}>
                        🗡️ <strong>Slabost:</strong> {currentEnemy.weakness} | 🛡️ <strong>Síla:</strong> {currentEnemy.strength}
                      </div>
                    </div>
                    <div style={{ textAlign: isSmallMobile ? 'left' : 'right', whiteSpace: 'nowrap', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', color: '#B91C1C', fontWeight: 900 }}>
                        {currentEnemy.danger}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#5C3A21', fontWeight: 700 }}>
                        ({currentEnemy.attackCadence})
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'grandfather' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: isSmallMobile ? '0.84rem' : '0.9rem' }}>Dědeček Kramář</strong>: Pekelný handlíř s nůší, červenými nohavicemi, dýmkou a věrnou myškou Rézinkou.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
