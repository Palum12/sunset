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
- After any web UI, routing, asset, CSS, or Vite build output change, run `npm run build:docs` and include the resulting `docs/` changes in the same PR. CI verifies this with `git diff --exit-code -- docs`.
- The checked-in `docs/` directory is the GitHub Pages fallback. Do not leave it stale after changes that affect the generated web bundle.

## Mobile app

- Mobile app lives in `mobile/`
- Install mobile dependencies: `cd mobile && npm install`
- Start Expo development server: `cd mobile && npm start`
- Run Android locally: `cd mobile && npm run android`
- Build debug APK locally: `cd mobile && npm run android:build-apk`
