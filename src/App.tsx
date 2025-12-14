import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSunCalendar, geocodeLocation } from './api/openMeteo';
import { LocationResult, SunDay } from './types';
import './App.css';

const DEFAULT_CITY = 'Wrocław';
const PAST_DAYS = 7;
const FUTURE_DAYS = 14;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const formatDate = (date: string, timeZone: string) => {
  const key = `${timeZone}-date`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone,
      }),
    );
  }
  return formatterCache.get(key)!.format(new Date(`${date}T00:00:00`));
};

const formatTime = (dateTime: string, timeZone: string) => {
  const key = `${timeZone}-time`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
      }),
    );
  }
  return formatterCache.get(key)!.format(new Date(dateTime));
};

const minutesToLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} h ${mins.toString().padStart(2, '0')} min`;
};

const getCurrentDateInZone = (timeZone: string) => {
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone,
    }),
  );
  return now.toISOString().split('T')[0];
};

const isToday = (date: string, timeZone: string) => getCurrentDateInZone(timeZone) === date;

const isDaylightNow = (day: SunDay, timeZone: string) => {
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone,
    }),
  );
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [sunriseHour, sunriseMinute] = day.sunrise.split('T')[1].split(':').map(Number);
  const [sunsetHour, sunsetMinute] = day.sunset.split('T')[1].split(':').map(Number);
  const sunriseMinutes = sunriseHour * 60 + sunriseMinute;
  const sunsetMinutes = sunsetHour * 60 + sunsetMinute;

  return nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes;
};

function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [days, setDays] = useState<SunDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      loadLocation(query.trim());
    }
  };

  useEffect(() => {
    loadLocation(DEFAULT_CITY);
  }, []);

  return (
    <div className="app-shell">
      <div className="animated-sky" aria-hidden />
      <main className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">{t('hero.eyebrow')}</p>
            <h1>{t('hero.title')}</h1>
            <p className="lede">{t('hero.lede')}</p>
          </div>
          <div className="header-actions">
            <form className="search" onSubmit={handleSubmit}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                aria-label={t('search.aria')}
              />
              <button type="submit" disabled={loading}>
                {loading ? t('search.loading') : t('search.cta')}
              </button>
            </form>
          </div>
        </header>

        {error && <div className="banner error">{error}</div>}
        {location && !error && (
          <div className="banner success">
            {t('banner.success', {
              name: location.name,
              country: location.country ? `, ${location.country}` : '',
              timezone: location.timezone,
            })}
          </div>
        )}

        {todayCard && location && (
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
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="section-head">
            <div>
              <p className="eyebrow">{t('days.title')}</p>
              <h3>{t('days.subtitle')}</h3>
              <p className="lede">{t('days.range', { past: PAST_DAYS, future: FUTURE_DAYS })}</p>
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
                      <article key={day.date} className="card">
                        <p className="eyebrow">{formatDate(day.date, location.timezone)}</p>
                        <h4>
                          {formatTime(day.sunrise, location.timezone)} — {formatTime(day.sunset, location.timezone)}
                        </h4>
                        <p className="muted">{t('cards.daylight', { value: minutesToLabel(day.dayLengthMinutes) })}</p>
                        <p className="muted">{t('cards.night', { value: minutesToLabel(day.nightLengthMinutes) })}</p>
                      </article>
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
                      <article
                        key={day.date}
                        className={`card ${isToday(day.date, location.timezone) ? 'today-card' : ''}`}
                      >
                        <p className="eyebrow">{formatDate(day.date, location.timezone)}</p>
                        <h4>
                          {formatTime(day.sunrise, location.timezone)} — {formatTime(day.sunset, location.timezone)}
                        </h4>
                        <p className="muted">
                          {t('cards.daylight', { value: minutesToLabel(day.dayLengthMinutes) })}
                        </p>
                        <p className="muted">
                          {t('cards.night', { value: minutesToLabel(day.nightLengthMinutes) })}
                        </p>
                        {isToday(day.date, location.timezone) && <span className="pill">{t('today.badge')}</span>}
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
