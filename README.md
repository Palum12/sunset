# Sunset

Aplikacja React (Vite) pokazująca godziny wschodu i zachodu słońca dla wskazanej lokalizacji.
Wykorzystuje Open-Meteo (geokodowanie + forecast) i umożliwia przewijanie dni do tyłu i do przodu
(w ramach limitów API).

## Funkcje

- Wyszukiwarka miejscowości (domyślnie Wrocław) z komunikatami o błędach.
- Pobieranie godzin wschodu/zachodu dla zakresu do 7 dni wstecz i 14 dni naprzód (automatycznie przycięte do limitów Open-Meteo).
- Sekcja "Dziś" z informacją, czy aktualnie jest jasno/ciemno oraz długością dnia i nocy.
- Przewijane karty z danymi dla kolejnych dni (scroll horizontalny, podświetlenie dzisiejszego dnia).
- Dynamiczne, animowane tło zachodu słońca.

## Rozwój lokalny

1. Zainstaluj zależności: `npm install` (wymaga dostępu do registry npm).
2. Uruchom tryb deweloperski: `npm run dev` i odwiedź wskazany adres (domyślnie `http://localhost:5173`).
3. Budowa produkcyjna: `npm run build`.

## Deploy na GitHub Pages

- W pliku `vite.config.ts` ustawiono `base` na `/sunset/`. Jeśli repozytorium lub domena różni się od tej nazwy, zmień wartość `BASE_PATH` w zmiennej środowiskowej lub dostosuj `base` ręcznie.
- Workflow `.github/workflows/deploy.yml` buduje projekt (`npm run build`) i publikuje artefakt Pages. Włącz GitHub Pages w ustawieniach repo, źródło: GitHub Actions.

## Stack

- React 18 + Vite
- TypeScript
- Open-Meteo Geocoding + Forecast API (bez klucza w podstawowym użyciu)

