import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import type { Listing } from '../data/listings'
import { fmtRange } from '../lib/dates'
import { isCalPolyEmail, isValidEmail, submitRequest } from '../lib/requests'
import { Icon } from './Icon'

type Props = {
  listing: Listing
  moveIn: string
  moveOut: string
  alreadyRequested: boolean
  onClose: () => void
  onSent: () => void
}

export function RequestModal({ listing, moveIn: initialIn, moveOut: initialOut, alreadyRequested, onClose, onSent }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [moveIn, setMoveIn] = useState(initialIn)
  const [moveOut, setMoveOut] = useState(initialOut)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [touched, setTouched] = useState(false)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const emailError = !email.trim()
    ? 'Enter your email.'
    : !isValidEmail(email)
      ? "That email doesn't look right."
      : config.requireCalPolyEmail && !isCalPolyEmail(email)
        ? 'Please use your @calpoly.edu email so we can verify you.'
        : ''
  const datesError = moveIn && moveOut && moveOut <= moveIn ? 'Move-out must be after move-in.' : ''
  const canSubmit = !emailError && !datesError && consent && status !== 'sending'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setStatus('sending')
    try {
      await submitRequest({ listingId: listing.id, listingTitle: listing.title, email, name, moveIn, moveOut, note, website })
      setStatus('sent')
      onSent()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>

        {status === 'sent' ? (
          <div className="modal-success">
            <span className="confirm-icon"><Icon name="check" size={34} /></span>
            <h2 id="request-title">Request sent!</h2>
            <p>
              We'll verify your Cal Poly status and check in with {listing.host.firstName}. Expect an email at <strong>{email.trim().toLowerCase()}</strong> within 1–2 days introducing you both.
            </p>
            {config.surveyUrl && (
              <div className="survey-callout">
                <p>Got 2 minutes? Tell us how this went. It helps us improve.</p>
                <a className="secondary" href={config.surveyUrl} target="_blank" rel="noreferrer">Take the optional survey</a>
              </div>
            )}
            <button className="primary wide" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="eyebrow">Request to sublease</p>
            <h2 id="request-title">{listing.title}</h2>
            <p className="modal-sub">
              {listing.neighborhood} · Available {fmtRange(listing.availableFrom, listing.availableTo)}
            </p>
            {alreadyRequested && <p className="notice">You already requested this place from this browser. Sending again is fine if something changed.</p>}

            <label className="field">
              <span>Cal Poly email *</span>
              <input ref={firstField} type="email" autoComplete="email" placeholder="you@calpoly.edu" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && !!emailError} />
              {touched && emailError && <em className="error">{emailError}</em>}
            </label>
            <label className="field">
              <span>Full name <small>(optional, helps us verify you faster)</small></span>
              <input autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <div className="two-col">
              <label className="field"><span>Move in</span><input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} /></label>
              <label className="field"><span>Move out</span><input type="date" value={moveOut} min={moveIn || undefined} onChange={e => setMoveOut(e.target.value)} /></label>
            </div>
            {datesError && <em className="error">{datesError}</em>}
            <label className="field">
              <span>Note for the host <small>(optional)</small></span>
              <textarea rows={3} maxLength={1000} placeholder="Why you're subleasing, flexibility on dates, questions…" value={note} onChange={e => setNote(e.target.value)} />
            </label>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} name="website" />
            <label className="checkline">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>I'm a current Cal Poly student. Subleasing Solutions may verify me against the Cal Poly directory and email me to connect with the host.</span>
            </label>
            {touched && !consent && <em className="error">Please confirm to continue.</em>}
            {status === 'error' && (
              <p className="error">Something went wrong sending your request. Check your connection and try again{config.contactEmail ? <>, or email <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></> : ''}.</p>
            )}
            <button className="primary wide" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : <><Icon name="mail" /> Send request</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
