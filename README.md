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

- `base` w `vite.config.ts` domyslnie jest relative (`./`), dzieki czemu assety dzialaja na Pages i na custom domenie. Jesli potrzebujesz innej sciezki, ustaw zmienna `BASE_PATH`.
- Workflow `.github/workflows/deploy.yml` buduje projekt (`npm run build`) i publikuje artefakt Pages. Upewnij sie, ze jako zrodlo GitHub Pages wybrano **GitHub Actions**; deploy uruchamia sie automatycznie po pushu do `main`.

## Stack

- React 18 + Vite
- TypeScript
- Open-Meteo Geocoding + Forecast API (bez klucza w podstawowym uzyciu)
