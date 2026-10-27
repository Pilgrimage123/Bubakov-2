import React from 'react';
import type { SmartSvgProps } from './types';
import { SmartDedecekNuseSvg } from './SmartDedecekNuseSvg';
import { SmartDedecekArenaSvg } from './SmartDedecekArenaSvg';

export * from './types';
export * from './SmartDedecekNuseSvg';
export * from './SmartDedecekArenaSvg';
export * from './SmartSvgViewer';

/**
 * Canonical registry mapping characters to interactive Smart SVG vector components.
 * Per project specification, all character SVGs were liquidated except Čertův dědeček.
 */
export const SMART_SVG_REGISTRY: Record<string, React.FC<SmartSvgProps>> = {
  // Čertův dědeček (Grandfather)
  dedecek_nuse: SmartDedecekNuseSvg,
  grandfather_nuse: SmartDedecekNuseSvg,
  grandfather_shop: SmartDedecekNuseSvg,
  dedecek_arena: SmartDedecekArenaSvg,
  grandfather_arena: SmartDedecekArenaSvg,
  grandfather: SmartDedecekArenaSvg,
  certuv_dedecek: SmartDedecekNuseSvg,
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
