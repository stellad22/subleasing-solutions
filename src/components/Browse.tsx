import { useCallback, useMemo, useRef, useState } from 'react'
import { FILTER_GROUPS, visibleListings, type FilterKey, type Listing } from '../data/listings'
import { fmt, fmtRange, matchDates, money, type Match } from '../lib/dates'
import { listingHref } from '../lib/router'
import type { Search } from '../App'
import { Icon } from './Icon'
import { ListingMap } from './ListingMap'

type Filters = Record<FilterKey, string[]>
const emptyFilters = (): Filters => ({ roomType: [], amenities: [], verification: [], roommates: [], household: [] })

function listingValues(l: Listing, key: FilterKey): string[] {
  switch (key) {
    case 'roomType': return [l.roomType]
    case 'roommates': return [l.roommates]
    case 'amenities': return l.amenities
    case 'household': return l.household
    case 'verification': return l.verification
  }
}

/** Single-value fields match ANY selected option; tag lists must include ALL selected options. */
function passes(l: Listing, f: Filters) {
  return (Object.keys(f) as FilterKey[]).every(key => {
    const sel = f[key]
    if (!sel.length) return true
    const vals = listingValues(l, key)
    return key === 'roomType' || key === 'roommates' ? sel.some(s => vals.includes(s)) : sel.every(s => vals.includes(s))
  })
}

type Sort = 'best' | 'price-asc' | 'price-desc' | 'soonest'

export function Browse({ search, setSearch }: { search: Search; setSearch: (s: Search) => void }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [sort, setSort] = useState<Sort>('best')
  const [hovered, setHovered] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const onHover = useCallback((id: string | null) => setHovered(id), [])

  const hasDates = Boolean(search.moveIn && search.moveOut && search.moveOut > search.moveIn)
  const maxPrice = Number(search.maxPrice.replace(/[^\d]/g, '')) || 0

  const results = useMemo(() => {
    const rows = visibleListings
      .filter(l => passes(l, filters))
      .filter(l => !maxPrice || l.monthlyPrice <= maxPrice)
      .map(l => ({ l, match: matchDates(l.availableFrom, l.availableTo, search.moveIn, search.moveOut) }))
      .filter(r => r.match.kind !== 'no-overlap')
    const score = (m: Match) => (m.kind === 'covers' ? 0 : m.kind === 'partial' ? m.gapDays : 0)
    rows.sort((a, b) => {
      if (sort === 'price-asc') return a.l.monthlyPrice - b.l.monthlyPrice
      if (sort === 'price-desc') return b.l.monthlyPrice - a.l.monthlyPrice
      if (sort === 'soonest') return a.l.availableFrom.localeCompare(b.l.availableFrom)
      return score(a.match) - score(b.match) || a.l.monthlyPrice - b.l.monthlyPrice
    })
    return rows
  }, [filters, maxPrice, search.moveIn, search.moveOut, sort])

  const toggle = (key: FilterKey, option: string) => {
    const cur = filters[key]
    setFilters({ ...filters, [key]: cur.includes(option) ? cur.filter(x => x !== option) : [...cur, option] })
  }
  const anyFilters = Object.values(filters).some(v => v.length) || maxPrice > 0

  return (
    <main onClick={() => setOpenFilter(null)}>
      <section className="browse-hero">
        <p className="eyebrow">Browse subleases</p>
        <h1>Find a room for exactly the months you need.</h1>
        <p>Every host is a verified Cal Poly student. Search by your dates, not by lease cycles.</p>
        <form
          className="searchbar"
          onSubmit={e => {
            e.preventDefault()
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          <label><span>Where</span><input value="San Luis Obispo, CA" readOnly tabIndex={-1} /></label>
          <label>
            <span>Move in</span>
            <input type="date" value={search.moveIn} onChange={e => setSearch({ ...search, moveIn: e.target.value })} />
          </label>
          <label>
            <span>Move out</span>
            <input type="date" value={search.moveOut} min={search.moveIn || undefined} onChange={e => setSearch({ ...search, moveOut: e.target.value })} />
          </label>
          <label>
            <span>Max monthly</span>
            <input inputMode="numeric" placeholder="Any" value={search.maxPrice} onChange={e => setSearch({ ...search, maxPrice: e.target.value })} />
          </label>
          <button className="primary" type="submit"><Icon name="search" /> Search</button>
        </form>
        <div className="filter-dropdowns" onClick={e => e.stopPropagation()}>
          {FILTER_GROUPS.map(group => {
            const selected = filters[group.key]
            const open = openFilter === group.key
            return (
              <div className="filter-dropdown" key={group.key}>
                <button className={selected.length ? 'filter-trigger selected' : 'filter-trigger'} aria-expanded={open} onClick={() => setOpenFilter(open ? null : group.key)}>
                  {group.label}
                  {selected.length > 0 && <span>{selected.length === 1 ? selected[0] : selected.length}</span>} <b>⌄</b>
                </button>
                {open && (
                  <div className="filter-menu">
                    <strong>{group.label}</strong>
                    {group.options.map(option => {
                      const checked = selected.includes(option)
                      return (
                        <button key={option} className={checked ? 'filter-option checked' : 'filter-option'} onClick={() => toggle(group.key, option)}>
                          <i>{checked && <Icon name="check" size={14} />}</i>
                          <span>{option}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {anyFilters && (
            <button className="clear-filters" onClick={() => { setFilters(emptyFilters()); setSearch({ ...search, maxPrice: '' }); setOpenFilter(null) }}>
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="browse-grid">
        <div className="results" ref={resultsRef}>
          <div className="results-head">
            <strong>
              {results.length} sublease{results.length === 1 ? '' : 's'}
              {hasDates ? ` available ${fmt(search.moveIn)} – ${fmt(search.moveOut)}` : ' available'}
            </strong>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort listings">
              <option value="best">Best match</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="soonest">Available soonest</option>
            </select>
          </div>

          {results.length === 0 ? (
            <div className="empty-results card">
              <h3>No subleases match yet</h3>
              <p>Try different dates, a higher max price, or fewer filters. New places are added every week.</p>
              {anyFilters && <button className="secondary" onClick={() => { setFilters(emptyFilters()); setSearch({ ...search, maxPrice: '' }) }}>Clear filters</button>}
            </div>
          ) : (
            <div className="listing-grid">
              {results.map(({ l, match }) => (
                <a
                  className={'listing-card' + (hovered === l.id ? ' hovered' : '')}
                  key={l.id}
                  href={listingHref(l.id)}
                  onMouseEnter={() => setHovered(l.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="photo">
                    <img src={l.photos[0]} alt={l.title} loading="lazy" />
                    {match.kind === 'covers' && <span className="badge">Covers your dates</span>}
                    {match.kind === 'partial' && <span className="badge warning">{match.label}</span>}
                  </div>
                  <div className="listing-body">
                    <h3>{l.title}</h3>
                    <p>{l.neighborhood} · {l.distanceToCampus}</p>
                    <p className="dates">{fmtRange(l.availableFrom, l.availableTo)}</p>
                    <div className="tags">{[...l.amenities.slice(0, 2), ...l.verification.filter(v => v !== 'Cal Poly student verified').slice(0, 1)].map(t => <span key={t}>{t}</span>)}</div>
                    <div className="price"><strong>{money(l.monthlyPrice)}</strong><span> / month</span></div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
        <ListingMap listings={results.map(r => r.l)} highlightId={hovered} onHover={onHover} />
      </section>
    </main>
  )
}
