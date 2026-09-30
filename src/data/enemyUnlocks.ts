import { EnemyCategory, EnemyStats } from '../types';
import { ENEMIES } from './enemies';

export interface EnemyProgress {
  id: string;
  name: string; // spoiled or real
  title: string; // spoiled or real
  category: EnemyCategory;
  kills: number;
  maxKills: number; // Kills required for 100% full study
  percent: number; // 0 - 100
  tier: 0 | 1 | 2 | 3 | 4;
  isUnlocked: boolean; // tier === 4 (or kills >= maxKills)
  isDiscovered: boolean; // kills > 0
  clueTag: string;
  spoiledLore: string;
  spoiledWeakness: string;
  spoiledStrength: string;
  spoiledStats: {
    hp: string;
    danger: string;
    coinValue: string;
    speed: string;
  };
  icon: string;
  realEnemy: EnemyStats;
}

export function getEnemyMaxKills(enemy: EnemyStats): number {
  if (enemy.category === 'bosses') {
    return 3; // Bosses: 0=locked, 1 kill=50%, 2 kills=75%, 3 kills=100%
  }
  if (enemy.category === 'demons' || enemy.hp >= 300) {
    return 10;
  }
  if (enemy.category === 'undead' || enemy.category === 'shadows' || enemy.category === 'frost' || enemy.category === 'fields' || enemy.category === 'water') {
    return 15;
  }
  return 20; // swarms & common critters
}

export function getObscuredName(name: string, tier: 0 | 1 | 2 | 3 | 4): string {
  if (tier >= 4) return name;
  if (tier === 3) {
    // 75%: Not fully unlocked, keep end or middle masked
    const parts = name.split(' ');
    return parts
      .map((p) => {
        if (p.length <= 2) return p;
        if (p.length <= 4) return p[0] + '..' + p[p.length - 1];
        const half = Math.floor(p.length * 0.6);
        return p.slice(0, half) + '...' + p.slice(-1);
      })
      .join(' ');
  }
  if (tier === 2) {
    // Show first and last letter with dots
    const parts = name.split(' ');
    return parts
      .map((p) => {
        if (p.length <= 3) return p[0] + '..';
        return p[0] + '..' + p[p.length - 1];
      })
      .join(' ');
  }
  if (tier === 1) {
    // First letter only
    const parts = name.split(' ');
    return parts
      .map((p) => (p.length > 0 ? p[0] + ' _ _ _' : ''))
      .join(' ');
  }
  return '??? [Neznámé strašidlo]';
}

export function getObscuredTitle(title: string, category: EnemyCategory, tier: 0 | 1 | 2 | 3 | 4): string {
  if (tier >= 3) return title;
  if (tier === 2) {
    return `Tajemná bytost (${title.slice(0, 15)}...)`;
  }
  if (tier === 1) {
    switch (category) {
      case 'bosses':
        return 'Pověst o obávaném vládci kraje';
      case 'demons':
        return 'Pekelná stvůra ze záhrobí';
      case 'water':
        return 'Mokrý přízrak od rybníka či potoka';
      case 'frost':
        return 'Mrazivý noční vítr a rampouchy';
      case 'undead':
        return 'Tlející umrlec ze starého hřbitova';
      case 'shadows':
        return 'Temný stín z podkroví a stodol';
      case 'fields':
        return 'Polní děs z poledního žáru či mezí';
      default:
        return 'Rychlý diblík a noční škůdce';
    }
  }
  return 'Dosud nespatřený tvor z nočních bájí';
}

