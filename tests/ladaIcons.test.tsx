import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GameIcon,
  LadaCastleRuinsIcon,
  LadaGhostIcon,
  LadaSnowmanIcon,
  LadaVillageDogIcon,
  LadaWatermanHatIcon,
  LadaMeadowFlowerIcon,
  LadaVillageSunIcon,
  LadaPasacekIcon,
  LadaKostelnikIcon,
  LadaGrannyIcon,
  LadaBarunkaIcon,
} from '../src/components/GameIcon';
import { LEVEL_UNLOCKS } from '../src/data/levelUnlocks';

describe('Ladovské ikony a oprava zvukových / duplicitních ikon', () => {
  it('správně mapuje zvukové klíče sound_on, sound_off, music_on, music_off na ponocenský roh a notu', () => {
    // sound_on -> LadaHornIcon s popiskem "Ponocenský roh"
    const soundOnHtml = renderToStaticMarkup(<GameIcon icon="sound_on" size={16} />);
    expect(soundOnHtml).toContain('<svg');
    expect(soundOnHtml).toContain('aria-label="Ponocenský roh"');
    expect(soundOnHtml).not.toContain('stroke="#C83E31"');

    // sound_off -> LadaHornIcon muted s popiskem "Ztišený roh"
    const soundOffHtml = renderToStaticMarkup(<GameIcon icon="sound_off" size={16} />);
    expect(soundOffHtml).toContain('<svg');
    expect(soundOffHtml).toContain('aria-label="Ztišený roh"');
    expect(soundOffHtml).toContain('stroke="#C83E31"');

    // music_on -> LadaFiddleMusicIcon
    const musicOnHtml = renderToStaticMarkup(<GameIcon icon="music_on" size={16} />);
    expect(musicOnHtml).toContain('<svg');
    expect(musicOnHtml).toContain('aria-label="Hospodská nota"');

    // music_off -> LadaFiddleMusicIcon muted
    const musicOffHtml = renderToStaticMarkup(<GameIcon icon="music_off" size={16} />);
    expect(musicOffHtml).toContain('<svg');
    expect(musicOffHtml).toContain('aria-label="Ztišená hudba"');
    expect(musicOffHtml).toContain('stroke="#C83E31"');
  });

  it('vykresluje 7 nových ladovských animovaných SVG ikon namísto běžných emoji', () => {
    // 1. Hradní zřícenina (🏰 / castle / zricenina)
    const castleHtml = renderToStaticMarkup(<GameIcon icon="🏰" size={24} />);
    expect(castleHtml).toContain('aria-label="Zřícenina hradu Zlenice"');
    expect(castleHtml).toContain('lada-anim-float');

    // 2. Bílá paní / Strašidlo (👻 / ghost / bila_pani)
    const ghostHtml = renderToStaticMarkup(<GameIcon icon="👻" size={24} />);
    expect(ghostHtml).toContain('aria-label="Bílá paní a strašidlo"');
    expect(ghostHtml).toContain('lada-anim-float');

    // 3. Ladovský sněhulák (☃️ / snowman / snehulak)
    const snowmanHtml = renderToStaticMarkup(<GameIcon icon="☃️" size={24} />);
    expect(snowmanHtml).toContain('aria-label="Ladovský sněhulák"');
    expect(snowmanHtml).toContain('lada-anim-rock');

    // 4. Hrusický voříšek (🐕 / dog / pes / vorisek)
    const dogHtml = renderToStaticMarkup(<GameIcon icon="🐕" size={24} />);
    expect(dogHtml).toContain('aria-label="Hrusický voříšek"');
    expect(dogHtml).toContain('lada-anim-rock');

    // 5. Vodnický cylinder (🎩 / tophat / cylinder)
    const hatHtml = renderToStaticMarkup(<GameIcon icon="🎩" size={24} />);
    expect(hatHtml).toContain('aria-label="Vodnický cylinder"');
    expect(hatHtml).toContain('lada-anim-rock');

    // 6. Blatouch / luční květ (🌼 / flower / blatouch)
    const flowerHtml = renderToStaticMarkup(<GameIcon icon="🌼" size={24} />);
    expect(flowerHtml).toContain('aria-label="Venkovský blatouch a luční kvítek"');
    expect(flowerHtml).toContain('lada-anim-pulse');

    // 7. Polední venkovské slunce (☀️ / sun / slunce / polednice)
    const sunHtml = renderToStaticMarkup(<GameIcon icon="☀️" size={24} />);
    expect(sunHtml).toContain('aria-label="Polední venkovské slunce"');
    expect(sunHtml).toContain('lada-anim-pulse');
  });

  it('vykresluje nové SVG ikony lovců: Pasáček, Pobožný kostelník, Babička a Barunka', () => {
    const shepherdHtml = renderToStaticMarkup(<GameIcon icon="shepherd" size={24} />);
    expect(shepherdHtml).toContain('aria-label="Pasáček s píšťalkou a pírkem"');

    const pasacekHtml = renderToStaticMarkup(<GameIcon icon="pasacek" size={24} />);
    expect(pasacekHtml).toContain('aria-label="Pasáček s píšťalkou a pírkem"');

    const sextonHtml = renderToStaticMarkup(<GameIcon icon="sexton" size={24} />);
    expect(sextonHtml).toContain('aria-label="Pobožný kostelník s kropáčem"');

    const kostelnikHtml = renderToStaticMarkup(<GameIcon icon="kostelnik" size={24} />);
    expect(kostelnikHtml).toContain('aria-label="Pobožný kostelník s kropáčem"');

    const grannyHtml = renderToStaticMarkup(<GameIcon icon="granny" size={24} />);
    expect(grannyHtml).toContain('aria-label="Babička v šátku"');

    const barunkaHtml = renderToStaticMarkup(<GameIcon icon="barunka" size={24} />);
    expect(barunkaHtml).toContain('aria-label="Vnučka Barunka s kytičkou"');
  });

  it('exportuje všechny nové komponenty ikon samostatně', () => {
    expect(typeof LadaCastleRuinsIcon).toBe('function');
    expect(typeof LadaGhostIcon).toBe('function');
    expect(typeof LadaSnowmanIcon).toBe('function');
    expect(typeof LadaVillageDogIcon).toBe('function');
    expect(typeof LadaWatermanHatIcon).toBe('function');
    expect(typeof LadaMeadowFlowerIcon).toBe('function');
    expect(typeof LadaVillageSunIcon).toBe('function');
    expect(typeof LadaPasacekIcon).toBe('function');
    expect(typeof LadaKostelnikIcon).toBe('function');
    expect(typeof LadaGrannyIcon).toBe('function');
    expect(typeof LadaBarunkaIcon).toBe('function');
  });

  it('neobsahuje duplicitní zámky 🔒 v textových řetězcích spoiledBadge a clueTag', () => {
    Object.values(LEVEL_UNLOCKS).forEach((def) => {
      def.milestones.forEach((m) => {
        expect(m.spoiledBadge).not.toContain('🔒');
        expect(m.clueTag).not.toContain('🔒');
      });
    });
  });
});

