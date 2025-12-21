import { SunDay } from '../types';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

export const formatDate = (date: string, timeZone: string) => {
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

export const formatTime = (dateTime: string, timeZone: string) => {
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

export const minutesToLabel = (minutes: number) => {
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

export const formatRange = (start: string, end: string, timeZone: string) =>
  `${formatTime(start, timeZone)} - ${formatTime(end, timeZone)}`;

export const formatDualWindow = (
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
  timeZone: string,
) => `${formatRange(firstStart, firstEnd, timeZone)} / ${formatRange(secondStart, secondEnd, timeZone)}`;

export const getPhotoWindows = (day: SunDay, timeZone: string) => ({
  morningBlue: {
    start: shiftTime(day.sunrise, -60, timeZone),
    end: day.sunrise,
  },
  morningGolden: {
    start: day.sunrise,
    end: shiftTime(day.sunrise, 60, timeZone),
  },
  eveningGolden: {
    start: shiftTime(day.sunset, -60, timeZone),
    end: day.sunset,
  },
  eveningBlue: {
    start: day.sunset,
    end: shiftTime(day.sunset, 60, timeZone),
  },
});

export const getCurrentDateInZone = (timeZone: string) => {
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone,
    }),
  );
  return now.toISOString().split('T')[0];
};

export const isToday = (date: string, timeZone: string) => getCurrentDateInZone(timeZone) === date;

export const isDaylightNow = (day: SunDay, timeZone: string) => {
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
