const DAY = 86_400_000

/** Parse YYYY-MM-DD as a local date (avoids timezone off-by-one). */
export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY)

export function fmt(s: string, withYear = false) {
  const d = parseDate(s)
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) })
}

export const fmtRange = (from: string, to: string) => `${fmt(from)} – ${fmt(to)}`

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

/** Approximate months between two dates (30.44-day months), one decimal. */
export function monthsBetween(from: string, to: string) {
  const a = parseDate(from), b = parseDate(to)
  if (!a || !b) return 0
  return Math.max(0, Math.round((daysBetween(a, b) / 30.44) * 10) / 10)
}

export type Match =
  | { kind: 'none' }
  | { kind: 'covers' }
  | { kind: 'partial'; label: string; gapDays: number }
  | { kind: 'no-overlap' }

/** How well a listing's availability covers the renter's dates. */
export function matchDates(availFrom: string, availTo: string, moveIn: string, moveOut: string): Match {
  const af = parseDate(availFrom), at = parseDate(availTo), mi = parseDate(moveIn), mo = parseDate(moveOut)
  if (!af || !at || !mi || !mo || mo <= mi) return { kind: 'none' }
  if (at <= mi || af >= mo) return { kind: 'no-overlap' }
  const late = Math.max(0, daysBetween(mi, af))
  const early = Math.max(0, daysBetween(at, mo))
  if (!late && !early) return { kind: 'covers' }
  const parts = [late && `Starts ${late} day${late > 1 ? 's' : ''} late`, early && `Ends ${early} day${early > 1 ? 's' : ''} early`].filter(Boolean)
  return { kind: 'partial', label: parts.join(' · '), gapDays: late + early }
}
