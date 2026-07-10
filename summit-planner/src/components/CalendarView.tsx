import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import type { Session, CityConfig } from '../types'

interface CalendarViewProps {
  sessions: Session[]
  onSelect: (id: string) => void
  isFavorite: (id: string) => boolean
  city: CityConfig
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function shortRoom(room: string): string {
  return room.replace(/^Floor \w+ \w+,\s*/, '').replace(/^Floor \w+,\s*/, '')
}

function generateTimeSlots(sessions: Session[]): string[] {
  if (sessions.length === 0) return []
  let minMinutes = Infinity
  let maxMinutes = 0
  for (const s of sessions) {
    const [h, m] = s.time.split(':').map(Number)
    const start = h * 60 + m
    const end = start + s.length
    if (start < minMinutes) minMinutes = start
    if (end > maxMinutes) maxMinutes = end
  }
  const slots: string[] = []
  for (let t = minMinutes; t <= maxMinutes; t += 15) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return slots
}

function categorizeRooms(rooms: string[], roomCategories: Record<string, string[]>): string[] {
  const categoryOrder: string[] = []
  const other: string[] = []

  for (const category of Object.keys(roomCategories)) {
    categoryOrder.push(category)
  }

  const categorizedByCategory: Record<string, string[]> = {}
  for (const cat of categoryOrder) {
    categorizedByCategory[cat] = []
  }

  for (const r of rooms) {
    let matched = false
    for (const [category, keywords] of Object.entries(roomCategories)) {
      if (keywords.some(k => r.includes(k))) {
        categorizedByCategory[category].push(r)
        matched = true
        break
      }
    }
    if (!matched) other.push(r)
  }

  const result: string[] = []
  for (const cat of categoryOrder) {
    result.push(...categorizedByCategory[cat])
  }
  result.push(...other)
  return result
}

export function CalendarView({ sessions, onSelect, isFavorite, city }: CalendarViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  const timeSlots = useMemo(() => generateTimeSlots(sessions), [sessions])

  const rooms = useMemo(() => {
    const roomSet = new Set<string>()
    for (const s of sessions) if (s.room) roomSet.add(s.room)
    return categorizeRooms([...roomSet], city.roomCategories)
  }, [sessions, city.roomCategories])

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
    <div className="calendar-wrapper">
      {canScrollLeft && <div className="scroll-indicator left"><span>‹</span></div>}
      {canScrollRight && <div className="scroll-indicator right"><span>›</span></div>}
      <div className="calendar-scroll" ref={scrollRef}>
        <div className="cal-grid" style={{ gridTemplateColumns: cols }}>
          <div className="cal-hdr cal-corner">Time / Room</div>
          {rooms.map(r => (
            <div key={r} className="cal-hdr" title={r}>{shortRoom(r)}</div>
          ))}
        </div>

        <div className="cal-body">
          {timeSlots.map(time => {
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
    </div>
  )
}
