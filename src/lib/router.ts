import { useEffect, useState } from 'react'

/**
 * Tiny hash router so the site works on any static host with no rewrite rules.
 *   #/                 → Find a place
 *   #/listing/<id>     → Listing details
 */
export type Route = { name: 'browse' } | { name: 'listing'; id: string }

function parse(hash: string): Route {
  const m = /^#\/listing\/([^/?#]+)/.exec(hash)
  return m ? { name: 'listing', id: decodeURIComponent(m[1]) } : { name: 'browse' }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const listingHref = (id: string) => `#/listing/${encodeURIComponent(id)}`
export const browseHref = '#/'
