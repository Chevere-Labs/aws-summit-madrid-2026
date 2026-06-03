import { useMemo } from 'react'
import type { Session } from '../types'

interface CalendarViewProps {
  sessions: Session[]
  onSelect: (id: string) => void
  isFavorite: (id: string) => boolean
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function shortRoom(room: string): string {
  return room.replace(/^Floor \w+ \w+,\s*/, '').replace(/^Floor \w+,\s*/, '')
}

const TIME_SLOTS = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30',
]

export function CalendarView({ sessions, onSelect, isFavorite }: CalendarViewProps) {
  const rooms = useMemo(() => {
    const roomSet = new Set<string>()
    for (const s of sessions) if (s.room) roomSet.add(s.room)
    const breakout: string[] = []
    const theatres: string[] = []
    const workshops: string[] = []
    const community: string[] = []
    const other: string[] = []
    for (const r of roomSet) {
      if (r.includes('Breakout')) breakout.push(r)
      else if (r.includes('Theatre') || r.includes('AWSome Stories')) theatres.push(r)
      else if (r.includes('Workshop')) workshops.push(r)
      else if (r.includes('Community') || r.includes('Developer') || r.includes('Chalk Talk')) community.push(r)
      else other.push(r)
    }
    return [...breakout, ...theatres, ...workshops, ...community, ...other]
  }, [sessions])

  const cols = `70px repeat(${rooms.length}, minmax(160px, 1fr))`

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h2>No sessions match your filters</h2>
        <p>Try adjusting your search or clearing filters</p>
      </div>
    )
  }

  return (
    <div className="calendar-view">
      <div className="cal-grid" style={{ gridTemplateColumns: cols }}>
        <div className="cal-hdr cal-corner">Time / Room</div>
        {rooms.map(r => (
          <div key={r} className="cal-hdr" title={r}>{shortRoom(r)}</div>
        ))}
      </div>

      <div className="cal-body">
        {TIME_SLOTS.map(time => {
          const atTime = sessions.filter(s => s.time === time)
          if (atTime.length === 0) return null
          return (
            <div key={time} className="cal-row" style={{ gridTemplateColumns: cols }}>
              <div className="cal-time-label"><span className="time-text">{time}</span></div>
              {rooms.map(room => {
                const ss = atTime.filter(s => s.room === room)
                return (
                  <div key={room} className="cal-cell">
                    {ss.map(s => (
                      <div
                        key={s.id}
                        className={`cal-session ${isFavorite(s.id) ? 'cal-fav' : ''}`}
                        onClick={() => onSelect(s.id)}
                      >
                        <div className="cal-session-type">{s.type}</div>
                        <div className="cal-session-title">{s.title}</div>
                        <div className="cal-session-time">{time}–{addMinutes(time, s.length)}</div>
                        <div className="cal-session-speaker">{s.speakers[0]?.split(',')[0] || ''}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
