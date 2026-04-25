import { useTranslation } from 'react-i18next';
import useMediaQuery from '../hooks/useMediaQuery';
import { LocationResult, SunDay } from '../types';
import DaysGroup from './DaysGroup';

interface DaysSectionProps {
  loading: boolean;
  location: LocationResult | null;
  currentDateInZone: string | null;
  pastDays: SunDay[];
  upcomingDays: SunDay[];
  pastRange: number;
  futureRange: number;
}

const MOBILE_BREAKPOINT = '(max-width: 720px)';

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
  const compactLayout = useMediaQuery(MOBILE_BREAKPOINT);

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
            <DaysGroup
              title={t('days.pastTitle')}
              hint={t('days.pastHint')}
              days={pastDays}
              timeZone={location.timezone}
              emptyLabel={t('days.noPast')}
              defaultOpen={!compactLayout}
            />

            <DaysGroup
              title={t('days.futureTitle')}
              hint={t('days.futureHint')}
              days={upcomingDays}
              timeZone={location.timezone}
              emptyLabel={t('days.noFuture')}
              defaultOpen
            />
          </>
        )}
      </div>
    </section>
  );
};

export default DaysSection;