export function getEnemyProgress(enemyId: string, kills: number): EnemyProgress {
  const enemy = ENEMIES[enemyId] || ENEMIES.rarach;
  const maxKills = getEnemyMaxKills(enemy);
  const curKills = Math.max(0, kills || 0);

  let percent = 0;
  let tier: 0 | 1 | 2 | 3 | 4 = 0;

  if (curKills === 0) {
    percent = 0;
    tier = 0;
  } else if (curKills >= maxKills) {
    percent = 100;
    tier = 4;
  } else {
    // Compute fractional percent based on required kills
    const rawPct = Math.floor((curKills / maxKills) * 100);
    percent = Math.min(99, Math.max(15, rawPct));

    if (percent >= 75) {
      tier = 3;
    } else if (percent >= 50) {
      tier = 2;
    } else {
      tier = 1; // Any kill >= 1 is at least tier 1
    }
  }

  const isUnlocked = tier === 4;
  const isDiscovered = curKills > 0;

  let clueTag = '🔒 0 %: Zcela neprobádáno';
  if (tier === 4) clueTag = '✅ 100 %: Zcela probádané strašidlo';
  else if (tier === 3) clueTag = `⚡ ${percent} %: Téměř kompletní zápis v kronice`;
  else if (tier === 2) clueTag = `🔎 ${percent} %: Známy slabiny a obrysy chování`;
  else if (tier === 1) clueTag = `🔍 ${percent} %: První letmé spatření`;

  // Progressive Lore
  let spoiledLore = 'O tomto strašidle v kronice zatím není ani řádka. Vydejte se na výpravu do venkovských končin a poražte jej, abyste zaznamenali první poznatky!';
  if (tier === 1) {
    spoiledLore = `Byl spatřen v šeru venkovské noci! Poutníci hlásí podivné zvuky a siluetu. K podrobnějšímu prozkoumání jeho slabin je třeba dalších střetnutí (${curKills} / ${maxKills} zahnáno).`;
  } else if (tier === 2) {
    spoiledLore = `${enemy.lore.slice(0, Math.floor(enemy.lore.length * 0.55))}... [Zbylá část záznamu čeká na důkladnější pozorování].`;
  } else if (tier >= 3) {
    spoiledLore = enemy.lore;
  }

  // Progressive Weakness & Strength
  let spoiledWeakness = '??? [Neznámá slabina – zažeňte více těchto tvorů]';
  let spoiledStrength = '??? [Neznámé nebezpečí]';

  if (tier >= 2) {
    spoiledWeakness = enemy.weakness;
  } else if (tier === 1) {
    spoiledWeakness = 'Skryto v mlze (vyžaduje 50 % pozorování)';
  }

  if (tier >= 3) {
    spoiledStrength = enemy.strength;
  } else if (tier === 2) {
    spoiledStrength = 'Částečně odhaleno (vyžaduje 75 % pozorování)';
  }

  // Progressive Stats
  const spoiledStats = {
    hp: tier >= 3 ? `${enemy.hp} HP` : tier >= 1 ? `cca ${Math.round(enemy.hp / 10) * 10} HP` : '??? HP',
    danger: tier >= 2 ? enemy.danger : tier >= 1 ? 'Nebezpečný' : '???',
    coinValue: tier >= 2 ? `${enemy.coinValue} kr.` : '??? kr.',
    speed: tier >= 3 ? `${enemy.speed}` : '???',
  };

  // Category Icon
  let icon = '❓';
  if (tier >= 1) {
    switch (enemy.category) {
      case 'bosses':
        icon = '👑';
        break;
      case 'demons':
        icon = '🔥';
        break;
      case 'water':
        icon = '💧';
        break;
      case 'frost':
        icon = '❄️';
        break;
      case 'undead':
        icon = '💀';
        break;
      case 'shadows':
        icon = '👤';
        break;
      case 'fields':
        icon = '🌾';
        break;
      default:
        icon = '🐭';
        break;
    }
  }

  return {
    id: enemy.id,
    name: getObscuredName(enemy.name, tier),
    title: getObscuredTitle(enemy.title, enemy.category, tier),
    category: enemy.category,
    kills: curKills,
    maxKills,
    percent,
    tier,
    isUnlocked,
    isDiscovered,
    clueTag,
    spoiledLore,
    spoiledWeakness,
    spoiledStrength,
    spoiledStats,
    icon,
    realEnemy: enemy,
  };
}
