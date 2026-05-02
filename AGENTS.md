# AGENTS Instructions

These guidelines apply to the entire repository:
- Split features into the smallest practical, self-contained pieces.
- Add all user-facing text through the translation system only. Do not hardcode copy directly in JS, TS, or HTML.
- Keep the UI usable on mobile devices, with attention to responsiveness and accessibility.
- With each change, check whether an existing behavior can be improved within the same PR without expanding the scope unnecessarily.

## Web app

- Install dependencies in the repository root: `npm install`
- Run the local dev server: `npm run dev`
- Default local URL: `http://localhost:5173`
- Build the production bundle: `npm run build`
- Preview the production build locally: `npm run preview`
- After any web UI, routing, asset, CSS, or Vite build output change, run `npm run build:docs` and include the resulting `docs/` changes in the same PR. CI verifies this with `git diff --exit-code -- docs`.
- The checked-in `docs/` directory is the GitHub Pages fallback. Do not leave it stale after changes that affect the generated web bundle.

## Mobile app

- The mobile app lives in `mobile/`
- Install mobile dependencies: `cd mobile && npm install`
- Start the Expo development server: `cd mobile && npm start`
- Run Android locally: `cd mobile && npm run android`
- Build a debug APK locally: `cd mobile && npm run android:build-apk`
