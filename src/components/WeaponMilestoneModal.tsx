import React from 'react';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaCartouche } from './LadaCartouche';
import { WEAPONS } from '../data/weapons';
import { t, getWeaponTranslation, type SupportedLang } from '../i18n';
import type { PendingMilestoneChoice } from '../game/engineState';
import type { MilestoneChoice } from '../types';

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
  const weaponIcon = wDef?.icon || '🗡️';

  const handleSelect = (choice: MilestoneChoice) => {
    // Folklore audio feedback
    sound.milestoneChosen(choice.audioSfx);
    onChoose(weaponId, choice.id);
  };

  const formatStatModifiers = (mods: MilestoneChoice['statModifiers']) => {
    const badges: Array<{ label: string; icon: string; color: string }> = [];

    if (mods.baseDamageMult && mods.baseDamageMult !== 1) {
      const pct = Math.round((mods.baseDamageMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.damage', lang, { val: pct }),
        icon: '💥',
        color: '#991B1B',
      });
    }

    if (mods.cooldownMult && mods.cooldownMult !== 1) {
      const pct = Math.round((1 - mods.cooldownMult) * 100);
      badges.push({
        label: t('milestone_modal.cooldown', lang, { val: pct }),
        icon: '⏱️',
        color: '#15803D',
      });
    }

    if (mods.areaRadiusMult && mods.areaRadiusMult !== 1) {
      const pct = Math.round((mods.areaRadiusMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.area', lang, { val: pct }),
        icon: '🎯',
        color: '#1E40AF',
      });
    }

    if (mods.knockbackMult && mods.knockbackMult !== 1) {
      const pct = Math.round((mods.knockbackMult - 1) * 100);
      badges.push({
        label: t('milestone_modal.knockback', lang, { val: pct }),
        icon: '💨',
        color: '#854D0E',
      });
    }

    if (mods.projectileCountDelta && mods.projectileCountDelta > 0) {
      badges.push({
        label: t('milestone_modal.projectiles', lang, { val: mods.projectileCountDelta }),
        icon: '🏹',
        color: '#7E22CE',
      });
    }

    if (mods.pierceDelta && mods.pierceDelta > 0) {
      badges.push({
        label: t('milestone_modal.pierce', lang, { val: mods.pierceDelta }),
        icon: '🗡️',
        color: '#B45309',
      });
    }

    if (mods.statusDurationSec && mods.statusDurationSec > 0) {
      badges.push({
        label: t('milestone_modal.status', lang, { val: mods.statusDurationSec }),
        icon: '⏳',
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
            ✨ {t('milestone_modal.title', lang)} ✨
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
          }}
        >
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
        </h2>

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
            const branchTag = isFirst
              ? t('milestone_modal.crowd_tag', lang)
              : t('milestone_modal.burst_tag', lang);
            const choiceName = t(`milestone.${choice.id}.name`, lang) || choice.name;
            const choiceDesc = t(`milestone.${choice.id}.desc`, lang) || choice.description;
            const statBadges = formatStatModifiers(choice.statModifiers);

            return (
              <div
                key={choice.id}
                style={{
                  background: isFirst ? '#FFFDF7' : '#FFFBF0',
                  border: isFirst ? '2.5px solid #2D5A27' : '2.5px solid #9A3412',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isFirst ? '3px 3px 0 rgba(45, 90, 39, 0.35)' : '3px 3px 0 rgba(154, 52, 18, 0.35)',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <LadaCartouche variant={isFirst ? 'green' : 'red'} size="sm">
                      {branchTag}
                    </LadaCartouche>
                  </div>

                  <h3
                    style={{
                      margin: '6px 0 8px',
                      fontSize: '1.25rem',
                      fontFamily: "'Eczar', serif",
                      color: isFirst ? '#166534' : '#991B1B',
                      lineHeight: 1.2,
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
                          <span>{badge.icon}</span>
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
                  }}
                >
                  {t('milestone_modal.choose_btn', lang)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
