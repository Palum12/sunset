# Sunset

Aplikacja React (Vite) pokazujaca godziny wschodu i zachodu slonca dla wskazanej lokalizacji. Korzysta z Open-Meteo (geokodowanie + forecast) i pozwala przewijac dni do tylu i do przodu (w ramach limitow API).

## Funkcje

- Wyszukiwarka miejscowosci (domyslnie Wroclaw) z komunikatami o bledach.
- Pobieranie godzin wschodu/zachodu dla zakresu do 7 dni wstecz i 14 dni naprzod (automatycznie przyciete do limitow Open-Meteo).
- Sekcja "Dzis" z informacja, czy aktualnie jest jasno/ciemno oraz jaka jest dlugosc dnia i nocy.
- Przewijane karty z danymi dla kolejnych dni (scroll poziomy, podswietlenie dzisiejszego dnia).
- Dynamiczne, animowane tlo zachodu slonca.

## Rozwoj lokalny

1. Zainstaluj zaleznosci: `npm install`.
2. Uruchom tryb deweloperski: `npm run dev` (domyslnie `http://localhost:5173`).
3. Budowa produkcyjna: `npm run build`.

## Deploy na GitHub Pages

- `npm run build` generuje artefakt `dist/` dla workflow `.github/workflows/deploy.yml`, z `base` ustawianym przez `BASE_PATH`.
- Jesli potrzebujesz innej sciezki (np. custom domena), ustaw zmienna `BASE_PATH` w workflow albo przy lokalnym `npm run build`.
- Jako zrodlo GitHub Pages ustaw **GitHub Actions**. W trybie `Deploy from a branch` GitHub serwuje surowy `index.html` z repo, wiec Vite-owy wpis `/src/main.tsx` konczy sie bledem MIME zamiast uruchomieniem aplikacji.

## Stack

- React 18 + Vite
- TypeScript
- Open-Meteo Geocoding + Forecast API (bez klucza w podstawowym uzyciu)

## Aplikacja mobilna (React Native)

- Folder `mobile/` zawiera port aplikacji do React Native (SDK Expo 52, React Native 0.76).
- Uruchomienie lokalne: `cd mobile && npm install && npm start` (lub `npm run android` aby odpalić emulator/urządzenie).
- Budowa debug APK: `cd mobile && npm run android:build-apk` (komenda sama wykona `expo prebuild` i zbuduje `android/app/build/outputs/apk/debug/app-debug.apk`).
- Android/iOS foldery generowane przez `expo prebuild` są ignorowane w repozytorium (`.gitignore`).
- Workflow `.github/workflows/mobile-apk.yml` buduje debugowy APK na push do `main` lub na żądanie (`workflow_dispatch`) i dołącza go jako artefakt `sunset-mobile-debug-apk`.
