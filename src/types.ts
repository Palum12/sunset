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
