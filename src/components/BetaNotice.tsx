import { useEffect, useRef } from 'react'
import { config } from '../config'
import { Icon } from './Icon'

/** Bump this if you change the notice and want everyone to see it again. */
const SEEN_KEY = 'ss-beta-notice-v1'

export function hasSeenBetaNotice() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* storage unavailable — notice will just show again next visit */
  }
}

export function BetaNotice({ onClose }: { onClose: () => void }) {
  const button = useRef<HTMLButtonElement>(null)

  const close = () => {
    markSeen()
    onClose()
  }

  useEffect(() => {
    button.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal card beta-modal" role="dialog" aria-modal="true" aria-labelledby="beta-title">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <span className="beta-pill">Beta</span>
        <h2 id="beta-title">Welcome to Subleasing Solutions</h2>
        <p>
          This site is an early <strong>MVP (minimum viable product)</strong> built by a team of Cal Poly students. We're running this
          beta to find out whether a simple, verified subleasing service is something students actually want, and whether it's worth
          continuing to build.
        </p>
        <ul className="beta-list">
          <li><Icon name="check" size={17} /><span><strong>The listings are real.</strong> Each one is posted by a Cal Poly student looking to sublease.</span></li>
          <li><Icon name="shield" size={17} /><span><strong>We verify everyone by hand.</strong> Before connecting anyone, our team checks both sides' Cal Poly IDs against the directory.</span></li>
          <li><Icon name="mail" size={17} /><span><strong>We introduce you by email.</strong> Hit "Request to sublease" and we'll reach out to connect you with the host. No payments happen on this site.</span></li>
        </ul>
        <p className="beta-foot">
          Expect a few rough edges.
          {config.surveyUrl
            ? <> After you've tried it, our <a href={config.surveyUrl} target="_blank" rel="noreferrer">short feedback survey</a> helps us decide what's next.</>
            : ' Your feedback helps us decide what to build next.'}
        </p>
        <button ref={button} className="primary wide" onClick={close}>Got it, let me browse</button>
      </div>
    </div>
  )
}