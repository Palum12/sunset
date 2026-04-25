import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { formatRange, getPhotoWindows } from '../utils/time';

interface PhotoWindowsSummaryProps {
  day: SunDay;
  timeZone: string;
}

const PhotoWindowsSummary = ({ day, timeZone }: PhotoWindowsSummaryProps) => {
  const { t } = useTranslation();
  const photoWindows = getPhotoWindows(day);

  return (
    <div className="photo-windows-grid">
      <article className="photo-window-card">
        <p className="eyebrow">{t('photo.goldenCard')}</p>
        <div className="photo-window-row">
          <span>{t('photo.morning')}</span>
          <strong>{formatRange(photoWindows.morningGolden.start, photoWindows.morningGolden.end, timeZone)}</strong>
        </div>
        <div className="photo-window-row">
          <span>{t('photo.evening')}</span>
          <strong>{formatRange(photoWindows.eveningGolden.start, photoWindows.eveningGolden.end, timeZone)}</strong>
        </div>
      </article>

      <article className="photo-window-card">
        <p className="eyebrow">{t('photo.blueCard')}</p>
        <div className="photo-window-row">
          <span>{t('photo.morning')}</span>
          <strong>{formatRange(photoWindows.morningBlue.start, photoWindows.morningBlue.end, timeZone)}</strong>
        </div>
        <div className="photo-window-row">
          <span>{t('photo.evening')}</span>
          <strong>{formatRange(photoWindows.eveningBlue.start, photoWindows.eveningBlue.end, timeZone)}</strong>
        </div>
      </article>
    </div>
  );
};

export default PhotoWindowsSummary;
