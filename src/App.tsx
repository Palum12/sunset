import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSunCalendar, geocodeLocation } from './api/openMeteo';
import { LocationResult, SunDay } from './types';
import './App.css';

const DEFAULT_CITY = 'Wrocław';
const PAST_DAYS = 7;
const FUTURE_DAYS = 14;
const PHOTO_WINDOW_MINUTES = 60;

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

const shiftTime = (dateTime: string, offsetMinutes: number, timeZone: string) => {
  const baseDate = new Date(
    new Date(dateTime).toLocaleString('en-US', {
      timeZone,
    }),
  );
  baseDate.setMinutes(baseDate.getMinutes() + offsetMinutes);
  return baseDate.toISOString();
};

const formatRange = (start: string, end: string, timeZone: string) =>
  `${formatTime(start, timeZone)} — ${formatTime(end, timeZone)}`;

const formatDualWindow = (
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
  timeZone: string,
) => `${formatRange(firstStart, firstEnd, timeZone)} / ${formatRange(secondStart, secondEnd, timeZone)}`;

const getPhotoWindows = (day: SunDay, timeZone: string) => ({
  morningBlue: {
    start: shiftTime(day.sunrise, -PHOTO_WINDOW_MINUTES, timeZone),
    end: day.sunrise,
  },
  morningGolden: {
    start: day.sunrise,
    end: shiftTime(day.sunrise, PHOTO_WINDOW_MINUTES, timeZone),
  },
  eveningGolden: {
    start: shiftTime(day.sunset, -PHOTO_WINDOW_MINUTES, timeZone),
    end: day.sunset,
  },
  eveningBlue: {
    start: day.sunset,
    end: shiftTime(day.sunset, PHOTO_WINDOW_MINUTES, timeZone),
  },
});

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
  const [comparisonQuery, setComparisonQuery] = useState('');
  const [comparisonLocation, setComparisonLocation] = useState<LocationResult | null>(null);
  const [comparisonDays, setComparisonDays] = useState<SunDay[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const todayCard = useMemo(() => {
    if (!location) return null;
    return days.find((day) => isToday(day.date, location.timezone)) ?? null;
  }, [days, location]);

  const todayPhotoWindows = useMemo(() => {
    if (!location || !todayCard) return null;
    return getPhotoWindows(todayCard, location.timezone);
  }, [location, todayCard]);

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

  const handleComparisonSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!location) return;
    if (comparisonQuery.trim()) {
      setComparisonLoading(true);
      setComparisonError(null);
      geocodeLocation(comparisonQuery.trim())
        .then((geo) => fetchSunCalendar(geo, PAST_DAYS, FUTURE_DAYS).then((calendar) => {
          setComparisonLocation(geo);
          setComparisonDays(calendar);
        }))
        .catch((err) => {
          console.error(err);
          setComparisonError(err instanceof Error ? err.message : t('errors.unknown'));
        })
        .finally(() => setComparisonLoading(false));
    }
  };

  useEffect(() => {
    loadLocation(DEFAULT_CITY);
  }, []);

  const comparisonRows = useMemo(() => {
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
                {todayPhotoWindows && (
                  <>
                    <div className="stat photography">
                      <p>{t('photo.golden')}</p>
                      <strong>
                        {formatRange(
                          todayPhotoWindows.morningGolden.start,
                          todayPhotoWindows.morningGolden.end,
                          location.timezone,
                        )}
                      </strong>
                      <span className="muted">
                        {formatRange(
                          todayPhotoWindows.eveningGolden.start,
                          todayPhotoWindows.eveningGolden.end,
                          location.timezone,
                        )}
                      </span>
                    </div>
                    <div className="stat photography">
                      <p>{t('photo.blue')}</p>
                      <strong>
                        {formatRange(
                          todayPhotoWindows.morningBlue.start,
                          todayPhotoWindows.morningBlue.end,
                          location.timezone,
                        )}
                      </strong>
                      <span className="muted">
                        {formatRange(
                          todayPhotoWindows.eveningBlue.start,
                          todayPhotoWindows.eveningBlue.end,
                          location.timezone,
                        )}
                      </span>
                    </div>
                  </>
                )}
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
                    {pastDays.map((day) => {
                      const photoWindows = getPhotoWindows(day, location.timezone);
                      return (
                        <article key={day.date} className="card">
                          <p className="eyebrow">{formatDate(day.date, location.timezone)}</p>
                          <h4>
                            {formatTime(day.sunrise, location.timezone)} — {formatTime(day.sunset, location.timezone)}
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
                                location.timezone,
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
                                location.timezone,
                              )}
                            </span>
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="days-row">
                  <div className="row-head">
                    <p className="eyebrow">{t('days.futureTitle')}</p>
                    <span className="muted">{t('days.futureHint')}</span>
                  </div>
                  <div className="cards" aria-live="polite">
                    {upcomingDays.map((day) => {
                      const photoWindows = getPhotoWindows(day, location.timezone);
                      return (
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
                          <p className="muted photography-row">
                            <span>{t('photo.goldenShort')}</span>
                            <span>
                              {formatDualWindow(
                                photoWindows.morningGolden.start,
                                photoWindows.morningGolden.end,
                                photoWindows.eveningGolden.start,
                                photoWindows.eveningGolden.end,
                                location.timezone,
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
                                location.timezone,
                              )}
                            </span>
                          </p>
                          {isToday(day.date, location.timezone) && <span className="pill">{t('today.badge')}</span>}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="comparison">
          <div className="section-head">
            <div>
              <p className="eyebrow">{t('compare.title')}</p>
              <h3>{t('compare.subtitle')}</h3>
              <p className="lede">{t('compare.hint')}</p>
            </div>
            <form className="search compact" onSubmit={handleComparisonSubmit}>
              <input
                value={comparisonQuery}
                onChange={(e) => setComparisonQuery(e.target.value)}
                placeholder={t('compare.placeholder')}
                aria-label={t('compare.aria')}
                disabled={!location}
              />
              <button type="submit" disabled={!location || comparisonLoading}>
                {comparisonLoading ? t('search.loading') : t('compare.cta')}
              </button>
            </form>
          </div>
          {comparisonError && <div className="banner error">{comparisonError}</div>}
          {comparisonLocation && !comparisonError && (
            <div className="banner success">
              {t('compare.banner', {
                base: location?.name,
                other: comparisonLocation.name,
              })}
            </div>
          )}
          <div className="cards comparison-cards" aria-live="polite">
            {comparisonRows.length === 0 && (
              <div className="muted">{t('compare.empty')}</div>
            )}
            {comparisonRows.map((row) => (
              <article key={row.date} className="card">
                <p className="eyebrow">{formatDate(row.date, location?.timezone ?? 'UTC')}</p>
                <h4>{t('compare.delta', { value: minutesToLabel(Math.abs(row.delta)) })}</h4>
                <p className="muted">
                  {t('compare.base', { value: minutesToLabel(row.base.dayLengthMinutes), name: location?.name })}
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
      </main>
    </div>
  );
}

export default App;
