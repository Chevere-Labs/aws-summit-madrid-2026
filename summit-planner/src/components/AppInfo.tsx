import { useState, useEffect, useCallback, useMemo } from 'react'

interface AppInfoProps {
  version: string
  lastFetched: string
}

type DateDisplayMode = 'absolute' | 'relative'

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatAbsolute(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then

  if (diffMs < 0) return formatAbsolute(iso)

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 6) return formatAbsolute(iso)
  if (days >= 1) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours >= 1) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes >= 1) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  return 'hace un momento'
}

function getStoredMode(): DateDisplayMode {
  try {
    const stored = localStorage.getItem('dateDisplayMode')
    if (stored === 'absolute' || stored === 'relative') return stored
  } catch { /* ignore */ }
  return 'relative'
}

export function AppInfo({ version, lastFetched }: AppInfoProps) {
  const [mode, setMode] = useState<DateDisplayMode>(getStoredMode)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next = prev === 'absolute' ? 'relative' : 'absolute'
      try { localStorage.setItem('dateDisplayMode', next) } catch { /* ignore */ }
      return next
    })
  }, [])

  const dateText = useMemo(() => {
    return mode === 'relative' ? formatRelative(lastFetched) : formatAbsolute(lastFetched)
  }, [mode, lastFetched])

  return (
    <div className="app-info">
      <span className="app-info-version">v{version}</span>
      <span className="app-info-sep">·</span>
      <button
        className="app-info-date"
        onClick={toggleMode}
        title={mode === 'relative' ? 'Mostrar fecha absoluta' : 'Mostrar tiempo relativo'}
      >
        Datos actualizados {mode === 'relative' ? '' : 'el '}{dateText}
      </button>
    </div>
  )
}
