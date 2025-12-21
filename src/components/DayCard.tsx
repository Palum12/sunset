import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { formatDate, formatDualWindow, formatTime, getPhotoWindows, minutesToLabel } from '../utils/time';

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
      <p className="eyebrow">{formatDate(day.date, timeZone)}</p>
      <h4>
        {formatTime(day.sunrise, timeZone)} — {formatTime(day.sunset, timeZone)}
      </h4>
      <p className="muted">{t('cards.daylight', { value: minutesToLabel(day.dayLengthMinutes) })}</p>
      <p className="muted">{t('cards.night', { value: minutesToLabel(day.nightLengthMinutes) })}</p>
      <p className="muted photography-row">
        <span>{t('photo.goldenShort')}</span>
        <span>
          {formatDualWindow(
            photoWindows.morningGolden.start,
            photoWindows.morningGolden.end,
            photoWindows.eveningGolden.start,
            photoWindows.eveningGolden.end,
            timeZone,
          )}
        </span>
      </p>
      <p className="muted photography-row">
        <span>{t('photo.blueShort')}</span>
        <span>
          {formatDualWindow(
            photoWindows.morningBlue.start,
            photoWindows.morningBlue.end,
            photoWindows.eveningBlue.start,
            photoWindows.eveningBlue.end,
            timeZone,
          )}
        </span>
      </p>
      {highlight && <span className="pill">{t('today.badge')}</span>}
    </article>
  );
};

export default DayCard;
