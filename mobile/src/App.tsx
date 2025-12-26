import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import './i18n';
import ActionButton from './components/ActionButton';
import DayCard from './components/DayCard';
import { ApiError, fetchSunCalendar, geocodeLocation } from './api/openMeteo';
import { LocationResult, SunDay } from './types';
import { formatClockTime, formatDuration } from './utils/time';

const DEFAULT_CITY = 'Wrocław';
const PAST_DAYS = 2;
const FUTURE_DAYS = 7;

const errorKeyMap: Record<string, string> = {
  GEOCODE_FAILED: 'errors.geocodeFailed',
  GEOCODE_EMPTY: 'errors.geocodeEmpty',
  CALENDAR_FAILED: 'errors.calendarFailed',
  MISSING_CALENDAR_DATA: 'errors.missingCalendarData',
};

function formatCountry(country?: string) {
  return country ? `, ${country}` : '';
}

export default function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [days, setDays] = useState<SunDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const todayCard = useMemo(() => {
    if (!location) return null;
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: location.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    return days.find((day) => day.date === today) ?? null;
  }, [days, location]);

  const upcomingDays = useMemo(() => {
    if (!location) return [];
    const now = new Date();
    return days.filter((day) => new Date(day.date) >= new Date(now.toISOString().split('T')[0]));
  }, [days, location]);

  const loadLocation = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrorKey('errors.geocodeEmpty');
      return;
    }
    setLoading(true);
    setErrorKey(null);
    try {
      const geo = await geocodeLocation(trimmed);
      const calendar = await fetchSunCalendar(geo, PAST_DAYS, FUTURE_DAYS);
      setLocation(geo);
      setDays(calendar);
    } catch (err) {
      if (err instanceof ApiError && errorKeyMap[err.code]) {
        setErrorKey(errorKeyMap[err.code]);
      } else {
        setErrorKey('errors.unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation(DEFAULT_CITY);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadLocation(query)}
            tintColor="#0f172a"
            colors={['#0f172a']}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('hero.eyebrow')}</Text>
          <Text style={styles.title}>{t('mobile.title')}</Text>
          <Text style={styles.subtitle}>{t('mobile.subtitle')}</Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>{t('search.aria')}</Text>
          <TextInput
            value={query}
            placeholder={t('mobile.searchPlaceholder')}
            onChangeText={setQuery}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={() => loadLocation(query)}
          />
          <ActionButton
            label={t('mobile.searchCta')}
            accessibilityLabel={t('mobile.searchCta')}
            loading={loading}
            disabled={!query.trim()}
            onPress={() => loadLocation(query)}
          />
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#0f172a" />
              <Text style={styles.loadingText}>{t('mobile.loading')}</Text>
            </View>
          )}
          {errorKey && <Text style={styles.errorText}>{t(errorKey)}</Text>}
        </View>

        {location && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('mobile.summaryTitle')}</Text>
            <Text style={styles.summaryText}>
              {t('mobile.summary', {
                name: location.name,
                country: formatCountry(location.country),
                timezone: location.timezone,
              })}
            </Text>
            {todayCard && (
              <View style={styles.todayBlock}>
                <Text style={styles.todayLabel}>{t('mobile.todayLabel')}</Text>
                <View style={styles.todayRow}>
                  <Text style={styles.todayMetric}>{t('stats.sunrise')}</Text>
                  <Text style={styles.todayValue}>{formatClockTime(todayCard.sunrise, location.timezone)}</Text>
                </View>
                <View style={styles.todayRow}>
                  <Text style={styles.todayMetric}>{t('stats.sunset')}</Text>
                  <Text style={styles.todayValue}>{formatClockTime(todayCard.sunset, location.timezone)}</Text>
                </View>
                <Text style={styles.summaryMeta}>
                  {t('mobile.daylightMeta', {
                    daylight: formatDuration(todayCard.dayLengthMinutes),
                    night: formatDuration(todayCard.nightLengthMinutes),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {upcomingDays.length > 0 && location && (
          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>{t('mobile.upcomingTitle')}</Text>
            <View style={styles.listGap}>
              {upcomingDays.map((day) => (
                <DayCard key={day.date} day={day} timezone={location.timezone} isToday={todayCard?.date === day.date} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    paddingVertical: 12,
    gap: 6,
  },
  eyebrow: {
    color: '#bae6fd',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  searchCard: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  searchLabel: {
    color: '#0f172a',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#0b172a',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  summaryTitle: {
    color: '#bfdbfe',
    fontWeight: '700',
    fontSize: 16,
  },
  summaryText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  summaryMeta: {
    color: '#cbd5e1',
    marginTop: 6,
  },
  todayBlock: {
    marginTop: 8,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  todayLabel: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayMetric: {
    color: '#cbd5e1',
  },
  todayValue: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 18,
  },
  listGap: {
    gap: 12,
  },
  refreshSpinner: {
    marginVertical: 8,
  },
});
