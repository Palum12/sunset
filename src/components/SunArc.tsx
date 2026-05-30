import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { formatTime, getSunProgress, minutesToLabel } from '../utils/time';

interface SunArcProps {
  day: SunDay;
  timeZone: string;
}

const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = 132;
const ARC_RADIUS = 92;
const ARC_CENTER_X = VIEWBOX_WIDTH / 2;
const ARC_CENTER_Y = 108;
const ARC_LENGTH = Math.PI * ARC_RADIUS;
const ARC_PATH = `M ${ARC_CENTER_X - ARC_RADIUS} ${ARC_CENTER_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${
  ARC_CENTER_X + ARC_RADIUS
} ${ARC_CENTER_Y}`;

const SunArc = ({ day, timeZone }: SunArcProps) => {
  const { t } = useTranslation();
  const sunProgress = getSunProgress(day, timeZone);
  const angle = Math.PI * (1 - sunProgress.progress);
  const sunX = ARC_CENTER_X + ARC_RADIUS * Math.cos(angle);
  const sunY = ARC_CENTER_Y - ARC_RADIUS * Math.sin(angle);
  const statusLabel =
    sunProgress.state === 'daylight'
      ? t('today.sunArc.untilSunset', { value: minutesToLabel(sunProgress.remainingMinutes) })
      : sunProgress.state === 'beforeSunrise'
        ? t('today.sunArc.untilSunrise', { value: minutesToLabel(sunProgress.remainingMinutes) })
        : t('today.sunArc.afterSunset', { value: minutesToLabel(sunProgress.elapsedMinutes) });

  return (
    <section className="sun-arc" aria-label={t('today.sunArc.aria')}>
      <div className="sun-arc-head">
        <div>
          <p className="eyebrow">{t('today.sunArc.label')}</p>
          <strong>{statusLabel}</strong>
        </div>
        <span className="sun-arc-progress-label">{t('today.sunArc.progress', { value: Math.round(sunProgress.progress * 100) })}</span>
      </div>
      <svg className="sun-arc-visual" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden>
        <defs>
          <linearGradient id="sunArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6f97ff" />
            <stop offset="55%" stopColor="#ffcf7b" />
            <stop offset="100%" stopColor="#ff8f6c" />
          </linearGradient>
        </defs>
        <path className="sun-arc-track" d={ARC_PATH} pathLength={ARC_LENGTH} />
        <path
          className="sun-arc-progress"
          d={ARC_PATH}
          pathLength={ARC_LENGTH}
          style={{ strokeDasharray: `${sunProgress.progress * ARC_LENGTH} ${ARC_LENGTH}` }}
        />
        <circle className="sun-arc-glow" cx={sunX} cy={sunY} r="14" />
        <circle className="sun-arc-sun" cx={sunX} cy={sunY} r="8" />
      </svg>
      <div className="sun-arc-times" aria-hidden>
        <span>{formatTime(day.sunrise, timeZone)}</span>
        <span>{formatTime(day.sunset, timeZone)}</span>
      </div>
    </section>
  );
};

export default SunArc;
