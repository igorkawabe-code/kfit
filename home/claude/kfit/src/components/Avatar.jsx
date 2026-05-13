import { getTextColor } from '../lib/utils'

function getFirstName(name) { return name?.split(' ')[0] || '' }

const SIZES = {
  xs:  { div: 'w-7 h-7',   text: 'text-xs',  ring: 2 },
  sm:  { div: 'w-8 h-8',   text: 'text-xs',  ring: 2 },
  md:  { div: 'w-10 h-10', text: 'text-sm',  ring: 2 },
  lg:  { div: 'w-12 h-12', text: 'text-base',ring: 2.5 },
  xl:  { div: 'w-14 h-14', text: 'text-xl',  ring: 3 },
  '2xl': { div: 'w-16 h-16', text: 'text-2xl', ring: 3 },
}

export default function Avatar({ profile, size = 'md', className = '' }) {
  const s = SIZES[size] || SIZES.md
  const color = profile?.color || '#B4FF00'

  if (profile?.photo_url) {
    return (
      <div
        className={`${s.div} rounded-full flex-shrink-0 ${className}`}
        style={{ padding: `${s.ring}px`, backgroundColor: color }}>
        <img
          src={profile.photo_url}
          alt={profile.name}
          className="w-full h-full rounded-full object-cover block"
        />
      </div>
    )
  }

  return (
    <div
      className={`${s.div} rounded-full flex items-center justify-center font-display ${s.text} flex-shrink-0 ${className}`}
      style={{ backgroundColor: color, color: getTextColor(color) }}>
      {getFirstName(profile?.name)?.[0] || '?'}
    </div>
  )
}
