import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CharacterType,
  Season,
  MetaProgression,
  UpgradeChoice,
  DayPhase,
} from './types';
import { COLORS, DAY_PHASES, getCurrentDayPhase } from './constants';
import { sound } from './audio';
import { WEAPONS } from './data/weapons';
import { ENEMIES } from './data/enemies';
import { TROPHIES } from './data/trophies';
import { Lada } from './render/ladaRenderer';
import { BestiaryModal } from './components/BestiaryModal';
import { PlanModal } from './components/PlanModal';
import { VillageView } from './components/VillageView';
import { TouchControls } from './components/TouchControls';

// Floating damage / status text
class DamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  size: number;
  vy: number;

  constructor(x: number, y: number, text: string, color = COLORS.white, big = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.text = text;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;
  }

  update(dt: number) {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.font = `900 ${this.size}px Eczar`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineJoin = 'round';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// Environmental decor item (tombstone, cross, tree, snowman, cottage)
class DecorItem {
  x: number;
  y: number;
  type: string;
  scale: number;
  flip: number;

  constructor(x: number, y: number, type: string) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.scale = 0.8 + Math.random() * 0.4;
    this.flip = Math.random() > 0.5 ? 1 : -1;
  }

  draw(ctx: CanvasRenderingContext2D, season: Season) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.flip * this.scale, this.scale);

    if (this.type === 'tree') {
      Lada.setupPath(ctx, COLORS.woodDark);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-10, -50);
      ctx.lineTo(10, -50);
      ctx.lineTo(6, 0);
      ctx.fill();
      ctx.stroke();

      Lada.setupPath(ctx, season === 'winter' ? '#FFFFFF' : COLORS.white);
      ctx.beginPath();
      ctx.arc(0, -60, 30, 0, Math.PI * 2);
      ctx.arc(-20, -50, 25, 0, Math.PI * 2);
      ctx.arc(20, -50, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'cross') {
      Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 3.5);
      ctx.beginPath();
      ctx.rect(-16, -10, 32, 10);
      ctx.fill();
      ctx.stroke();

      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
      ctx.beginPath();
      ctx.rect(-4, -60, 8, 50);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-18, -48, 36, 8);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'tombstone') {
      Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 3);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-16, -26);
      ctx.arc(0, -26, 16, Math.PI, 0);
      ctx.lineTo(16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, -14);
      ctx.moveTo(-7, -24);
      ctx.lineTo(7, -24);
      ctx.stroke();
    } else if (this.type === 'will_o_wisp') {
      const bob = Math.sin(performance.now() / 300 + this.x) * 8;
      ctx.shadowColor = COLORS.water;
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(217, 160, 54, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.type === 'cottage') {
      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3.5);
      ctx.fillRect(-28, -25, 56, 35);
      ctx.strokeRect(-28, -25, 56, 35);
      Lada.setupPath(ctx, '#F8FAFC', COLORS.ink, 4);
      ctx.beginPath();
      ctx.moveTo(-36, -22);
      ctx.quadraticCurveTo(-15, -45, 0, -48);
      ctx.quadraticCurveTo(15, -45, 36, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Character preview canvases
  const wandererRef = useRef<HTMLCanvasElement | null>(null);
  const shepherdRef = useRef<HTMLCanvasElement | null>(null);
  const korenarkaRef = useRef<HTMLCanvasElement | null>(null);
  const watchmanRef = useRef<HTMLCanvasElement | null>(null);

  // Meta progression in LocalStorage
  const [meta, setMeta] = useState<MetaProgression>(() => {
    try {
      const saved = localStorage.getItem('bubakov_meta');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      krejcary: 0,
      regenLevel: 0,
      ovenLevel: 0,
      scarecrowLevel: 0,
      millLevel: 0,
      wallLevel: 0,
      totalSoulsSaved: 0,
      totalChasnikSaved: 0,
      season: 'autumn',
      trophiesClaimed: {},
      bestiaryKills: {},
      highestSurviveTime: 0,
    };
  });

  const saveMeta = (updated: MetaProgression) => {
    setMeta(updated);
    try {
      localStorage.setItem('bubakov_meta', JSON.stringify(updated));
    } catch {}
  };

  // Game UI state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelup' | 'chest' | 'fleeing' | 'tally' | 'tavern'>('menu');
  const [activeTavernTab, setActiveTavernTab] = useState<'crafts' | 'trophies'>('crafts');
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [season, setSeason] = useState<Season>(meta.season || 'autumn');

  // Touch controls
  const [touchEnabled, setTouchEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const stored = localStorage.getItem('bubakov_touch_joystick');
    return stored === null ? isTouch || window.innerWidth <= 1024 : stored === 'true';
  });

  const touchMoveRef = useRef<{ x: number; y: number; active: boolean; intensity: number }>({
    x: 0,
    y: 0,
    active: false,
    intensity: 0,
  });

  // Run stats
  const [runStats, setRunStats] = useState({
    time: 0,
    level: 1,
    xp: 0,
    xpNeeded: 10,
    kills: 0,
    coins: 0,
    souls: 0,
    chasniks: 0,
    hp: 150,
    maxHp: 150,
    ultCd: 0,
    dayPhase: DAY_PHASES[0],
    bossHpPct: null as number | null,
    bossTitle: '',
    warningBanner: '',
    chasnikIndicator: '',
  });

  // Level Up choices
  const [levelUpChoices, setLevelUpChoices] = useState<UpgradeChoice[]>([]);

  // Chest sequence state
  const [chestRewards, setChestRewards] = useState<any[]>([]);

  // Tally state
  const [tallyCounters, setTallyCounters] = useState({ kills: 0, coins: 0, souls: 0, time: 0 });

  // Game engine refs (persistent through renders)
  const engineRef = useRef<{
    player: any;
    enemies: any[];
    projectiles: any[];
    slashes: any[];
    drops: any[];
    decor: DecorItem[];
    particles: any[];
    texts: DamageText[];
    camera: { x: number; y: number };
    keys: Record<string, boolean>;
    bossSpawned: boolean;
    hejkalSpawned: boolean;
    obrSpawned: boolean;
    chasnikSpawned: boolean;
    poledniceSpawned: boolean;
    chestCounter: number;
    companion: any;
    lastTime: number;
    uiTime: number;
    fleeTimer: number;
  }>({
    player: null,
    enemies: [],
    projectiles: [],
    slashes: [],
    drops: [],
    decor: [],
    particles: [],
    texts: [],
    camera: { x: 0, y: 0 },
    keys: {},
    bossSpawned: false,
    hejkalSpawned: false,
    obrSpawned: false,
    chasnikSpawned: false,
    poledniceSpawned: false,
    chestCounter: 0,
    companion: null,
    lastTime: performance.now(),
    uiTime: 0,
    fleeTimer: 0,
  });

  // Sync season change
  const toggleSeason = () => {
    const next: Season = season === 'autumn' ? 'winter' : 'autumn';
    setSeason(next);
    saveMeta({ ...meta, season: next });
    sound.coin();
  };

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
    if (next) sound.coin();
  };

  const toggleTouch = () => {
    const next = !touchEnabled;
    setTouchEnabled(next);
    try {
      localStorage.setItem('bubakov_touch_joystick', next ? 'true' : 'false');
    } catch {}
    sound.coin();
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        triggerUltimate();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Start new run
  const startGame = (type: CharacterType) => {
    sound.init();
    sound.coin();

    const baseMaxHp =
      type === 'wanderer' ? 150 : type === 'shepherd' ? 110 : type === 'korenarka' ? 125 : 140;
    const baseSpeed =
      type === 'wanderer' ? 165 : type === 'shepherd' ? 220 : type === 'korenarka' ? 180 : 175;
    const basePickup =
      type === 'wanderer' ? 75 : type === 'shepherd' ? 160 : type === 'korenarka' ? 105 : 115;

    const initialWeapons =
      type === 'wanderer'
        ? [{ id: 'buns', level: 1, cd: 0 }, { id: 'cane', level: 1, cd: 0 }]
        : type === 'shepherd'
        ? [{ id: 'buns', level: 1, cd: 0 }]
        : type === 'korenarka'
        ? [{ id: 'herbs', level: 1, cd: 0 }]
        : [{ id: 'halberd', level: 1, cd: 0 }];

    const wallBonusHp = (meta.wallLevel || 0) * 25;
    const millBonusSpeed = (meta.millLevel || 0) * 15;
    const scarecrowBonusPickup = (meta.scarecrowLevel || 0) * 25;
    const ovenDmgMult = 1 + (meta.ovenLevel || 0) * 0.1;
    const wallDmgRed = Math.min(0.5, (meta.wallLevel || 0) * 0.05);

    const player = {
      x: 0,
      y: 0,
      radius: 20,
      type,
      maxHp: baseMaxHp + wallBonusHp,
      hp: baseMaxHp + wallBonusHp,
      speed: baseSpeed + millBonusSpeed,
      pickupRadius: basePickup + scarecrowBonusPickup,
      weapons: initialWeapons,
      damageMultiplier: ovenDmgMult,
      damageReduction: wallDmgRed,
      regenLevel: meta.regenLevel || 0,
      regenTimer: 0,
      herbTimer: 0,
      soulBuffTimer: 0,
      hasSoakedCane: false,
      ultCd: 0,
      ultMaxCd: 30,
      lastDx: 1,
      lastDy: 0,
      animTime: 0,

      // Helper methods for weapon scripts
      distTo(e: any) {
        return Math.hypot(e.x - this.x, e.y - this.y);
      },
      getLivingEnemies() {
        return engineRef.current.enemies.filter((e) => !e.isDefeated);
      },
      spawnProjectile(proj: any) {
        engineRef.current.projectiles.push({
          ...proj,
          vx: Math.cos(proj.angle) * proj.speed,
          vy: Math.sin(proj.angle) * proj.speed,
          hitList: [],
          dead: false,
        });
      },
      spawnMeleeSlash(slash: any) {
        engineRef.current.slashes.push({
          ...slash,
          hitList: [],
          dead: false,
        });
      },
      spawnAreaImpact(impact: any) {
        const enemies = engineRef.current.enemies;
        for (const e of enemies) {
          if (!e.isDefeated && Math.hypot(e.x - impact.x, e.y - impact.y) <= impact.radius + e.radius) {
            e.takeDamage(impact.dmg, impact.type, (e.x - impact.x) * 4, (e.y - impact.y) * 4);
          }
        }
        engineRef.current.texts.push(new DamageText(impact.x, impact.y - 20, 'BUM!', COLORS.mustard, true));
      },

      draw(ctx: CanvasRenderingContext2D) {
        Lada.drawShadow(ctx, this.x, this.y, this.radius);

        if (this.soulBuffTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (this.type === 'watchman') {
          ctx.save();
          const grad = ctx.createRadialGradient(this.x, this.y, 8, this.x, this.y, 85);
          grad.addColorStop(0, 'rgba(255, 220, 120, 0.3)');
          grad.addColorStop(0.7, 'rgba(255, 180, 50, 0.12)');
          grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 85, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const isFleeing = (engineRef.current?.fleeTimer ?? 0) > 0;
        if (this.type === 'wanderer') {
          Lada.drawWanderer(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'shepherd') {
          Lada.drawShepherd(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'korenarka') {
          Lada.drawKorenarka(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'watchman') {
          Lada.drawWatchman(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else {
          Lada.drawWanderer(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        }
      },
    };

    // Decor seed around starting zone
    const decor: DecorItem[] = [];
    for (let i = 0; i < 90; i++) {
      const dist = 100 + Math.random() * 1400;
      const ang = Math.random() * Math.PI * 2;
      const roll = Math.random();
      const decType =
        season === 'winter'
          ? roll > 0.85
            ? 'cottage'
            : roll > 0.7
            ? 'snowman'
            : roll > 0.5
            ? 'tree'
            : roll > 0.35
            ? 'cross'
            : 'will_o_wisp'
          : roll > 0.82
          ? 'tree'
          : roll > 0.68
          ? 'cross'
          : roll > 0.52
          ? 'tombstone'
          : roll > 0.35
          ? 'cottage'
          : 'will_o_wisp';
      decor.push(new DecorItem(Math.cos(ang) * dist, Math.sin(ang) * dist, decType));
    }

    engineRef.current = {
      player,
      enemies: [],
      projectiles: [],
      slashes: [],
      drops: [],
      decor,
      particles: [],
      texts: [],
      camera: { x: 0, y: 0 },
      keys: {},
      bossSpawned: false,
      hejkalSpawned: false,
      obrSpawned: false,
      chasnikSpawned: false,
      poledniceSpawned: false,
      chestCounter: 0,
      companion: null,
      lastTime: performance.now(),
      uiTime: 0,
      fleeTimer: 0,
    };

    setRunStats({
      time: 0,
      level: 1,
      xp: 0,
      xpNeeded: 10,
      kills: 0,
      coins: 0,
      souls: 0,
      chasniks: 0,
      hp: player.hp,
      maxHp: player.maxHp,
      ultCd: 0,
      dayPhase: DAY_PHASES[0],
      bossHpPct: null,
      bossTitle: '',
      warningBanner: '',
      chasnikIndicator: '',
    });

    setGameState('playing');
  };

  // Ultimate ability trigger
  const triggerUltimate = () => {
    const p = engineRef.current.player;
    if (!p || p.ultCd > 0 || gameState !== 'playing') return;

    p.ultCd = p.ultMaxCd;
    sound.slash();

    if (p.type === 'wanderer') {
      // Massive shockwave
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'RÁZOVÁ VLNA!', COLORS.mustard, true));
      for (const e of engineRef.current.enemies) {
        if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 450) {
          e.takeDamage(130 * p.damageMultiplier, 'magic', (e.x - p.x) * 6, (e.y - p.y) * 6);
        }
      }
    } else if (p.type === 'shepherd') {
      // Stampede of sheep
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'DUSOT STÁDA!', COLORS.mustard, true));
      for (const e of engineRef.current.enemies) {
        if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 500) {
          e.takeDamage(120 * p.damageMultiplier, 'physical', 300, (Math.random() - 0.5) * 200);
        }
      }
    } else if (p.type === 'korenarka') {
      // Herbal incense & cure
      p.hp = Math.min(p.maxHp, p.hp + 45);
      sound.victory();
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, '+45 HP! OČISTNÉ KADIDLO 🌿', COLORS.green, true));
      for (const e of engineRef.current.enemies) {
        if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 420) {
          e.takeDamage(100 * p.damageMultiplier, 'nature', (e.x - p.x) * 4, (e.y - p.y) * 4);
          e.soak();
        }
      }
    } else {
      // Night watchman horn & dog pack
      sound.horn();
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'TÚÚ-DÚÚ! POPLACH!', COLORS.mustard, true));
      for (const e of engineRef.current.enemies) {
        e.panicTimer = 5.0 * (1 - (e.willpower || 0) * 0.7);
        e.panicked = true;
        e.takeDamage(110 * p.damageMultiplier, 'physical', (e.x - p.x) * 4, (e.y - p.y) * 4);
      }
    }
  };

  // Open Level Up Choice Modal
  const openLevelUpModal = () => {
    const p = engineRef.current.player;
    if (!p) return;

    sound.levelUp();
    setGameState('levelup');

    const choices: UpgradeChoice[] = [];
    const availableWeaponKeys = Object.keys(WEAPONS);

    // New weapons
    for (const key of availableWeaponKeys) {
      if (!p.weapons.find((w: any) => w.id === key)) {
        choices.push({
          type: 'new_weapon',
          id: key,
          name: WEAPONS[key].name,
          desc: WEAPONS[key].desc,
          icon: WEAPONS[key].icon,
        });
      }
    }

    // Upgrades for existing weapons
    for (const w of p.weapons) {
      if (w.level < 5) {
        const wDef = WEAPONS[w.id];
        choices.push({
          type: 'upgrade_weapon',
          id: w.id,
          name: `${wDef.name} (Úr. ${w.level + 1})`,
          desc: 'Zvyšuje sílu poškození, počet střel a rychlost útoku.',
          icon: wDef.icon,
        });
      }
    }

    // Passives
    choices.push({
      type: 'passive',
      stat: 'maxHp',
      name: 'Hroší kůže z podhůří',
      desc: '+25 k maximálnímu zdraví lovce.',
      icon: '🥩',
    });
    choices.push({
      type: 'passive',
      stat: 'speed',
      name: 'Toulavé boty sedmimílové',
      desc: '+20 k rychlosti pohybu lovce.',
      icon: '👢',
    });
    choices.push({
      type: 'passive',
      stat: 'pickupRadius',
      name: 'Magnetický měšec na krejcary',
      desc: '+35 k dosahu sběru mincí a lektvarů.',
      icon: '🧲',
    });

    if (p.weapons.find((w: any) => w.id === 'cane') && !p.hasSoakedCane) {
      choices.push({
        type: 'modifier',
        id: 'soaked_cane',
        name: 'Máčená vrbová rákoska',
        desc: 'Údery rákoskou namáčí nepřátele v rybniční vodě a zpomalují je.',
        icon: '💧',
      });
    }

    choices.sort(() => 0.5 - Math.random());
    setLevelUpChoices(choices.slice(0, 3));
  };

  const selectUpgrade = (choice: UpgradeChoice) => {
    const p = engineRef.current.player;
    if (p) {
      if (choice.type === 'new_weapon' && choice.id) {
        p.weapons.push({ id: choice.id, level: 1, cd: 0 });
      } else if (choice.type === 'upgrade_weapon' && choice.id) {
        const w = p.weapons.find((x: any) => x.id === choice.id);
        if (w) w.level++;
      } else if (choice.type === 'passive' && choice.stat) {
        if (choice.stat === 'maxHp') {
          p.maxHp += 25;
          p.hp += 25;
        } else if (choice.stat === 'speed') {
          p.speed += 20;
        } else if (choice.stat === 'pickupRadius') {
          p.pickupRadius += 35;
        }
      } else if (choice.type === 'modifier') {
        p.hasSoakedCane = true;
      }
    }
    sound.coin();
    setGameState('playing');
    engineRef.current.lastTime = performance.now();
  };

  // Open Painted Chest sequence
  const openChestSequence = () => {
    sound.chest();
    setGameState('chest');

    const possibleRewards = [
      { name: '+50 Krejcarů do měšce', icon: '💰', action: () => setRunStats((s) => ({ ...s, coins: s.coins + 50 })) },
      { name: 'Svatovítský balzám (+35 HP)', icon: '🧪', action: () => {
        const p = engineRef.current.player;
        if (p) p.hp = Math.min(p.maxHp, p.hp + 35);
      }},
      { name: 'Kynutý koláč (+20 Max HP)', icon: '🥧', action: () => {
        const p = engineRef.current.player;
        if (p) { p.maxHp += 20; p.hp += 20; }
      }},
      { name: 'Toulavé boty (+20 Rychlost)', icon: '👢', action: () => {
        const p = engineRef.current.player;
        if (p) p.speed += 20;
      }},
    ];

    possibleRewards.sort(() => 0.5 - Math.random());
    setChestRewards(possibleRewards.slice(0, Math.floor(Math.random() * 2) + 2));
  };

  const closeChestSequence = () => {
    chestRewards.forEach((r) => r.action());
    sound.coin();
    setGameState('playing');
    engineRef.current.lastTime = performance.now();
  };

  // Rescue Chasník Kuba event
  const triggerRescueChasnik = (x: number, y: number) => {
    sound.cheer();
    engineRef.current.texts.push(new DamageText(x, y - 50, 'CHASNÍK KUBA ZACHRÁNĚN! +50 🪙', COLORS.mustard, true));
    setRunStats((s) => ({ ...s, coins: s.coins + 50, chasniks: s.chasniks + 1 }));

    const p = engineRef.current.player;
    if (p) {
      p.hp = Math.min(p.maxHp, p.hp + 35);
      engineRef.current.texts.push(new DamageText(p.x, p.y - 30, '+35 HP (Od souseda)', COLORS.green, true));
    }

    // Companion joins player
    engineRef.current.companion = {
      x,
      y,
      life: 30,
      throwCd: 0.5,
      animTime: 0,
    };
  };

  // Village upgrade handler
  const handleVillageUpgrade = (key: keyof MetaProgression, cost: number) => {
    if (meta.krejcary < cost) return;
    const curLevel = (meta[key] as number) || 0;
    saveMeta({
      ...meta,
      krejcary: meta.krejcary - cost,
      [key]: curLevel + 1,
    });
  };

  // Main canvas game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - engineRef.current.lastTime) / 1000);
      engineRef.current.lastTime = now;
      engineRef.current.uiTime += dt;

      // Animate character portraits in main menu
      if (gameState === 'menu') {
        const t = engineRef.current.uiTime;
        if (wandererRef.current) {
          const wCtx = wandererRef.current.getContext('2d');
          if (wCtx) {
            wCtx.clearRect(0, 0, 180, 180);
            Lada.drawWanderer(wCtx, 90, 120, t, 0, 0, false, 1.4);
          }
        }
        if (shepherdRef.current) {
          const sCtx = shepherdRef.current.getContext('2d');
          if (sCtx) {
            sCtx.clearRect(0, 0, 180, 180);
            Lada.drawShepherd(sCtx, 90, 120, t, 0, 0, false, 1.4);
          }
        }
        if (korenarkaRef.current) {
          const kCtx = korenarkaRef.current.getContext('2d');
          if (kCtx) {
            kCtx.clearRect(0, 0, 180, 180);
            Lada.drawKorenarka(kCtx, 90, 120, t, 0, 0, false, 1.4);
          }
        }
        if (watchmanRef.current) {
          const mCtx = watchmanRef.current.getContext('2d');
          if (mCtx) {
            mCtx.clearRect(0, 0, 180, 180);
            Lada.drawWatchman(mCtx, 90, 120, t, 0, 0, false, 1.4);
          }
        }
      }

      // In-game simulation
      if (gameState === 'playing' || gameState === 'fleeing') {
        const engine = engineRef.current;
        const player = engine.player;

        if (player) {
          // Time & Day/Night phase tracking
          if (gameState === 'playing') {
            const newTime = runStats.time + dt;
            const currentPhase = getCurrentDayPhase(newTime);

            // Check dawn victory
            if (newTime >= 360 && runStats.time < 360) {
              sound.rooster();
              sound.victory();
              engine.texts.push(new DamageText(player.x, player.y - 70, 'KUROPĚNÍ! KOHOUT ZAKOKRHAL!', COLORS.mustard, true));
              // All monsters panic and flee
              engine.enemies.forEach((e) => {
                e.panicked = true;
                e.isDefeated = true;
              });
            }

            // Spawn bosses and events
            if (!engine.poledniceSpawned && newTime >= 35) {
              engine.poledniceSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              engine.enemies.push(createEnemyInstance('polednice', player.x + Math.cos(ang) * 550, player.y + Math.sin(ang) * 550, 1.2));
              engine.texts.push(new DamageText(player.x, player.y - 50, 'POZOR: POLEDNICE SE SRPEM!', COLORS.mustard, true));
              sound.slash();
            }

            if (!engine.bossSpawned && (newTime >= 120 || runStats.kills >= 60)) {
              engine.bossSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              engine.enemies.push(createEnemyInstance('cert', player.x + Math.cos(ang) * 560, player.y + Math.sin(ang) * 560, 1.5, true));
              sound.boss();
              setRunStats((s) => ({
                ...s,
                bossTitle: '👹 PEKELNÝ ČERT',
                bossHpPct: 100,
                warningBanner: '⚠️ PŘICHÁZÍ PEKELNÝ ČERT! ⚠️',
              }));
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4000);
            }

            if (!engine.hejkalSpawned && (newTime >= 240 || runStats.kills >= 130)) {
              engine.hejkalSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              engine.enemies.push(createEnemyInstance('hejkal', player.x + Math.cos(ang) * 580, player.y + Math.sin(ang) * 580, 1.8, true));
              sound.roar();
              setRunStats((s) => ({
                ...s,
                bossTitle: '🌲 PŮLNOČNÍ HEJKAL',
                bossHpPct: 100,
                warningBanner: '🌲 PŘICHÁZÍ PŮLNOČNÍ HEJKAL! 🌲',
              }));
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
            }

            if (!engine.chasnikSpawned && (newTime >= 50 || runStats.kills >= 40)) {
              engine.chasnikSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const cx = player.x + Math.cos(ang) * 480;
              const cy = player.y + Math.sin(ang) * 480;
              engine.drops.push({
                type: 'chasnik',
                x: cx,
                y: cy,
                radius: 26,
                time: 0,
                rescued: false,
              });
              // Spawn wave of rarachs harassing him
              for (let i = 0; i < 5; i++) {
                engine.enemies.push(createEnemyInstance('rarach', cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60, 1));
              }
              engine.texts.push(new DamageText(player.x, player.y - 50, 'CHASNÍK V NOUZI!', COLORS.mustard, true));
              sound.hit();
            }

            // Regular mob spawn waves
            const enemyCap = 180;
            if (engine.enemies.length < enemyCap && Math.random() < 0.35) {
              const spawnCount = Math.floor(1 + newTime / 30);
              for (let i = 0; i < spawnCount; i++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 700 + Math.random() * 200;
                let mobId = 'rarach';

                if (currentPhase.id === 'noon') {
                  mobId = Math.random() > 0.6 ? 'zaba' : Math.random() > 0.3 ? 'rarach' : 'sotek';
                } else if (currentPhase.id === 'afternoon') {
                  mobId = Math.random() > 0.7 ? 'divozenka' : Math.random() > 0.4 ? 'hastrman' : 'rarach';
                } else if (currentPhase.id === 'dusk') {
                  mobId = Math.random() > 0.65 ? 'klekanice' : Math.random() > 0.35 ? 'skeleton' : 'certik';
                } else if (currentPhase.id === 'night') {
                  mobId = Math.random() > 0.7 ? 'bubak' : Math.random() > 0.4 ? 'skeleton_scythe' : 'bludicka';
                } else if (currentPhase.id === 'midnight') {
                  mobId = Math.random() > 0.7 ? 'hromotluk' : Math.random() > 0.4 ? 'drab' : 'meluzina';
                }

                if (season === 'winter' && Math.random() > 0.5) {
                  mobId = Math.random() > 0.5 ? 'meluzina' : 'zmrzlik';
                }

                engine.enemies.push(createEnemyInstance(mobId, player.x + Math.cos(ang) * dist, player.y + Math.sin(ang) * dist, 1 + newTime / 90));
              }
            }

            // Player movement
            let mx = 0;
            let my = 0;
            const keys = engine.keys;
            if (keys.KeyW || keys.ArrowUp) my -= 1;
            if (keys.KeyS || keys.ArrowDown) my += 1;
            if (keys.KeyA || keys.ArrowLeft) mx -= 1;
            if (keys.KeyD || keys.ArrowRight) mx += 1;

            if (touchMoveRef.current.active) {
              mx += touchMoveRef.current.x;
              my += touchMoveRef.current.y;
            }

            if (mx !== 0 || my !== 0) {
              const len = Math.hypot(mx, my);
              const speedMultiplier = player.soulBuffTimer > 0 ? 1.25 : 1;
              player.x += (mx / len) * player.speed * speedMultiplier * dt;
              player.y += (my / len) * player.speed * speedMultiplier * dt;
              player.lastDx = mx;
              player.lastDy = my;
              player.animTime += dt;
            } else {
              player.animTime = 0;
            }

            if (player.soulBuffTimer > 0) player.soulBuffTimer -= dt;
            if (player.ultCd > 0) player.ultCd -= dt;

            // Player regeneration
            if (player.regenLevel > 0 && player.hp < player.maxHp) {
              player.regenTimer += dt;
              if (player.regenTimer >= 5) {
                player.hp = Math.min(player.maxHp, player.hp + player.regenLevel);
                player.regenTimer = 0;
                engine.texts.push(new DamageText(player.x, player.y - 40, `+${player.regenLevel} 🍺`, COLORS.green));
              }
            }
            if (player.type === 'korenarka' && player.hp < player.maxHp) {
              player.herbTimer += dt;
              if (player.herbTimer >= 4) {
                player.hp = Math.min(player.maxHp, player.hp + 2);
                player.herbTimer = 0;
                engine.texts.push(new DamageText(player.x, player.y - 45, '+2 🌿', COLORS.green));
              }
            }

            // Night Watchman passive holy aura
            if (player.type === 'watchman') {
              for (const e of engine.enemies) {
                if (!e.isDefeated && Math.hypot(player.x - e.x, player.y - e.y) < 85 + e.radius) {
                  e.takeDamage(16 * player.damageMultiplier * dt, 'holy', 0, 0);
                }
              }
            }

            // Fire weapons
            for (const w of player.weapons) {
              w.cd -= dt;
              if (w.cd <= 0) {
                const wDef = WEAPONS[w.id];
                if (wDef) {
                  const fired = wDef.fire(player, w.level);
                  w.cd = fired ? wDef.baseCd * Math.max(0.2, 1 - w.level * 0.05) : 0.1;
                }
              }
            }

            // Companion behavior (Kuba with sling)
            if (engine.companion) {
              const comp = engine.companion;
              comp.life -= dt;
              comp.animTime += dt;
              comp.throwCd -= dt;

              const targetX = player.x + Math.cos(comp.animTime * 1.5) * 60;
              const targetY = player.y + Math.sin(comp.animTime * 1.5) * 60;
              comp.x += (targetX - comp.x) * 4 * dt;
              comp.y += (targetY - comp.y) * 4 * dt;

              if (comp.throwCd <= 0) {
                const living = player.getLivingEnemies();
                if (living.length > 0) {
                  const target = living[0];
                  const ang = Math.atan2(target.y - comp.y, target.x - comp.x);
                  player.spawnProjectile({
                    x: comp.x,
                    y: comp.y,
                    angle: ang,
                    speed: 420,
                    dmg: 18,
                    radius: 10,
                    type: 'physical',
                    visual: season === 'winter' ? 'snowball_small' : 'stone',
                    life: 2.0,
                  });
                  sound.slash();
                  comp.throwCd = 0.85;
                }
              }

              if (comp.life <= 0) {
                engine.companion = null;
                engine.texts.push(new DamageText(comp.x, comp.y - 30, 'Mějte se, sousede!', COLORS.parchment));
              }
            }

            // Camera follow
            engine.camera.x += (player.x - canvas.width / 2 - engine.camera.x) * 0.1;
            engine.camera.y += (player.y - canvas.height / 2 - engine.camera.y) * 0.1;

            // Sync run stats
            setRunStats((prev) => ({
              ...prev,
              time: newTime,
              dayPhase: currentPhase,
              hp: player.hp,
              maxHp: player.maxHp,
              ultCd: player.ultCd,
            }));
          } else if (gameState === 'fleeing') {
            engine.fleeTimer -= dt;
            if (engine.fleeTimer <= 0) {
              // Transition to tally screen
              setTallyCounters({
                kills: runStats.kills,
                coins: runStats.coins,
                souls: runStats.souls,
                time: Math.floor(runStats.time),
              });
              const updatedHighest = Math.max(meta.highestSurviveTime || 0, runStats.time);
              saveMeta({
                ...meta,
                highestSurviveTime: updatedHighest,
              });
              setGameState('tally');
            }
          }

          // Update Projectiles
          for (const p of engine.projectiles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) p.dead = true;

            // Homing bees
            if (p.homing) {
              const living = player.getLivingEnemies();
              if (living.length > 0) {
                const target = living[0];
                const targetAng = Math.atan2(target.y - p.y, target.x - p.x);
                p.vx += Math.cos(targetAng) * 400 * dt;
                p.vy += Math.sin(targetAng) * 400 * dt;
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 350) {
                  p.vx = (p.vx / spd) * 350;
                  p.vy = (p.vy / spd) * 350;
                }
              }
            }

            for (const e of engine.enemies) {
              if (e.isDefeated) continue;
              if (!p.hitList.includes(e) && Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
                p.hitList.push(e);
                const resist = p.type === 'food' ? e.foodResist || 0 : 0;
                if (resist >= 0.95) {
                  engine.texts.push(new DamageText(e.x, e.y - 20, 'IMUNNÍ', COLORS.ink));
                } else {
                  let dmg = p.dmg * (1 - resist);
                  if (p.type === 'holy' && (e.category === 'undead' || e.category === 'demons')) {
                    dmg *= 2.0;
                    engine.texts.push(new DamageText(e.x, e.y - 45, 'SVATÁ ZKÁZA!', COLORS.mustard, true));
                  }
                  e.takeDamage(dmg, p.type, p.vx * 0.3, p.vy * 0.3);
                  if (p.type === 'ice') e.chill(3.5);

                  // Bouncing poppy cake
                  if (p.bounces && p.bounces > 0) {
                    p.bounces--;
                    const living = player.getLivingEnemies().filter((x: any) => x !== e);
                    if (living.length > 0) {
                      const next = living[0];
                      const bAng = Math.atan2(next.y - p.y, next.x - p.x);
                      p.vx = Math.cos(bAng) * p.speed;
                      p.vy = Math.sin(bAng) * p.speed;
                      p.hitList = [];
                      break;
                    }
                  }
                  p.dead = true;
                  break;
                }
              }
            }
          }
          engine.projectiles = engine.projectiles.filter((p) => !p.dead);

          // Update Melee Slashes
          for (const s of engine.slashes) {
            s.x = player.x;
            s.y = player.y;
            s.life -= dt;
            if (s.life <= 0) s.dead = true;

            for (const e of engine.enemies) {
              if (e.isDefeated) continue;
              if (!s.hitList.includes(e) && Math.hypot(s.x - e.x, s.y - e.y) <= s.reach + e.radius) {
                const ang = Math.atan2(e.y - s.y, e.x - s.x);
                let diff = Math.abs(ang - s.angle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                if (diff <= s.arc / 2) {
                  s.hitList.push(e);
                  e.takeDamage(s.dmg, s.type, Math.cos(s.angle) * 260, Math.sin(s.angle) * 260);
                  if (s.soaked) e.soak();
                }
              }
            }
          }
          engine.slashes = engine.slashes.filter((s) => !s.dead);

          // Update Enemies
          for (const e of engine.enemies) {
            e.update(dt, player);

            if (!e.isDefeated && Math.hypot(e.x - player.x, e.y - player.y) < e.radius + player.radius) {
              if (gameState === 'playing') {
                const hurtDmg = e.damage * dt * (1 - player.damageReduction);
                player.hp -= hurtDmg;
                sound.hit();
                if (player.hp <= 0) {
                  // Player defeated -> start flee sequence
                  sound.hit();
                  setGameState('fleeing');
                  engine.fleeTimer = 3.0;
                  engine.enemies.forEach((m) => {
                    m.panicked = true;
                    m.vx = -m.vx * 3;
                    m.vy = -m.vy * 3;
                  });
                  engine.texts.push(new DamageText(player.x, player.y - 60, 'PŘEMOŽEN!', COLORS.red, true));
                }
              }
            }
          }
          engine.enemies = engine.enemies.filter((e) => !e.dead);

          // Update Drops
          for (const d of engine.drops) {
            d.time += dt;
            const dist = Math.hypot(d.x - player.x, d.y - player.y);

            if (d.type === 'chasnik') {
              if (!d.rescued && dist < d.radius + player.radius + 35) {
                d.rescued = true;
                d.dead = true;
                triggerRescueChasnik(d.x, d.y);
              }
            } else if (dist < player.pickupRadius && gameState === 'playing') {
              const spd = 480 * dt;
              const ang = Math.atan2(player.y - d.y, player.x - d.x);
              d.x += Math.cos(ang) * spd;
              d.y += Math.sin(ang) * spd;

              if (dist < player.radius + d.radius) {
                d.dead = true;
                if (d.type === 'coin') {
                  const val = d.value || 1;
                  sound.coin();
                  setRunStats((s) => {
                    const nextXp = s.xp + val;
                    const nextCoins = s.coins + val;
                    if (nextXp >= s.xpNeeded) {
                      openLevelUpModal();
                      return {
                        ...s,
                        xp: nextXp - s.xpNeeded,
                        level: s.level + 1,
                        xpNeeded: Math.floor(s.xpNeeded * 1.5),
                        coins: nextCoins,
                      };
                    }
                    return { ...s, xp: nextXp, coins: nextCoins };
                  });
                } else if (d.type === 'potion') {
                  sound.potion();
                  player.hp = Math.min(player.maxHp, player.hp + 30);
                  engine.texts.push(new DamageText(player.x, player.y - 45, '+30 HP 🧪', COLORS.green, true));
                } else if (d.type === 'bread') {
                  sound.potion();
                  player.hp = Math.min(player.maxHp, player.hp + 15);
                  engine.texts.push(new DamageText(player.x, player.y - 40, '+15 HP 🥧', COLORS.mustard));
                } else if (d.type === 'soul') {
                  sound.soul();
                  player.soulBuffTimer = 6.0;
                  setRunStats((s) => ({ ...s, souls: s.souls + 1, coins: s.coins + 25 }));
                  engine.texts.push(new DamageText(player.x, player.y - 45, 'DUŠIČKA OSVOBOZENA! +25 🪙', COLORS.mustard, true));
                } else if (d.type === 'chest') {
                  openChestSequence();
                }
              }
            }
          }
          engine.drops = engine.drops.filter((d) => !d.dead);

          // Update texts
          for (const txt of engine.texts) txt.update(dt);
          engine.texts = engine.texts.filter((t) => t.life > 0);
        }
      }

      // -------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing' || gameState === 'fleeing' || gameState === 'levelup' || gameState === 'chest') {
        const engine = engineRef.current;
        const player = engine.player;
        const cam = engine.camera;
        const phase = runStats.dayPhase;

        // Sky / Grass background
        ctx.fillStyle = season === 'winter' ? '#E9F1F7' : phase.skyColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply camera translate
        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        // Ambient night/day tint over world
        if (season !== 'winter' && phase.ambientTint !== 'transparent') {
          ctx.fillStyle = phase.ambientTint;
          ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
        }

        // Draw Decor
        for (const dec of engine.decor) {
          dec.draw(ctx, season);
        }

        // Draw Drops
        for (const d of engine.drops) {
          if (d.type === 'coin') {
            Lada.drawCoin(ctx, d.x, d.y, d.time, d.value || 1);
          } else if (d.type === 'potion') {
            Lada.drawPotion(ctx, d.x, d.y, d.time);
          } else if (d.type === 'bread') {
            Lada.drawBreadRoll(ctx, d.x, d.y, d.time);
          } else if (d.type === 'soul') {
            Lada.drawSoulJar(ctx, d.x, d.y, d.time);
          } else if (d.type === 'chest') {
            Lada.drawChest(ctx, d.x, d.y, 0, Math.abs(Math.sin(d.time * 2)), 0.65);
          } else if (d.type === 'chasnik') {
            Lada.drawChasnik(ctx, d.x, d.y, d.time, true);
          }
        }

        // Draw Companion if active
        if (engine.companion) {
          Lada.drawChasnik(ctx, engine.companion.x, engine.companion.y, engine.companion.animTime, false);
        }

        // Sort characters & enemies by Y for correct isometric depth
        const drawables = player ? [player, ...engine.enemies] : [...engine.enemies];
        drawables.sort((a, b) => a.y - b.y);

        for (const d of drawables) {
          if (d && typeof d.draw === 'function') {
            d.draw(ctx);
          }
        }

        // Draw Projectiles
        for (const p of engine.projectiles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          if (p.visual === 'bun') {
            Lada.setupPath(ctx, COLORS.white, COLORS.ink, 3);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#6B2046';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.visual === 'herb_leaf') {
            Lada.setupPath(ctx, COLORS.green, COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'snowball' || p.visual === 'snowball_small') {
            const rad = p.visual === 'snowball' ? 12 : 7;
            Lada.setupPath(ctx, '#F8FAFC', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'kolac') {
            Lada.setupPath(ctx, '#FDE68A', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1E1B18';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.visual === 'potato') {
            Lada.setupPath(ctx, '#78350F', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'bee') {
            Lada.setupPath(ctx, COLORS.mustard, COLORS.ink, 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'holy_droplet') {
            Lada.setupPath(ctx, COLORS.ice, COLORS.ink, 2);
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Melee Slashes
        for (const s of engine.slashes) {
          ctx.save();
          ctx.translate(s.x, s.y);
          if (s.style === 'thrust') {
            ctx.rotate(s.angle);
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(s.reach, 0);
            ctx.moveTo(15, -12);
            ctx.lineTo(s.reach * 0.9, -12);
            ctx.moveTo(15, 12);
            ctx.lineTo(s.reach * 0.9, 12);
            ctx.stroke();
          } else {
            Lada.setupPath(ctx, 'transparent', s.style === 'halberd' ? '#94A3B8' : COLORS.white, 8);
            ctx.beginPath();
            ctx.arc(0, 0, s.reach * 0.8, s.angle - s.arc / 2, s.angle + s.arc / 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Damage Texts
        for (const txt of engine.texts) {
          txt.draw(ctx);
        }

        ctx.restore();

        // Winter falling snowflakes overlay
        if (season === 'winter') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          const t = engine.uiTime;
          for (let i = 0; i < 45; i++) {
            const sx = ((i * 123 + t * 40) % canvas.width);
            const sy = ((i * 77 + t * 80) % canvas.height);
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [gameState, season]);

  // Enemy instance factory
  const createEnemyInstance = (id: string, x: number, y: number, multiplier = 1, isBoss = false) => {
    const stats = ENEMIES[id] || ENEMIES.rarach;
    return {
      id,
      x,
      y,
      isBoss,
      maxHp: stats.hp * multiplier * (isBoss ? 1.5 : 1),
      hp: stats.hp * multiplier * (isBoss ? 1.5 : 1),
      speed: stats.speed,
      damage: stats.damage,
      radius: isBoss ? stats.radius * 1.3 : stats.radius,
      foodResist: stats.foodResist || 0,
      poiseResist: stats.poiseResist || 0,
      willpower: stats.willpower || 0,
      coinValue: stats.coinValue || 1,
      category: stats.category,
      method: stats.method,
      vx: 0,
      vy: 0,
      kbx: 0,
      kby: 0,
      soaked: false,
      soakedTimer: 0,
      chilled: false,
      chillTimer: 0,
      dead: false,
      isDefeated: false,
      panicked: false,
      panicTimer: 0,
      animTime: Math.random() * 10,

      update(dt: number, player: any) {
        if (this.isDefeated) {
          const fleeSpd = this.speed * 3.5;
          const ang = Math.atan2(this.y - player.y, this.x - player.x);
          this.x += Math.cos(ang) * fleeSpd * dt;
          this.y += Math.sin(ang) * fleeSpd * dt;
          if (Math.hypot(this.x - player.x, this.y - player.y) > 1400) this.dead = true;
          return;
        }

        this.kbx *= 0.9;
        this.kby *= 0.9;
        this.animTime += dt;
        if (this.panicTimer > 0) this.panicTimer -= dt;
        this.panicked = this.panicTimer > 0;

        let spd = this.speed;
        if (this.soaked) {
          spd *= 0.55;
          this.soakedTimer -= dt;
          if (this.soakedTimer <= 0) this.soaked = false;
        }
        if (this.chilled) {
          spd *= 0.45;
          this.chillTimer -= dt;
          if (this.chillTimer <= 0) this.chilled = false;
        }

        const ang = this.panicked
          ? Math.atan2(this.y - player.y, this.x - player.x)
          : Math.atan2(player.y - this.y, player.x - this.x);

        this.vx = Math.cos(ang) * spd;
        this.vy = Math.sin(ang) * spd;
        this.x += (this.vx + this.kbx) * dt;
        this.y += (this.vy + this.kby) * dt;
      },

      takeDamage(amount: number, type: string, kbx: number, kby: number) {
        if (this.isDefeated) return;
        let finalDmg = amount;
        if (this.soaked) finalDmg *= 1.45;

        this.hp -= finalDmg;
        engineRef.current.texts.push(
          new DamageText(this.x, this.y - 25, Math.floor(finalDmg).toString(), COLORS.white, this.soaked)
        );

        this.kbx = kbx * (1 - this.poiseResist);
        this.kby = kby * (1 - this.poiseResist);

        if (this.isBoss) {
          const pct = Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
          setRunStats((s) => ({ ...s, bossHpPct: pct }));
        }

        if (this.hp <= 0 && !this.isDefeated) {
          this.isDefeated = true;
          this.panicked = true;

          // Bestiary tracking
          const updatedKills = { ...meta.bestiaryKills, [this.id]: (meta.bestiaryKills[this.id] || 0) + 1 };
          saveMeta({ ...meta, bestiaryKills: updatedKills });

          setRunStats((s) => ({ ...s, kills: s.kills + 1 }));

          if (this.isBoss) {
            setRunStats((s) => ({ ...s, bossHpPct: null, bossTitle: '' }));
            sound.victory();
            sound.cheer();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 60, `${stats.name.toUpperCase()} POKOŘEN!`, COLORS.mustard, true));
            // Spawn big reward chest and coins
            engineRef.current.drops.push({ type: 'chest', x: this.x, y: this.y, radius: 25, time: 0 });
            for (let i = 0; i < 6; i++) {
              engineRef.current.drops.push({
                type: 'coin',
                value: 15, // Golden Tolars
                x: this.x + (Math.random() - 0.5) * 60,
                y: this.y + (Math.random() - 0.5) * 60,
                radius: 12,
                time: Math.random() * 5,
              });
            }
          } else {
            // Drop coins & items
            engineRef.current.chestCounter++;
            if (engineRef.current.chestCounter >= 40) {
              engineRef.current.chestCounter = 0;
              engineRef.current.drops.push({ type: 'chest', x: this.x, y: this.y, radius: 25, time: 0 });
            } else {
              // Coin drop
              engineRef.current.drops.push({
                type: 'coin',
                value: this.coinValue || 1,
                x: this.x,
                y: this.y,
                radius: 8,
                time: Math.random() * 5,
              });

              // Rare healing drop (Potion or Bread)
              const roll = Math.random();
              if (roll < 0.04) {
                engineRef.current.drops.push({ type: 'potion', x: this.x + 10, y: this.y, radius: 12, time: 0 });
              } else if (roll < 0.09) {
                engineRef.current.drops.push({ type: 'bread', x: this.x + 10, y: this.y, radius: 10, time: 0 });
              }

              // Hastrman drops soul jars
              if (this.category === 'water' && Math.random() < 0.65) {
                engineRef.current.drops.push({ type: 'soul', x: this.x - 12, y: this.y, radius: 14, time: 0 });
              }
            }
          }
        }
      },

      soak() {
        this.soaked = true;
        this.soakedTimer = 5.0;
      },

      chill(duration = 3.5) {
        this.chilled = true;
        this.chillTimer = duration;
      },

      draw(ctx: CanvasRenderingContext2D) {
        Lada.drawShadow(ctx, this.x, this.y, this.radius);
        if (this.id === 'cert') {
          Lada.drawCert(ctx, this.x, this.y, this.animTime, this.vx, this.panicked, this.isBoss);
        } else if (this.id === 'hejkal') {
          Lada.drawHejkal(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
        } else if (this.id === 'obr') {
          Lada.drawObr(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
        } else if (this.id === 'meluzina') {
          Lada.drawMeluzina(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
        } else if (this.id === 'polednice') {
          Lada.drawPolednice(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
        } else if (this.id === 'klekanice') {
          Lada.drawKlekanice(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
        } else {
          const drawer = (Lada as any)[this.method];
          if (typeof drawer === 'function') {
            drawer.call(Lada, ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
          } else {
            Lada.drawRarach(ctx, this.x, this.y, this.animTime, this.vx, this.panicked);
          }
        }

        if (this.soaked && !this.isDefeated) {
          ctx.fillStyle = 'rgba(58, 118, 168, 0.4)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        if (this.chilled && !this.isDefeated) {
          ctx.fillStyle = 'rgba(196, 225, 246, 0.45)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  };

  // Download standalone offline HTML game
  const downloadGameHtml = () => {
    sound.coin();
    const docHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bubakov_hra_ladovska_edice.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  // Download complete game HTML saved as TXT file
  const downloadGameTxt = () => {
    sound.coin();
    const docHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const blob = new Blob([docHtml], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bubakov_hra_ladovska_edice.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const claimTrophy = (id: string) => {
    const trophy = TROPHIES.find((t) => t.id === id);
    if (!trophy || meta.trophiesClaimed[id] || !trophy.isMet(meta)) return;

    sound.cheer();
    sound.coin();
    saveMeta({
      ...meta,
      krejcary: meta.krejcary + trophy.reward,
      trophiesClaimed: { ...meta.trophiesClaimed, [id]: true },
    });
  };

  return (
    <>
      <canvas id="gameCanvas" ref={canvasRef} />

      {/* IN-GAME HUD */}
      {gameState === 'playing' && (
        <div id="hud">
          {/* Top-right menu controls */}
          <div className="hud-top-right">
            <button className="season-toggle-btn" onClick={toggleSeason} title="Přepnout roční období">
              <span className="season-toggle-text">
                {season === 'winter' ? '❄️ Zima: Ladovská' : '🍂 Podzim: Zlatavý'}
              </span>
            </button>
            <button className="touch-toggle-btn" onClick={toggleTouch} title="Přepnout dotykový joystick">
              🕹️ Joystick: <span className="touch-toggle-text">{touchEnabled ? 'Zap' : 'Vyp'}</span>
            </button>
            <button className="download-toggle-btn" onClick={downloadGameHtml} title="Stáhnout hru pro offline hraní (HTML)">
              📥 Stáhnout HTML
            </button>
            <button className="download-toggle-btn btn-txt-download" onClick={downloadGameTxt} title="Stáhnout celou hru jako TXT soubor">
              📄 Stáhnout TXT
            </button>
            <button className="sound-toggle-btn" onClick={toggleSound}>
              <span className="sound-btn-text">{soundEnabled ? '🔊 Zvuk: Zap' : '🔇 Zvuk: Vyp'}</span>
            </button>
          </div>

          {/* Top Bar with XP and Stats */}
          <div id="top-bar">
            {/* XP bar */}
            <div className="bar-container">
              <div id="xp-fill" style={{ width: `${(runStats.xp / runStats.xpNeeded) * 100}%` }} />
              <div className="bar-text" id="level-text">
                ÚROVEŇ {runStats.level}
              </div>
            </div>

            {/* Stats row with Day/Night clock indicator */}
            <div id="stats-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.6rem' }}>{runStats.dayPhase.icon}</span>
                <div>
                  <div style={{ fontSize: '1.4rem', lineHeight: 1 }}>{formatTimer(runStats.time)}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--wood-dark)', fontWeight: 800 }}>
                    {runStats.dayPhase.name}
                  </div>
                </div>
              </div>
              <div id="coins-text">Krejcary: {runStats.coins} 🪙</div>
              <div id="souls-text">🏺 Dušičky: {runStats.souls}</div>
              <div id="kills-text">Přemoženo: {runStats.kills} 💀</div>
            </div>

            {/* Boss Bar if boss spawned */}
            {runStats.bossHpPct !== null && (
              <div id="boss-bar-wrap">
                <div className="boss-title-text">{runStats.bossTitle}</div>
                <div id="boss-bar-container">
                  <div id="boss-hp-fill" style={{ width: `${runStats.bossHpPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Warning Banner */}
          {runStats.warningBanner && (
            <div id="boss-warning-banner">{runStats.warningBanner}</div>
          )}

          {/* Ultimate ability indicator button */}
          <button
            id="ult-indicator"
            onClick={triggerUltimate}
            style={{
              backgroundColor: runStats.ultCd <= 0 ? 'var(--blood-red)' : 'var(--wood-light)',
              transform: runStats.ultCd <= 0 ? 'translateX(-50%) scale(1.05)' : 'translateX(-50%) scale(1)',
            }}
          >
            {runStats.ultCd <= 0
              ? '⚡ SPECIÁLNÍ SCHOPNOST: PŘIPRAVENA! (MEZERNÍK / KLIK)'
              : `⚡ Speciální schopnost: ${Math.ceil(runStats.ultCd)} s`}
          </button>
        </div>
      )}

      {/* TOUCH CONTROLS */}
      {gameState === 'playing' && (
        <TouchControls
          enabled={touchEnabled}
          active={touchMoveRef.current.active}
          onMove={(x, y, intensity) => {
            touchMoveRef.current = { x, y, active: true, intensity };
          }}
          onStop={() => {
            touchMoveRef.current = { x: 0, y: 0, active: false, intensity: 0 };
          }}
          onTriggerUltimate={triggerUltimate}
          ultCooldown={runStats.ultCd}
        />
      )}

      {/* MAIN MENU */}
      {gameState === 'menu' && (
        <div id="main-menu" className="overlay">
          <div className="menu-top-right">
            <button className="season-toggle-btn" onClick={toggleSeason}>
              <span className="season-toggle-text">
                {season === 'winter' ? '❄️ Zima: Ladovská' : '🍂 Podzim: Zlatavý'}
              </span>
            </button>
            <button className="touch-toggle-btn" onClick={toggleTouch}>
              🕹️ Joystick: <span className="touch-toggle-text">{touchEnabled ? 'Zap' : 'Vyp'}</span>
            </button>
            <button className="sound-toggle-btn" onClick={toggleSound}>
              <span className="sound-btn-text">{soundEnabled ? '🔊 Zvuk: Zap' : '🔇 Zvuk: Vyp'}</span>
            </button>
          </div>

          <div className="panel" style={{ maxWidth: '980px' }}>
            <h1>BUBÁKOV</h1>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '-5px' }}>
              Přežijte noc ve světě venkovského děsu Josefa Lady.
            </p>

            <h3 style={{ marginTop: '20px' }}>Vyberte si svého lovce:</h3>
            <div className="char-select-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
              {/* Poutník */}
              <div className="char-card" onClick={() => startGame('wanderer')}>
                <canvas ref={wandererRef} className="portrait-canvas" width={180} height={180} />
                <h3 style={{ fontSize: '1.65rem', margin: '6px 0 2px 0' }}>Poutník</h3>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>
                  Vysoké zdraví. Povidlové buchty a rákoska. Schopnost: Rázová vlna.
                </p>
              </div>

              {/* Pasáček */}
              <div className="char-card" onClick={() => startGame('shepherd')}>
                <canvas ref={shepherdRef} className="portrait-canvas" width={180} height={180} />
                <h3 style={{ fontSize: '1.65rem', margin: '6px 0 2px 0' }}>Pasáček</h3>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>
                  Rychlý, snadno sbírá krejcary. Schopnost: Dusot stáda.
                </p>
              </div>

              {/* Bába kořenářka */}
              <div className="char-card" onClick={() => startGame('korenarka')}>
                <canvas ref={korenarkaRef} className="portrait-canvas" width={180} height={180} />
                <h3 style={{ fontSize: '1.65rem', margin: '6px 0 2px 0' }}>Bába kořenářka</h3>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>
                  Léčivý balzám, Devatery kvítí. Schopnost: Očistné kadidlo.
                </p>
              </div>

              {/* Ponocný */}
              <div className="char-card" onClick={() => startGame('watchman')}>
                <canvas ref={watchmanRef} className="portrait-canvas" width={180} height={180} />
                <h3 style={{ fontSize: '1.65rem', margin: '6px 0 2px 0' }}>Ponocný</h3>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>
                  Halapartna, svatá záře lucerny. Schopnost: Noční roh & Voříšek.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="lada-btn btn-download" onClick={downloadGameHtml} title="Stáhnout celou hru jako HTML soubor">
                📥 Stáhnout celou hru (HTML)
              </button>
              <button className="lada-btn btn-download-txt" onClick={downloadGameTxt} title="Stáhnout celou hru (HTML) jako TXT soubor">
                📄 Stáhnout celou hru (TXT)
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                📖 Bestiář nočního venkova
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsPlanOpen(true)}>
                📜 Plán změn a kronika
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                onClick={() => setGameState('tavern')}
              >
                🏘️ Vesnice & Hospoda ({meta.krejcary} 🪙)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL UP MODAL */}
      {gameState === 'levelup' && (
        <div id="level-up-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '650px' }}>
            <h2>NOVÁ ÚROVEŇ!</h2>
            <p style={{ fontWeight: 700, marginTop: '-5px', marginBottom: '15px' }}>
              Vyberte si vylepšení pro svého lovce:
            </p>
            <div id="choices-container">
              {levelUpChoices.map((c, i) => (
                <div key={i} className="choice-card" onClick={() => selectUpgrade(c)}>
                  <div className="choice-icon">{c.icon}</div>
                  <div className="choice-text">
                    <h3>{c.name}</h3>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAINTED CHEST SEQUENCE */}
      {gameState === 'chest' && (
        <div id="chest-ui" className="overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="panel" style={{ maxWidth: '600px', background: 'var(--wood-dark)' }}>
            <h1 style={{ color: 'var(--mustard)' }}>MALOVANÁ TRUHLA!</h1>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--parchment)' }}>
              Bohatá kořist z venkovského pokladu:
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '25px 0', flexWrap: 'wrap' }}>
              {chestRewards.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--parchment)',
                    border: '4px solid var(--ink)',
                    borderRadius: '8px',
                    padding: '15px 20px',
                    color: 'var(--ink)',
                    textAlign: 'center',
                    minWidth: '150px',
                    boxShadow: '4px 4px 0 var(--mustard)',
                  }}
                >
                  <div style={{ fontSize: '3rem' }}>{r.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', marginTop: '6px' }}>{r.name}</div>
                </div>
              ))}
            </div>
            <button className="lada-btn" style={{ padding: '12px 35px', fontSize: '1.4rem' }} onClick={closeChestSequence}>
              Vyzvednout poklad
            </button>
          </div>
        </div>
      )}

      {/* TALLY SCREEN */}
      {gameState === 'tally' && (
        <div id="tally-screen" className="overlay">
          <h1 className="tally-title" id="tally-title" style={{ animation: 'popIn 0.5s forwards' }}>
            VÝPRAVA SKONČILA!
          </h1>
          <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
            <span>Přemožených bubáků:</span>
            <span className="tally-number">{tallyCounters.kills}</span>
          </div>
          <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
            <span>Získaných krejcarů:</span>
            <span className="tally-number">{tallyCounters.coins}</span>
          </div>
          <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
            <span>Osvobozených dušiček:</span>
            <span className="tally-number">{tallyCounters.souls}</span>
          </div>
          <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
            <span>Doba přežití:</span>
            <span className="tally-number">{formatTimer(tallyCounters.time)}</span>
          </div>

          <button
            className="lada-btn"
            style={{ marginTop: '35px', fontSize: '1.4rem', padding: '12px 35px' }}
            onClick={() => {
              saveMeta({
                ...meta,
                krejcary: meta.krejcary + tallyCounters.coins,
                totalSoulsSaved: (meta.totalSoulsSaved || 0) + tallyCounters.souls,
                totalChasnikSaved: (meta.totalChasnikSaved || 0) + runStats.chasniks,
              });
              setGameState('tavern');
            }}
          >
            Vstoupit do hospody
          </button>
        </div>
      )}

      {/* TAVERN & VILLAGE SCREEN */}
      {gameState === 'tavern' && (
        <div id="tavern-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '1000px' }}>
            <h1>HOSPODA U ČERNÉHO KOCOURA 🍻</h1>
            <p style={{ fontWeight: 900, fontSize: '1.35rem', marginTop: '-12px', color: 'var(--mustard)' }}>
              🎶 V koutě vyhrávají pekelné dudy a voní čerstvý chléb... 🎵
            </p>

            <div className="modal-tabs" style={{ marginBottom: '14px' }}>
              <button
                className={`tab-btn ${activeTavernTab === 'crafts' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTavernTab('crafts');
                  sound.coin();
                }}
              >
                🏘️ Naše vesnice Bubákov
              </button>
              <button
                className={`tab-btn ${activeTavernTab === 'trophies' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTavernTab('trophies');
                  sound.coin();
                }}
              >
                🏆 Síň slávy a Syslovské výzvy
              </button>
            </div>

            {activeTavernTab === 'crafts' ? (
              <VillageView
                meta={meta}
                onUpgrade={handleVillageUpgrade}
                onClose={() => setGameState('menu')}
              />
            ) : (
              <div>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '5px 0 15px 0' }}>
                  Plňte výzvy rychtáře a pamětníků a získejte štědré odměny do své stálé pokladny!
                </p>
                <div className="trophies-grid">
                  {TROPHIES.map((t) => {
                    const claimed = !!meta.trophiesClaimed[t.id];
                    const isMet = t.isMet(meta);
                    const prog = t.getProgress(meta);

                    return (
                      <div key={t.id} className={`trophy-card ${claimed ? 'claimed' : isMet ? 'completed' : ''}`}>
                        <div>
                          <div className="trophy-header">
                            <h4 className="trophy-title">{t.title}</h4>
                            <span className="trophy-reward">+{t.reward} 🪙</span>
                          </div>
                          <p className="trophy-desc">{t.desc}</p>
                        </div>
                        <div className="trophy-action-row">
                          <span className="trophy-progress-text">
                            Postup: {prog.cur} / {prog.max}
                          </span>
                          {claimed ? (
                            <span className="badge-claimed">✅ Splněno</span>
                          ) : isMet ? (
                            <button className="btn-claim-trophy" onClick={() => claimTrophy(t.id)}>
                              Vyzvednout (+{t.reward})
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6 }}>⏳ Nesplněno</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <button className="lada-btn btn-download" style={{ padding: '12px 28px' }} onClick={downloadGameHtml} title="Stáhnout celou hru jako HTML soubor">
                📥 Stáhnout hru (HTML)
              </button>
              <button className="lada-btn btn-download-txt" style={{ padding: '12px 28px' }} onClick={downloadGameTxt} title="Stáhnout celou hru (HTML) jako TXT soubor">
                📄 Stáhnout hru (TXT)
              </button>
              <button className="lada-btn" style={{ padding: '12px 28px' }} onClick={() => setGameState('menu')}>
                Zpět do nabídky
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BESTIARY MODAL */}
      <BestiaryModal
        isOpen={isBestiaryOpen}
        onClose={() => setIsBestiaryOpen(false)}
        bestiaryKills={meta.bestiaryKills || {}}
      />

      {/* PLAN MODAL */}
      <PlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        defaultTab="plan"
      />
    </>
  );
}
