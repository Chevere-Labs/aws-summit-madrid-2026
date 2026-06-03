import { useEffect } from 'react'
import type { Session } from '../types'
import { useFavorites } from '../hooks/useFavorites'

interface TalkDetailProps {
  session: Session
  onClose: () => void
}

export function TalkDetail({ session, onClose }: TalkDetailProps) {
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(session.id)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const levelClass = session.level.startsWith('100') ? 'level-100'
    : session.level.startsWith('200') ? 'level-200'
    : session.level.startsWith('300') ? 'level-300'
    : session.level.startsWith('400') ? 'level-400'
    : ''

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-badges">
            <span className="talk-type-badge">{session.type}</span>
            <span className={`talk-level ${levelClass}`}>
              {session.level.replace(/ –.*/, '')}
            </span>
            <span className="modal-code">{session.id}</span>
          </div>
          <button
            className={`favorite-btn-large ${fav ? 'favorited' : ''}`}
            onClick={() => toggle(session.id)}
          >
            {fav ? '★' : '☆'} {fav ? 'Favorited' : 'Add to favorites'}
          </button>
        </div>

        <h2 className="modal-title">{session.title}</h2>

        <div className="modal-info-grid">
          <div className="modal-info-item">
            <span className="info-label">Time</span>
            <span className="info-value">{session.date} {session.time}</span>
          </div>
          <div className="modal-info-item">
            <span className="info-label">Duration</span>
            <span className="info-value">{session.length} min</span>
          </div>
          <div className="modal-info-item">
            <span className="info-label">Room</span>
            <span className="info-value">{session.room}</span>
          </div>
          <div className="modal-info-item">
            <span className="info-label">Timezone</span>
            <span className="info-value">{session.timezone}</span>
          </div>
        </div>

        {(session.speakers.length > 0) && (
          <div className="modal-section">
            <h3>Speakers</h3>
            <ul className="speaker-list">
              {session.speakers.map((sp, i) => (
                <li key={i}>{sp}</li>
              ))}
            </ul>
          </div>
        )}

        {session.abstract && (
          <div className="modal-section">
            <h3>Description</h3>
            <p className="modal-abstract">{session.abstract}</p>
          </div>
        )}

        <div className="modal-tags">
          {session.services.map(s => (
            <span key={s} className="tag tag-service">{s}</span>
          ))}
          {session.areasOfInterest.map(a => (
            <span key={a} className="tag tag-area">{a}</span>
          ))}
          {session.industries.map(ind => (
            <span key={ind} className="tag tag-industry">{ind}</span>
          ))}
          {session.jobRoles.map(r => (
            <span key={r} className="tag tag-role">{r}</span>
          ))}
          {session.sessionFeatures.map(f => (
            <span key={f} className="tag tag-feature">{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
