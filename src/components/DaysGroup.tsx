import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { isToday } from '../utils/time';
import DayCard from './DayCard';

interface DaysGroupProps {
  title: string;
  hint: string;
  days: SunDay[];
  timeZone: string;
  emptyLabel: string;
  defaultOpen: boolean;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`days-toggle-icon ${open ? 'is-open' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    focusable="false"
  >
    <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DaysGroup = ({ title, hint, days, timeZone, emptyLabel, defaultOpen }: DaysGroupProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <section className={`days-row ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="days-toggle"
        aria-expanded={open}
        aria-label={t(open ? 'days.collapseSection' : 'days.expandSection', { section: title })}
        onClick={() => setOpen((current) => !current)}
      >
        <div className="days-toggle-copy">
          <p className="eyebrow">{title}</p>
          <span className="muted">{hint}</span>
        </div>
        <div className="days-toggle-side">
          <span className="days-toggle-meta">{t('days.itemsCount', { count: days.length })}</span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="cards" aria-live="polite">
          {days.length === 0 && <div className="muted">{emptyLabel}</div>}
          {days.map((day) => (
            <DayCard key={day.date} day={day} timeZone={timeZone} highlight={isToday(day.date, timeZone)} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DaysGroup;
