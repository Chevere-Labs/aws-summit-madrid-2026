import type { Session } from '../types'
import { useFavorites } from '../hooks/useFavorites'

interface TalkCardProps {
  session: Session
  onSelect: (id: string) => void
}

export function TalkCard({ session, onSelect }: TalkCardProps) {
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(session.id)
  const levelClass = session.level.startsWith('100') ? 'level-100'
    : session.level.startsWith('200') ? 'level-200'
    : session.level.startsWith('300') ? 'level-300'
    : session.level.startsWith('400') ? 'level-400'
    : ''

  return (
    <div className="talk-card" onClick={() => onSelect(session.id)}>
      <div className="talk-card-header">
        <div className="talk-type-badge">{session.type}</div>
        <button
          className={`favorite-btn ${fav ? 'favorited' : ''}`}
          onClick={e => { e.stopPropagation(); toggle(session.id) }}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {fav ? '★' : '☆'}
        </button>
      </div>
      <div className="talk-card-body">
        <h3 className="talk-title">{session.title}</h3>
        <div className="talk-meta">
          <span className={`talk-level ${levelClass}`}>
            {session.level.replace(/ –.*/, '')}
          </span>
          <span className="talk-time">{session.time}</span>
          <span className="talk-length">{session.length}min</span>
        </div>
        <div className="talk-room">{session.room}</div>
        <div className="talk-speakers">
          {session.speakers.slice(0, 2).map((sp, i) => (
            <span key={i} className="talk-speaker">{sp.split(',')[0]}</span>
          ))}
          {session.speakers.length > 2 && (
            <span className="talk-speaker-more">+{session.speakers.length - 2}</span>
          )}
        </div>
        <div className="talk-tags">
          {session.services.slice(0, 3).map(s => (
            <span key={s} className="tag tag-service">{s}</span>
          ))}
          {session.areasOfInterest.slice(0, 2).map(a => (
            <span key={a} className="tag tag-area">{a}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
