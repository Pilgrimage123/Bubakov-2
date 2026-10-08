import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../audio';

interface GrandfatherSceneProps {
  mode?: 'desktop' | 'mobile';
  state: 'idle' | 'reaching' | 'pulling' | 'rerolling' | 'purchasing';
  activeItemName?: string;
  activeItemIcon?: string;
  onMousePet?: () => void;
}

export function GrandfatherScene({
  mode = 'desktop',
  state,
  activeItemName,
  activeItemIcon,
  onMousePet,
}: GrandfatherSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const mouseStateRef = useRef<{ clickedAt: number; isPeeking: boolean }>({ clickedAt: -999, isPeeking: true });

  // Smoke particles array
  const smokeParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    birth: number;
  }>>([]);

  // Sparkles / herb dust when rummaging in basket
  const sparklesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    radius: number;
    alpha: number;
    birth: number;
  }>>([]);

  const isMobile = mode === 'mobile';

  // Handle canvas click to interact with the mouse or grandfather
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Mouse coordinates in canvas space:
    // In desktop view: mouse is around (bx + 110, by + 45)
    // Let's check distance to the mouse region
    const mouseX = isMobile ? canvas.width * 0.72 : canvas.width * 0.76;
    const mouseY = isMobile ? canvas.height * 0.62 : canvas.height * 0.58;

    const distToMouse = Math.hypot(x - mouseX, y - mouseY);
    if (distToMouse < 45) {
      mouseStateRef.current.clickedAt = performance.now();
      try {
        sound.mouseSqueak();
      } catch (err) {
        // Safe audio fallback
      }
      if (onMousePet) onMousePet();

      // Spawn heart / crumb sparkles
      for (let i = 0; i < 6; i++) {
        sparklesRef.current.push({
          x: mouseX + (Math.random() - 0.5) * 12,
          y: mouseY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 40,
          vy: -30 - Math.random() * 40,
          color: Math.random() > 0.5 ? '#FDA4AF' : '#F59E0B',
          radius: 3 + Math.random() * 3,
          alpha: 1,
          birth: performance.now(),
        });
      }
    }
  }, [isMobile, onMousePet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastPuffSpawn = 0;
    let lastRumbleSparkle = 0;

    const render = (now: number) => {
      const time = (now - startTimeRef.current) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // --- Responsive Geometry Anchors ---
      // Grandfather sits on the left, open wicker basket sits on the right
      const scale = isMobile ? 0.95 : 1.25;
      const gx = isMobile ? width * 0.30 : width * 0.35;
      const gy = isMobile ? height * 0.82 : height * 0.84;
      const bx = isMobile ? width * 0.68 : width * 0.72;
      const by = isMobile ? height * 0.85 : height * 0.86;

      // 1. Warm Ambient Background Radial Glow
      const bgGlow = ctx.createRadialGradient(width * 0.5, height * 0.5, 20, width * 0.5, height * 0.5, width * 0.7);
      bgGlow.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
      bgGlow.addColorStop(0.55, 'rgba(253, 230, 138, 0.22)');
      bgGlow.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Ground Shadows (Grandfather & Heavy Wicker Basket)
      ctx.save();
      ctx.fillStyle = 'rgba(40, 20, 10, 0.32)';
      // Grandfather shadow
      ctx.beginPath();
      ctx.ellipse(gx, gy + 10, 48 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Basket shadow (wider, rectangular base)
      ctx.beginPath();
      ctx.ellipse(bx, by + 12, 60 * scale, 18 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // State wobble when rummaging / rerolling
      const isRerolling = state === 'rerolling';
      const isPurchasing = state === 'purchasing';
      const isReaching = state === 'reaching' || state === 'pulling';
      const basketShake = isRerolling ? Math.sin(time * 26) * 4 : Math.sin(time * 2.2) * 0.8;

      // 3. Wicker Basket Open Lid & Rim (drawn behind grandfather's hands, in front of back shadow)
      ctx.save();
      ctx.translate(bx, by + basketShake);
      ctx.scale(scale, scale);

      // Open Wicker Lid thrown back and angled
      ctx.save();
      ctx.rotate(-0.25 + Math.sin(time * 1.8) * 0.02);
      // Outer wicker rim of lid
      ctx.fillStyle = '#78350F';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-45, -95, 88, 44, [16, 16, 8, 8]);
      ctx.fill();
      ctx.stroke();
      // Wicker crossweave on lid
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.55)';
      ctx.lineWidth = 1.6;
      for (let lx = -40; lx < 40; lx += 8) {
        ctx.beginPath();
        ctx.moveTo(lx, -92);
        ctx.lineTo(lx, -54);
        ctx.stroke();
      }
      for (let ly = -90; ly < -52; ly += 8) {
        ctx.beginPath();
        ctx.moveTo(-42, ly);
        ctx.lineTo(40, ly);
        ctx.stroke();
      }
      // Leather hinge strap on lid
      ctx.fillStyle = '#451A03';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-28, -65, 8, 22);
      ctx.strokeRect(-28, -65, 8, 22);
      ctx.fillRect(20, -65, 8, 22);
      ctx.strokeRect(20, -65, 8, 22);
      ctx.restore();

      // Main Basket Deep Cavity (Interior dark cavity before drawing items)
      ctx.fillStyle = '#2B1408';
      ctx.strokeStyle = '#1D0C04';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, -42, 52, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden Warm Magic Glow from inside the basket!
      const basketInteriorGlow = ctx.createRadialGradient(0, -42, 4, 0, -42, 48);
      basketInteriorGlow.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
      basketInteriorGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)');
      basketInteriorGlow.addColorStop(1, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = basketInteriorGlow;
      ctx.beginPath();
      ctx.ellipse(0, -42, 48, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- Wares Inside the Open Basket ---
      // Item 1: Rolled Bohemian Red Embroidered Blanket / Pillow
      ctx.save();
      ctx.translate(22, -48);
      ctx.rotate(0.2);
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 24, 8);
      ctx.fill();
      ctx.stroke();
      // Folk gold embroidery stitches
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.8;
      for (let st = -10; st <= 10; st += 6) {
        ctx.beginPath();
        ctx.moveTo(st, -10);
        ctx.lineTo(st + 3, -4);
        ctx.lineTo(st, 2);
        ctx.stroke();
      }
      ctx.restore();

      // Item 2: Apothecary Glass Potion Bottles (Emerald Green & Amber)
      // Bottle A: Emerald
      ctx.save();
      ctx.translate(-26, -56);
      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-8, -10, 16, 22, 4);
      ctx.fill();
      ctx.stroke();
      // Bottle neck & Cork stopper
      ctx.fillStyle = '#34D399';
      ctx.fillRect(-4, -16, 8, 6);
      ctx.strokeRect(-4, -16, 8, 6);
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-5, -20, 10, 5);
      ctx.strokeRect(-5, -20, 10, 5);
      // Liquid highlight gleam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(-6, -6, 3, 14);
      ctx.restore();

      // Bottle B: Ruby / Amber Tincture
      ctx.save();
      ctx.translate(-10, -60);
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-3, -16, 6, 6);
      ctx.strokeRect(-3, -16, 6, 6);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-4, -20, 8, 5);
      ctx.strokeRect(-4, -20, 8, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(-3, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Item 3: Tied Lavender & St. John's Wort Herb Bundles
      ctx.save();
      ctx.translate(6, -56);
      // Golden blossoms
      ctx.fillStyle = '#EAB308';
      for (let fi = 0; fi < 5; fi++) {
        ctx.beginPath();
        ctx.arc(-4 + fi * 2.5, -6 - (fi % 2) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Violet lavender blossoms
      ctx.fillStyle = '#A855F7';
      for (let li = 0; li < 6; li++) {
        ctx.beginPath();
        ctx.arc(2 + li * 2, -10 - (li % 3) * 3, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Stems tied with twine
      ctx.strokeStyle = '#65A30D';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, 4);
      ctx.lineTo(-4, -6);
      ctx.moveTo(2, 4);
      ctx.lineTo(6, -8);
      ctx.stroke();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -1);
      ctx.lineTo(6, -1);
      ctx.stroke();
      ctx.restore();

      // Item 4: Malovaná Dřevěná Truhlička (carved chest with iron latch)
      ctx.save();
      ctx.translate(-2, -44);
      ctx.fillStyle = '#78350F';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 18, 3);
      ctx.fill();
      ctx.stroke();
      // Iron bands & latch
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-14, -10, 4, 18);
      ctx.fillRect(10, -10, 4, 18);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-3, -4, 6, 7);
      ctx.strokeRect(-3, -4, 6, 7);
      ctx.restore();

      // Item 5: Linen Herb Pouch (Burlap sack tied with cord)
      ctx.save();
      ctx.translate(14, -40);
      ctx.fillStyle = '#D6C7A1';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#B59F6E';
      ctx.fillRect(-4, -9, 8, 4);
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, -6);
      ctx.lineTo(5, -6);
      ctx.stroke();
      ctx.restore();

      // Item 6: Curious Little Field Mouse ("Rézinka") Peeking Out!
      // The mouse blinks and reacts to clicks or rummaging
      const mouseClickElapsed = (now - mouseStateRef.current.clickedAt) / 1000;
      const isMouseJumping = mouseClickElapsed < 0.45;
      const mouseJumpY = isMouseJumping ? Math.sin(mouseClickElapsed / 0.45 * Math.PI) * -12 : 0;
      const mouseTwitch = Math.sin(time * 7) > 0.85 ? 1.5 : 0;

      ctx.save();
      ctx.translate(26, -42 + mouseJumpY);

      // Mouse Head & Fur
      ctx.fillStyle = '#78716C';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0 + mouseTwitch * 0.3, 7, 6, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Big Round Ears (with soft pink interior)
      ctx.fillStyle = '#78716C';
      ctx.beginPath();
      ctx.arc(-5, -6 + mouseTwitch, 4, 0, Math.PI * 2);
      ctx.arc(4, -6 - mouseTwitch, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FDA4AF';
      ctx.beginPath();
      ctx.arc(-5, -6 + mouseTwitch, 2.2, 0, Math.PI * 2);
      ctx.arc(4, -6 - mouseTwitch, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute Beady Black Eyes with glint
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(-2, -1, 1.4, 0, Math.PI * 2);
      ctx.arc(2.5, -1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-1.6, -1.4, 0.6, 0, Math.PI * 2);
      ctx.arc(2.9, -1.4, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Pink Nose & Whiskers
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(0, 3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1;
      // Whiskers left
      ctx.beginPath();
      ctx.moveTo(-1, 3); ctx.lineTo(-8, 2);
      ctx.moveTo(-1, 4); ctx.lineTo(-8, 5);
      // Whiskers right
      ctx.moveTo(1, 3); ctx.lineTo(8, 2);
      ctx.moveTo(1, 4); ctx.lineTo(8, 5);
      ctx.stroke();

      // Tiny paws holding the rim of the basket
      ctx.fillStyle = '#FDA4AF';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-3, 6, 1.8, 0, Math.PI * 2);
      ctx.arc(3, 6, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // End Mouse

      // --- Front Wall of Basket (Hand-Woven Willow Texture) ---
      const basketGrad = ctx.createLinearGradient(-48, -42, 48, 24);
      basketGrad.addColorStop(0, '#D97706');
      basketGrad.addColorStop(0.5, '#B45309');
      basketGrad.addColorStop(1, '#78350F');

      ctx.fillStyle = basketGrad;
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(-46, -40);
      ctx.quadraticCurveTo(-52, -2, -40, 18);
      ctx.quadraticCurveTo(0, 26, 40, 18);
      ctx.quadraticCurveTo(52, -2, 46, -40);
      ctx.quadraticCurveTo(0, -32, -46, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Braided Top Rim of Wicker
      ctx.fillStyle = '#92400E';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(0, -38, 48, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wicker Weave Lattice (Cross-hatching)
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.7)';
      ctx.lineWidth = 2;
      for (let wy = -30; wy <= 14; wy += 8) {
        ctx.beginPath();
        ctx.moveTo(-42, wy);
        ctx.quadraticCurveTo(0, wy + 5, 42, wy);
        ctx.stroke();
      }
      for (let wx = -34; wx <= 34; wx += 9) {
        ctx.beginPath();
        ctx.moveTo(wx, -35);
        ctx.quadraticCurveTo(wx * 0.85, -10, wx * 0.75, 20);
        ctx.stroke();
      }

      // Heavy Leather Straps with Brass Buckles & Copper Rivets
      ctx.fillStyle = '#451A03';
      ctx.strokeStyle = '#1F0C04';
      ctx.lineWidth = 2.4;
      // Left strap
      ctx.fillRect(-26, -38, 11, 56);
      ctx.strokeRect(-26, -38, 11, 56);
      // Right strap
      ctx.fillRect(15, -38, 11, 56);
      ctx.strokeRect(15, -38, 11, 56);

      // Brass Buckles
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-28, -12, 15, 12);
      ctx.strokeRect(-28, -12, 15, 12);
      ctx.clearRect(-25, -9, 9, 6);
      ctx.strokeRect(-25, -9, 9, 6);

      ctx.fillRect(13, -12, 15, 12);
      ctx.strokeRect(13, -12, 15, 12);
      ctx.clearRect(16, -9, 9, 6);
      ctx.strokeRect(16, -9, 9, 6);

      // Hanging Tin Jug / Milk Can Dangling from Basket
      ctx.save();
      const canSway = Math.sin(time * 2.8 + 1.2) * 0.18;
      ctx.translate(46, -6);
      ctx.rotate(canSway);
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 11, 15, 2);
      ctx.fill();
      ctx.stroke();
      // Handle
      ctx.beginPath();
      ctx.arc(6, 7, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.restore();

      // Hanging Brass Bell
      ctx.save();
      const bellSway = Math.sin(time * 3.2) * 0.15;
      ctx.translate(-44, -10);
      ctx.rotate(bellSway);
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-6, 8); ctx.lineTo(6, 8); ctx.lineTo(3, 0); ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.restore(); // End Basket

      // 4. Grandfather Character (Devil Peddler / Kramář)
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(scale, scale);

      // Limp/Breathing rhythm
      const breathBob = Math.sin(time * 2.5) * 1.6;
      const tailPhase = time * 3.2;

      // Devil's Tail with Tuft (Behind legs/coat)
      ctx.save();
      const tailSwing = Math.sin(tailPhase) * 10;
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.quadraticCurveTo(-46, -6 + tailSwing * 0.5, -56, -30 + tailSwing);
      ctx.stroke();
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.quadraticCurveTo(-46, -6 + tailSwing * 0.5, -56, -30 + tailSwing);
      ctx.stroke();

      // Bushy Black Tail Tuft
      const ttx = -56;
      const tty = -30 + tailSwing;
      ctx.fillStyle = '#1C1917';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(ttx, tty, 10, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Legs: Left Cloven Hoof & Right Peddler Boot
      // Right Hoof (Kopyto)
      ctx.save();
      ctx.fillStyle = '#991B1B'; // Red trousers
      ctx.fillRect(2, -18, 12, 18);
      // Furry fetlock
      ctx.fillStyle = '#2A1810';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(8, 0, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Cloven Hoof with cleft
      ctx.fillStyle = '#1C1410';
      ctx.beginPath();
      ctx.roundRect(0, 3, 16, 12, [2, 2, 4, 4]);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 3); ctx.lineTo(8, 15);
      ctx.stroke();
      ctx.restore();

      // Left Boot (Laced peddler boot)
      ctx.save();
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(-18, -18, 12, 18);
      ctx.fillStyle = '#5C3A21';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-22, 2, 18, 13, [4, 4, 2, 2]);
      ctx.fill(); ctx.stroke();
      // Laces & Brass Buckle
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, 5); ctx.lineTo(-12, 9);
      ctx.moveTo(-12, 5); ctx.lineTo(-18, 9);
      ctx.stroke();
      ctx.restore();

      // Torso & Patchwork Fur-Trimmed Coat
      ctx.save();
      ctx.translate(0, breathBob);

      // Round stout coat body
      const coatGrad = ctx.createLinearGradient(-26, -55, 26, -10);
      coatGrad.addColorStop(0, '#8C5E37');
      coatGrad.addColorStop(1, '#5E3A21');
      ctx.fillStyle = coatGrad;
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.roundRect(-28, -58, 54, 48, [14, 14, 8, 8]);
      ctx.fill();
      ctx.stroke();

      // Patches on the coat
      // Patch 1: Folk Red with Cross Stitches
      ctx.fillStyle = '#B91C1C';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-24, -46, 13, 12);
      ctx.strokeRect(-24, -46, 13, 12);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-22, -42); ctx.lineTo(-18, -38);
      ctx.moveTo(-18, -42); ctx.lineTo(-22, -38);
      ctx.stroke();

      // Patch 2: Forest Olive Green
      ctx.fillStyle = '#4D7C0F';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.6;
      ctx.fillRect(8, -36, 12, 10);
      ctx.strokeRect(8, -36, 12, 10);

      // Fluffy White Sheepskin Trim around Bottom Hem
      ctx.fillStyle = '#FAF7EE';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(-30, -14, 58, 12, 6);
      ctx.fill();
      ctx.stroke();

      // Diagonal Leather Chest Strap with Brass Buckle
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(-22, -56); ctx.lineTo(18, -16);
      ctx.stroke();
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-22, -56); ctx.lineTo(18, -16);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-2, -38, 7, 7);
      ctx.strokeRect(-2, -38, 7, 7);

      // Left arm (resting over belly/waist)
      ctx.save();
      ctx.fillStyle = '#784D2B';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-28, -50, 14, 26, 6);
      ctx.fill(); ctx.stroke();
      // Sheepskin cuff
      ctx.fillStyle = '#FAF7EE';
      ctx.beginPath();
      ctx.roundRect(-30, -26, 16, 8, 4);
      ctx.fill(); ctx.stroke();
      // Red clawed hand resting on belt
      ctx.fillStyle = '#D34538';
      ctx.beginPath();
      ctx.ellipse(-22, -18, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // --- Head, Horns, Cap, Spectacles & Face ---
      ctx.save();
      const headBob = Math.sin(time * 2.8) * 1.2;
      ctx.translate(0, -62 + headBob);

      // Ram Horns Curling Outwards (Behind Head)
      for (const hSign of [-1, 1]) {
        ctx.save();
        ctx.scale(hSign, 1);
        const hornGrad = ctx.createLinearGradient(6, -14, 30, -42);
        hornGrad.addColorStop(0, '#5C2E14');
        hornGrad.addColorStop(0.7, '#2E180E');
        hornGrad.addColorStop(1, '#180C07');
        ctx.fillStyle = hornGrad;
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, -14);
        ctx.bezierCurveTo(24, -26, 36, -20, 32, -42);
        ctx.bezierCurveTo(22, -36, 14, -24, 4, -16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Horn ridges
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 1.6;
        for (let ri = 0; ri < 4; ri++) {
          const rt = 0.25 + ri * 0.18;
          ctx.beginPath();
          ctx.moveTo(8 + rt * 18, -14 - rt * 18);
          ctx.lineTo(8 + rt * 18 - 4, -14 - rt * 18 + 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Devil Red Head Base
      ctx.fillStyle = '#D34538';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -6, 18, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pointed Devil Ears
      for (const eSign of [-1, 1]) {
        ctx.fillStyle = '#D34538';
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eSign * 14, -8);
        ctx.lineTo(eSign * 26, -16);
        ctx.lineTo(eSign * 16, -2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#F87171';
        ctx.beginPath();
        ctx.moveTo(eSign * 15, -7);
        ctx.lineTo(eSign * 22, -13);
        ctx.lineTo(eSign * 16, -3);
        ctx.closePath();
        ctx.fill();
      }

      // Beranice Cap Crown & Fluffy White Brim
      ctx.fillStyle = '#4A2E1B';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, -14, 18, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FAF7EE';
      ctx.beginPath();
      ctx.ellipse(0, -13, 21, 6.5, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Expressive Eyes (Blink cycle)
      const isBlinking = (time % 4.2) < 0.18;
      for (const eyeSign of [-1, 1]) {
        const eyeX = eyeSign * 8;
        const eyeY = -7;
        if (isBlinking) {
          ctx.strokeStyle = '#271206';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 5, 0.2, Math.PI - 0.2);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#FFFDF7';
          ctx.strokeStyle = '#271206';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();

          // Big mischievous pupil looking warmly towards viewer
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(eyeX + 1.2, eyeY, 3.2, 0, Math.PI * 2);
          ctx.fill();
          // Catchlight sparkle
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(eyeX + 2.2, eyeY - 1.2, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bushy White Eyebrows
        ctx.fillStyle = '#F5F3ED';
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY - 7, 5.5, 2.5, eyeSign * 0.18, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Round Brass Wire Spectacles
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 7.2, 0, Math.PI * 2);
        ctx.stroke();
        // Spectacle lens glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(eyeX - 2, eyeY - 2, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // Spectacles gold nose bridge
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -7, 4.5, Math.PI, 0);
      ctx.stroke();

      // Bulbous Red Crooked Nose
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, -2, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFA49A';
      ctx.beginPath();
      ctx.arc(1.5, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Broad Mischievous Grin & Teeth
      ctx.fillStyle = '#781515';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 8, 0.2, Math.PI - 0.2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cheerful teeth
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(-4, 4, 8, 3);

      // Flowing Thick Curly White Beard & Mustache
      const beardSway = Math.sin(time * 3.2) * 2.5;
      ctx.fillStyle = '#F5F3ED';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(-8, 5, 0, 3);
      ctx.quadraticCurveTo(8, 5, 16, 0);
      ctx.quadraticCurveTo(24, 16, 16 + beardSway, 32);
      ctx.quadraticCurveTo(8 + beardSway * 0.8, 42, 0 + beardSway * 0.5, 38);
      ctx.quadraticCurveTo(-10, 40, -18, 28);
      ctx.quadraticCurveTo(-24, 14, -16, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Beard curls detail
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.8;
      for (const bCurl of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.arc(bCurl + beardSway * 0.3, 16, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Wooden Briar Smoking Pipe (Fajfka)
      const pipeBob = Math.sin(time * 2.6) * 0.8;
      const pipeStemX = 6;
      const pipeStemY = 4;
      const bowlX = 24;
      const bowlY = 2 + pipeBob;

      // Pipe stem
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pipeStemX, pipeStemY);
      ctx.quadraticCurveTo(14, 12, bowlX - 2, bowlY + 4);
      ctx.stroke();
      ctx.strokeStyle = '#5C2E14';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pipeStemX, pipeStemY);
      ctx.quadraticCurveTo(14, 12, bowlX - 2, bowlY + 4);
      ctx.stroke();

      // Pipe bowl
      ctx.fillStyle = '#451A03';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(bowlX, bowlY, 6, 8, 0.15, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(bowlX - 4, bowlY + 3, 8, 2.2);

      // Glowing Ember in Pipe
      const emberFlare = 1 + Math.sin(time * 12) * 0.25;
      ctx.fillStyle = isPurchasing ? '#FEF08A' : '#F97316';
      ctx.beginPath();
      ctx.ellipse(bowlX, bowlY - 5, 4 * emberFlare, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smoke spawn logic
      if (now - lastPuffSpawn > (isPurchasing ? 120 : 380)) {
        lastPuffSpawn = now;
        // In canvas coordinates:
        const worldBowlX = gx + (bowlX) * scale;
        const worldBowlY = gy + (-62 + headBob + bowlY - 5) * scale;
        smokeParticlesRef.current.push({
          x: worldBowlX,
          y: worldBowlY,
          vx: 12 + Math.random() * 18,
          vy: -28 - Math.random() * 24,
          radius: 4 + Math.random() * 4,
          alpha: 0.85,
          birth: now,
        });
      }

      ctx.restore(); // End Head

      // --- 5. Animated Reaching / Pulling Arm ("Dědeček vytahuje věci z nůše") ---
      // Grandfather's long red arm with articulate claws actively reaches towards or inside the basket
      ctx.save();
      const armAnimPhase = isRerolling
        ? Math.sin(time * 18)
        : isReaching
          ? Math.sin(time * 4) * 0.3 + 0.8
          : isPurchasing
            ? -0.5
            : Math.sin(time * 3.0) * 0.25;

      const armShoulderX = 16;
      const armShoulderY = -50 + breathBob;
      
      // Determine hand target coordinates depending on action:
      // If reaching/rerolling: hand plunges deep inside the wicker basket cavity
      // If idle/pointing: hand gestures beckoningly towards the goods
      let handTargetX = 42;
      let handTargetY = -22;

      if (isRerolling) {
        handTargetX = 54 + Math.sin(time * 24) * 8;
        handTargetY = -8 + Math.cos(time * 24) * 6;
      } else if (state === 'pulling') {
        handTargetX = 48;
        handTargetY = -38 + Math.sin(time * 4) * 6; // Lifted high, presenting item!
      } else if (state === 'reaching') {
        handTargetX = 52;
        handTargetY = -12; // Reaching down into basket
      } else if (isPurchasing) {
        handTargetX = 36;
        handTargetY = -34; // Clapping / celebrating
      }

      // Patchwork sleeve
      ctx.fillStyle = '#784D2B';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(armShoulderX - 6, armShoulderY - 4);
      ctx.quadraticCurveTo(armShoulderX + 16, armShoulderY + 8, handTargetX - 10, handTargetY - 4);
      ctx.lineTo(handTargetX - 10, handTargetY + 6);
      ctx.quadraticCurveTo(armShoulderX + 14, armShoulderY + 16, armShoulderX - 4, armShoulderY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sheepskin sleeve cuff
      ctx.fillStyle = '#FAF7EE';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(handTargetX - 8, handTargetY + 1, 6, 8, armAnimPhase * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Red Articulated Demon Claws
      ctx.fillStyle = '#D34538';
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(handTargetX, handTargetY, 7, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4 Claw Fingers reaching & beckoning
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 2;
      for (let fi = 0; fi < 4; fi++) {
        const fingerAngle = -0.4 + fi * 0.35 + armAnimPhase * 0.2;
        const fx1 = handTargetX + Math.cos(fingerAngle) * 5;
        const fy1 = handTargetY + Math.sin(fingerAngle) * 5;
        const fx2 = fx1 + Math.cos(fingerAngle) * 7;
        const fy2 = fy1 + Math.sin(fingerAngle) * 7;
        ctx.beginPath();
        ctx.moveTo(fx1, fy1);
        ctx.lineTo(fx2, fy2);
        ctx.stroke();
        // Sharp black claw tip
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(fx2, fy2, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // If pulling an item up: render a mystical golden aura in his claw!
      if (state === 'pulling' || state === 'reaching') {
        const auraPulse = (Math.sin(time * 8) + 1) * 0.5;
        ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + auraPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(handTargetX + 8, handTargetY - 6, 14 + auraPulse * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      ctx.restore(); // End Arm

      ctx.restore(); // End Grandfather

      // 6. Smoke Particles Simulation & Rendering (in Canvas World Space)
      const currentSmoke = smokeParticlesRef.current;
      for (let i = currentSmoke.length - 1; i >= 0; i--) {
        const p = currentSmoke[i];
        const age = (now - p.birth) / 1000;
        if (age > 2.5) {
          currentSmoke.splice(i, 1);
          continue;
        }
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.radius += 0.18;
        p.alpha = Math.max(0, 0.85 * (1 - age / 2.5));

        ctx.save();
        ctx.fillStyle = `rgba(243, 244, 246, ${p.alpha * 0.75})`;
        ctx.strokeStyle = `rgba(156, 163, 175, ${p.alpha * 0.5})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 7. Sparkles / Crumb Dust Simulation (when rummaging or petting mouse)
      if (isRerolling && now - lastRumbleSparkle > 80) {
        lastRumbleSparkle = now;
        sparklesRef.current.push({
          x: bx + (Math.random() - 0.5) * 40 * scale,
          y: by - 40 * scale,
          vx: (Math.random() - 0.5) * 50,
          vy: -35 - Math.random() * 45,
          color: Math.random() > 0.4 ? '#F59E0B' : '#EAB308',
          radius: 2 + Math.random() * 2.5,
          alpha: 1,
          birth: now,
        });
      }

      const currentSparkles = sparklesRef.current;
      for (let si = currentSparkles.length - 1; si >= 0; si--) {
        const sp = currentSparkles[si];
        const age = (now - sp.birth) / 1000;
        if (age > 1.2) {
          currentSparkles.splice(si, 1);
          continue;
        }
        sp.x += sp.vx * 0.016;
        sp.y += sp.vy * 0.016;
        sp.vy += 80 * 0.016; // gravity
        sp.alpha = Math.max(0, 1 - age / 1.2);

        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isMobile, state]);

  // Dimensions
  const canvasWidth = isMobile ? 360 : 420;
  const canvasHeight = isMobile ? 220 : 360;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at bottom, #FDF3DB 0%, #F5E6CA 70%, #E7D7B6 100%)',
        border: '3px solid #451A03',
        borderRadius: 14,
        padding: isMobile ? '6px' : '10px',
        boxShadow: 'inset 0 0 16px rgba(69, 26, 3, 0.18), 3px 3px 0 rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          maxWidth: canvasWidth,
          height: 'auto',
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          display: 'block',
          cursor: 'pointer',
        }}
        title="Klikni na zvědavou myšku Rézinku v nůši!"
      />

      {/* Floating prompt tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          right: 12,
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#78350F',
          background: 'rgba(254, 243, 199, 0.85)',
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid #B45309',
          pointerEvents: 'none',
        }}
      >
        🐭 Rézinka hlídá perníčky
      </div>
    </div>
  );
}
