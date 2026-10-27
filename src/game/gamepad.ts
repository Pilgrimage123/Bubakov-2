/**
 * HTML5 Gamepad API & Unified Input Controller (Klávesnice + Gamepad)
 *
 * Zajišťuje:
 * 1. Detekci prvního aktivního gamepadu v herní smyčce:
 *    Array.from(navigator.getGamepads()).find(gp => gp && gp.connected)
 * 2. Pohyb postavy (levá páčka axes[0]/axes[1] s deadzone 0.15 + D-Pad buttons[12..15] + WASD/šipky)
 *    s normalizací výsledného vektoru, aby diagonální pohyb nebyl rychlejší.
 * 3. Edge detection (justPressed) pro akční tlačítka i klávesy:
 *    - Zvláštní schopnost: Space nebo RB (buttons[5]) / B (buttons[1])
 *    - Interakce: KeyE nebo X (buttons[2])
 *    - Potvrzení v menu (Level-Up / Milník / Dědeček / Truhla): Enter/Space nebo A (buttons[0])
 *    - Pauza: Escape/KeyP nebo Start (buttons[9])
 *    - Fullscreen: KeyF
 * 4. Ochranu proti přenosu stisků (input bleed) mezi menu a arénou.
 * 5. Sledování naposledy použitého vstupního zařízení ('keyboard' | 'gamepad') pro dynamické UI nápovědy.
 */

export type InputDeviceMode = 'keyboard' | 'gamepad';

export const GAMEPAD_DEADZONE = 0.15;
export const MENU_STICK_THRESHOLD = 0.52;
export const MENU_STICK_RELEASE = 0.25;

export interface GamepadFrameInput {
  /** Zda je právě připojen alespoň jeden aktivní gamepad */
  gamepadConnected: boolean;
  /** Název/ID připojeného gamepadu */
  gamepadName: string;
  /** Naposledy použité ovládací zařízení ('keyboard' | 'gamepad') */
  activeDevice: InputDeviceMode;
  /** Normalizovaný vektor pohybu X (-1 až 1) zkombinovaný z klávesnice a gamepadu */
  moveX: number;
  /** Normalizovaný vektor pohybu Y (-1 až 1) zkombinovaný z klávesnice a gamepadu */
  moveY: number;
  /** Zvláštní schopnost (Space / RB [5] / B [1]) – pouze při náběžné hraně (justPressed) */
  abilityJustPressed: boolean;
  /** Interakce s okolím (KeyE / X [2]) – pouze při náběžné hraně (justPressed) */
  interactJustPressed: boolean;
  /** Potvrzení v menu (Enter / Space / A [0]) – pouze při náběžné hraně (justPressed) */
  confirmJustPressed: boolean;
  /** Zrušení / Zavření v menu (Escape / B [1]) – pouze při náběžné hraně (justPressed) */
  cancelJustPressed: boolean;
  /** Obnovení nabídky u dědečka (KeyR / Y [3]) – pouze při náběžné hraně (justPressed) */
  rerollJustPressed: boolean;
  /** Přepnutí pauzy (Escape / KeyP / Start [9]) – pouze při náběžné hraně (justPressed) */
  pauseJustPressed: boolean;
  /** Přepnutí celé obrazovky (KeyF) – pouze při náběžné hraně (justPressed) */
  fullscreenJustPressed: boolean;
  /** Navigace v menu doleva (D-Pad Left [14] / Levá páčka <- / ArrowLeft / KeyA) */
  navLeftJustPressed: boolean;
  /** Navigace v menu doprava (D-Pad Right [15] / Levá páčka -> / ArrowRight / KeyD) */
  navRightJustPressed: boolean;
  /** Navigace v menu nahoru (D-Pad Up [12] / Levá páčka ^ / ArrowUp / KeyW) */
  navUpJustPressed: boolean;
  /** Navigace v menu dolů (D-Pad Down [13] / Levá páčka v / ArrowDown / KeyS) */
  navDownJustPressed: boolean;
}

/**
 * Pomocná funkce pro bezpečné čtení stisku tlačítka na gamepadu.
 */
function isButtonPressed(gp: Gamepad | null | undefined, index: number): boolean {
  if (!gp || !gp.buttons || index < 0 || index >= gp.buttons.length) return false;
  const btn = gp.buttons[index];
  if (!btn) return false;
  return typeof btn === 'object' ? Boolean(btn.pressed || btn.value > 0.5) : Boolean(btn);
}

/**
 * Aplikuje mrtvou zónu (deadzone 0.15) na osu analogové páčky s plynulým přepočtem rozsahu.
 */
