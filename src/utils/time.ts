import { MoonPhaseInfo, MoonPhaseKey, PhotoWindows, SunDay, SunProgress } from '../types';

const formatterCache = new Map<string, Intl.DateTimeFormat>();
const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const pad = (value: number) => value.toString().padStart(2, '0');

const getFormatter = (key: string, options: Intl.DateTimeFormatOptions) => {
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat('pl-PL', options));
  }

  return formatterCache.get(key)!;
};

const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return { year, month, day };
};

const parseDateTime = (dateTime: string) => {
  const [date, time = '00:00'] = dateTime.split('T');
  const { year, month, day } = parseDate(date);
  const [hour, minute] = time.slice(0, 5).split(':').map(Number);

  return { year, month, day, hour, minute };
};

const formatNaiveDateTime = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}`;

const getZonedParts = (date: Date, timeZone: string) => {
  const formatter = getFormatter(`${timeZone}-parts`, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: values.get('year') ?? '0000',
    month: values.get('month') ?? '01',
    day: values.get('day') ?? '01',
    hour: Number(values.get('hour') ?? '0'),
    minute: Number(values.get('minute') ?? '0'),
  };
};

const parseTimeToMinutes = (dateTime: string) => {
  const time = dateTime.split('T')[1] ?? '00:00';
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);

  return hours * 60 + minutes;
};

const getCurrentMinutesInZone = (timeZone: string) => {
  const { hour, minute } = getZonedParts(new Date(), timeZone);
  return hour * 60 + minute;
};

const getMoonPhaseVisual = (phaseFraction: number): { phaseKey: MoonPhaseKey; icon: string } => {
  if (phaseFraction < 0.03 || phaseFraction >= 0.97) {
    return { phaseKey: 'new', icon: '🌑' };
  }

  if (phaseFraction < 0.22) {
    return { phaseKey: 'waxingCrescent', icon: '🌒' };
  }

  if (phaseFraction < 0.28) {
    return { phaseKey: 'firstQuarter', icon: '🌓' };
  }

  if (phaseFraction < 0.47) {
    return { phaseKey: 'waxingGibbous', icon: '🌔' };
  }

  if (phaseFraction < 0.53) {
    return { phaseKey: 'full', icon: '🌕' };
  }

  if (phaseFraction < 0.72) {
    return { phaseKey: 'waningGibbous', icon: '🌖' };
  }

  if (phaseFraction < 0.78) {
    return { phaseKey: 'lastQuarter', icon: '🌗' };
  }

  return { phaseKey: 'waningCrescent', icon: '🌘' };
};

export const formatDate = (date: string, _timeZone: string) => {
  const { year, month, day } = parseDate(date);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return getFormatter('pl-date', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(utcDate);
};

export const formatTime = (dateTime: string, _timeZone: string) => (dateTime.split('T')[1] ?? '00:00').slice(0, 5);

export const minutesToLabel = (minutes: number) => {
  const safeMinutes = Math.max(minutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return `${hours} h ${mins.toString().padStart(2, '0')} min`;
};

export const formatRange = (start: string, end: string, timeZone: string) =>
  `${formatTime(start, timeZone)} - ${formatTime(end, timeZone)}`;

export const formatDualWindow = (
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
  timeZone: string,
) => `${formatRange(firstStart, firstEnd, timeZone)} / ${formatRange(secondStart, secondEnd, timeZone)}`;

export const shiftTime = (dateTime: string, offsetMinutes: number) => {
  const { year, month, day, hour, minute } = parseDateTime(dateTime);
  const shiftedDate = new Date(Date.UTC(year, month - 1, day, hour, minute + offsetMinutes));

  return formatNaiveDateTime(shiftedDate);
};

export const getPhotoWindows = (day: SunDay): PhotoWindows => ({
  morningBlue: {
    start: shiftTime(day.sunrise, -60),
    end: day.sunrise,
  },
  morningGolden: {
    start: day.sunrise,
    end: shiftTime(day.sunrise, 60),
  },
  eveningGolden: {
    start: shiftTime(day.sunset, -60),
    end: day.sunset,
  },
  eveningBlue: {
    start: day.sunset,
    end: shiftTime(day.sunset, 60),
  },
});

export const getCurrentDateInZone = (timeZone: string) => {
  const { year, month, day } = getZonedParts(new Date(), timeZone);

  return `${year}-${month}-${day}`;
};

export const isToday = (date: string, timeZone: string) => getCurrentDateInZone(timeZone) === date;

export const isDaylightNow = (day: SunDay, timeZone: string) => {
  const nowMinutes = getCurrentMinutesInZone(timeZone);
  const sunriseMinutes = parseTimeToMinutes(day.sunrise);
  const sunsetMinutes = parseTimeToMinutes(day.sunset);

  return nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes;
};

export const getSunProgress = (day: SunDay, timeZone: string): SunProgress => {
  const nowMinutes = getCurrentMinutesInZone(timeZone);
  const sunriseMinutes = parseTimeToMinutes(day.sunrise);
  const sunsetMinutes = parseTimeToMinutes(day.sunset);
  const daylightMinutes = Math.max(sunsetMinutes - sunriseMinutes, 1);

  if (nowMinutes < sunriseMinutes) {
    return {
      progress: 0,
      state: 'beforeSunrise',
      elapsedMinutes: 0,
      remainingMinutes: sunriseMinutes - nowMinutes,
    };
  }

  if (nowMinutes >= sunsetMinutes) {
    return {
      progress: 1,
      state: 'afterSunset',
      elapsedMinutes: nowMinutes - sunsetMinutes,
      remainingMinutes: 0,
    };
  }

  const elapsedMinutes = nowMinutes - sunriseMinutes;

  return {
    progress: clamp(elapsedMinutes / daylightMinutes, 0, 1),
    state: 'daylight',
    elapsedMinutes,
    remainingMinutes: sunsetMinutes - nowMinutes,
  };
};

export const getMoonPhase = (date: string): MoonPhaseInfo => {
  const { year, month, day } = parseDate(date);
  const dateAtNoonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
  const daysSinceKnownNewMoon = (dateAtNoonUtc - KNOWN_NEW_MOON_UTC) / (1000 * 60 * 60 * 24);
  const age = ((daysSinceKnownNewMoon % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseFraction = age / SYNODIC_MONTH;
  const illuminationPercent = Math.round(((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2) * 100);
  const { phaseKey, icon } = getMoonPhaseVisual(phaseFraction);

  return {
    illuminationPercent,
    icon,
    phaseKey,
  };
};
