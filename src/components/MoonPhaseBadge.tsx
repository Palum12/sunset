import { useTranslation } from 'react-i18next';
import { getMoonPhase } from '../utils/time';

interface MoonPhaseBadgeProps {
  date: string;
}

const MoonPhaseBadge = ({ date }: MoonPhaseBadgeProps) => {
  const { t } = useTranslation();
  const moonPhase = getMoonPhase(date);
  const phaseLabel = t(`moonPhase.names.${moonPhase.phaseKey}`);
  const title = t('today.moonPhase.title', {
    phase: phaseLabel,
    value: moonPhase.illuminationPercent,
  });

  return (
    <span className="moon-phase" title={title} aria-label={title}>
      <span className="moon-phase-icon" aria-hidden>
        {moonPhase.icon}
      </span>
      <span>{t('today.moonPhase.value', { value: moonPhase.illuminationPercent })}</span>
    </span>
  );
};

export default MoonPhaseBadge;
