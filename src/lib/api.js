import { API_BASE_URL } from './config.js';

/** Error thrown for every failed API call, carrying the backend's error code and field details. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = [], requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

async function request(path, { method = 'GET', body, next } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      // `next` is used by Next.js on the server (cache for N seconds); browsers ignore it.
      ...(next ? { next } : {}),
    });
  } catch {
    throw new ApiError('We could not reach the booking server. Please check your connection and try again.', {
      code: 'NETWORK_ERROR',
    });
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    const error = json?.error;
    throw new ApiError(error?.message || `Request failed (${response.status})`, {
      status: response.status,
      code: error?.code || 'UNKNOWN',
      details: Array.isArray(error?.details) ? error.details : [],
      requestId: error?.requestId,
    });
  }

  return json.data;
}

/**
 * GET /rates — the list of routes and prices. Optional `tag` limits it to one agent's rates.
 * On the server the response is cached for 60 seconds (matching the API's own cache header).
 */
export function fetchRates({ tag } = {}) {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return request(`/rates${query}`, { next: { revalidate: 60 } });
}

/** POST /bookings — creates the booking. The API recomputes the price; we only send the rate id. */
export function createBooking(payload) {
  return request('/bookings', { method: 'POST', body: payload });
}
