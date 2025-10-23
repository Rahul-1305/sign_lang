# Sign Language Frontend (Vite + React)

Quick scaffold for a React frontend that integrates with an existing sign-language backend API.

Getting started

1. Install dependencies

```bash
cd frontend
npm install
```

2. Create `.env` from `.env.example` and set `VITE_API_URL` to your backend URL

3. Run dev server

```bash
npm run dev
```

Notes

- The code contains placeholders for API endpoints under `src/api/api.js`. Adjust endpoints and auth handling as needed.
- The `Prediction` page demonstrates a webcam capture using getUserMedia, captures a frame, converts to a data URL, and sends it to `POST /api/predict`.
- Use the contexts (`AuthContext` / `AppContext`) to store auth and prediction state.
