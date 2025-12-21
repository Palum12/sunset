import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSunCalendar, geocodeLocation } from './api/openMeteo';
import AppHeader from './components/AppHeader';
import ComparisonSection, { ComparisonRow } from './components/ComparisonSection';
import DaysSection from './components/DaysSection';
import StatusBanners from './components/StatusBanners';
import TodaySection from './components/TodaySection';
import { LocationResult, SunDay } from './types';
import { getCurrentDateInZone, isToday } from './utils/time';
import './App.css';

const DEFAULT_CITY = 'Wrocław';
const PAST_DAYS = 7;
const FUTURE_DAYS = 14;

function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [days, setDays] = useState<SunDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonQuery, setComparisonQuery] = useState('');
  const [comparisonLocation, setComparisonLocation] = useState<LocationResult | null>(null);
  const [comparisonDays, setComparisonDays] = useState<SunDay[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const todayCard = useMemo(() => {
    if (!location) return null;
    return days.find((day) => isToday(day.date, location.timezone)) ?? null;
  }, [days, location]);

  const currentDateInZone = useMemo(
    () => (location ? getCurrentDateInZone(location.timezone) : null),
    [location],
  );

  const pastDays = useMemo(() => {
    if (!location || !currentDateInZone) return [];
    return days.filter((day) => day.date < currentDateInZone);
  }, [currentDateInZone, days, location]);

  const upcomingDays = useMemo(() => {
    if (!location || !currentDateInZone) return [];
    return days.filter((day) => day.date >= currentDateInZone);
  }, [currentDateInZone, days, location]);

  const loadLocation = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const geo = await geocodeLocation(name);
      const calendar = await fetchSunCalendar(geo, PAST_DAYS, FUTURE_DAYS);
      setLocation(geo);
      setDays(calendar);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      loadLocation(query.trim());
    }
  };

  const handleComparisonSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!location || !comparisonQuery.trim()) return;

    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const geo = await geocodeLocation(comparisonQuery.trim());
      const calendar = await fetchSunCalendar(geo, PAST_DAYS, FUTURE_DAYS);
      setComparisonLocation(geo);
      setComparisonDays(calendar);
    } catch (err) {
      console.error(err);
      setComparisonError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setComparisonLoading(false);
    }
  };

  useEffect(() => {
    loadLocation(DEFAULT_CITY);
  }, []);

  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (!location || !comparisonLocation) return [];
    const comparisonMap = new Map(comparisonDays.map((day) => [day.date, day]));

    return upcomingDays
      .filter((day) => comparisonMap.has(day.date))
      .map((day) => {
        const match = comparisonMap.get(day.date)!;
        const delta = match.dayLengthMinutes - day.dayLengthMinutes;
        return {
          date: day.date,
          base: day,
          other: match,
          delta,
        };
      });
  }, [comparisonDays, comparisonLocation, location, upcomingDays]);

  return (
    <div className="app-shell">
      <div className="animated-sky" aria-hidden />
      <main className="panel">
        <AppHeader query={query} loading={loading} onQueryChange={setQuery} onSubmit={handleSubmit} />

        <StatusBanners location={location} error={error} />

        {todayCard && location && <TodaySection todayCard={todayCard} location={location} />}

        <DaysSection
          loading={loading}
          location={location}
          currentDateInZone={currentDateInZone}
          pastDays={pastDays}
          upcomingDays={upcomingDays}
          pastRange={PAST_DAYS}
          futureRange={FUTURE_DAYS}
        />

        <ComparisonSection
          comparisonQuery={comparisonQuery}
          comparisonLoading={comparisonLoading}
          comparisonError={comparisonError}
          comparisonLocation={comparisonLocation}
          comparisonRows={comparisonRows}
          baseLocation={location}
          onQueryChange={setComparisonQuery}
          onSubmit={handleComparisonSubmit}
        />
      </main>
    </div>
  );
}

export default App;
