import React from 'react';
import type { SmartSvgProps } from './types';
import { SmartKrajanekSvg } from './SmartKrajanekSvg';
import { SmartTulakSvg } from './SmartTulakSvg';
import { SmartBezhlavyRytirSvg } from './SmartBezhlavyRytirSvg';
import { SmartSnehulakSvg } from './SmartSnehulakSvg';
import { SmartBabickaBarunkaSvg } from './SmartBabickaBarunkaSvg';
import { SmartKostelnikSvg } from './SmartKostelnikSvg';
import { SmartPasacekSvg } from './SmartPasacekSvg';
import { SmartDedecekNuseSvg } from './SmartDedecekNuseSvg';
import { SmartDedecekArenaSvg } from './SmartDedecekArenaSvg';

export * from './types';
export * from './SmartKrajanekSvg';
export * from './SmartTulakSvg';
export * from './SmartBezhlavyRytirSvg';
export * from './SmartSnehulakSvg';
export * from './SmartBabickaBarunkaSvg';
export * from './SmartKostelnikSvg';
export * from './SmartPasacekSvg';
export * from './SmartDedecekNuseSvg';
export * from './SmartDedecekArenaSvg';
export * from './SmartSvgViewer';

/**
 * Canonical registry mapping Hunter, Enemy, and NPC IDs across the game
 * to their interactive Smart SVG vector components.
 */
export const SMART_SVG_REGISTRY: Record<string, React.FC<SmartSvgProps>> = {
  // Hunters
  krajanek: SmartKrajanekSvg,
  wanderer: SmartTulakSvg,
  tulak: SmartTulakSvg,
  shepherd: SmartPasacekSvg,
  pasacek: SmartPasacekSvg,
  sexton: SmartKostelnikSvg,
  kostelnik: SmartKostelnikSvg,
  granny: SmartBabickaBarunkaSvg,
  babicka: SmartBabickaBarunkaSvg,
  babicka_barunka: SmartBabickaBarunkaSvg,

  // Enemies & Minibosses
  bezhlavy_rytir: SmartBezhlavyRytirSvg,
  snehulak: SmartSnehulakSvg,
  tajici_snehulak: SmartSnehulakSvg,

  // Grandfather NPCs
  dedecek_nuse: SmartDedecekNuseSvg,
  grandfather_nuse: SmartDedecekNuseSvg,
  grandfather_shop: SmartDedecekNuseSvg,
  dedecek_arena: SmartDedecekArenaSvg,
  grandfather_arena: SmartDedecekArenaSvg,
  grandfather: SmartDedecekArenaSvg,
};

export function hasSmartSvgSprite(id?: string | null): boolean {
  if (!id) return false;
  return Boolean(SMART_SVG_REGISTRY[id]);
}

export function getSmartSvgComponent(id?: string | null): React.FC<SmartSvgProps> | null {
  if (!id) return null;
  return SMART_SVG_REGISTRY[id] || null;
}

export interface SmartSpriteRendererProps extends SmartSvgProps {
  spriteId: string;
}

export const SmartSpriteRenderer: React.FC<SmartSpriteRendererProps> = ({
  spriteId,
  ...svgProps
}) => {
  const Component = getSmartSvgComponent(spriteId);
  if (!Component) return null;
  return React.createElement(Component, svgProps);
};
