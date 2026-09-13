# Smart Campus Mobility

"Don't just know where your bus is. Know what to do next."

AI-powered campus mobility prototype built with React + Vite + Tailwind CSS.
All data is mocked on the frontend — no backend, database, or external APIs
are used in this phase.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. The app redirects `/` to `/student`.

## Routes

- `/student` — Student dashboard with destination picker, AI recommendation, campus map, and nearby buses
- `/routes` — All campus routes (R1, R2, R3) with stops and active buses
- `/ai` — Campus Mobility Assistant (local, deterministic mock chat — no external AI API)
- `/admin` — Fleet Operations dashboard with KPIs, fleet table, fleet map, and demo controls

## Demo flow

1. Go to `/student`, select **Block C** → AI recommends **BUS 12 (5 min, ON TIME)**.
2. Go to `/admin`, click **Simulate Delay** → BUS12 becomes DELAYED (11 min, 15 km/h).
3. Return to `/student` (or just watch — state is shared) → AI recommendation automatically
   switches to **BUS 14 (7 min)** with an explanation.
4. Click **Reset Demo** in `/admin` to restore the initial state.

## Architecture

- `src/data/mockData.js` — seed data for buses, routes, stops, destinations
- `src/services/mockMobility.js` — stand-in for a future Firebase/backend data layer
- `src/services/mockAI.js` — deterministic recommendation + assistant-answer logic (stand-in for a future real AI service)
- `src/context/MobilityContext.jsx` — single source of truth (useReducer) shared by every page
- `src/components/` — reusable UI building blocks (BusCard, LiveMap, FleetTable, DemoControls, etc.)
- `src/pages/` — one component per route

## Future integration points

- **Firebase**: replace the bodies of `services/mockMobility.js` with Firestore/Realtime DB reads; component code does not need to change.
- **Real AI**: replace `services/mockAI.js`'s `getMobilityRecommendation` / `answerAssistantQuestion` with calls to a real AI/ML service using the same input/output shapes.
- **Google Maps**: swap `components/LiveMap.jsx`'s SVG rendering for a Maps-backed component while keeping the same `buses` prop contract.
