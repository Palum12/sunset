export interface LocationResult {
  name: string;
  country?: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface SunDay {
  date: string;
  sunrise: string;
  sunset: string;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface PhotoWindows {
  morningBlue: TimeWindow;
  morningGolden: TimeWindow;
  eveningGolden: TimeWindow;
  eveningBlue: TimeWindow;
}

export type SunProgressState = 'beforeSunrise' | 'daylight' | 'afterSunset';

export interface SunProgress {
  progress: number;
  state: SunProgressState;
  elapsedMinutes: number;
  remainingMinutes: number;
}

export type MoonPhaseKey =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface MoonPhaseInfo {
  illuminationPercent: number;
  icon: string;
  phaseKey: MoonPhaseKey;
}
