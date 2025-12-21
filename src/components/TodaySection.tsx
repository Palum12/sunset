import { useTranslation } from 'react-i18next';
import { LocationResult, SunDay } from '../types';
import { formatDate, formatTime, isDaylightNow, minutesToLabel } from '../utils/time';
import { getPhotoWindows } from '../utils/time';
import PhotoTooltip from './PhotoTooltip';

interface TodaySectionProps {
  location: LocationResult;
  todayCard: SunDay;
}

const TodaySection = ({ location, todayCard }: TodaySectionProps) => {
  const { t } = useTranslation();
  const photoWindows = getPhotoWindows(todayCard, location.timezone);

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
        <PhotoTooltip
          ariaLabel={t('photo.tooltipLabel')}
          title={t('photo.tooltipTitle')}
          goldenLabel={t('photo.goldenShort')}
          blueLabel={t('photo.blueShort')}
          morningLabel={t('photo.morning')}
          eveningLabel={t('photo.evening')}
          photoWindows={photoWindows}
          timeZone={location.timezone}
          align="right"
        />
      </div>
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
      </div>
    </section>
  );
};

export default TodaySection;
