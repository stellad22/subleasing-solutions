import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { CAMPUS, type Listing } from '../data/listings'
import { money } from '../lib/dates'
import { listingHref } from '../lib/router'
import { Icon } from './Icon'

type Props = { listings: Listing[]; highlightId?: string | null; onHover?: (id: string | null) => void }

/** Real map with price pins (approximate neighborhood locations). */
export function ListingMap({ listings, highlightId, onHover }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView([CAMPUS.lat, CAMPUS.lng], 13)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map.current)
    L.marker([CAMPUS.lat, CAMPUS.lng], {
      icon: L.divIcon({ className: '', html: '<span class="campus-pin">Cal Poly</span>', iconSize: [0, 0] }),
      interactive: false,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const m = map.current, g = layer.current
    if (!m || !g) return
    g.clearLayers()
    listings.forEach(l => {
      const marker = L.marker([l.lat, l.lng], {
        icon: L.divIcon({
          className: '',
          html: `<a class="price-pin${l.id === highlightId ? ' active' : ''}" href="${listingHref(l.id)}">${money(l.monthlyPrice)}</a>`,
          iconSize: [0, 0],
        }),
        title: l.title,
        riseOnHover: true,
        zIndexOffset: l.id === highlightId ? 1000 : 0,
      })
      marker.on('mouseover', () => onHover?.(l.id))
      marker.on('mouseout', () => onHover?.(null))
      marker.addTo(g)
    })
  }, [listings, highlightId, onHover])

  useEffect(() => {
    const m = map.current
    if (!m || !listings.length) return
    const bounds = L.latLngBounds(listings.map(l => [l.lat, l.lng] as [number, number]))
    bounds.extend([CAMPUS.lat, CAMPUS.lng])
    m.fitBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [50, 90], maxZoom: 15 })
  }, [listings])

  return (
    <div className="map">
      <div ref={el} className="map-canvas" aria-label="Map of available subleases near campus" />
      <div className="map-note"><Icon name="info" size={15} /> Pins are approximate. Exact addresses are shared once we connect you.</div>
    </div>
  )
}
