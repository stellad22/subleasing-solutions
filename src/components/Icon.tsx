export type IconName = 'home' | 'search' | 'check' | 'back' | 'shield' | 'info' | 'close' | 'mail'

const paths: Record<IconName, string> = {
  home: 'M4 11 12 5l8 6v9H4z M9 20v-6h6v6',
  search: 'M20 20l-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  check: 'm5 12 5 5L19 7',
  back: 'm15 18-6-6 6-6',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z M9 12l2 2 4-4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 8v5 M12 16.5v.5',
  close: 'M6 6l12 12M18 6 6 18',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
