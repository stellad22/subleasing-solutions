import { useState } from 'react'
import type { Listing } from '../data/listings'
import { fmt, fmtRange, matchDates, money, monthsBetween, parseDate } from '../lib/dates'
import { requestedIds } from '../lib/requests'
import { browseHref } from '../lib/router'
import type { Search } from '../App'
import { Icon } from './Icon'
import { RequestModal } from './RequestModal'

function Timeline({ l, moveIn, moveOut }: { l: Listing; moveIn: string; moveOut: string }) {
  const match = matchDates(l.availableFrom, l.availableTo, moveIn, moveOut)
  const af = parseDate(l.availableFrom)!, at = parseDate(l.availableTo)!
  const mi = parseDate(moveIn), mo = parseDate(moveOut)
  const hasStay = match.kind !== 'none' && mi && mo
  const start = hasStay ? Math.min(af.getTime(), mi!.getTime()) : af.getTime()
  const end = hasStay ? Math.max(at.getTime(), mo!.getTime()) : at.getTime()
  const pct = (t: number) => ((t - start) / (end - start || 1)) * 100
  const seg = (a: Date, b: Date) => ({ left: pct(a.getTime()) + '%', width: pct(b.getTime()) - pct(a.getTime()) + '%' })

  return (
    <div className="timeline-card">
      <h3>{hasStay ? 'Availability vs. your dates' : 'Availability'}</h3>
      <div className="timeline-label"><span>Available {fmt(l.availableFrom)}</span><span>{fmt(l.availableTo)}</span></div>
      <div className="timeline">
        <i style={seg(af, at)} />
        {hasStay && <b className={match.kind === 'covers' ? '' : 'partial'} style={seg(mi!, mo!)} />}
      </div>
      {hasStay && <div className="timeline-label"><span>Your stay: {fmt(moveIn)}</span><span>{fmt(moveOut)}</span></div>}
      {match.kind === 'covers' && <p><Icon name="check" /> This sublease covers your whole stay.</p>}
      {match.kind === 'partial' && <p className="warn"><Icon name="info" /> {match.label} compared to your dates. Mention flexibility in your request.</p>}
      {match.kind === 'no-overlap' && <p className="warn"><Icon name="info" /> This place isn't available during your dates.</p>}
      {match.kind === 'none' && <p className="muted-line"><Icon name="info" /> Add your move-in and move-out dates to compare.</p>}
    </div>
  )
}

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const shown = photos.slice(0, 4)
  return (
    <div className={`gallery count-${shown.length}`}>
      {shown.map((p, i) => <img key={p + i} src={p} alt={`${title} — photo ${i + 1}`} />)}
    </div>
  )
}

export function ListingDetail({ listing: l, search, setSearch }: { listing: Listing; search: Search; setSearch: (s: Search) => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [requested, setRequested] = useState(() => requestedIds().includes(l.id))
  const validStay = Boolean(search.moveIn && search.moveOut && search.moveOut > search.moveIn)
  const months = validStay ? monthsBetween(search.moveIn, search.moveOut) : 0
  const highlights = [...l.amenities, l.roomType, `${l.roommates} household`, ...l.household]

  return (
    <main className="page narrow">
      <a className="back-link" href={browseHref}><Icon name="back" /> Back to results</a>
      <Gallery photos={l.photos} title={l.title} />
      <div className="detail-grid">
        <div className="detail-main">
          <p className="eyebrow">{l.neighborhood} · {l.distanceToCampus}</p>
          <h1>{l.title}</h1>
          <Timeline l={l} moveIn={search.moveIn} moveOut={search.moveOut} />
          <section>
            <h2>About the place</h2>
            <p className="description">{l.description}</p>
            <div className="amenities">{highlights.map(x => <span key={x}><Icon name="check" size={16} />{x}</span>)}</div>
          </section>
          {l.reviews && l.reviews.length > 0 && (
            <section>
              <h2>From past subleasers</h2>
              <div className="reviews">
                {l.reviews.map((r, i) => <blockquote key={i}>“{r.text}”<small>— {r.author}</small></blockquote>)}
              </div>
            </section>
          )}
          <section>
            <h2>How requesting works</h2>
            <ol className="steps">
              <li><strong>Send a request</strong> with your Cal Poly email. It's free and doesn't commit you to anything.</li>
              <li><strong>We verify you both</strong> against the Cal Poly directory and confirm the host is allowed to sublease.</li>
              <li><strong>We introduce you by email</strong> so you and the host can talk details, tour, and sign a sublease agreement.</li>
            </ol>
          </section>
        </div>

        <aside className="detail-aside">
          <div className="booking card">
            <div>
              <strong>{money(l.monthlyPrice)}</strong> / month
              {l.priceNote && <span className="price-note"> · {l.priceNote}</span>}
            </div>
            <p>Available {fmtRange(l.availableFrom, l.availableTo)}</p>
            <div className="booking-dates">
              <label><span>Move in</span><input type="date" value={search.moveIn} onChange={e => setSearch({ ...search, moveIn: e.target.value })} /></label>
              <label><span>Move out</span><input type="date" value={search.moveOut} min={search.moveIn || undefined} onChange={e => setSearch({ ...search, moveOut: e.target.value })} /></label>
            </div>
            {validStay && (
              <dl>
                <div><dt>Rent</dt><dd>{money(l.monthlyPrice)} × {months} mo</dd></div>
                <div className="total"><dt>Estimated total</dt><dd>≈ {money(l.monthlyPrice * months)}</dd></div>
              </dl>
            )}
            {requested ? (
              <button className="success-button" onClick={() => setModalOpen(true)}><Icon name="check" /> Request sent</button>
            ) : (
              <button className="primary wide" onClick={() => setModalOpen(true)}>Request to sublease</button>
            )}
            <small>Free to request. No payments happen on this site. We'll email you once we've verified you both.</small>
          </div>
          <div className="host card">
            <div className="person">
              <span className="avatar large">{l.host.firstName[0]}{l.host.lastInitial}</span>
              <div>
                <h3>{l.host.firstName} {l.host.lastInitial}.</h3>
                <p>{l.host.role}</p>
              </div>
            </div>
            <ul>{l.verification.map(x => <li key={x}><Icon name="check" size={17} />{x}</li>)}</ul>
          </div>
        </aside>
      </div>
      {modalOpen && (
        <RequestModal
          listing={l}
          moveIn={search.moveIn}
          moveOut={search.moveOut}
          alreadyRequested={requested}
          onClose={() => setModalOpen(false)}
          onSent={() => setRequested(true)}
        />
      )}
    </main>
  )
}
