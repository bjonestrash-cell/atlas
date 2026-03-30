const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Trips
  getTrips: (params) => request(`/trips${params ? '?' + new URLSearchParams(params) : ''}`),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id, data) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),

  // Points
  getPoints: () => request('/points'),
  createPoint: (data) => request('/points', { method: 'POST', body: JSON.stringify(data) }),
  bulkSavePoints: (programs) => request('/points/bulk', { method: 'POST', body: JSON.stringify({ programs }) }),
  updatePoint: (id, data) => request(`/points/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePoint: (id) => request(`/points/${id}`, { method: 'DELETE' }),
  getTransactions: (program) => request(`/points/transactions${program ? '?program=' + encodeURIComponent(program) : ''}`),
  createTransaction: (data) => request('/points/transactions', { method: 'POST', body: JSON.stringify(data) }),

  // Flights
  searchFlights: (params) => request(`/flights/search?${new URLSearchParams(params)}`),

  // Alerts
  getAlerts: () => request('/alerts'),
  createAlert: (data) => request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateAlert: (id, data) => request(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlert: (id) => request(`/alerts/${id}`, { method: 'DELETE' }),

  // Budget
  getBudget: (params) => request(`/budget${params ? '?' + new URLSearchParams(params) : ''}`),
  getBudgetSummary: (year) => request(`/budget/summary${year ? '?year=' + year : ''}`),
  createBudgetEntry: (data) => request('/budget', { method: 'POST', body: JSON.stringify(data) }),
  updateBudgetEntry: (id, data) => request(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudgetEntry: (id) => request(`/budget/${id}`, { method: 'DELETE' }),
};
