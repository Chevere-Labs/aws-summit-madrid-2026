import { useState, useMemo, useCallback } from 'react'
import citiesData from './data/cities.json'
import bogotaSessions from './data/bogota-sessions.json'
import madridSessions from './data/madrid-sessions.json'
import type { Session, Filters, ViewMode, CityConfig } from './types'
import { FavoritesProvider } from './hooks/useFavorites'
import { SearchBar } from './components/SearchBar'
import { FilterBar } from './components/FilterBar'
import { TalkGrid } from './components/TalkGrid'
import { CalendarView } from './components/CalendarView'
import { TalkDetail } from './components/TalkDetail'
import { StatsBar } from './components/StatsBar'
import { CitySelector } from './components/CitySelector'
import { AppInfo } from './components/AppInfo'
import { useFavorites } from './hooks/useFavorites'
import './App.css'

const APP_VERSION = '6.7.10a'

const cities: CityConfig[] = citiesData as unknown as CityConfig[]

const sessionsByCity: Record<string, Session[]> = {
  bogota: bogotaSessions as Session[],
  madrid: madridSessions as Session[],
}

const DEFAULT_CITY_ID = 'bogota'

function getStoredCityId(): string {
  try {
    return localStorage.getItem('selectedCity') || DEFAULT_CITY_ID
  } catch {
    return DEFAULT_CITY_ID
  }
}

function getAll<T>(key: keyof Session, sessions: Session[]): T[] {
  const values = new Set<T>()
  for (const s of sessions) {
    const v = s[key]
    if (Array.isArray(v)) {
      for (const item of v) if (item) values.add(item as T)
    } else if (v) {
      values.add(v as T)
    }
  }
  return [...values].sort()
}

function filterSessions(sessions: Session[], filters: Filters): Session[] {
  const q = filters.search.toLowerCase().trim()
  return sessions.filter(s => {
    if (q) {
      const searchable = `${s.title} ${s.abstract} ${s.id} ${s.speakers.join(' ')} ${s.room}`.toLowerCase()
      if (!searchable.includes(q)) return false
    }
    if (filters.types.length && !filters.types.includes(s.type)) return false
    if (filters.levels.length && !filters.levels.includes(s.level)) return false
    if (filters.rooms.length && !filters.rooms.includes(s.room)) return false
    if (filters.times.length && !filters.times.includes(s.time)) return false
    if (filters.industries.length && !s.industries.some(i => filters.industries.includes(i))) return false
    if (filters.jobRoles.length && !s.jobRoles.some(r => filters.jobRoles.includes(r))) return false
    if (filters.services.length && !s.services.some(se => filters.services.includes(se))) return false
    if (filters.areasOfInterest.length && !s.areasOfInterest.some(a => filters.areasOfInterest.includes(a))) return false
    if (filters.speakers.length && !s.speakers.some(sp => filters.speakers.includes(sp))) return false
    if (filters.sessionFeatures.length && !s.sessionFeatures.some(f => filters.sessionFeatures.includes(f))) return false
    return true
  })
}

const defaultFilters: Filters = {
  search: '',
  types: [],
  levels: [],
  rooms: [],
  times: [],
  industries: [],
  jobRoles: [],
  services: [],
  areasOfInterest: [],
  speakers: [],
  sessionFeatures: [],
}

function AppContent({ cityId, onCityChange }: { cityId: string, onCityChange: (id: string) => void }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { isFavorite } = useFavorites()

  const city = useMemo(() => cities.find(c => c.id === cityId) || cities[0], [cityId])
  const sessions = useMemo(() => sessionsByCity[city.id] || [], [city])

  const handleCityChange = useCallback((newCity: CityConfig) => {
    try { localStorage.setItem('selectedCity', newCity.id) } catch { /* ignore */ }
    onCityChange(newCity.id)
  }, [onCityChange])

  const allTypes = getAll<string>('type', sessions)
  const allLevels = getAll<string>('level', sessions)
  const allRooms = getAll<string>('room', sessions)
  const allTimes = getAll<string>('time', sessions)
  const allIndustries = getAll<string>('industries', sessions)
  const allJobRoles = getAll<string>('jobRoles', sessions)
  const allServices = getAll<string>('services', sessions)
  const allAreas = getAll<string>('areasOfInterest', sessions)
  const allSpeakers = getAll<string>('speakers', sessions)
  const allFeatures = getAll<string>('sessionFeatures', sessions)

  const filtered = useMemo(() => filterSessions(sessions, filters), [sessions, filters])
  const selectedSession = selectedId ? sessions.find(s => s.id === selectedId) : null

  const setFilter = (key: keyof Filters, value: string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(defaultFilters)
  const hasActiveFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : !!v)

  const { count: favCount } = useFavorites()

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'search' && Array.isArray(v) && v.length > 0).length +
    (filters.search ? 1 : 0)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">{city.name}</h1>
          <div className="header-controls">
            <span className="favorite-count">★ {favCount}</span>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ▦
              </button>
              <button
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Calendar view"
              >
                ▤
              </button>
            </div>
            <CitySelector
              cities={cities}
              selected={city}
              onSelect={handleCityChange}
            />
          </div>
        </div>
        <AppInfo version={APP_VERSION} lastFetched={city.lastFetched} />
        <SearchBar
          value={filters.search}
          onChange={v => setFilters(prev => ({ ...prev, search: v }))}
        />
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          options={{
            types: allTypes,
            levels: allLevels,
            rooms: allRooms,
            times: allTimes,
            industries: allIndustries,
            jobRoles: allJobRoles,
            services: allServices,
            areasOfInterest: allAreas,
            speakers: allSpeakers,
            sessionFeatures: allFeatures,
          }}
        />
      </header>

      <StatsBar total={sessions.length} filtered={filtered.length} />

      <main className="app-main">
        {viewMode === 'grid' ? (
          <TalkGrid
            sessions={filtered}
            onSelect={setSelectedId}
            isFavorite={isFavorite}
          />
        ) : (
          <CalendarView
            sessions={filtered}
            onSelect={setSelectedId}
            isFavorite={isFavorite}
            city={city}
          />
        )}
      </main>

      {selectedSession && (
        <TalkDetail
          session={selectedSession}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [cityId, setCityId] = useState<string>(getStoredCityId)

  return (
    <FavoritesProvider key={cityId} cityId={cityId}>
      <AppContent cityId={cityId} onCityChange={setCityId} />
    </FavoritesProvider>
  )
}