export function applyAxisDeadzone(value: number, deadzone: number = GAMEPAD_DEADZONE): number {
  if (!Number.isFinite(value)) return 0;
  const abs = Math.abs(value);
  if (abs < deadzone) return 0;
  const sign = value < 0 ? -1 : 1;
  return sign * Math.min(1, (abs - deadzone) / (1 - deadzone));
}

export class GamepadInputManager {
  private prevGpButtons: boolean[] = new Array(20).fill(false);
  private prevKeys: Record<string, boolean> = {};
  private stickNavLeftLatched = false;
  private stickNavRightLatched = false;
  private stickNavUpLatched = false;
  private stickNavDownLatched = false;

  private lastStateContext = '';
  /** Pokud došlo k přepnutí mezi menu a arénou, vyžadujeme nejprve uvolnění akčních kláves/tlačítek (input bleed guard). */
  private bleedGuardActive = false;

  public activeDevice: InputDeviceMode = 'keyboard';
  public gamepadConnected = false;
  public gamepadName = '';

  public readonly currentFrame: GamepadFrameInput = {
    gamepadConnected: false,
    gamepadName: '',
    activeDevice: 'keyboard',
    moveX: 0,
    moveY: 0,
    abilityJustPressed: false,
    interactJustPressed: false,
    confirmJustPressed: false,
    cancelJustPressed: false,
    rerollJustPressed: false,
    pauseJustPressed: false,
    fullscreenJustPressed: false,
    navLeftJustPressed: false,
    navRightJustPressed: false,
    navUpJustPressed: false,
    navDownJustPressed: false,
  };

  /**
   * Explicitně uzamkne aktuálně držená akční tlačítka a klávesy, aby se stisk z menu
   * (např. Space / Enter / A / B při potvrzení level-upu) nepřenesl do arény v témže ani následujícím snímku.
   */
  public consumeActionsAndLockBleed(keys?: Record<string, boolean>): void {
    this.bleedGuardActive = true;
    this.currentFrame.abilityJustPressed = false;
    this.currentFrame.interactJustPressed = false;
    this.currentFrame.confirmJustPressed = false;
    this.currentFrame.cancelJustPressed = false;
    this.currentFrame.rerollJustPressed = false;
    this.currentFrame.pauseJustPressed = false;
    if (keys) {
      this.prevKeys['Space'] = Boolean(keys['Space']);
      this.prevKeys['Enter'] = Boolean(keys['Enter'] || keys['NumpadEnter']);
      this.prevKeys['KeyE'] = Boolean(keys['KeyE']);
      this.prevKeys['Escape'] = Boolean(keys['Escape']);
      this.prevKeys['KeyP'] = Boolean(keys['KeyP']);
      this.prevKeys['KeyR'] = Boolean(keys['KeyR']);
    }
    const gp = this.getActiveGamepad();
    if (gp) {
      for (let i = 0; i < 16; i++) {
        this.prevGpButtons[i] = isButtonPressed(gp, i);
      }
    }
  }

