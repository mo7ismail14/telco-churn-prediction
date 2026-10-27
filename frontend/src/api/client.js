// Local dev -> http://localhost:5000 (.env.development), production -> deployed API (.env.production)
const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  schema: () => request("/api/schema"),
  metrics: () => request("/api/metrics"),
  models: () => request("/api/models"),
  randomSample: (actual) => request(`/api/samples/random${actual ? `?actual=${actual}` : ""}`),
  predict: (customer, model, customerID) => post("/api/predict", { customer, model, customerID }),
  predictAll: (customer, customerID) => post("/api/predict/all", { customer, customerID }),
};
