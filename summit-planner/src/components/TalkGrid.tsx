import type { Session } from '../types'
import { TalkCard } from './TalkCard'

interface TalkGridProps {
  sessions: Session[]
  onSelect: (id: string) => void
  isFavorite: (id: string) => boolean
}

export function TalkGrid({ sessions, onSelect }: TalkGridProps) {
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
    <div className="talk-grid">
      {sessions.map(session => (
        <TalkCard
          key={session.id}
          session={session}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
