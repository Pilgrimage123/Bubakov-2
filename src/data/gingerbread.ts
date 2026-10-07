export type GingerbreadSize = 'small' | 'large' | 'giant';

export interface GingerbreadDropConfig {
  size: GingerbreadSize;
  value: number;
  radius: number;
}

export const GINGERBREAD_VALUES: Record<GingerbreadSize, number> = {
  small: 1,
  large: 3,
  giant: 10,
};

export const GINGERBREAD_CONFIG: Record<GingerbreadSize, GingerbreadDropConfig> = {
  small: { size: 'small', value: 1, radius: 10 },
  large: { size: 'large', value: 3, radius: 14 },
  giant: { size: 'giant', value: 10, radius: 19 },
};

export function getGingerbreadSize(isBoss: boolean, isMiniboss: boolean, points: number): GingerbreadSize {
  // Perníček se řídí herní hodnotou nepřítele (ENEMY_POINTS), ne náhodným HP.
  // Bossové vždy dávají největší kus; běžní protivníci se dělí podle hodnotových pásem.
  if (isBoss || points >= 250) return 'giant';
  if (isMiniboss || points >= 80) return 'large';
  return 'small';
}

export function getGingerbreadValue(size: GingerbreadSize): number {
  return GINGERBREAD_VALUES[size];
}
