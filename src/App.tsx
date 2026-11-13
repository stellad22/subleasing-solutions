import { useEffect, useState } from 'react'
import { config } from './config'
import { getListing } from './data/listings'
import { browseHref, useRoute } from './lib/router'
import { Browse } from './components/Browse'
import { ListingDetail } from './components/ListingDetail'
import { Footer, Header } from './components/Header'
import { BetaNotice, hasSeenBetaNotice } from './components/BetaNotice'

export type Search = { moveIn: string; moveOut: string; maxPrice: string }

const SEARCH_KEY = 'ss-search'
function loadSearch(): Search {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SEARCH_KEY) || 'null')
    if (saved) return saved
  } catch { /* ignore */ }
  return { moveIn: config.defaultMoveIn, moveOut: config.defaultMoveOut, maxPrice: '' }
}

export default function App() {
  const route = useRoute()
  const [search, setSearchState] = useState<Search>(loadSearch)
  const [showBeta, setShowBeta] = useState(() => !hasSeenBetaNotice())
  const setSearch = (s: Search) => {
    setSearchState(s)
    try { sessionStorage.setItem(SEARCH_KEY, JSON.stringify(s)) } catch { /* ignore */ }
  }

  const listing = route.name === 'listing' ? getListing(route.id) : undefined

  useEffect(() => {
    document.title = listing ? `${listing.title} · Subleasing Solutions` : 'Subleasing Solutions · Find a place in SLO'
  }, [listing])

  const openBeta = () => setShowBeta(true)

  return (
    <>
      <Header onShowBeta={openBeta} />
      {route.name === 'browse' && <Browse search={search} setSearch={setSearch} />}
      {route.name === 'listing' && listing && <ListingDetail key={listing.id} listing={listing} search={search} setSearch={setSearch} />}
      {route.name === 'listing' && !listing && (
        <main className="confirmation">
          <h1>This listing isn't available</h1>
          <p>It may have been filled or taken down.</p>
          <a className="primary" href={browseHref}>Browse other places</a>
        </main>
      )}
      <Footer onShowBeta={openBeta} />
      {showBeta && <BetaNotice onClose={() => setShowBeta(false)} />}
    </>
  )
}