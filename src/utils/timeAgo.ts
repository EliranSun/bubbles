const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getElapsedText(timestamp: string | number | Date, now = Date.now()) {
  const value = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime()

  if (Number.isNaN(value)) {
    return 'Today'
  }

  const diff = Math.max(0, now - value)
  const days = Math.floor(diff / MS_PER_DAY)

  if (days <= 0) {
    return 'Today'
  }

  if (days === 1) {
    return '1 day ago'
  }

  return `${days} days ago`
}