  /**
   * Načte první aktivní ovladač podle zadání:
   * Array.from(navigator.getGamepads()).find(gp => gp && gp.connected)
   */
  public getActiveGamepad(): Gamepad | null {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return null;
    }
    try {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return null;
      const active = Array.from(gamepads).find((gp): gp is Gamepad => Boolean(gp && gp.connected));
      return active || null;
    } catch {
      return null;
    }
  }

  /**
   * Označí klávesnici jako aktivní vstupní zařízení (např. při stisku klávesy v DOM eventu).
   */
  public notifyKeyboardActivity(): void {
    this.activeDevice = 'keyboard';
    this.currentFrame.activeDevice = 'keyboard';
  }

  /**
   * Hlavní dotazovací metoda volaná jednou za snímek v requestAnimationFrame.
   */
  public poll(
    keys: Record<string, boolean>,
    stateContext: string,
    touchMove?: { x: number; y: number; active: boolean }
  ): GamepadFrameInput {
    // 1. Detekce změny kontextu (např. přechod 'milestone' -> 'playing' nebo 'grandfather' -> 'playing')
    if (this.lastStateContext !== '' && this.lastStateContext !== stateContext) {
      this.bleedGuardActive = true;
    }
    this.lastStateContext = stateContext;

    // 2. Detekce prvního aktivního ovladače
    const gp = this.getActiveGamepad();
    this.gamepadConnected = Boolean(gp);
    this.gamepadName = gp ? gp.id || 'Gamepad' : '';

    // 3. Čtení pohybu z gamepadu (levá analogová páčka s deadzone 0.15 + D-Pad buttons[12..15])
    let gpMoveX = 0;
    let gpMoveY = 0;
    let rawAxisX = 0;
    let rawAxisY = 0;

    if (gp) {
      rawAxisX = gp.axes && gp.axes.length > 0 ? gp.axes[0] : 0;
      rawAxisY = gp.axes && gp.axes.length > 1 ? gp.axes[1] : 0;

      // Radiální + osová deadzone 0.15
      const radialMag = Math.hypot(rawAxisX, rawAxisY);
      if (radialMag >= GAMEPAD_DEADZONE) {
        const normMag = Math.min(1, (radialMag - GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE));
        gpMoveX = (rawAxisX / radialMag) * normMag;
        gpMoveY = (rawAxisY / radialMag) * normMag;
      }

      // D-Pad: buttons[12] nahoru, buttons[13] dolů, buttons[14] doleva, buttons[15] doprava
      if (isButtonPressed(gp, 12)) gpMoveY -= 1;
      if (isButtonPressed(gp, 13)) gpMoveY += 1;
      if (isButtonPressed(gp, 14)) gpMoveX -= 1;
      if (isButtonPressed(gp, 15)) gpMoveX += 1;
    }

    // 4. Čtení pohybu z klávesnice (WASD / šipky)
    let kbMoveX = 0;
    let kbMoveY = 0;
    if (keys['KeyW'] || keys['ArrowUp']) kbMoveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) kbMoveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) kbMoveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) kbMoveX += 1;

    // 5. Sledování, zda uživatel právě použil gamepad nebo klávesnici
    const anyGpButtonNow =
      gp !== null &&
      (isButtonPressed(gp, 0) ||
        isButtonPressed(gp, 1) ||
        isButtonPressed(gp, 2) ||
        isButtonPressed(gp, 3) ||
        isButtonPressed(gp, 4) ||
        isButtonPressed(gp, 5) ||
        isButtonPressed(gp, 8) ||
        isButtonPressed(gp, 9) ||
        isButtonPressed(gp, 12) ||
        isButtonPressed(gp, 13) ||
        isButtonPressed(gp, 14) ||
        isButtonPressed(gp, 15) ||
        Math.hypot( gpMoveX, gpMoveY ) > 0.05);

    const anyKbNow =
      kbMoveX !== 0 ||
      kbMoveY !== 0 ||
      Boolean(
        keys['Space'] ||
          keys['KeyE'] ||
          keys['Enter'] ||
          keys['NumpadEnter'] ||
          keys['Escape'] ||
          keys['KeyP'] ||
          keys['KeyR'] ||
          keys['KeyF']
      );

    if (anyGpButtonNow) {
      this.activeDevice = 'gamepad';
    } else if (anyKbNow) {
      this.activeDevice = 'keyboard';
    }

    // 6. Zkombinování vstupu z gamepadu, klávesnice a dotyku + normalizace vektoru
    let combinedX = kbMoveX + gpMoveX;
    let combinedY = kbMoveY + gpMoveY;
    if (touchMove && touchMove.active) {
      combinedX += touchMove.x;
      combinedY += touchMove.y;
    }

    const totalLen = Math.hypot(combinedX, combinedY);
    if (totalLen > 1) {
      combinedX /= totalLen;
      combinedY /= totalLen;
    }

    // 7. Edge detection (justPressed) pro všechna tlačítka gamepadu a klávesnice
    const gpBtnJustPressed = (idx: number): boolean => {
      const nowPressed = isButtonPressed(gp, idx);
      const wasPressed = this.prevGpButtons[idx] || false;
      this.prevGpButtons[idx] = nowPressed;
      return nowPressed && !wasPressed;
    };

    const kbKeyJustPressed = (code: string): boolean => {
      const nowPressed = Boolean(keys[code]);
      const wasPressed = Boolean(this.prevKeys[code]);
      this.prevKeys[code] = nowPressed;
      return nowPressed && !wasPressed;
    };

    const gpAJust = gpBtnJustPressed(0); // A (potvrzení v menu)
    const gpBJust = gpBtnJustPressed(1); // B (schopnost v aréně / zrušit v menu)
    const gpXJust = gpBtnJustPressed(2); // X (interakce v aréně)
    const gpYJust = gpBtnJustPressed(3); // Y (reroll u dědečka)
    const gpRBJust = gpBtnJustPressed(5); // RB (schopnost v aréně)
    const gpStartJust = gpBtnJustPressed(9); // Start (pauza)

    const gpDpadUpJust = gpBtnJustPressed(12);
    const gpDpadDownJust = gpBtnJustPressed(13);
    const gpDpadLeftJust = gpBtnJustPressed(14);
    const gpDpadRightJust = gpBtnJustPressed(15);

    // Edge detection pro pohyb levou páčkou v menu (s hysterezí)
    let stickLeftJust = false;
    let stickRightJust = false;
    let stickUpJust = false;
    let stickDownJust = false;

    if (rawAxisX < -MENU_STICK_THRESHOLD) {
      if (!this.stickNavLeftLatched) {
        stickLeftJust = true;
        this.stickNavLeftLatched = true;
      }
    } else if (rawAxisX > -MENU_STICK_RELEASE) {
      this.stickNavLeftLatched = false;
    }

    if (rawAxisX > MENU_STICK_THRESHOLD) {
      if (!this.stickNavRightLatched) {
        stickRightJust = true;
        this.stickNavRightLatched = true;
      }
    } else if (rawAxisX < MENU_STICK_RELEASE) {
      this.stickNavRightLatched = false;
    }

    if (rawAxisY < -MENU_STICK_THRESHOLD) {
      if (!this.stickNavUpLatched) {
        stickUpJust = true;
        this.stickNavUpLatched = true;
      }
    } else if (rawAxisY > -MENU_STICK_RELEASE) {
      this.stickNavUpLatched = false;
    }

    if (rawAxisY > MENU_STICK_THRESHOLD) {
      if (!this.stickNavDownLatched) {
        stickDownJust = true;
        this.stickNavDownLatched = true;
      }
    } else if (rawAxisY < MENU_STICK_RELEASE) {
      this.stickNavDownLatched = false;
    }

    const kbSpaceJust = kbKeyJustPressed('Space');
    const kbEnterJust = kbKeyJustPressed('Enter') || kbKeyJustPressed('NumpadEnter');
    const kbEJust = kbKeyJustPressed('KeyE');
    const kbEscJust = kbKeyJustPressed('Escape');
    const kbPJust = kbKeyJustPressed('KeyP');
    const kbRJust = kbKeyJustPressed('KeyR');
    const kbFJust = kbKeyJustPressed('KeyF');

    const kbLeftJust = kbKeyJustPressed('ArrowLeft') || kbKeyJustPressed('KeyA');
    const kbRightJust = kbKeyJustPressed('ArrowRight') || kbKeyJustPressed('KeyD');
    const kbUpJust = kbKeyJustPressed('ArrowUp') || kbKeyJustPressed('KeyW');
    const kbDownJust = kbKeyJustPressed('ArrowDown') || kbKeyJustPressed('KeyS');

    // 8. Ochrana proti přenosu stisků (input bleed) mezi menu a arénou:
    // Pokud došlo ke změně herního stavu (např. zavření level-up menu po stisku Space/A/B),
    // ignorujeme akční hrany, dokud nejsou všechna akční tlačítka uvolněna.
    const anyActionHeldNow =
      Boolean(keys['Space'] || keys['Enter'] || keys['NumpadEnter'] || keys['KeyE'] || keys['Escape']) ||
      isButtonPressed(gp, 0) ||
      isButtonPressed(gp, 1) ||
      isButtonPressed(gp, 2) ||
      isButtonPressed(gp, 5) ||
      isButtonPressed(gp, 9);

    let suppressActionEdges = false;
    if (this.bleedGuardActive) {
      if (!anyActionHeldNow) {
        this.bleedGuardActive = false;
      } else {
        suppressActionEdges = true;
      }
    }

    const out = this.currentFrame;
    out.gamepadConnected = this.gamepadConnected;
    out.gamepadName = this.gamepadName;
    out.activeDevice = this.activeDevice;
    out.moveX = combinedX;
    out.moveY = combinedY;

    out.abilityJustPressed = !suppressActionEdges && (kbSpaceJust || gpRBJust || gpBJust);
    out.interactJustPressed = !suppressActionEdges && (kbEJust || gpXJust);
    out.confirmJustPressed = !suppressActionEdges && (kbEnterJust || kbSpaceJust || gpAJust);
    out.cancelJustPressed = !suppressActionEdges && (kbEscJust || gpBJust);
    out.rerollJustPressed = !suppressActionEdges && (kbRJust || gpYJust);
    out.pauseJustPressed = !suppressActionEdges && (kbEscJust || kbPJust || gpStartJust);
    out.fullscreenJustPressed = kbFJust;

    out.navLeftJustPressed = gpDpadLeftJust || stickLeftJust || kbLeftJust;
    out.navRightJustPressed = gpDpadRightJust || stickRightJust || kbRightJust;
    out.navUpJustPressed = gpDpadUpJust || stickUpJust || kbUpJust;
    out.navDownJustPressed = gpDpadDownJust || stickDownJust || kbDownJust;

    return out;
  }
}

/** Sdílená instance pro komponenty i hlavní herní smyčku */
export const gamepadManager = new GamepadInputManager();
