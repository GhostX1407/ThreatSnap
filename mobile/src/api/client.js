/**
 * ThreatSnap API Client
 * Centralized HTTP client for all backend communication.
 * All endpoints match the contract in backend/CONTRACT.md exactly.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://threatsnap-backend.onrender.com';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = data?.error;
      if (!errorMessage) {
        if (response.status === 500) {
          errorMessage = 'Backend server error (500). Please check backend server logs.';
        } else {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Network error — unable to reach the server. Is the backend running?',
      0,
      null
    );
  }
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

/** POST /api/auth/login */
export async function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/** POST /api/threat/analyze */
export async function analyzeThreat(token, type, value) {
  return request('/api/threat/analyze', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ type, value }),
  });
}

/** GET /api/threat/history */
export async function getThreatHistory(token) {
  return request('/api/threat/history', {
    headers: authHeaders(token),
  });
}

/** GET /api/audit (senior only) */
export async function getAuditLog(token) {
  return request('/api/audit', {
    headers: authHeaders(token),
  });
}

/** GET /api/stats/drift (senior only) */
export async function getDriftStats(token) {
  return request('/api/stats/drift', {
    headers: authHeaders(token),
  });
}

export { ApiError };
