import { config } from '../config'

export type SubleaseRequest = {
  listingId: string
  listingTitle: string
  email: string
  name: string
  moveIn: string
  moveOut: string
  note: string
  /** Honeypot — real people leave this blank. */
  website: string
}

const LOCAL_KEY = 'ss-requests'

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
export const isCalPolyEmail = (email: string) => /@calpoly\.edu$/i.test(email.trim())

/** Remembers which listings this browser already requested, so the button shows "Request sent". */
export function requestedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]').map((r: { listingId: string }) => r.listingId)
  } catch {
    return []
  }
}

function rememberLocally(req: SubleaseRequest & { submittedAt: string }) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    all.push({ listingId: req.listingId, submittedAt: req.submittedAt, email: req.email })
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable (private mode) — not critical */
  }
}

/**
 * Sends a request to the team's Google Sheet via an Apps Script web app.
 * Uses a "simple" text/plain POST in no-cors mode, which Apps Script accepts
 * without CORS preflight. The response is opaque, so a resolved promise means
 * the request left the browser successfully.
 */
export async function submitRequest(req: SubleaseRequest) {
  const payload = {
    ...req,
    email: req.email.trim().toLowerCase(),
    name: req.name.trim(),
    note: req.note.trim(),
    submittedAt: new Date().toISOString(),
    pageUrl: window.location.href,
  }

  if (!config.requestsEndpoint) {
    console.warn('[Subleasing Solutions] VITE_REQUESTS_ENDPOINT is not set — request saved in this browser only:', payload)
    rememberLocally(payload)
    return
  }

  await fetch(config.requestsEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  rememberLocally(payload)
}
