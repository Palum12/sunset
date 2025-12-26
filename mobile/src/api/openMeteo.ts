import { LocationResult, SunDay } from '../types';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type ApiErrorCode =
  | 'GEOCODE_FAILED'
  | 'GEOCODE_EMPTY'
  | 'CALENDAR_FAILED'
  | 'MISSING_CALENDAR_DATA';

export class ApiError extends Error {
  code: ApiErrorCode;

  constructor(code: ApiErrorCode) {
    super(code);
    this.code = code;
  }
}

const clampRange = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const parseMinutes = (dateTime: string) => {
  const timePart = dateTime.split('T')[1];
  const [hours, minutes] = timePart.split(':').map(Number);
  return hours * 60 + minutes;
};

export async function geocodeLocation(query: string): Promise<LocationResult> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=pl`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError('GEOCODE_FAILED');
  }

  const data = await response.json();

  if (!data.results?.length) {
    throw new ApiError('GEOCODE_EMPTY');
  }

  const [best] = data.results;

  return {
    name: best.name,
    country: best.country,
    timezone: best.timezone,
    latitude: best.latitude,
    longitude: best.longitude,
  };
}

export async function fetchSunCalendar(
  location: LocationResult,
  pastDays = 3,
  futureDays = 7,
): Promise<SunDay[]> {
  const now = new Date();
  const limitedPast = clampRange(pastDays, 0, 92);
  const limitedFuture = clampRange(futureDays, 0, 16);

  const start = new Date(now);
  start.setDate(now.getDate() - limitedPast);
  const end = new Date(now);
  end.setDate(now.getDate() + limitedFuture);

  const searchParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    daily: 'sunrise,sunset',
    timezone: 'auto',
    start_date: formatDate(start),
    end_date: formatDate(end),
  });

  const response = await fetch(`${FORECAST_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new ApiError('CALENDAR_FAILED');
  }

  const data = await response.json();
  const { daily } = data;

  if (!daily?.time || !daily.sunrise || !daily.sunset) {
    throw new ApiError('MISSING_CALENDAR_DATA');
  }

  return daily.time.map((date: string, index: number) => {
    const sunrise = daily.sunrise[index];
    const sunset = daily.sunset[index];
    const dayLengthMinutes = parseMinutes(sunset) - parseMinutes(sunrise);

    return {
      date,
      sunrise,
      sunset,
      dayLengthMinutes,
      nightLengthMinutes: 24 * 60 - dayLengthMinutes,
    };
  });
}
