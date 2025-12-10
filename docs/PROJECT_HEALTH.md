# PowerStream Project Health & Dev Scripts

## Overview

This document explains:

- How to run the **backend** and **frontend** in development.
- What build scripts are available.
- How to call the **health check** endpoint from the browser or code.

---

## 1. Backend (API + Streaming) – `backend/`

**Entry file**: `backend/server.js`  
**Port**: `5001` by default (configurable via `PORT` env var)  
**Env file**: `.env.local`

### 1.1 Scripts

In the `backend` directory:

```bash
# Development (with nodemon reload)
npm run dev

# Production-style start (no reload)
npm start
```

`package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### 1.2 Health Check Endpoint

The backend exposes a lightweight health endpoint that does **not** require MongoDB:

- URL: `GET http://localhost:5001/api/health`
- Also available as: `GET http://localhost:5001/health`

Example response:

```json
{
  "status": "ok",
  "service": "powerstream-api",
  "host": "127.0.0.1",
  "port": 5001,
  "env": "development",
  "time": "2025-01-01T00:00:00.000Z"
}
```

Use this to:

- Confirm the API server is running.
- Verify port/env configuration.

---

## 2. Frontend (Vite React) – `frontend/`

**Dev server port**: `5173` by default  
**Env file**: `frontend/.env` (for `VITE_API_URL`, etc.)

### 2.1 Scripts

In the `frontend` directory:

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Preview built app (after build)
npm run preview
```

`package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173"
  }
}
```

The frontend API client (`frontend/src/lib/api.js`) is configured so that:

- In **development**, it always uses: `http://localhost:5001/api`
- In **production**, it uses `VITE_API_URL` or falls back to:
  `https://studio-api.southernpowertvmusic.com/api`

---

## 3. Frontend Health Check Helper

**File**: `frontend/src/lib/api.js`

The shared Axios client now includes a small helper:

```js
export async function healthCheck() {
  const res = await api.get("/health");
  return res.data;
}
```

Usage example inside a React component:

```js
import { useEffect, useState } from "react";
import { healthCheck } from "../lib/api.js";

export function HealthDebug() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    healthCheck()
      .then((data) => setStatus(data))
      .catch((err) => setStatus({ error: err.message }));
  }, []);

  return <pre>{JSON.stringify(status, null, 2)}</pre>;
}
```

This will call `GET /api/health` against the same base URL the rest of the app uses and display the result.

---

## 4. Quick Start

From the project root:

```bash
cd backend
npm install
npm run dev    # starts API on http://localhost:5001

cd ../frontend
npm install
npm run dev    # starts Vite on http://localhost:5173
```

Then open a browser to:

- `http://localhost:5173` for the frontend.
- `http://localhost:5001/api/health` for backend health.

If `/api/health` returns `status: "ok"`, the backend is healthy and reachable from the frontend.






