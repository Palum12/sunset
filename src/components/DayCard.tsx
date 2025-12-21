import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { formatDate, formatRange, getPhotoWindows, minutesToLabel } from '../utils/time';
import PhotoTooltip from './PhotoTooltip';

interface DayCardProps {
  day: SunDay;
  timeZone: string;
  highlight?: boolean;
}

const DayCard = ({ day, timeZone, highlight = false }: DayCardProps) => {
  const { t } = useTranslation();
  const photoWindows = getPhotoWindows(day, timeZone);

  return (
    <article className={`card ${highlight ? 'today-card' : ''}`}>
      <div className="card-top">
        <div>
          <p className="eyebrow">{formatDate(day.date, timeZone)}</p>
          <h4>{formatRange(day.sunrise, day.sunset, timeZone)}</h4>
        </div>
        <PhotoTooltip
          ariaLabel={t('photo.tooltipLabel')}
          title={t('photo.tooltipTitle')}
          goldenLabel={t('photo.goldenShort')}
          blueLabel={t('photo.blueShort')}
          morningLabel={t('photo.morning')}
          eveningLabel={t('photo.evening')}
          photoWindows={photoWindows}
          timeZone={timeZone}
          align="right"
        />
      </div>
      <p className="muted">{t('cards.daylight', { value: minutesToLabel(day.dayLengthMinutes) })}</p>
      <p className="muted">{t('cards.night', { value: minutesToLabel(day.nightLengthMinutes) })}</p>
      {highlight && <span className="pill">{t('today.badge')}</span>}
    </article>
  );
};

export default DayCard;
