# AGENTS Instructions

These guidelines apply to the entire repository:
- Rozbijaj funkcjonalności na możliwie najmniejsze, samodzielne cząstki.
- Wszelkie teksty dodawaj wyłącznie w systemie tłumaczeń, nie umieszczaj ich bezpośrednio w kodzie JS/TS/HTML.
- Dbaj, aby UI działało sensownie również na urządzeniach mobilnych (responsywność, dostępność).
- Przy każdej zmianie sprawdź, czy można przy okazji podbić istniejącą funkcjonalność lub ulepszyć obsługę w ramach PR.

## Web app

- Install dependencies in repo root: `npm install`
- Run local dev server: `npm run dev`
- Default local URL: `http://localhost:5173`
- Build production bundle: `npm run build`
- Preview production build locally: `npm run preview`
- Rebuild checked-in GitHub Pages fallback only when needed: `npm run build:docs`

## Mobile app

- Mobile app lives in `mobile/`
- Install mobile dependencies: `cd mobile && npm install`
- Start Expo development server: `cd mobile && npm start`
- Run Android locally: `cd mobile && npm run android`
- Build debug APK locally: `cd mobile && npm run android:build-apk`
