// frontend/studio-app/src/hooks/useStudioApi.js
// Custom hook for making API calls to the studio backend

import { useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_STUDIO_API_BASE_URL || "";
const MAIN_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export function useStudioApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const base = endpoint.startsWith("/api/aistudio") || endpoint.startsWith("/api/aicoach")
        ? MAIN_API
        : API_BASE;

      const res = await fetch(`${base}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const get = useCallback((endpoint) => callApi(endpoint, { method: "GET" }), [callApi]);

  const post = useCallback(
    (endpoint, body) =>
      callApi(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    [callApi]
  );

  const uploadFile = useCallback(
    async (endpoint, file, additionalData = {}) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Upload failed: ${res.status}`);
        }

        const data = await res.json();
        setLoading(false);
        return data;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return { loading, error, get, post, uploadFile, callApi };
}

export default useStudioApi;



