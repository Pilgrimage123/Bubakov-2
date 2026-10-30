import React from 'react';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaCartouche } from './LadaCartouche';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { WEAPONS } from '../data/weapons';
import { t, getWeaponTranslation, type SupportedLang } from '../i18n';
import type { PendingMilestoneChoice } from '../game/engineState';
import type { MilestoneChoice } from '../types';
import { gamepadManager, MENU_STICK_THRESHOLD, MENU_STICK_RELEASE } from '../game/gamepad';

interface WeaponMilestoneModalProps {
  pendingMilestone: PendingMilestoneChoice;
  lang?: SupportedLang;
  onChoose: (weaponId: string, choiceId: string) => void;
}

export const WeaponMilestoneModal: React.FC<WeaponMilestoneModalProps> = ({
  pendingMilestone,
  lang = 'cs',
  onChoose,
}) => {
  const { weaponId, rank, choices } = pendingMilestone;
  const wDef = WEAPONS[weaponId];
  const wTrans = getWeaponTranslation(weaponId, lang);
  const weaponName = wTrans?.name || wDef?.name || weaponId;
  const weaponIcon = wDef?.icon || 'weapons';

  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [activeDevice, setActiveDevice] = React.useState<'keyboard' | 'gamepad'>(gamepadManager.activeDevice);
  const selectedIndexRef = React.useRef(0);
  selectedIndexRef.current = selectedIndex;

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [weaponId, rank]);

  const handleSelect = React.useCallback((choice: MilestoneChoice) => {
    gamepadManager.consumeActionsAndLockBleed();
    sound.milestoneChosen(choice.audioSfx);
    onChoose(weaponId, choice.id);
  }, [onChoose, weaponId]);

  React.useEffect(() => {
    let requireReleaseBeforeConfirm = true;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      gamepadManager.notifyKeyboardActivity();
      setActiveDevice('keyboard');

      if (e.key === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        sound.coin();
        setSelectedIndex((prev) => (prev - 1 + choices.length) % choices.length);
        return;
      }
      if (e.key === 'ArrowRight' || e.code === 'KeyD' || e.key === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        sound.coin();
        setSelectedIndex((prev) => (prev + 1) % choices.length);
        return;
      }
      if (e.key === '1' && choices[0]) {
        e.preventDefault();
        setSelectedIndex(0);
        handleSelect(choices[0]);
      } else if (e.key === '2' && choices[1]) {
        e.preventDefault();
        setSelectedIndex(1);
        handleSelect(choices[1]);
      } else if ((e.key === 'Enter' || e.code === 'Space') && !requireReleaseBeforeConfirm) {
        e.preventDefault();
        const chosen = choices[selectedIndexRef.current] || choices[0];
        if (chosen) handleSelect(chosen);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        requireReleaseBeforeConfirm = false;
      }
    };
    const unlockTimer = window.setTimeout(() => {
      requireReleaseBeforeConfirm = false;
    }, 140);

    // Gamepad polling loop inside modal (edge detection for D-Pad, Left Stick, and Button A [0])
    let rafId = 0;
    let prevA = true; // start latched so held A from before modal open cannot auto-confirm
    let prevLeft = true;
    let prevRight = true;
    let stickLatchedLeft = false;
    let stickLatchedRight = false;

    const pollModalGamepad = () => {
      const gp = gamepadManager.getActiveGamepad();
      if (gp) {
        const btnA = Boolean(gp.buttons[0]?.pressed);
        const dpadUp = Boolean(gp.buttons[12]?.pressed);
        const dpadDown = Boolean(gp.buttons[13]?.pressed);
        const dpadLeft = Boolean(gp.buttons[14]?.pressed) || dpadUp;
        const dpadRight = Boolean(gp.buttons[15]?.pressed) || dpadDown;
        const axisX = gp.axes?.[0] ?? 0;

        let stickLeftJust = false;
        let stickRightJust = false;
        if (axisX < -MENU_STICK_THRESHOLD) {
          if (!stickLatchedLeft) {
            stickLeftJust = true;
            stickLatchedLeft = true;
          }
        } else if (axisX > -MENU_STICK_RELEASE) {
          stickLatchedLeft = false;
        }
        if (axisX > MENU_STICK_THRESHOLD) {
          if (!stickLatchedRight) {
            stickRightJust = true;
            stickLatchedRight = true;
          }
        } else if (axisX < MENU_STICK_RELEASE) {
          stickLatchedRight = false;
        }

        const leftJust = (dpadLeft && !prevLeft) || stickLeftJust;
        const rightJust = (dpadRight && !prevRight) || stickRightJust;
        const aJust = btnA && !prevA;

        prevLeft = dpadLeft;
        prevRight = dpadRight;
        prevA = btnA;

        if (leftJust || rightJust || aJust) {
          gamepadManager.activeDevice = 'gamepad';
          setActiveDevice('gamepad');
        }
        if (leftJust) {
          sound.coin();
          setSelectedIndex((prev) => (prev - 1 + choices.length) % choices.length);
        } else if (rightJust) {
          sound.coin();
          setSelectedIndex((prev) => (prev + 1) % choices.length);
        } else if (aJust) {
          const chosen = choices[selectedIndexRef.current] || choices[0];
          if (chosen) {
            handleSelect(chosen);
            return;
          }
        }
      }
      rafId = requestAnimationFrame(pollModalGamepad);
    };
    rafId = requestAnimationFrame(pollModalGamepad);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.clearTimeout(unlockTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [choices, weaponId, handleSelect]);

  const formatStatModifiers = (mods: MilestoneChoice['statModifiers']) => {
    const badges: Array<{ label: string; icon: string; color: string }> = [];

    if (mods.baseDamageMult && mods.baseDamageMult !== 1) {
      const pct = Math.round((mods.baseDamageMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.damage', lang, { val: pct }),
        icon: 'impact',
        color: '#991B1B',
      });
    }

    if (mods.cooldownMult && mods.cooldownMult !== 1) {
      const pct = Math.round((1 - mods.cooldownMult) * 100);
      badges.push({
        label: t('milestone_modal.cooldown', lang, { val: pct }),
        icon: 'cuckoo',
        color: '#15803D',
      });
    }

    if (mods.areaRadiusMult && mods.areaRadiusMult !== 1) {
      const pct = Math.round((mods.areaRadiusMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.area', lang, { val: pct }),
        icon: 'target',
        color: '#1E40AF',
      });
    }

    if (mods.knockbackMult && mods.knockbackMult !== 1) {
      const pct = Math.round((mods.knockbackMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.knockback', lang, { val: pct }),
        icon: 'wind',
        color: '#854D0E',
      });
    }

    if (mods.projectileCountDelta && mods.projectileCountDelta > 0) {
      badges.push({
        label: t('milestone_modal.projectiles', lang, { val: mods.projectileCountDelta }),
        icon: 'bow',
        color: '#7E22CE',
      });
    }

    if (mods.pierceDelta && mods.pierceDelta > 0) {
      badges.push({
        label: t('milestone_modal.pierce', lang, { val: mods.pierceDelta }),
        icon: 'weapons',
        color: '#B45309',
      });
    }

    if (mods.ignoreResist && mods.ignoreResist > 0) {
      const pct = Math.round(mods.ignoreResist * 100);
      badges.push({
        label: t('milestone_modal.ignore_resist', lang, { val: pct }),
        icon: 'shield',
        color: '#D97706',
      });
    }

    if (mods.critChanceBonus && mods.critChanceBonus > 0) {
      const pct = Math.round(mods.critChanceBonus * 100);
      badges.push({
        label: t('milestone_modal.crit_chance', lang, { val: pct }),
        icon: 'target',
        color: '#B45309',
      });
    }

    if (mods.critDamageMult && mods.critDamageMult !== 1) {
      const pct = Math.round((mods.critDamageMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.crit_damage', lang, { val: pct }),
        icon: 'impact',
        color: '#B91C1C',
      });
    }

    if (mods.critKnockbackMult && mods.critKnockbackMult !== 1) {
      const pct = Math.round((mods.critKnockbackMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.crit_knockback', lang, { val: pct }),
        icon: 'wind',
        color: '#92400E',
      });
    }

    if (mods.statusDurationSec && mods.statusDurationSec > 0) {
      badges.push({
        label: t('milestone_modal.status', lang, { val: mods.statusDurationSec }),
        icon: 'cuckoo',
        color: '#047857',
      });
    }

    return badges;
  };

  return (
    <div
      className="overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 22, 16, 0.82)',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('milestone_modal.title', lang)}
    >
      <div
        className="panel"
        style={{
          maxWidth: '780px',
          width: '100%',
          background: '#FAF6ED',
          border: '3px solid #1C1610',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '6px 6px 0px #1C1610, 0 12px 28px rgba(0,0,0,0.4)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <LadaCardCorners variant="default" showBottomCorners />

        {/* Header Tag */}
        <div style={{ marginBottom: 12 }}>
          <LadaCartouche variant="ochre" size="lg">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <GameIcon icon="star" size={18} /> {t('milestone_modal.title', lang)} <GameIcon icon="star" size={18} />
            </span>
          </LadaCartouche>
        </div>

        {/* Weapon info */}
        <h2
          style={{
            margin: '8px 0 4px',
            fontSize: '1.6rem',
            color: '#1C1610',
            fontFamily: "'Eczar', serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <LadaFolkFlower variant="buttercup" size={20} spin />
          <GameIcon icon={weaponIcon} size={32} />
          <span>{weaponName}</span>
          <span
            style={{
              fontSize: '0.95rem',
              background: '#9A3412',
              color: '#FFFDF7',
              padding: '2px 10px',
              borderRadius: 6,
              border: '1.5px solid #1C1610',
              fontWeight: 900,
            }}
          >
            {t('milestone_modal.rank_badge', lang, { rank })}
          </span>
          <LadaFolkFlower variant="carmine" size={20} spin="reverse" />
        </h2>
        <LadaBotanicalFlourish height={16} />

        <p
          style={{
            margin: '0 0 18px',
            fontSize: '0.96rem',
            color: '#4B3621',
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {t('milestone_modal.subtitle', lang, { weapon: weaponName, rank })}
        </p>

        {/* The Two Milestone Choices */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            textAlign: 'left',
          }}
        >
          {choices.map((choice, index) => {
            const isFirst = index === 0;
            const isSelected = selectedIndex === index;
            const branchTag = isFirst
              ? t('milestone_modal.crowd_tag', lang)
              : t('milestone_modal.burst_tag', lang);
            const choiceName = t(`milestone.${choice.id}.name`, lang) || choice.name;
            const choiceDesc = t(`milestone.${choice.id}.desc`, lang) || choice.description;
            const statBadges = formatStatModifiers(choice.statModifiers);

            return (
              <div
                key={choice.id}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  background: isSelected
                    ? isFirst
                      ? '#F0FDF4'
                      : '#FEF2F2'
                    : isFirst
                      ? '#FFFDF7'
                      : '#FFFBF0',
                  border: isSelected
                    ? '3.5px solid #D97706'
                    : isFirst
                      ? '2.5px solid #2D5A27'
                      : '2.5px solid #9A3412',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSelected
                    ? '0 0 0 3px #FEF08A, 5px 5px 0 #1C1610'
                    : isFirst
                      ? '3px 3px 0 rgba(45, 90, 39, 0.35)'
                      : '3px 3px 0 rgba(154, 52, 18, 0.35)',
                  transform: isSelected ? 'translateY(-3px)' : 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  position: 'relative',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflowWrap: 'break-word',
                }}
              >
                <div>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <LadaCartouche variant={isFirst ? 'green' : 'red'} size="sm">
                      {branchTag}
                    </LadaCartouche>
                    {isSelected && (
                      <span
                        style={{
                          background: '#FEF08A',
                          color: '#78350F',
                          border: '1.5px solid #1C1610',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                        }}
                      >
                        VYBRÁNO
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      margin: '6px 0 8px',
                      fontSize: '1.25rem',
                      fontFamily: "'Eczar', serif",
                      color: isFirst ? '#166534' : '#991B1B',
                      lineHeight: 1.2,
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    }}
                  >
                    {choiceName}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: '0.9rem',
                      color: '#2A1B12',
                      lineHeight: 1.35,
                      fontWeight: 600,
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    }}
                  >
                    {choiceDesc}
                  </p>

                  {/* Stat Modifiers */}
                  {statBadges.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        margin: '8px 0 14px',
                      }}
                    >
                      {statBadges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          style={{
                            background: '#FAF6ED',
                            border: `1.5px solid ${badge.color}`,
                            color: badge.color,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <GameIcon icon={badge.icon} size={15} />
                          <span>{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm choice button */}
                <button
                  onClick={() => handleSelect(choice)}
                  className="lada-btn"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '1.02rem',
                    fontWeight: 900,
                    background: isFirst ? '#3A7843' : '#C53026',
                    color: '#FAF5E8',
                    border: '2px solid #1C1610',
                    borderRadius: 8,
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #1C1610',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  title={`Zvolit milník (Klávesa ${index + 1} / Enter / Gamepad A)`}
                >
                  <span
                    style={{
                      background: 'rgba(0, 0, 0, 0.28)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-ui)',
                      lineHeight: 1,
                    }}
                  >
                    {activeDevice === 'gamepad'
                      ? isSelected
                        ? '[A]'
                        : '[D-Pad]'
                      : isSelected
                        ? `[${index + 1} / Enter]`
                        : `[${index + 1}]`}
                  </span>
                  <span>{t('milestone_modal.choose_btn', lang)}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Dynamic Navigation Hint */}
        <div
          style={{
            marginTop: 14,
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#5C4033',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <GameIcon icon={activeDevice === 'gamepad' ? 'gamepad' : 'controls'} size={16} />
          <span>
            {activeDevice === 'gamepad'
              ? 'Gamepad: [D-Pad / Levá páčka] Přepnout kartu • [A] Potvrdit vylepšení'
              : 'Klávesnice: [A / D nebo Šipky] Přepnout kartu • [Enter / Mezerník nebo 1-2] Potvrdit vylepšení'}
          </span>
        </div>
      </div>
    </div>
  );
};
