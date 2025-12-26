export const formatClockTime = (dateTime: string, timezone: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(dateTime));

export const formatDateLabel = (date: string, timezone: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(`${date}T12:00:00`));

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return `${hours}h ${restMinutes.toString().padStart(2, '0')}m`;
};
