import React, { Suspense, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { APP_MANIFEST, routeExists, normalizePath } from "./manifest";
import RequireAuth from "../context/RequireAuth";

// OPTIONAL: if you have one. If not, leave it.
// import ErrorBoundary from "../core/runtime/ui/ErrorBoundary";

function Loader() {
  return <div style={{ padding: 24 }}>Loading...</div>;
}

/**
 * Map manifest element names -> real components (lazy loaded).
 * Update the import paths here ONLY if your file locations differ.
 */
const REGISTRY = {
  Home: React.lazy(() => import("../pages/Home.jsx")),
  Auth: React.lazy(() => import("../pages/Auth.jsx")),

  PowerFeed: React.lazy(() => import("../pages/PowerFeed.jsx")),
  PowerGram: React.lazy(() => import("../pages/PowerGram.jsx")),
  PowerReel: React.lazy(() => import("../pages/PowerReel.jsx")),
  PowerLine: React.lazy(() => import("../pages/PowerLine.jsx")),

  TVStations: React.lazy(() => import("../pages/TVStations.jsx")),
  TexasGotTalentTV: React.lazy(() => import("../pages/TexasGotTalent.jsx")),
  NoLimitEastHouston: React.lazy(() => import("../pages/NoLimitEastHouston.jsx")),
  CivicConnectTV: React.lazy(() => import("../pages/CivicConnect.jsx")),
};

function NotFound() {
  const pathname = normalizePath(window.location.pathname);
  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ color: "#f5c400" }}>404 - Not Found</h2>
      <div style={{ marginTop: 10, opacity: 0.9 }}>
        <div><b>Path:</b> {pathname}</div>
        <div style={{ marginTop: 10 }}>
          Route exists in manifest? If not, add it to <code>src/kernel/manifest.js</code>.
        </div>
        <div style={{ marginTop: 10 }}>
          <b>Known routes:</b>
          <pre style={{ marginTop: 8, background: "#111", padding: 12, borderRadius: 8 }}>
            {APP_MANIFEST.map((r) => r.path).join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}

function RenderRoute({ elementName, auth }) {
  const Component = REGISTRY[elementName];

  if (!Component) {
    return (
      <div style={{ padding: 24 }}>
        Missing component mapping for: <b>{elementName}</b>
        <div style={{ marginTop: 8 }}>
          Fix it in <code>src/kernel/RouterFromManifest.jsx</code> REGISTRY.
        </div>
      </div>
    );
  }

  const node = <Component />;

  if (auth) {
    return <RequireAuth>{node}</RequireAuth>;
  }

  return node;
}

export default function RouterFromManifest() {
  const routes = useMemo(() => APP_MANIFEST, []);

  // If your app is mounted, but current path isn't in manifest:
  const pathname = normalizePath(window.location.pathname);
  const exists = routeExists(pathname);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* If route isn't known, show our NotFound */}
          {!exists && <Route path="*" element={<NotFound />} />}

          {/* Build routes from manifest */}
          {routes.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={<RenderRoute elementName={r.element} auth={r.auth} />}
            />
          ))}

          {/* Safety redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
