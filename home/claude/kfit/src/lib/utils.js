// Retorna nome curto inteligente: "Clara K." se houver duas Claras, senão só "Clara"
export function getDisplayName(profile, allProfiles = []) {
  if (!profile?.name) return ''
  const firstName = profile.name.split(' ')[0]
  const hasDuplicate = allProfiles.some(p => p.id !== profile.id && p.name?.split(' ')[0] === firstName)
  if (hasDuplicate) {
    const parts = profile.name.split(' ')
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : ''
    return `${firstName} ${lastInitial}`
  }
  return firstName
}

// Retorna cor do texto (preto ou branco) baseado no background
export function getTextColor(bgColor) {
  if (!bgColor) return '#060606'
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#060606' : '#FFFFFF'
}
