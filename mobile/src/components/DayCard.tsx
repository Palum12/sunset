import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SunDay } from '../types';
import { formatClockTime, formatDateLabel, formatDuration } from '../utils/time';

interface DayCardProps {
  day: SunDay;
  timezone: string;
  isToday?: boolean;
}

export default function DayCard({ day, timezone, isToday }: DayCardProps) {
  const { t } = useTranslation();
  const dateLabel = formatDateLabel(day.date, timezone);
  return (
    <View style={[styles.card, isToday && styles.highlight]}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{dateLabel}</Text>
        {isToday && <Text style={styles.badge}>{t('today.badge')}</Text>}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('stats.sunrise')}</Text>
        <Text style={styles.value}>{formatClockTime(day.sunrise, timezone)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('stats.sunset')}</Text>
        <Text style={styles.value}>{formatClockTime(day.sunset, timezone)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('stats.dayLength')}</Text>
        <Text style={styles.value}>{formatDuration(day.dayLengthMinutes)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('stats.nightLength')}</Text>
        <Text style={styles.value}>{formatDuration(day.nightLengthMinutes)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  highlight: {
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  badge: {
    backgroundColor: '#e0f2fe',
    color: '#075985',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    color: '#475569',
    fontSize: 14,
  },
  value: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});
