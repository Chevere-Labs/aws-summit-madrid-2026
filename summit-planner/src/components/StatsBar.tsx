interface StatsBarProps {
  total: number
  filtered: number
}

export function StatsBar({ total, filtered }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <span>{filtered} of {total} sessions</span>
      {filtered !== total && (
        <span className="stats-filtered">({total - filtered} hidden by filters)</span>
      )}
    </div>
  )
}
