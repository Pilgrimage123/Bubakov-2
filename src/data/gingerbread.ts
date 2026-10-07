export type GingerbreadSize = 'small' | 'large' | 'giant';

export interface GingerbreadDropConfig {
  size: GingerbreadSize;
  value: number;
  radius: number;
}

export const GINGERBREAD_VALUES: Record<GingerbreadSize, number> = {
  small: 2,
  large: 6,
  giant: 20,
};

export const GINGERBREAD_CONFIG: Record<GingerbreadSize, GingerbreadDropConfig> = {
  small: { size: 'small', value: 2, radius: 10 },
  large: { size: 'large', value: 6, radius: 14 },
  giant: { size: 'giant', value: 20, radius: 19 },
};

export function getGingerbreadSize(isBoss: boolean, isMiniboss: boolean, points: number): GingerbreadSize {
  // Perníček se řídí herní hodnotou nepřítele (ENEMY_POINTS), ne náhodným HP.
  // Bossové a těžcí protivníci dávají obří kusy; střední protivníci velké; slabí základní.
  if (isBoss || points >= 180) return 'giant';
  if (isMiniboss || points >= 50) return 'large';
  return 'small';
}

export function getGingerbreadValue(size: GingerbreadSize): number {
  return GINGERBREAD_VALUES[size];
}
