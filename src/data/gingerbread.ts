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

export function getGingerbreadSize(isBoss: boolean, isMiniboss: boolean, hp: number): GingerbreadSize {
  if (isBoss || hp >= 1000) return 'giant';
  if (isMiniboss || hp >= 300) return 'large';
  return 'small';
}

export function getGingerbreadValue(size: GingerbreadSize): number {
  return GINGERBREAD_VALUES[size];
}
