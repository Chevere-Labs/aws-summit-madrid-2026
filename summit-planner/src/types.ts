export interface CityConfig {
  id: string
  name: string
  sessionsFile: string
  timezone: string
  date: string
  roomCategories: Record<string, string[]>
  lastFetched: string
}

export interface Session {
  id: string
  title: string
  type: string
  level: string
  abstract: string
  time: string
  date: string
  timezone: string
  room: string
  length: number
  speakers: string[]
  jobRoles: string[]
  industries: string[]
  track: string[]
  areasOfInterest: string[]
  services: string[]
  sessionFeatures: string[]
  status: string
}

export interface Filters {
  search: string
  types: string[]
  levels: string[]
  rooms: string[]
  times: string[]
  industries: string[]
  jobRoles: string[]
  services: string[]
  areasOfInterest: string[]
  speakers: string[]
  sessionFeatures: string[]
}

export type ViewMode = 'grid' | 'calendar'
