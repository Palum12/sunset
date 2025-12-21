import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationResult, SunDay } from '../types';
import { formatDate, minutesToLabel } from '../utils/time';

export interface ComparisonRow {
  date: string;
  base: SunDay;
  other: SunDay;
  delta: number;
}

interface ComparisonSectionProps {
  comparisonQuery: string;
  comparisonLoading: boolean;
  comparisonError: string | null;
  comparisonLocation: LocationResult | null;
  comparisonRows: ComparisonRow[];
  baseLocation: LocationResult | null;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

const ComparisonSection = ({
  comparisonQuery,
  comparisonLoading,
  comparisonError,
  comparisonLocation,
  comparisonRows,
  baseLocation,
  onQueryChange,
  onSubmit,
}: ComparisonSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="comparison">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t('compare.title')}</p>
          <h3>{t('compare.subtitle')}</h3>
          <p className="lede">{t('compare.hint')}</p>
        </div>
        <form className="search compact" onSubmit={onSubmit}>
          <input
            value={comparisonQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t('compare.placeholder')}
            aria-label={t('compare.aria')}
            disabled={!baseLocation}
          />
          <button type="submit" disabled={!baseLocation || comparisonLoading}>
            {comparisonLoading ? t('search.loading') : t('compare.cta')}
          </button>
        </form>
      </div>
      {comparisonError && <div className="banner error">{comparisonError}</div>}
      {comparisonLocation && !comparisonError && (
        <div className="banner success">
          {t('compare.banner', {
            base: baseLocation?.name,
            other: comparisonLocation.name,
          })}
        </div>
      )}
      <div className="cards comparison-cards" aria-live="polite">
        {comparisonRows.length === 0 && <div className="muted">{t('compare.empty')}</div>}
        {comparisonRows.map((row) => (
          <article key={row.date} className="card">
            <p className="eyebrow">{formatDate(row.date, baseLocation?.timezone ?? 'UTC')}</p>
            <h4>{t('compare.delta', { value: minutesToLabel(Math.abs(row.delta)) })}</h4>
            <p className="muted">
              {t('compare.base', { value: minutesToLabel(row.base.dayLengthMinutes), name: baseLocation?.name })}
            </p>
            <p className="muted">
              {t('compare.other', {
                value: minutesToLabel(row.other.dayLengthMinutes),
                name: comparisonLocation?.name,
              })}
            </p>
            <span className={`pill ${row.delta >= 0 ? 'pill-positive' : 'pill-negative'}`}>
              {row.delta >= 0 ? t('compare.longer') : t('compare.shorter')}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ComparisonSection;
