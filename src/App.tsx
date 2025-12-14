import { useEffect, useMemo, useState } from 'react';
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

const isToday = (date: string, timeZone: string) => {
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone,
    }),
  );
  const localDate = now.toISOString().split('T')[0];
  return localDate === date;
};

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
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [days, setDays] = useState<SunDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayCard = useMemo(() => {
    if (!location) return null;
    return days.find((day) => isToday(day.date, location.timezone)) ?? null;
  }, [days, location]);

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
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation(DEFAULT_CITY);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      loadLocation(query.trim());
    }
  };

  return (
    <div className="app-shell">
      <div className="animated-sky" aria-hidden />
      <main className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">Wschody i zachody słońca</p>
            <h1>Twoja codzienna złota godzina</h1>
            <p className="lede">
              Sprawdź kiedy robi się jasno i ciemno w dowolnym mieście, przewiń wstecz lub do przodu
              aby zobaczyć pełny kalendarz.
            </p>
          </div>
          <form className="search" onSubmit={handleSubmit}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wpisz miejscowość, np. Wrocław"
              aria-label="Wybierz miejscowość"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Ładowanie…' : 'Szukaj'}
            </button>
          </form>
        </header>

        {error && <div className="banner error">{error}</div>}
        {location && !error && (
          <div className="banner success">
            Pokazuję lokalne godziny dla <strong>{location.name}</strong>
            {location.country ? `, ${location.country}` : ''} (strefa {location.timezone}).
          </div>
        )}

        {todayCard && location && (
          <section className="today">
            <div>
              <p className="eyebrow">Dziś</p>
              <h2>{formatDate(todayCard.date, location.timezone)}</h2>
              <p className="lede">
                Teraz jest {isDaylightNow(todayCard, location.timezone) ? 'jasno' : 'ciemno'} – dzień trwa
                {` ${minutesToLabel(todayCard.dayLengthMinutes)}`}.
              </p>
              <div className="today-grid">
                <div className="stat">
                  <p>Wschód</p>
                  <strong>{formatTime(todayCard.sunrise, location.timezone)}</strong>
                </div>
                <div className="stat">
                  <p>Zachód</p>
                  <strong>{formatTime(todayCard.sunset, location.timezone)}</strong>
                </div>
                <div className="stat">
                  <p>Długość dnia</p>
                  <strong>{minutesToLabel(todayCard.dayLengthMinutes)}</strong>
                </div>
                <div className="stat">
                  <p>Długość nocy</p>
                  <strong>{minutesToLabel(todayCard.nightLengthMinutes)}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="section-head">
            <div>
              <p className="eyebrow">Historia i prognoza</p>
              <h3>Przewiń dni w tył i w przód</h3>
              <p className="lede">Zakres obejmuje do {PAST_DAYS} dni wstecz i {FUTURE_DAYS} dni do przodu.</p>
            </div>
          </div>
          <div className="days">
            {loading && <div className="muted">Wczytywanie danych…</div>}
            {!loading && location && (
              <div className="cards" aria-live="polite">
                {days.map((day) => (
                  <article key={day.date} className={`card ${isToday(day.date, location.timezone) ? 'today-card' : ''}`}>
                    <p className="eyebrow">{formatDate(day.date, location.timezone)}</p>
                    <h4>
                      {formatTime(day.sunrise, location.timezone)} → {formatTime(day.sunset, location.timezone)}
                    </h4>
                    <p className="muted">Czas jasno: {minutesToLabel(day.dayLengthMinutes)}</p>
                    <p className="muted">Czas ciemno: {minutesToLabel(day.nightLengthMinutes)}</p>
                    {isToday(day.date, location.timezone) && (
                      <span className="pill">Dzisiaj</span>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
