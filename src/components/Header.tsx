import { config } from '../config'
import { browseHref } from '../lib/router'
import { Icon } from './Icon'

export function Header() {
  return (
    <header className="header">
      <a className="brand" href={browseHref}>
        <span className="logo"><Icon name="home" size={20} /></span>
        <span>Subleasing<br />Solutions</span>
      </a>
      <nav>
        <a className="active" href={browseHref}>Find a place</a>
      </nav>
      <div className="header-actions">
        {config.surveyUrl && (
          <a className="gold-button" href={config.surveyUrl} target="_blank" rel="noreferrer">Give feedback</a>
        )}
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        <Icon name="shield" size={15} /> Every host and renter is checked against the Cal Poly directory by the Subleasing Solutions team before we connect you.
      </p>
      <p>
        {config.contactEmail && <>Questions? <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></>}
        {config.contactEmail && config.surveyUrl && ' · '}
        {config.surveyUrl && <a href={config.surveyUrl} target="_blank" rel="noreferrer">Share feedback</a>}
      </p>
    </footer>
  )
}
