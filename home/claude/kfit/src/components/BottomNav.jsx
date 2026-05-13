import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#B4FF00' : 'none'} stroke={active ? '#B4FF00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Início'
  },
  {
    to: '/checkin',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#B4FF00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={active ? 'rgba(180,255,0,0.15)' : 'none'} />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    label: 'Check-in'
  },
  {
    to: '/rankings',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#B4FF00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    label: 'Ranking'
  },
  {
    to: '/history',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#B4FF00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: 'Histórico'
  },
  {
    to: '/profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#B4FF00' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: 'Perfil'
  }
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-zinc-800 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex flex-col items-center gap-1 flex-1 py-2"
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span className={`text-[10px] font-body font-medium transition-colors ${isActive ? 'text-accent' : 'text-zinc-600'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
