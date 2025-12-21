import { useTranslation } from 'react-i18next';
import { LocationResult, SunDay } from '../types';
import { formatDate, formatRange, formatTime, isDaylightNow, minutesToLabel } from '../utils/time';
import { getPhotoWindows } from '../utils/time';

interface TodaySectionProps {
  location: LocationResult;
  todayCard: SunDay;
}

const TodaySection = ({ location, todayCard }: TodaySectionProps) => {
  const { t } = useTranslation();
  const photoWindows = getPhotoWindows(todayCard, location.timezone);

  return (
    <section className="today">
      <div>
        <p className="eyebrow">{t('today.label')}</p>
        <h2>{formatDate(todayCard.date, location.timezone)}</h2>
        <p className="lede">
          {t('today.meta', {
            light: isDaylightNow(todayCard, location.timezone) ? t('today.daylight') : t('today.night'),
            length: minutesToLabel(todayCard.dayLengthMinutes),
          })}
        </p>
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
          </div>
          <div className="stat photography">
            <p>{t('photo.golden')}</p>
            <strong>
              {formatRange(photoWindows.morningGolden.start, photoWindows.morningGolden.end, location.timezone)}
            </strong>
            <span className="muted">
              {formatRange(photoWindows.eveningGolden.start, photoWindows.eveningGolden.end, location.timezone)}
            </span>
          </div>
          <div className="stat photography">
            <p>{t('photo.blue')}</p>
            <strong>
              {formatRange(photoWindows.morningBlue.start, photoWindows.morningBlue.end, location.timezone)}
            </strong>
            <span className="muted">
              {formatRange(photoWindows.eveningBlue.start, photoWindows.eveningBlue.end, location.timezone)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodaySection;
