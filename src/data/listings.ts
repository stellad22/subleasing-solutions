/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LISTINGS — edit this file to add / update / remove subleases.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The four listings below are SAMPLE data copied from the Figma prototype.
 *  Replace them with your real, verified listings.
 *
 *  Tips
 *  • `id` must be unique and URL-friendly (it becomes /#/listing/<id>).
 *  • Dates are YYYY-MM-DD.
 *  • `monthlyPrice` is a number in dollars (what renters pay per month, all-in).
 *  • Photos: put image files in /public/listings/ and reference them as
 *    '/listings/your-photo.jpg', or paste a full https:// image URL.
 *  • `lat` / `lng` should be APPROXIMATE (neighborhood-level), not the exact
 *    address. Exact addresses are only shared after you connect both parties.
 *  • Tags used by the filters must match the option names in FILTER_GROUPS
 *    (bottom of this file) exactly.
 *  • Set `hidden: true` to take a listing down without deleting it.
 */

export type RoomType = 'Private room' | 'Shared room' | 'Entire place'
export type Roommates = 'Women only' | 'Men only' | 'Gender inclusive'

export type Listing = {
  id: string
  title: string
  neighborhood: string
  distanceToCampus: string
  lat: number
  lng: number
  availableFrom: string
  availableTo: string
  monthlyPrice: number
  /** e.g. 'all-in' or 'plus ~$60 utilities' — shown next to the price on the detail page */
  priceNote?: string
  roomType: RoomType
  roommates: Roommates
  amenities: string[]
  household: string[]
  /** Checks your team has done on this listing, shown to renters */
  verification: string[]
  photos: string[]
  description: string
  host: {
    firstName: string
    lastInitial: string
    role: string
  }
  reviews?: { text: string; author: string }[]
  hidden?: boolean
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
const samplePhotos = [
  unsplash('photo-1512918728675-ed5a9ecdebfd'),
  unsplash('photo-1560448204-e02f11c3d0e2'),
  unsplash('photo-1484154218962-a197022b5858'),
  unsplash('photo-1502672260266-1c1ef2d93688'),
]
const rotate = (start: number) => [0, 1, 2, 3].map(i => samplePhotos[(start + i) % samplePhotos.length])

export const listings: Listing[] = [
  {
    id: 'monterey-heights-private-room',
    title: 'Private room in 3BR house',
    neighborhood: 'Monterey Heights',
    distanceToCampus: '0.4 mi to campus',
    lat: 35.2908,
    lng: -120.6548,
    availableFrom: '2027-01-02',
    availableTo: '2027-06-15',
    monthlyPrice: 975,
    priceNote: 'all-in',
    roomType: 'Private room',
    roommates: 'Gender inclusive',
    amenities: ['Furnished', 'Utilities included', 'Washer/dryer', 'Parking'],
    household: ['Quiet home', 'Non-smoking'],
    verification: ['Cal Poly student verified', 'Landlord approved'],
    photos: rotate(0),
    description:
      "[SAMPLE] Bright private room in a 3-bedroom house with two quiet grad-student roommates. Furnished with a bed, desk and dresser. Utilities and Wi-Fi are included. I'm subleasing while I study abroad in the spring.",
    host: { firstName: 'Maya', lastInitial: 'R', role: 'Current tenant' },
  },
  {
    id: 'downtown-studio',
    title: 'Studio with own entrance',
    neighborhood: 'Downtown',
    distanceToCampus: '1.1 mi to campus',
    lat: 35.2799,
    lng: -120.6618,
    availableFrom: '2027-01-04',
    availableTo: '2027-06-12',
    monthlyPrice: 1150,
    roomType: 'Entire place',
    roommates: 'Gender inclusive',
    amenities: ['Private bath', 'Furnished'],
    household: ['Quiet home', 'Non-smoking'],
    verification: ['Cal Poly student verified', 'Landlord approved'],
    photos: rotate(1),
    description: '[SAMPLE] Self-contained studio with its own entrance, kitchenette and private bathroom. Walkable to downtown.',
    host: { firstName: 'Jordan', lastInitial: 'T', role: 'Current tenant' },
  },
  {
    id: 'foothill-shared-room',
    title: 'Shared room, 2BR apartment',
    neighborhood: 'Foothill',
    distanceToCampus: '0.7 mi to campus',
    lat: 35.2948,
    lng: -120.6712,
    availableFrom: '2027-01-10',
    availableTo: '2027-06-20',
    monthlyPrice: 640,
    roomType: 'Shared room',
    roommates: 'Women only',
    amenities: ['Furnished', 'Pets OK'],
    household: ['Social home', 'Students preferred'],
    verification: ['Cal Poly student verified'],
    photos: rotate(2),
    description: '[SAMPLE] Shared bedroom in a 2BR apartment off Foothill. Friendly household, cat-friendly.',
    host: { firstName: 'Alex', lastInitial: 'K', role: 'Current tenant' },
  },
  {
    id: 'laguna-lake-townhouse',
    title: 'Room + bath in townhouse',
    neighborhood: 'Laguna Lake',
    distanceToCampus: '3.2 mi to campus',
    lat: 35.2612,
    lng: -120.6869,
    availableFrom: '2026-12-20',
    availableTo: '2027-06-30',
    monthlyPrice: 1050,
    priceNote: 'plus ~$60 utilities',
    roomType: 'Private room',
    roommates: 'Gender inclusive',
    amenities: ['Private bath', 'Parking', 'Washer/dryer'],
    household: ['Quiet home', 'LGBTQ+ friendly'],
    verification: ['Cal Poly student verified', 'Lease verified'],
    photos: rotate(3),
    description: '[SAMPLE] Private bedroom with an attached bathroom in a townhouse near Laguna Lake. Garage parking spot included.',
    host: { firstName: 'Sam', lastInitial: 'P', role: 'Current tenant' },
  },
]

export const visibleListings = listings.filter(l => !l.hidden)

export const getListing = (id: string) => visibleListings.find(l => l.id === id)

/** Filter dropdowns on the Find a place page. */
export const FILTER_GROUPS = [
  { key: 'roomType', label: 'Room type', options: ['Private room', 'Shared room', 'Entire place'] },
  { key: 'amenities', label: 'Amenities', options: ['Furnished', 'Utilities included', 'Private bath', 'Parking', 'Washer/dryer', 'Pets OK'] },
  { key: 'verification', label: 'Verification', options: ['Landlord approved', 'Lease verified'] },
  { key: 'roommates', label: 'Roommates', options: ['Women only', 'Men only', 'Gender inclusive'] },
  { key: 'household', label: 'Household', options: ['Quiet home', 'Social home', 'Non-smoking', 'LGBTQ+ friendly', 'Students preferred'] },
] as const

export type FilterKey = (typeof FILTER_GROUPS)[number]['key']

/** Cal Poly campus, used to center the map. */
export const CAMPUS = { lat: 35.3005, lng: -120.6625 }
