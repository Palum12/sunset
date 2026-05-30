import { useTranslation } from 'react-i18next';
import useMediaQuery from '../hooks/useMediaQuery';
import { LocationResult, SunDay } from '../types';
import { formatDate, formatTime, isDaylightNow, minutesToLabel } from '../utils/time';
import MoonPhaseBadge from './MoonPhaseBadge';
import PhotoWindowsSummary from './PhotoWindowsSummary';
import SunArc from './SunArc';

interface TodaySectionProps {
  location: LocationResult;
  todayCard: SunDay;
}

const TodaySection = ({ location, todayCard }: TodaySectionProps) => {
  const { t } = useTranslation();
  const compactLayout = useMediaQuery('(max-width: 720px)');

  return (
    <section className="today">
      <div className="today-head">
        <div>
          <p className="eyebrow">{t('today.label')}</p>
          <h2>{formatDate(todayCard.date, location.timezone)}</h2>
          <p className="lede">
            {t('today.meta', {
              light: isDaylightNow(todayCard, location.timezone) ? t('today.daylight') : t('today.night'),
              length: minutesToLabel(todayCard.dayLengthMinutes),
            })}
          </p>
        </div>
      </div>
      <div className="today-overview">
        <SunArc day={todayCard} timeZone={location.timezone} />
        <div className="today-side">
          <div className="today-grid">
            <div className="stat">
              <p>{t('stats.sunrise')}</p>
              <strong>{formatTime(todayCard.sunrise, location.timezone)}</strong>
            </div>
            <div className="stat">
              <p>{t('stats.sunset')}</p>
              <strong>{formatTime(todayCard.sunset, location.timezone)}</strong>
            </div>
            <div className="stat">
              <p>{t('stats.dayLength')}</p>
              <strong>{minutesToLabel(todayCard.dayLengthMinutes)}</strong>
            </div>
            <div className="stat">
              <p>{t('stats.nightLength')}</p>
              <strong>{minutesToLabel(todayCard.nightLengthMinutes)}</strong>
              <div className="stat-meta">
                <span className="stat-note">{t('today.moonPhase.label')}</span>
                <MoonPhaseBadge date={todayCard.date} />
              </div>
            </div>
          </div>
          {compactLayout ? (
            <details className="today-disclosure">
              <summary>{t('photo.tooltipTitle')}</summary>
              <div className="today-disclosure-body">
                <PhotoWindowsSummary day={todayCard} timeZone={location.timezone} />
              </div>
            </details>
          ) : (
            <PhotoWindowsSummary day={todayCard} timeZone={location.timezone} />
          )}
        </div>
      </div>
    </section>
  );
};

export default TodaySection;
