import { useTranslation } from 'react-i18next';
import { LocationResult, SunDay } from '../types';
import DayCard from './DayCard';
import { isToday } from '../utils/time';

interface DaysSectionProps {
  loading: boolean;
  location: LocationResult | null;
  currentDateInZone: string | null;
  pastDays: SunDay[];
  upcomingDays: SunDay[];
  pastRange: number;
  futureRange: number;
}

const DaysSection = ({
  loading,
  location,
  currentDateInZone,
  pastDays,
  upcomingDays,
  pastRange,
  futureRange,
}: DaysSectionProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">{t('days.title')}</p>
          <h3>{t('days.subtitle')}</h3>
          <p className="lede">{t('days.range', { past: pastRange, future: futureRange })}</p>
        </div>
      </div>
      <div className="days">
        {loading && <div className="muted">{t('loading.data')}</div>}
        {!loading && location && currentDateInZone && (
          <>
            <div className="days-row">
              <div className="row-head">
                <p className="eyebrow">{t('days.pastTitle')}</p>
                <span className="muted">{t('days.pastHint')}</span>
              </div>
              <div className="cards" aria-live="polite">
                {pastDays.length === 0 && <div className="muted">{t('days.noPast')}</div>}
                {pastDays.map((day) => (
                  <DayCard key={day.date} day={day} timeZone={location.timezone} />
                ))}
              </div>
            </div>

            <div className="days-row">
              <div className="row-head">
                <p className="eyebrow">{t('days.futureTitle')}</p>
                <span className="muted">{t('days.futureHint')}</span>
              </div>
              <div className="cards" aria-live="polite">
                {upcomingDays.map((day) => (
                  <DayCard
                    key={day.date}
                    day={day}
                    timeZone={location.timezone}
                    highlight={isToday(day.date, location.timezone)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DaysSection;
